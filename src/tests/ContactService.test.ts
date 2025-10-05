import { ContactService } from '../services/ContactService';
import Contact from '../models/Contact';
import sequelize from '../config/database';

describe('ContactService', () => {
  let contactService: ContactService;

  beforeAll(async () => {
    // Initialize database connection
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Recreate tables for testing
    contactService = new ContactService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up contacts before each test
    await Contact.destroy({ where: {}, force: true });
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
      const contacts = await Contact.findAll();
      expect(contacts).toHaveLength(1);
      expect(contacts[0].linkPrecedence).toBe('primary');
    });

    it('should create a secondary contact when email matches but phone is different', async () => {
      // Create initial primary contact
      await Contact.create({
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
      const contacts = await Contact.findAll();
      expect(contacts).toHaveLength(2);
      expect(contacts.filter(c => c.linkPrecedence === 'secondary')).toHaveLength(1);
    });

    it('should create a secondary contact when phone matches but email is different', async () => {
      // Create initial primary contact
      await Contact.create({
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

    it('should not create duplicate secondary contact for same information', async () => {
      // Create initial primary contact
      await Contact.create({
        email: 'test@example.com',
        phoneNumber: '1234567890',
        linkPrecedence: 'primary',
      });

      // Create secondary contact
      await Contact.create({
        email: 'test@example.com',
        phoneNumber: '9876543210',
        linkedId: 1,
        linkPrecedence: 'secondary',
      });

      const request = {
        email: 'test@example.com',
        phoneNumber: '9876543210',
      };

      const result = await contactService.identify(request);

      // Should not create another secondary contact
      const contacts = await Contact.findAll();
      expect(contacts).toHaveLength(2);
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

    it('should handle linking two primary contacts', async () => {
      // Create two separate primary contacts
      const contact1 = await Contact.create({
        email: 'test1@example.com',
        phoneNumber: '1111111111',
        linkPrecedence: 'primary',
      });

      const contact2 = await Contact.create({
        email: 'test2@example.com',
        phoneNumber: '2222222222',
        linkPrecedence: 'primary',
      });

      // Link them by providing both emails
      const request = {
        email: 'test1@example.com',
        phoneNumber: '2222222222',
      };

      const result = await contactService.identify(request);

      // Should have one primary and one secondary
      expect(result.contact.secondaryContactIds).toHaveLength(1);
      expect(result.contact.emails).toContain('test1@example.com');
      expect(result.contact.emails).toContain('test2@example.com');
    });
  });
});
