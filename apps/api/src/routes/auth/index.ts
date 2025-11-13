import { FastifyInstance } from 'fastify';
import { loginRoute } from './login';
import { registerRoute } from './register';
import { refreshRoute } from './refresh';
import { resetPasswordRoute } from './reset-password';
import { impersonateRoute } from './impersonate';

export const authRoutes = async (app: FastifyInstance) => {
  await app.register(loginRoute);
  await app.register(registerRoute);
  await app.register(refreshRoute);
  await app.register(resetPasswordRoute);
  await app.register(impersonateRoute);
};

