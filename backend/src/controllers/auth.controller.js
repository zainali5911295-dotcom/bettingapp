import validator from 'validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, username, referralCode } = req.body || {};
  if (!email || !password || !username) {
    throw new AppError('email, password, and username are required', 400);
  }
  if (!validator.isEmail(String(email))) throw new AppError('Invalid email', 400);
  if (String(username).length < 3) throw new AppError('Username too short', 400);

  const result = await authService.registerUser({ email, password, username, referralCode });
  res.status(201).json({ ok: true, ...result });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new AppError('email and password are required', 400);
  const result = await authService.loginUser({ email, password });
  res.json({ ok: true, ...result });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new AppError('email and password are required', 400);
  console.log('adminLogin route hit', { email });
  const result = await authService.adminLoginUser({ email, password });
  console.log('adminLogin success', { email, adminId: result.admin._id });
  res.json({ ok: true, ...result });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  const result = await authService.refreshSession(refreshToken);
  res.json({ ok: true, ...result });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  await authService.logoutUser(req.user.id, refreshToken);
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    ok: true,
    user: {
      id: req.user.user._id,
      email: req.user.user.email,
      username: req.user.user.username,
      role: req.user.user.role,
      walletBalance: req.user.user.walletBalance,
      referralCode: req.user.user.referralCode,
      clientSeed: req.user.user.clientSeed,
    },
  });
});

export const patchClientSeed = asyncHandler(async (req, res) => {
  const { clientSeed } = req.body || {};
  const user = await authService.updateClientSeed(req.user.id, clientSeed);
  res.json({ ok: true, user });
});
