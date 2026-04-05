import bcrypt from 'bcryptjs';
import { prisma } from '../config';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: { phone: input.phone },
    });

    if (existingUser) {
      throw new AppError('Phone number already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        phone: input.phone,
        password: hashedPassword,
        name: input.name,
      },
      select: { id: true, phone: true, name: true },
    });

    const tokens = this.generateTokens(user.id, user.phone);

    await prisma.timeline.create({
      data: { user_id: user.id },
    });

    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: { phone: input.phone },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user.id, user.phone);

    return {
      user: { id: user.id, phone: user.phone, name: user.name },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expires_at < new Date()) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: storedToken.user_id },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return this.generateTokens(user.id, user.phone);
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private generateTokens(userId: string, phone: string) {
    const payload = { userId, phone };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}

export const authService = new AuthService();
