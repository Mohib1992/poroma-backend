import { registerSchema, loginSchema } from '../src/validators/auth.validator';

describe('Auth Validation', () => {
  describe('registerSchema', () => {
    it('should validate correct Bangladesh phone number', () => {
      const validData = {
        phone: '+8801712345678',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate another valid phone format', () => {
      const validData = {
        phone: '+8801912345678',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number (wrong format)', () => {
      const invalidData = {
        phone: '+880171234567', // too short
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number (wrong prefix)', () => {
      const invalidData = {
        phone: '+8801212345678', // 12 prefix not valid
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        phone: '+8801712345678',
        password: '12345', // less than 6 chars
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional name', () => {
      const validData = {
        phone: '+8801712345678',
        password: 'password123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        phone: '+8801712345678',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing password', () => {
      const invalidData = {
        phone: '+8801712345678',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        phone: 'not-a-phone-number',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
