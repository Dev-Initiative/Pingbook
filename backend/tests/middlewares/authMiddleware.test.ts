import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../../src/middleware/authMiddleware.js';

// Mock dependencies
jest.mock('jsonwebtoken');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
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

  it('should authenticate valid token', async () => {
    const mockDecoded = { id: 'userId', email: 'test@example.com' };

    mockReq.headers = { authorization: 'Bearer validToken' };
    mockedJwt.verify.mockReturnValue(mockDecoded as any);

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({ id: 'userId', email: 'test@example.com' });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return error for missing token', async () => {
    mockReq.headers = {};

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return error for invalid token format', async () => {
    mockReq.headers = { authorization: 'InvalidFormat' };

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token format',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return error for invalid token', async () => {
    mockReq.headers = { authorization: 'Bearer invalidToken' };
    mockedJwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication failed',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});