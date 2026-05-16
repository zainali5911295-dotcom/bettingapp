import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Withdrawal } from '../models/Withdrawal.js';
import { User } from '../models/User.js';
import { Transaction, TransactionTypes } from '../models/Transaction.js';
import { applyWalletChange } from '../services/wallet.service.js';
import * as colorService from '../services/colorPrediction.service.js';
import * as aviatorService from '../services/aviator.service.js';
import mongoose from 'mongoose';

export const forceColorOutcome = asyncHandler(async (req, res) => {
  const { roundId, outcome } = req.body || {};
  if (!roundId) throw new AppError('roundId is required', 400);
  const round = await colorService.adminSetForcedColorOutcome(roundId, outcome ?? null);
  res.json({ ok: true, round });
});

export const forceAviatorCrash = asyncHandler(async (req, res) => {
  const { roundId, crashMultiplier } = req.body || {};
  if (!roundId) throw new AppError('roundId is required', 400);
  const round = await aviatorService.adminSetForcedAviatorCrash(roundId, crashMultiplier ?? null);
  res.json({ ok: true, round });
});

export const listWithdrawals = asyncHandler(async (req, res) => {
  const status = req.query.status || 'pending';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const filter = {};
  if (['pending', 'approved', 'rejected'].includes(String(status))) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email username walletBalance')
      .lean(),
    Withdrawal.countDocuments(filter),
  ]);

  res.json({ ok: true, items, total, page, limit });
});

export const approveWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNote } = req.body || {};

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const w = await Withdrawal.findOne({ _id: id, status: 'pending' }).session(session);
      if (!w) throw new AppError('Withdrawal not found or not pending', 404);

      w.status = 'approved';
      w.adminNote = String(adminNote || '').slice(0, 500);
      w.processedBy = req.user.id;
      w.processedAt = new Date();
      await w.save({ session });

      await applyWalletChange(
        w.userId,
        0,
        TransactionTypes.WITHDRAWAL_APPROVED,
        { withdrawalId: String(w._id), amount: w.amount },
        session
      );
    });
  } finally {
    await session.endSession();
  }

  const updated = await Withdrawal.findById(id).lean();
  res.json({ ok: true, withdrawal: updated });
});

export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNote } = req.body || {};

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const w = await Withdrawal.findOne({ _id: id, status: 'pending' }).session(session);
      if (!w) throw new AppError('Withdrawal not found or not pending', 404);

      await applyWalletChange(
        w.userId,
        w.amount,
        TransactionTypes.WITHDRAWAL_REJECTED,
        { withdrawalId: String(w._id) },
        session
      );

      w.status = 'rejected';
      w.adminNote = String(adminNote || '').slice(0, 500);
      w.processedBy = req.user.id;
      w.processedAt = new Date();
      await w.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const updated = await Withdrawal.findById(id).lean();
  res.json({ ok: true, withdrawal: updated });
});

export const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [totalUsers, totalBalance, pendingWithdrawals, revenueAggregate] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$walletBalance' } } }]),
    Withdrawal.countDocuments({ status: 'pending' }),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const recentDays = 7;
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - (recentDays - 1));

  const dailyRevenue = await Transaction.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const revenueByDay = [];
  for (let i = 0; i < recentDays; i += 1) {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + i);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayItem = dailyRevenue.find(
      (row) =>
        row._id.year === date.getUTCFullYear() &&
        row._id.month === date.getUTCMonth() + 1 &&
        row._id.day === date.getUTCDate()
    );
    revenueByDay.push({ date: label, value: dayItem ? dayItem.total : 0 });
  }

  const totalBalanceValue = totalBalance?.[0]?.total || 0;
  res.json({
    ok: true,
    stats: {
      totalUsers,
      totalBalance: totalBalanceValue,
      todaysProfit: revenueAggregate?.[0]?.total || 0,
      activeGames: 2,
      pendingWithdrawals,
      totalDeposits: 0,
      totalWithdrawals: 0,
      revenueByDay,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = { role: 'user' };
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ ok: true, data, total, page, limit });
});

export const updateUserBalance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount)) throw new AppError('Invalid amount', 400);

  const balanceAfter = await applyWalletChange(
    id,
    amount,
    TransactionTypes.ADMIN_ADJUSTMENT,
    { note: 'admin_balance_edit', adminId: req.user.id }
  );

  res.json({ ok: true, balanceAfter });
});

export const toggleUserBan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banned = req.body?.banned === true || req.body?.banned === 'true';

  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: banned },
    { new: true }
  ).lean();
  if (!user) throw new AppError('User not found', 404);

  res.json({ ok: true, user });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const type = String(req.query.type || '').trim();
  const userSearch = String(req.query.user || '').trim();
  const after = req.query.after ? new Date(String(req.query.after)) : null;
  const before = req.query.before ? new Date(String(req.query.before)) : null;

  const filter = {};
  if (type) filter.type = type.toUpperCase();
  if (userSearch) {
    const users = await User.find({
      $or: [
        { email: { $regex: userSearch, $options: 'i' } },
        { username: { $regex: userSearch, $options: 'i' } },
      ],
    }).select('_id');
    filter.userId = { $in: users.map((u) => u._id) };
  }
  if (after || before) filter.createdAt = {};
  if (after) filter.createdAt.$gte = after;
  if (before) filter.createdAt.$lte = before;

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email username')
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  const data = items.map((tx) => ({
    ...tx,
    userEmail: tx.userId?.email || 'Unknown',
    username: tx.userId?.username || '',
  }));

  res.json({ ok: true, data, total, page, limit });
});
