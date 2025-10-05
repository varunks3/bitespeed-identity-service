import { ContactModel } from '../models/Contact';
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
    const existingContacts = await ContactModel.findByEmailOrPhone(email, phoneNumber);

    if (existingContacts.length === 0) {
      // No existing contacts found, create a new primary contact
      const newContact = await ContactModel.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary',
      });
      return this.buildResponse([newContact]);
    }

    // Find the primary contact among existing contacts
    const primaryContact = await ContactModel.findPrimaryContact(existingContacts);
    if (!primaryContact) {
      throw new Error('Failed to find or create primary contact');
    }
    
    // Check if we need to create a secondary contact
    const needsSecondaryContact = this.shouldCreateSecondaryContact(
      primaryContact,
      email,
      phoneNumber
    );

    if (needsSecondaryContact) {
      await ContactModel.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
    }

    // Get all contacts linked to the primary contact
    const allLinkedContacts = await ContactModel.findLinkedContacts(primaryContact.id);
    
    return this.buildResponse(allLinkedContacts);
  }

  /**
   * Check if we need to create a secondary contact
   */
  private shouldCreateSecondaryContact(
    primaryContact: any,
    email?: string,
    phoneNumber?: string
  ): boolean {
    // Check if the new data is different from primary contact
    const hasNewEmail = Boolean(email && email !== primaryContact.email);
    const hasNewPhone = Boolean(phoneNumber && phoneNumber !== primaryContact.phoneNumber);

    return hasNewEmail || hasNewPhone;
  }

  /**
   * Build the response object
   */
  private buildResponse(contacts: any[]): IdentifyResponse {
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
  async mergePrimaryContacts(olderPrimary: any, newerPrimary: any): Promise<void> {
    // Update the newer primary to be secondary
    await ContactModel.update(newerPrimary.id, {
      linkPrecedence: 'secondary',
      linkedId: olderPrimary.id,
    });

    // Update all secondary contacts of the newer primary to point to the older primary
    await ContactModel.updateSecondaryContacts(newerPrimary.id, olderPrimary.id);
  }
}