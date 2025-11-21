import { Request, Response } from 'express';
import { Contact } from '../../src/model/Contact.js';
import { Label } from '../../src/model/Label.js';
import { SharedContact } from '../../src/model/SharedContact.js';
import { AuthRequest } from '../../src/middleware/authMiddleware.js';
import {
  getAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  shareContact,
} from '../../src/controller/contactController.js';

// Mock dependencies
jest.mock('../../src/model/Contact.js');
jest.mock('../../src/model/Label.js');
jest.mock('../../src/model/SharedContact.js');

const mockedContact = Contact as jest.Mocked<typeof Contact>;
const mockedLabel = Label as jest.Mocked<typeof Label>;
const mockedSharedContact = SharedContact as jest.Mocked<typeof SharedContact>;

describe('Contact Controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      user: { id: 'userId', email: 'test@example.com' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllContacts', () => {
    it('should return all contacts for user', async () => {
      const mockContacts = [
        { _id: 'contact1', firstname: 'John', lastname: 'Doe' },
        { _id: 'contact2', firstname: 'Jane', lastname: 'Smith' },
      ];

      mockReq.query = { page: '1', limit: '10' };
      mockedContact.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockContacts),
      } as any);
      mockedContact.countDocuments.mockResolvedValue(2);

      await getAllContacts(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        contacts: mockContacts,
        total: 2,
        page: 1,
        pages: 1,
      });
    });

    it('should filter contacts by search', async () => {
      const mockContacts = [{ _id: 'contact1', firstname: 'John', lastname: 'Doe' }];

      mockReq.query = { search: 'John' };
      mockedContact.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockContacts),
      } as any);
      mockedContact.countDocuments.mockResolvedValue(1);

      await getAllContacts(mockReq as AuthRequest, mockRes as Response);

      expect(mockedContact.find).toHaveBeenCalledWith({
        userId: 'userId',
        $or: [
          { firstname: { $regex: 'John', $options: 'i' } },
          { lastname: { $regex: 'John', $options: 'i' } },
          { email: { $regex: 'John', $options: 'i' } },
        ],
      });
    });
  });

  describe('getContact', () => {
    it('should return single contact', async () => {
      const mockContact = { _id: 'contact1', firstname: 'John', lastname: 'Doe' };

      mockReq.params = { id: 'contact1' };
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockContact),
      };
      mockedContact.findOne.mockReturnValue(mockQuery as any);

      await getContact(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        contact: mockContact,
      });
    });

    it('should return 404 if contact not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockedContact.findOne.mockResolvedValue(null);

      await getContact(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contact not found',
      });
    });
  });

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const mockContact = {
        _id: 'contact1',
        firstname: 'John',
        lastname: 'Doe',
        phone: '1234567890',
        save: jest.fn().mockResolvedValue({
          _id: 'contact1',
          firstname: 'John',
          lastname: 'Doe',
          phone: '1234567890',
        }),
        populate: jest.fn().mockResolvedValue({
          _id: 'contact1',
          firstname: 'John',
          lastname: 'Doe',
          phone: '1234567890',
        }),
      };

      mockReq.body = {
        firstname: 'John',
        lastname: 'Doe',
        phone: '1234567890',
      };
      mockedLabel.findOne.mockResolvedValue(null); // No labels
      (mockedContact as any).mockImplementation(() => mockContact);

      await createContact(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Contact created successfully',
        contact: {
          _id: 'contact1',
          firstname: 'John',
          lastname: 'Doe',
          phone: '1234567890',
        },
      });
    });

    it('should return error for missing required fields', async () => {
      mockReq.body = { firstname: 'John' }; // Missing lastname and phone

      await createContact(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Firstname, lastname, and phone are required',
      });
    });
  });

  describe('updateContact', () => {
    it('should update contact successfully', async () => {
      const mockContact = {
        _id: 'contact1',
        firstname: 'John',
        lastname: 'Doe',
        labels: ['label1'],
        save: jest.fn().mockResolvedValue({
          _id: 'contact1',
          firstname: 'Jane',
          lastname: 'Smith',
        }),
        populate: jest.fn().mockResolvedValue({
          _id: 'contact1',
          firstname: 'Jane',
          lastname: 'Smith',
        }),
      };

      mockReq.params = { id: 'contact1' };
      mockReq.body = { firstname: 'Jane', lastname: 'Smith' };
      mockedContact.findOne.mockResolvedValue(mockContact);
      mockedLabel.findOne.mockResolvedValue(null);

      await updateContact(mockReq as AuthRequest, mockRes as Response);

      expect(mockContact.firstname).toBe('Jane');
      expect(mockContact.lastname).toBe('Smith');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      const mockContact = { _id: 'contact1', firstname: 'John', lastname: 'Doe' };

      mockReq.params = { id: 'contact1' };
      mockedContact.findOneAndDelete.mockResolvedValue(mockContact);

      await deleteContact(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Contact deleted successfully',
      });
    });
  });

  describe('shareContact', () => {
    it('should share contact successfully', async () => {
      const mockContact = { _id: 'contact1', firstname: 'John', lastname: 'Doe' };
      const mockSharedContact = {
        _id: 'shared1',
        contactId: 'contact1',
        sharedByUserId: 'userId',
        sharedWithUserId: 'user2',
        save: jest.fn().mockResolvedValue({
          _id: 'shared1',
          contactId: 'contact1',
        }),
        populate: jest.fn().mockResolvedValue({
          _id: 'shared1',
          contactId: { firstname: 'John', lastname: 'Doe', email: '', phone: '' },
        }),
      };

      mockReq.params = { id: 'contact1' };
      mockReq.body = { sharedWithUserId: 'user2' };
      mockedContact.findOne.mockResolvedValue(mockContact);
      mockedSharedContact.findOne.mockResolvedValue(null);
      (mockedSharedContact as any).mockImplementation(() => mockSharedContact);

      await shareContact(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Contact shared successfully',
        sharedContact: {
          _id: 'shared1',
          contactId: { firstname: 'John', lastname: 'Doe', email: '', phone: '' },
        },
      });
    });
  });
});