import { Router } from 'express';
import authRoutes from './auth.routes.js';
import walletRoutes from './wallet.routes.js';
import referralRoutes from './referral.routes.js';
import colorRoutes from './colorPrediction.routes.js';
import aviatorRoutes from './aviator.routes.js';
import adminRoutes from './admin.routes.js';

const r = Router();

r.use('/auth', authRoutes);
r.use('/wallet', walletRoutes);
r.use('/referral', referralRoutes);
r.use('/color-prediction', colorRoutes);
r.use('/aviator', aviatorRoutes);
r.use('/admin', adminRoutes);

export default r;
