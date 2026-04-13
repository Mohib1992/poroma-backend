import bcrypt from 'bcryptjs';
import { authService } from '../src/services/auth.service';
import { mockPrisma } from './mocks';

describe('Auth Service', () => {
  describe('register', () => {
    it('should register a new user with valid phone number', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id-123',
        phone: '+8801712345678',
        name: 'Test User',
      });
      mockPrisma.timeline.create.mockResolvedValue({ id: 'timeline-id' });

      const result = await authService.register({
        phone: '+8801712345678',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.user).toBeDefined();
      expect(result.user.phone).toBe('+8801712345678');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw error for duplicate phone number', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        phone: '+8801712345678',
      });

      await expect(
        authService.register({
          phone: '+8801712345678',
          password: 'password123',
          name: 'Test User',
        })
      ).rejects.toThrow('Phone number already registered');
    });

    it('should hash password before saving', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id-123',
        phone: '+8801712345678',
        name: 'Test User',
      });
      mockPrisma.timeline.create.mockResolvedValue({ id: 'timeline-id' });

      const originalHash = bcrypt.hash;
      const hashSpy = jest.spyOn(bcrypt, 'hash');

      await authService.register({
        phone: '+8801712345678',
        password: 'password123',
        name: 'Test User',
      });

      expect(hashSpy).toHaveBeenCalledWith('password123', 12);
      hashSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-id-123',
        phone: '+8801712345678',
        password: hashedPassword,
        name: 'Test User',
      });

      const result = await authService.login({
        phone: '+8801712345678',
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.phone).toBe('+8801712345678');
      expect(result.accessToken).toBeDefined();
    });

    it('should throw error for non-existent phone', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({
          phone: '+8801712345678',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-id-123',
        phone: '+8801712345678',
        password: hashedPassword,
        name: 'Test User',
      });

      await expect(
        authService.login({
          phone: '+8801712345678',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token with valid refresh token', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        user_id: 'user-id-123',
        token: 'valid-refresh-token',
        expires_at: futureDate,
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id-123',
        phone: '+8801712345678',
        name: 'Test User',
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.refreshToken('invalid-token')
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error for expired refresh token', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        user_id: 'user-id-123',
        token: 'expired-token',
        expires_at: pastDate,
      });

      await expect(
        authService.refreshToken('expired-token')
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await authService.logout('refresh-token');

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
      });
    });
  });
});
