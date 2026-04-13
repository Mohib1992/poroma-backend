import { mockPrisma, resetMocks } from './mocks';

jest.mock('../src/config', () => ({
  prisma: mockPrisma,
  config: {
    port: 3000,
    nodeEnv: 'test',
    jwt: {
      secret: 'test-secret-key-at-least-32-characters-long',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    cors: {
      origin: '*',
    },
  },
}));

beforeEach(() => {
  resetMocks();
});
