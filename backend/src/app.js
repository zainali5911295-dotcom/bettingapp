import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import routes from './routes/index.js';
import adminRoutes from './routes/admin.routes.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();
  if (env.trustProxy) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin === '*' ? true : env.clientOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '32kb' }));
  app.use(mongoSanitize());
  app.use(apiLimiter);

  app.get('/health', (req, res) => res.json({ ok: true }));

  // Main API routes
  app.use('/api', routes);

  // Admin Panel Routes (Yeh add kiya hai)
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}