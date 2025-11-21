import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../src/model/User.js';
import {
  googleLogin,
  loginUser,
  registerUser,
  verifyEmail,
  setPassword,
  resetPassword,
} from '../../src/controller/authController.js';
import { AuthRequest } from '../../src/middleware/authMiddleware.js';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('@sendgrid/mail');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: jest.fn(() => 'mockToken') })),
}));
jest.mock('../../src/model/User.js');

const mockedUser = User as jest.Mocked<typeof User>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('googleLogin', () => {
    it('should return success for valid Google user', async () => {
      const mockGoogleUser = {
        _id: 'userId',
        email: 'test@example.com',
        username: 'testuser',
        avatar: 'avatar.jpg',
      };

      (mockReq as any).user = mockGoogleUser;
      mockedJwt.sign.mockReturnValue('mockToken' as any);

      await googleLogin(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        token: 'mockToken',
        user: {
          id: 'userId',
          email: 'test@example.com',
          username: 'testuser',
          avatar: 'avatar.jpg',
        },
      });
    });

    it('should return error if req.user is undefined', async () => {
      mockReq.user = undefined;

      await googleLogin(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Google authentication failed',
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        password: 'hashedPassword',
        emailVerified: true,
        username: 'testuser',
      };

      mockReq.body = { email: 'test@example.com', password: 'password' };
      mockedUser.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as any).mockResolvedValue(true);
      mockedJwt.sign.mockReturnValue('mockToken' as any);

      await loginUser(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        token: 'mockToken',
        user: { id: 'userId', email: 'test@example.com', username: 'testuser' },
      });
    });

    it('should return error for invalid credentials', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      mockedUser.findOne.mockResolvedValue(null);

      await loginUser(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid user credentials',
      });
    });

    it('should return error if email not verified', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        password: 'hashedPassword',
        emailVerified: false,
      };

      mockReq.body = { email: 'test@example.com', password: 'password' };
      mockedUser.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as any).mockResolvedValue(true);

      await loginUser(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please verify your email before logging in',
      });
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        _id: 'userId',
        username: 'testuser',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue({
          _id: 'userId',
          username: 'testuser',
          email: 'test@example.com',
        }),
      };

      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        phone: '1234567890',
      };
      mockedUser.findOne.mockResolvedValue(null);
      (mockedBcrypt.hash as any).mockResolvedValue('hashedPassword');
      (mockedUser as any).mockImplementation(() => mockUser);

      await registerUser(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: 'userId',
          username: 'testuser',
          email: 'test@example.com',
        },
      });
    });

    it('should return error if user already exists', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        phone: '1234567890',
      };
      mockedUser.findOne.mockResolvedValue({ email: 'test@example.com' });

      await registerUser(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockUser = {
        emailVerified: false,
        verificationToken: 'validToken',
        verificationTokenExpires: new Date(Date.now() + 3600000),
        save: jest.fn().mockResolvedValue({}),
      };

      mockReq.body = { token: 'validToken' };
      mockedUser.findOne.mockResolvedValue(mockUser);

      await verifyEmail(mockReq as AuthRequest, mockRes as Response);

      expect(mockUser.emailVerified).toBe(true);
      expect(mockUser.verificationToken).toBeUndefined();
      expect(mockUser.verificationTokenExpires).toBeUndefined();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email verified successfully',
      });
    });

    it('should return error for invalid token', async () => {
      mockReq.body = { token: 'invalidToken' };
      mockedUser.findOne.mockResolvedValue(null);

      await verifyEmail(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired verification token',
      });
    });
  });

  describe('setPassword', () => {
    it('should set password successfully', async () => {
      const mockUser = {
        _id: 'userId',
        password: undefined,
        save: jest.fn().mockResolvedValue({}),
      };

      (mockReq as any).user = { id: 'userId', email: 'test@example.com' };
      mockReq.body = { newPassword: 'newPassword' };
      mockedUser.findById.mockResolvedValue(mockUser);
      (mockedBcrypt.hash as any).mockResolvedValue('hashedPassword');

      await setPassword(mockReq as AuthRequest, mockRes as Response);

      expect(mockUser.password).toBe('hashedPassword');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password has been set successfully.',
      });
    });

    it('should return error if password already set', async () => {
      const mockUser = {
        _id: 'userId',
        password: 'existingPassword',
      };

      (mockReq as any).user = { id: 'userId', email: 'test@example.com' };
      mockReq.body = { newPassword: 'newPassword' };
      mockedUser.findById.mockResolvedValue(mockUser);

      await setPassword(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password already set. Use the \'Reset Password\' feature to change it.',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockUser = {
        _id: 'userId',
        password: 'oldHashedPassword',
        save: jest.fn().mockResolvedValue({}),
      };

      (mockReq as any).user = { id: 'userId', email: 'test@example.com' };
      mockReq.body = { currentPassword: 'currentPassword', newPassword: 'newPassword' };
      mockedUser.findById.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as any).mockResolvedValue(true);
      (mockedBcrypt.hash as any).mockResolvedValue('newHashedPassword');

      await resetPassword(mockReq as AuthRequest, mockRes as Response);

      expect(mockUser.password).toBe('newHashedPassword');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successfully',
      });
    });

    it('should return error for Google user without password', async () => {
      const mockUser = {
        _id: 'userId',
        password: undefined,
      };

      (mockReq as any).user = { id: 'userId', email: 'test@example.com' };
      mockReq.body = { currentPassword: 'currentPassword', newPassword: 'newPassword' };
      mockedUser.findById.mockResolvedValue(mockUser);

      await resetPassword(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'This account is authenticated via Google. Please use the \'Set Password\' feature to create a password.',
      });
    });
  });
});