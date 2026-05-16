import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback = null) {
  const v = process.env[name] ?? fallback;
  if (v === null || v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  mongodbUri: required('MONGODB_URI'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  trustProxy: process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true',
  minDepositAmount: Number(process.env.MIN_DEPOSIT_AMOUNT) || 1,
  minWithdrawalAmount: Number(process.env.MIN_WITHDRAWAL_AMOUNT) || 10,
  maxBetAmount: Number(process.env.MAX_BET_AMOUNT) || 5000,
  referralCommissionRate: Number(process.env.REFERRAL_COMMISSION_RATE) || 0.001,
  colorBettingFraction: Math.min(
    0.99,
    Math.max(0.5, Number(process.env.COLOR_PREDICTION_BETTING_FRACTION) || 0.85)
  ),
  aviatorRoundIntervalMs: Number(process.env.AVIATOR_ROUND_INTERVAL_MS) || 15000,
  aviatorBettingPhaseMs: Number(process.env.AVIATOR_BETTING_PHASE_MS) || 5000,
  aviatorHouseEdge: Number(process.env.AVIATOR_HOUSE_EDGE) || 0.01,
  aviatorTickMs: Math.max(50, Number(process.env.AVIATOR_TICK_MS) || 100),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
};
