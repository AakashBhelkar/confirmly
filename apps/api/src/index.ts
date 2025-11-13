import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import connectDB from './db/connection';
import { ensureIndexes } from './db/indexes';
import { errorHandler } from './middlewares/error-handler';

// Load environment variables
dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
async function buildApp() {
  // CORS
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Swagger/OpenAPI documentation
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Confirmly API',
        description: 'API documentation for Confirmly RTO reduction platform',
        version: '1.0.0',
      },
      host: process.env.API_URL || 'localhost:4000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User management endpoints' },
        { name: 'merchants', description: 'Merchant management endpoints' },
        { name: 'orders', description: 'Order management endpoints' },
        { name: 'templates', description: 'Template management endpoints' },
        { name: 'policies', description: 'Policy management endpoints' },
        { name: 'analytics', description: 'Analytics endpoints' },
        { name: 'billing', description: 'Billing endpoints' },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

        // Connect to database (optional for preview)
        try {
          await connectDB();
          await ensureIndexes();
        } catch (error) {
          console.warn('⚠️  Database connection failed. Running in preview mode.');
        }

  // Register routes
  const { authRoutes } = await import('./routes/auth/index');
  const { v1Routes } = await import('./routes/v1/index');
  const { userRoutes } = await import('./routes/users/index');
  const { merchantRoutes } = await import('./routes/merchants/index');
  const { orderRoutes } = await import('./routes/orders/index');
  const { shopifyRoutes } = await import('./routes/integrations/shopify/index');
  const { mcpRoutes } = await import('./mcp/server');

  await app.register(authRoutes, { prefix: '/v1/auth' });
  await app.register(v1Routes, { prefix: '/v1' });
  await app.register(userRoutes, { prefix: '/v1/users' });
  await app.register(merchantRoutes, { prefix: '/v1/merchants' });
  await app.register(orderRoutes, { prefix: '/v1/orders' });
  await app.register(shopifyRoutes, { prefix: '/v1/integrations/shopify' });
  const { whatsappRoutes } = await import('./routes/integrations/whatsapp/index');
  await app.register(whatsappRoutes, { prefix: '/v1/integrations/whatsapp' });
  const { confirmationRoutes } = await import('./routes/confirmations/index');
  await app.register(confirmationRoutes, { prefix: '/v1/confirmations' });
  const { policyRoutes } = await import('./routes/policies/index');
  await app.register(policyRoutes, { prefix: '/v1/policies' });
  const { templateRoutes } = await import('./routes/templates/index');
  await app.register(templateRoutes, { prefix: '/v1/templates' });
  const { stripeRoutes } = await import('./routes/billing/stripe');
  await app.register(stripeRoutes, { prefix: '/v1/billing/stripe' });
  const { analyticsRoutes } = await import('./routes/analytics/index');
  await app.register(analyticsRoutes, { prefix: '/v1/analytics' });
  const { adminRoutes } = await import('./routes/admin/index');
  await app.register(adminRoutes, { prefix: '/v1/admin' });
  const { planRoutes } = await import('./routes/plans/index');
  await app.register(planRoutes, { prefix: '/v1/plans' });
  
  // Register webhook routes (no auth required)
  const { msg91WebhookRoute, twilioWebhookRoute } = await import('./routes/integrations/sms/webhooks');
  await app.register(msg91WebhookRoute);
  await app.register(twilioWebhookRoute);
  
  const { sendgridWebhookRoute, sesWebhookRoute } = await import('./routes/integrations/email/webhooks');
  await app.register(sendgridWebhookRoute);
  await app.register(sesWebhookRoute);
  
  await app.register(mcpRoutes);

  return app;
}

// Start server
const start = async () => {
  try {
    const app = await buildApp();
    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    console.log(`🚀 Server listening on http://${host}:${port}`);
    console.log(`📚 API documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

