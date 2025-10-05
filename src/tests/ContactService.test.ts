import { ContactService } from '../services/ContactService';
import { ContactModel } from '../models/Contact';
import { db } from '../config/database';

describe('ContactService', () => {
  let contactService: ContactService;

  beforeAll(async () => {
    // Initialize database connection
    await db.raw('SELECT 1');
    await db.migrate.latest();
    contactService = new ContactService();
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean up contacts before each test
    await db('contacts').del();
  });

  describe('identify', () => {
    it('should create a new primary contact when no existing contact is found', async () => {
      const request = {
        email: 'test@example.com',
        phoneNumber: '1234567890',
      };

      const result = await contactService.identify(request);

      expect(result.contact.primaryContatctId).toBeDefined();
      expect(result.contact.emails).toEqual(['test@example.com']);
      expect(result.contact.phoneNumbers).toEqual(['1234567890']);
      expect(result.contact.secondaryContactIds).toEqual([]);

      // Verify contact was created in database
      const contacts = await db('contacts').select('*');
      expect(contacts).toHaveLength(1);
      expect(contacts[0].linkPrecedence).toBe('primary');
    });

    it('should create a secondary contact when email matches but phone is different', async () => {
      // Create initial primary contact
      await ContactModel.create({
        email: 'test@example.com',
        phoneNumber: '1234567890',
        linkPrecedence: 'primary',
      });

      const request = {
        email: 'test@example.com',
        phoneNumber: '9876543210',
      };

      const result = await contactService.identify(request);

      expect(result.contact.emails).toEqual(['test@example.com']);
      expect(result.contact.phoneNumbers).toEqual(['1234567890', '9876543210']);
      expect(result.contact.secondaryContactIds).toHaveLength(1);

      // Verify two contacts exist
      const contacts = await db('contacts').select('*');
      expect(contacts).toHaveLength(2);
      expect(contacts.filter(c => c.linkPrecedence === 'secondary')).toHaveLength(1);
    });

    it('should create a secondary contact when phone matches but email is different', async () => {
      // Create initial primary contact
      await ContactModel.create({
        email: 'test@example.com',
        phoneNumber: '1234567890',
        linkPrecedence: 'primary',
      });

      const request = {
        email: 'different@example.com',
        phoneNumber: '1234567890',
      };

      const result = await contactService.identify(request);

      expect(result.contact.emails).toEqual(['test@example.com', 'different@example.com']);
      expect(result.contact.phoneNumbers).toEqual(['1234567890']);
      expect(result.contact.secondaryContactIds).toHaveLength(1);
    });

    it('should handle case where only email is provided', async () => {
      const request = {
        email: 'test@example.com',
      };

      const result = await contactService.identify(request);

      expect(result.contact.emails).toEqual(['test@example.com']);
      expect(result.contact.phoneNumbers).toEqual([]);
    });

    it('should handle case where only phoneNumber is provided', async () => {
      const request = {
        phoneNumber: '1234567890',
      };

      const result = await contactService.identify(request);

      expect(result.contact.emails).toEqual([]);
      expect(result.contact.phoneNumbers).toEqual(['1234567890']);
    });

    it('should throw error when neither email nor phoneNumber is provided', async () => {
      const request = {};

      await expect(contactService.identify(request)).rejects.toThrow(
        'Either email or phoneNumber must be provided'
      );
    });
  });
});
