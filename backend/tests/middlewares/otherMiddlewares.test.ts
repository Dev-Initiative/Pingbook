import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware as exportAuthMiddleware, preloadExport } from '../../src/middleware/exportMiddleware.js';
import { settingsMiddleware, SettingsRequest } from '../../src/middleware/settingsMiddleware.js';
import { userMiddleware, UserRequest } from '../../src/middleware/userMiddleware.js';
import { handleValidationErrors } from '../../src/middleware/validateAuth.js';
import { Export } from '../../src/model/Exports.js';
import { Settings } from '../../src/model/Settings.js';
import { User } from '../../src/model/User.js';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/model/Exports.js');
jest.mock('../../src/model/Settings.js');
jest.mock('../../src/model/User.js');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedExport = Export as jest.Mocked<typeof Export>;
const mockedSettings = Settings as jest.Mocked<typeof Settings>;
const mockedUser = User as jest.Mocked<typeof User>;

describe('Other Middlewares', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('Export Middleware - authMiddleware', () => {
    it('should authenticate valid token', async () => {
      const mockDecoded = { id: 'userId' };

      (mockReq as any).header = jest.fn(() => 'Bearer validToken');
      mockedJwt.verify.mockReturnValue(mockDecoded as any);

      await exportAuthMiddleware(mockReq as any, mockRes as Response, mockNext);

      expect((mockReq as any).userId).toBe('userId');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error for missing token', async () => {
      (mockReq as any).header = jest.fn(() => undefined);

      await exportAuthMiddleware(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided',
      });
    });
  });

  describe('Export Middleware - preloadExport', () => {
    it('should preload export successfully', async () => {
      const mockExport = { _id: 'exportId', userId: 'userId' };

      (mockReq as any).userId = 'userId';
      mockReq.params = { id: 'exportId' };
      mockedExport.findById.mockResolvedValue(mockExport);

      await preloadExport(mockReq as any, mockRes as Response, mockNext);

      expect((mockReq as any).exportDoc).toBe(mockExport);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error for unauthorized access', async () => {
      const mockExport = { _id: 'exportId', userId: 'otherUserId' };

      (mockReq as any).userId = 'userId';
      mockReq.params = { id: 'exportId' };
      mockedExport.findById.mockResolvedValue(mockExport);

      await preloadExport(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized access',
      });
    });
  });

  describe('Settings Middleware', () => {
    it('should authenticate and preload settings', async () => {
      const mockDecoded = { id: 'userId' };
      const mockSettings = { userId: 'userId', theme: 'dark' };

      (mockReq as any).header = jest.fn(() => 'Bearer validToken');
      mockedJwt.verify.mockReturnValue(mockDecoded as any);
      mockedSettings.findOne.mockResolvedValue(mockSettings as any);

      await settingsMiddleware(mockReq as SettingsRequest, mockRes as Response, mockNext);

      expect((mockReq as SettingsRequest).userId).toBe('userId');
      expect((mockReq as SettingsRequest).userSettings).toBe(mockSettings);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('User Middleware', () => {
    it('should load user successfully', async () => {
      const mockUser = { _id: 'userId', username: 'testuser' };

      (mockReq as UserRequest).user = { id: 'userId', email: 'test@example.com' };
      mockedUser.findById.mockResolvedValue(mockUser as any);

      await userMiddleware(mockReq as UserRequest, mockRes as Response, mockNext);

      expect((mockReq as UserRequest).currentUser).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error for unauthenticated user', async () => {
      (mockReq as UserRequest).user = undefined;

      await userMiddleware(mockReq as UserRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not authenticated',
      });
    });
  });

  describe('Validation Middleware', () => {
    describe('handleValidationErrors', () => {
      it('should call next for valid data', () => {
        mockReq = {};

        handleValidationErrors(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });
  });
});