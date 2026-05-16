import { Router } from 'express';
import * as c from '../controllers/aviator.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const r = Router();
r.get('/verify/:id', c.getRoundVerify);
r.get('/me/bets', requireAuth, c.myBets);
r.get('/state', c.getState);
export default r;
