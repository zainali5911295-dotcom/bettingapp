import { Router } from 'express';
import * as c from '../controllers/referral.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const r = Router();
r.use(requireAuth);
r.get('/stats', c.referralStats);
r.get('/referees', c.listReferees);
export default r;
