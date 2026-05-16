import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { applyWalletChange, getTransactions } from '../services/wallet.service.js';
import { TransactionTypes } from '../models/Transaction.js';
import { Withdrawal } from '../models/Withdrawal.js';
import mongoose from 'mongoose';

/**
 * Demo deposit — wire a real payment provider before production.
 */
export const deposit = asyncHandler(async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount < env.minDepositAmount) {
    throw new AppError(`Minimum deposit is ${env.minDepositAmount}`, 400);
  }

  const balanceAfter = await applyWalletChange(
    req.user.id,
    amount,
    TransactionTypes.DEPOSIT,
    { note: 'demo_deposit' }
  );

  res.json({ ok: true, walletBalance: balanceAfter });
});

export const requestWithdrawal = asyncHandler(async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount < env.minWithdrawalAmount) {
    throw new AppError(`Minimum withdrawal is ${env.minWithdrawalAmount}`, 400);
  }

  const session = await mongoose.startSession();
  let withdrawal;
  try {
    await session.withTransaction(async () => {
      await applyWalletChange(
        req.user.id,
        -amount,
        TransactionTypes.WITHDRAWAL_REQUEST,
        { note: 'withdrawal_hold' },
        session
      );
      const created = await Withdrawal.create(
        [{ userId: req.user.id, amount, status: 'pending' }],
        { session }
      );
      withdrawal = created[0];
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json({ ok: true, withdrawal });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const data = await getTransactions(req.user.id, { page, limit });
  res.json({ ok: true, ...data });
});

export const listMyWithdrawals = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Withdrawal.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Withdrawal.countDocuments({ userId: req.user.id }),
  ]);

  res.json({ ok: true, items, total, page, limit });
});
