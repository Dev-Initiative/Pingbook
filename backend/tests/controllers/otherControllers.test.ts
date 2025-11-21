import { Request, Response } from 'express';
import { Export } from '../../src/model/Exports.js';
import { Settings } from '../../src/model/Settings.js';
import { SharedContact } from '../../src/model/SharedContact.js';
import { User } from '../../src/model/User.js';
import { ExportRequest } from '../../src/middleware/exportMiddleware.js';
import { SettingsRequest } from '../../src/middleware/settingsMiddleware.js';
import { AuthRequest } from '../../src/middleware/authMiddleware.js';
import { UserRequest } from '../../src/middleware/userMiddleware.js';
import {
  getAllExports,
  getExport,
  createExport,
  downloadExport,
  deleteExport,
} from '../../src/controller/exportController.js';
import {
  getSettings,
  createSettings,
  updateSettings,
} from '../../src/controller/settingsController.js';
import {
  getAllSharedContacts,
  acceptSharedContact,
  rejectSharedContact,
} from '../../src/controller/sharedContactController.js';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getUserById,
} from '../../src/controller/userController.js';

// Mock dependencies
jest.mock('../../src/model/Exports.js');
jest.mock('../../src/model/Settings.js');
jest.mock('../../src/model/SharedContact.js');
jest.mock('../../src/model/User.js');

const mockedExport = Export as jest.Mocked<typeof Export>;
const mockedSettings = Settings as jest.Mocked<typeof Settings>;
const mockedSharedContact = SharedContact as jest.Mocked<typeof SharedContact>;
const mockedUser = User as jest.Mocked<typeof User>;

describe('Other Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('Export Controller', () => {
    describe('getAllExports', () => {
      it('should return all exports for user', async () => {
        const mockExports = [
          { _id: 'export1', format: 'csv', status: 'completed' },
        ];

        (mockReq as ExportRequest).userId = 'userId';
        mockedExport.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockExports),
        } as any);

        await getAllExports(mockReq as ExportRequest, mockRes as Response);

        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          exports: mockExports,
        });
      });
    });

    describe('createExport', () => {
      it('should create export successfully', async () => {
        const mockExport = {
          _id: 'export1',
          format: 'csv',
          status: 'in_progress',
          save: jest.fn().mockResolvedValue({
            _id: 'export1',
            format: 'csv',
            status: 'in_progress',
          }),
        };

        (mockReq as ExportRequest).userId = 'userId';
        mockReq.body = { format: 'csv' };
        (mockedExport as any).mockImplementation(() => mockExport);

        await createExport(mockReq as ExportRequest, mockRes as Response);

        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: 'Export created',
          export: expect.objectContaining({
            _id: 'export1',
            format: 'csv',
            status: 'in_progress',
          }),
        });
      });

      it('should return error for invalid format', async () => {
        (mockReq as ExportRequest).userId = 'userId';
        mockReq.body = { format: 'invalid' };

        await createExport(mockReq as ExportRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: 'Invalid format',
        });
      });
    });
  });

  describe('Settings Controller', () => {
    describe('getSettings', () => {
      it('should return user settings', async () => {
        const mockSettings = { theme: 'dark', notificationsEnabled: true };

        (mockReq as SettingsRequest).userSettings = mockSettings as any;

        await getSettings(mockReq as SettingsRequest, mockRes as Response);

        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          settings: mockSettings,
        });
      });

      it('should return error if settings not found', async () => {
        (mockReq as SettingsRequest).userSettings = undefined;

        await getSettings(mockReq as SettingsRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: 'Settings not found',
        });
      });
    });

    describe('createSettings', () => {
      it('should create settings successfully', async () => {
        const mockSettings = {
          userId: 'userId',
          theme: 'light',
          save: jest.fn().mockResolvedValue({
            userId: 'userId',
            theme: 'light',
          }),
        };

        (mockReq as SettingsRequest).userId = 'userId';
        (mockReq as SettingsRequest).userSettings = undefined;
        mockReq.body = { theme: 'light' };
        (mockedSettings as any).mockImplementation(() => mockSettings);

        await createSettings(mockReq as SettingsRequest, mockRes as Response);

        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: 'Settings created',
          settings: expect.objectContaining({
            userId: 'userId',
            theme: 'light',
          }),
        });
      });
    });
  });

  describe('Shared Contact Controller', () => {
    describe('getAllSharedContacts', () => {
      it('should return all shared contacts', async () => {
        const mockSharedContacts = [
          { _id: 'shared1', status: 'pending' },
        ];

        (mockReq as AuthRequest).user = { id: 'userId', email: 'test@example.com' };
        (mockReq as any).query = {};
        mockedSharedContact.find.mockResolvedValue(mockSharedContacts);

        await getAllSharedContacts(mockReq as AuthRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          sharedContacts: mockSharedContacts,
        });
      });
    });

    describe('acceptSharedContact', () => {
      it('should accept shared contact', async () => {
        const mockSharedContact = {
          _id: 'shared1',
          sharedWithUserId: 'userId',
          status: 'pending',
          save: jest.fn().mockResolvedValue({ _id: 'shared1', status: 'accepted' }),
        };

        (mockReq as AuthRequest).user = { id: 'userId', email: 'test@example.com' };
        mockReq.params = { id: 'shared1' };
        mockedSharedContact.findById.mockResolvedValue(mockSharedContact);

        await acceptSharedContact(mockReq as AuthRequest, mockRes as Response);

        expect(mockSharedContact.status).toBe('accepted');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: 'Shared contact accepted',
          sharedContact: expect.objectContaining({ _id: 'shared1', status: 'accepted' }),
        });
      });
    });
  });

  describe('User Controller', () => {
    describe('getProfile', () => {
      it('should return user profile', async () => {
        const mockUser = {
          _id: 'userId',
          username: 'testuser',
          email: 'test@example.com',
        };

        (mockReq as UserRequest).currentUser = mockUser;

        await getProfile(mockReq as UserRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          user: mockUser,
        });
      });
    });

    describe('updateProfile', () => {
      it('should update user profile', async () => {
        const mockUser = {
          _id: 'userId',
          username: 'testuser',
          email: 'test@example.com',
          save: jest.fn().mockResolvedValue({
            _id: 'userId',
            username: 'newuser',
            email: 'test@example.com',
          }),
        };

        (mockReq as UserRequest).currentUser = mockUser;
        mockReq.body = { username: 'newuser' };

        await updateProfile(mockReq as UserRequest, mockRes as Response);

        expect(mockUser.username).toBe('newuser');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: 'Profile updated',
          user: expect.objectContaining({
            _id: 'userId',
            username: 'newuser',
            email: 'test@example.com',
          }),
        });
      });
    });

    describe('getUserById', () => {
      it('should return user by id', async () => {
        const mockUser = {
          _id: 'userId',
          username: 'testuser',
          email: 'test@example.com',
        };

        mockReq.params = { id: 'userId' };
        mockedUser.findById.mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser),
        } as any);

        await getUserById(mockReq as UserRequest, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          user: mockUser,
        });
      });
    });
  });
});