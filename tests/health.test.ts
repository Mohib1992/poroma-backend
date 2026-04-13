import request from 'supertest';
import express from 'express';
import router from '../src/routes';

describe('Health Check', () => {
  const app = express();
  app.use(router);

  it('GET /health should return 200 with status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /health should return valid timestamp', async () => {
    const response = await request(app).get('/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });

  it('GET /health should return current time', async () => {
    const beforeRequest = new Date();
    const response = await request(app).get('/health');
    const afterRequest = new Date();

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime() - 1000);
    expect(timestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime() + 1000);
  });
});
