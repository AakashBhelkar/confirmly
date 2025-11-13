import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Fastify from 'fastify';

describe('Health Check', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify();
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.status).toBe('ok');
    expect(data).toHaveProperty('timestamp');
  });
});

