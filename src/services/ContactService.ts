import { Op } from 'sequelize';
import Contact from '../models/Contact';
import { IdentifyRequest, IdentifyResponse, ContactInput } from '../types';

export class ContactService {
  /**
   * Main identify method that handles contact consolidation
   */
  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = request;

    // Validate that at least one identifier is provided
    if (!email && !phoneNumber) {
      throw new Error('Either email or phoneNumber must be provided');
    }

    // Find existing contacts that match either email or phoneNumber
    const existingContacts = await this.findMatchingContacts(email, phoneNumber);

    if (existingContacts.length === 0) {
      // No existing contacts found, create a new primary contact
      const newContact = await this.createPrimaryContact(email, phoneNumber);
      return this.buildResponse([newContact]);
    }

    // Find the primary contact among existing contacts
    const primaryContact = await this.findPrimaryContact(existingContacts);
    
    // Check if we need to create a secondary contact
    const needsSecondaryContact = this.shouldCreateSecondaryContact(
      primaryContact,
      email,
      phoneNumber
    );

    if (needsSecondaryContact) {
      await this.createSecondaryContact(primaryContact.id, email, phoneNumber);
    }

    // Get all contacts linked to the primary contact
    const allLinkedContacts = await this.getAllLinkedContacts(primaryContact.id);
    
    return this.buildResponse(allLinkedContacts);
  }

  /**
   * Find contacts that match the provided email or phoneNumber
   */
  private async findMatchingContacts(email?: string, phoneNumber?: string): Promise<Contact[]> {
    const whereConditions: any = {
      deletedAt: null,
    };

    if (email && phoneNumber) {
      whereConditions[Op.or] = [
        { email },
        { phoneNumber },
      ];
    } else if (email) {
      whereConditions.email = email;
    } else if (phoneNumber) {
      whereConditions.phoneNumber = phoneNumber;
    }

    return await Contact.findAll({
      where: whereConditions,
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Find the primary contact among a list of contacts
   */
  private async findPrimaryContact(contacts: Contact[]): Promise<Contact> {
    // First, check if any of the contacts is already primary
    const primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary');
    if (primaryContact) {
      return primaryContact;
    }

    // If no primary found, find the oldest contact and make it primary
    const oldestContact = contacts[0]; // Already sorted by createdAt ASC
    await oldestContact.update({ linkPrecedence: 'primary' });
    return oldestContact;
  }

  /**
   * Check if we need to create a secondary contact
   */
  private shouldCreateSecondaryContact(
    primaryContact: Contact,
    email?: string,
    phoneNumber?: string
  ): boolean {
    // Check if the new data is different from primary contact
    const hasNewEmail = email && email !== primaryContact.email;
    const hasNewPhone = phoneNumber && phoneNumber !== primaryContact.phoneNumber;

    return hasNewEmail || hasNewPhone;
  }

  /**
   * Create a new primary contact
   */
  private async createPrimaryContact(email?: string, phoneNumber?: string): Promise<Contact> {
    const contactData: ContactInput = {
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkPrecedence: 'primary',
    };

    return await Contact.create(contactData);
  }

  /**
   * Create a secondary contact linked to the primary contact
   */
  private async createSecondaryContact(
    primaryContactId: number,
    email?: string,
    phoneNumber?: string
  ): Promise<Contact> {
    const contactData: ContactInput = {
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId: primaryContactId,
      linkPrecedence: 'secondary',
    };

    return await Contact.create(contactData);
  }

  /**
   * Get all contacts linked to a primary contact
   */
  private async getAllLinkedContacts(primaryContactId: number): Promise<Contact[]> {
    return await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryContactId },
          { linkedId: primaryContactId },
        ],
        deletedAt: null,
      },
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Build the response object
   */
  private buildResponse(contacts: Contact[]): IdentifyResponse {
    const primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary')!;
    const secondaryContacts = contacts.filter(contact => contact.linkPrecedence === 'secondary');

    // Collect all unique emails and phone numbers
    const emails = [...new Set(contacts.map(contact => contact.email).filter(Boolean))] as string[];
    const phoneNumbers = [...new Set(contacts.map(contact => contact.phoneNumber).filter(Boolean))] as string[];

    // Ensure primary contact's email and phone are first in the arrays
    if (primaryContact.email && emails.includes(primaryContact.email)) {
      emails.splice(emails.indexOf(primaryContact.email), 1);
      emails.unshift(primaryContact.email);
    }
    if (primaryContact.phoneNumber && phoneNumbers.includes(primaryContact.phoneNumber)) {
      phoneNumbers.splice(phoneNumbers.indexOf(primaryContact.phoneNumber), 1);
      phoneNumbers.unshift(primaryContact.phoneNumber);
    }

    return {
      contact: {
        primaryContatctId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryContacts.map(contact => contact.id),
      },
    };
  }

  /**
   * Handle the case where two primary contacts need to be merged
   */
  async mergePrimaryContacts(olderPrimary: Contact, newerPrimary: Contact): Promise<void> {
    // Update the newer primary to be secondary
    await newerPrimary.update({
      linkPrecedence: 'secondary',
      linkedId: olderPrimary.id,
    });

    // Update all secondary contacts of the newer primary to point to the older primary
    await Contact.update(
      { linkedId: olderPrimary.id },
      {
        where: {
          linkedId: newerPrimary.id,
          deletedAt: null,
        },
      }
    );
  }
}
