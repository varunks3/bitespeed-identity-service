import { db } from '../config/database';
import { Contact, ContactInput } from '../types';

export class ContactModel {
  private static tableName = 'contacts';

  /**
   * Create a new contact
   */
  static async create(contactData: ContactInput): Promise<Contact> {
    const [contact] = await db(this.tableName)
      .insert({
        phoneNumber: contactData.phoneNumber || null,
        email: contactData.email || null,
        linkedId: contactData.linkedId || null,
        linkPrecedence: contactData.linkPrecedence,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning('*');

    return contact;
  }

  /**
   * Find contacts by email or phone number
   */
  static async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    let query = db(this.tableName)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'asc');

    if (email && phoneNumber) {
      query = query.where(function() {
        this.where('email', email).orWhere('phoneNumber', phoneNumber);
      });
    } else if (email) {
      query = query.where('email', email);
    } else if (phoneNumber) {
      query = query.where('phoneNumber', phoneNumber);
    }

    return await query;
  }

  /**
   * Find contact by ID
   */
  static async findById(id: number): Promise<Contact | null> {
    const contact = await db(this.tableName)
      .where({ id, deletedAt: null })
      .first();

    return contact || null;
  }

  /**
   * Find all contacts linked to a primary contact
   */
  static async findLinkedContacts(primaryContactId: number): Promise<Contact[]> {
    return await db(this.tableName)
      .where(function() {
        this.where('id', primaryContactId).orWhere('linkedId', primaryContactId);
      })
      .whereNull('deletedAt')
      .orderBy('createdAt', 'asc');
  }

  /**
   * Update contact
   */
  static async update(id: number, updates: Partial<ContactInput>): Promise<Contact | null> {
    const [contact] = await db(this.tableName)
      .where({ id, deletedAt: null })
      .update({
        ...updates,
        updatedAt: new Date(),
      })
      .returning('*');

    return contact || null;
  }

  /**
   * Soft delete contact
   */
  static async softDelete(id: number): Promise<boolean> {
    const result = await db(this.tableName)
      .where({ id })
      .update({
        deletedAt: new Date(),
        updatedAt: new Date(),
      });

    return result > 0;
  }

  /**
   * Find primary contact among a list of contacts
   */
  static async findPrimaryContact(contacts: Contact[]): Promise<Contact | null> {
    // First, check if any of the contacts is already primary
    const primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary');
    if (primaryContact) {
      return primaryContact;
    }

    // If no primary found, find the oldest contact and make it primary
    const oldestContact = contacts[0]; // Already sorted by createdAt ASC
    if (oldestContact) {
      const updated = await this.update(oldestContact.id, { linkPrecedence: 'primary' });
      return updated;
    }

    return null;
  }

  /**
   * Update all secondary contacts of a primary to point to a new primary
   */
  static async updateSecondaryContacts(oldPrimaryId: number, newPrimaryId: number): Promise<void> {
    await db(this.tableName)
      .where({ linkedId: oldPrimaryId, deletedAt: null })
      .update({
        linkedId: newPrimaryId,
        updatedAt: new Date(),
      });
  }
}