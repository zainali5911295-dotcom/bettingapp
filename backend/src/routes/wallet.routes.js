import { Router } from 'express';
import * as c from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { strictLimiter } from '../middleware/rateLimiter.middleware.js';

const r = Router();

r.use(requireAuth);

r.post('/deposit', strictLimiter, c.deposit);
r.post('/withdraw', strictLimiter, c.requestWithdrawal);
r.get('/withdrawals', c.listMyWithdrawals);
r.get('/transactions', c.listTransactions);

export default r;
