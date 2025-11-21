import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes.js';
import { User } from '../../src/model/User.js';

// Mock dependencies
jest.mock('../../src/model/User.js');
jest.mock('@sendgrid/mail');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: jest.fn(() => 'mockToken') })),
}));
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
  handleValidationErrors: jest.fn((req, res, next) => next()),
}));
jest.mock('../../src/middleware/authMiddleware.js', () => ({
  authMiddleware: jest.fn((req, res, next) => next()),
}));

const mockedUser = User as jest.Mocked<typeof User>;

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
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

      mockedUser.findOne.mockResolvedValue(null);
      (mockedUser as any).mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registration successful');
    });

    it('should return error for existing user', async () => {
      mockedUser.findOne.mockResolvedValue({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        password: 'hashedPassword',
        emailVerified: true,
        username: 'testuser',
      };

      mockedUser.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
    });

    it('should return error for invalid credentials', async () => {
      mockedUser.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid user credentials');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email successfully', async () => {
      const mockUser = {
        emailVerified: false,
        verificationToken: 'validToken',
        verificationTokenExpires: new Date(Date.now() + 3600000),
        save: jest.fn().mockResolvedValue({}),
      };

      mockedUser.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'validToken' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email verified successfully');
    });
  });
});