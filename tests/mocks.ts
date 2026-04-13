import { PrismaClient } from '@prisma/client';

export const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  timeline: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  analyticsEvent: {
    create: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
} as any;

export const prisma = mockPrisma as unknown as PrismaClient;

export const resetMocks = () => {
  Object.values(mockPrisma).forEach((model: any) => {
    if (model) {
      Object.keys(model).forEach((method: string) => {
        model[method]?.mockReset?.();
      });
    }
  });
};
