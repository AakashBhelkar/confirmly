import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Fastify from 'fastify';
import { authRoutes } from '../routes/auth/index';

describe('Authentication', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify();
    await app.register(authRoutes, { prefix: '/v1/auth' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'test@example.com',
        password: 'Test1234!',
        name: 'Test User',
        merchantName: 'Test Merchant',
      },
    });

    expect(response.statusCode).toBe(201);
    const data = JSON.parse(response.body);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('accessToken');
    expect(data.data).toHaveProperty('refreshToken');
  });

  it('should login with valid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'Test1234!',
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('accessToken');
  });

  it('should reject invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'WrongPassword',
      },
    });

    expect(response.statusCode).toBe(401);
  });
});

