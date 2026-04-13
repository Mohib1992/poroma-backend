import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../src/utils/jwt';

describe('JWT Utils', () => {
  const testSecret = 'test-secret-key-at-least-32-characters-long';

  beforeAll(() => {
    process.env.JWT_SECRET = testSecret;
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload = { userId: 'user-123', phone: '+8801712345678' };
      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate token with correct payload', () => {
      const payload = { userId: 'user-123', phone: '+8801712345678' };
      const token = generateAccessToken(payload);
      const decoded = jwt.verify(token, testSecret);

      expect(decoded).toMatchObject(payload);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = { userId: 'user-123', phone: '+8801712345678' };
      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const payload = { userId: 'user-123', phone: '+8801712345678' };
      const token = generateAccessToken(payload);

      const result = verifyToken(token);

      expect(result.userId).toBe('user-123');
      expect(result.phone).toBe('+8801712345678');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw error for expired token', () => {
      const payload = { userId: 'user-123', phone: '+8801712345678' };
      const expiredToken = jwt.sign(payload, testSecret, { expiresIn: '-1s' });

      expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
    });
  });
});
