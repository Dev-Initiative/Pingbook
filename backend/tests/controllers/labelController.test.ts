import { Request, Response } from 'express';
import { Label } from '../../src/model/Label.js';
import { Contact } from '../../src/model/Contact.js';
import { AuthRequest } from '../../src/middleware/authMiddleware.js';
import {
  getAllLabels,
  getLabel,
  createLabel,
  updateLabel,
  deleteLabel,
} from '../../src/controller/labelController.js';

// Mock dependencies
jest.mock('../../src/model/Label.js');
jest.mock('../../src/model/Contact.js');

const mockedLabel = Label as jest.Mocked<typeof Label>;
const mockedContact = Contact as jest.Mocked<typeof Contact>;

describe('Label Controller', () => {
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

  describe('getAllLabels', () => {
    it('should return all labels for user', async () => {
      const mockLabels = [
        { _id: 'label1', name: 'Work', color: '#ff0000' },
        { _id: 'label2', name: 'Personal', color: '#00ff00' },
      ];

      mockedLabel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockLabels),
      } as any);

      await getAllLabels(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        labels: mockLabels,
      });
    });
  });

  describe('createLabel', () => {
    it('should create label successfully', async () => {
      const mockLabel = {
        _id: 'label1',
        name: 'Work',
        color: '#ff0000',
        save: jest.fn().mockResolvedValue({
          _id: 'label1',
          name: 'Work',
          color: '#ff0000',
        }),
      };

      mockReq.body = { name: 'Work', color: '#ff0000' };
      mockedContact.findOne.mockResolvedValue(null);
      (mockedLabel as any).mockImplementation(() => mockLabel);

      await createLabel(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Label created successfully',
        label: {
          _id: 'label1',
          name: 'Work',
          color: '#ff0000',
        },
      });
    });

    it('should return error for missing name', async () => {
      mockReq.body = {}; // Missing name

      await createLabel(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Name is required',
      });
    });
  });

  describe('deleteLabel', () => {
    it('should delete label successfully', async () => {
      const mockLabel = { _id: 'label1', name: 'Work' };

      mockReq.params = { id: 'label1' };
      mockedLabel.findOneAndDelete.mockResolvedValue(mockLabel);

      await deleteLabel(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Label deleted successfully',
      });
    });
  });
});