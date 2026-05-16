import { Router } from 'express';
import * as c from '../controllers/colorPrediction.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const r = Router();

r.get('/verify/:id', c.getRoundVerify);
r.get('/me/bets', requireAuth, c.myBets);
r.get('/:period', c.getRounds);
r.post('/:period/bet', requireAuth, c.placeBet);

export default r;
