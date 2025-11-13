import { FastifyInstance } from 'fastify';

export interface FastifyConfig {
  port: number;
  host: string;
  logger: {
    level: string;
    pretty: boolean;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    max: number;
    timeWindow: string;
  };
}

export const getFastifyConfig = (): FastifyConfig => {
  return {
    port: Number(process.env.PORT) || 4000,
    host: process.env.HOST || '0.0.0.0',
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      pretty: process.env.NODE_ENV === 'development',
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    rateLimit: {
      max: 100,
      timeWindow: '1 minute',
    },
  };
};

