import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateReferralCode } from '../utils/referralCode.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function ensureUniqueReferralCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = generateReferralCode();
    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }
  throw new AppError('Could not allocate referral code', 500);
}

export async function registerUser({ email, password, username, referralCode }) {
  const emailNorm = String(email).toLowerCase().trim();
  if (password.length < 8) throw new AppError('Password must be at least 8 characters', 400);

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

  let referredBy = null;
  if (referralCode) {
    const ref = await User.findOne({
      referralCode: String(referralCode).trim().toUpperCase(),
    })
      .select('_id')
      .lean();
    if (!ref) throw new AppError('Invalid referral code', 400);
    referredBy = ref._id;
  }

  const userReferralCode = await ensureUniqueReferralCode();

  try {
    const user = await User.create({
      email: emailNorm,
      passwordHash,
      username: String(username).trim(),
      referredBy,
      referralCode: userReferralCode,
    });

    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  } catch (e) {
    if (e?.code === 11000) {
      throw new AppError('Email or username already in use', 409);
    }
    throw e;
  }
}

export async function loginUser({ email, password }) {
  const emailNorm = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: emailNorm }).select('+passwordHash');
  if (!user) throw new AppError('Invalid credentials', 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError('Invalid credentials', 401);

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function adminLoginUser({ email, password }) {
  const emailNorm = String(email).toLowerCase().trim();
  console.log('adminLoginUser: attempting login', { email: emailNorm });

  const user = await User.findOne({ email: emailNorm, role: 'admin' }).select('+passwordHash');
  if (!user) {
    console.log('adminLoginUser: admin user not found', { email: emailNorm });
    throw new AppError('Invalid admin credentials', 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log('adminLoginUser: password compare result', { email: emailNorm, ok });
  if (!ok) {
    throw new AppError('Invalid admin credentials', 401);
  }

  const tokens = await issueTokens(user);
  return {
    token: tokens.accessToken,
    admin: {
      _id: user._id,
      email: user.email,
      name: user.username,
      role: user.role,
    },
  };
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) throw new AppError('Missing refresh token', 400);
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokenHash = hashToken(refreshToken);
  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user) throw new AppError('Invalid refresh token', 401);

  const match = user.refreshTokens.some((t) => t.tokenHash === tokenHash);
  if (!match) throw new AppError('Invalid refresh token', 401);

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function logoutUser(userId, refreshToken) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { tokenHash } },
  });
}

async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({ sub: String(user._id) });
  const tokenHash = hashToken(refreshToken);

  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        $each: [{ tokenHash, createdAt: new Date() }],
        $slice: -10,
      },
    },
  });

  return { accessToken, refreshToken };
}

function sanitizeUser(user) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    walletBalance: user.walletBalance,
    referralCode: user.referralCode,
    clientSeed: user.clientSeed,
  };
}

export async function updateClientSeed(userId, clientSeed) {
  const cs = String(clientSeed ?? '').slice(0, 128);
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { clientSeed: cs } },
    { new: true }
  ).lean();
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
}
