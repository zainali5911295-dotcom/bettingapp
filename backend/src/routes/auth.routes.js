import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const r = Router();

r.post('/register', authLimiter, c.register);
r.post('/login', authLimiter, c.login);
r.post('/admin/login', authLimiter, c.adminLogin);
r.post('/refresh', authLimiter, c.refresh);
r.post('/logout', requireAuth, c.logout);
r.get('/me', requireAuth, c.me);
r.patch('/me/client-seed', requireAuth, c.patchClientSeed);

export default r;
