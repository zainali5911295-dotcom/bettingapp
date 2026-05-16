import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Transaction, TransactionTypes } from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';

/**
 * Atomically adjust wallet balance and append a ledger row.
 * @param {mongoose.ClientSession|null} session
 */
export async function applyWalletChange(
  userId,
  amount,
  type,
  meta = {},
  session = null
) {
  const inc = Number(amount);
  if (!Number.isFinite(inc)) {
    throw new AppError('Invalid amount', 400);
  }
  if (inc === 0) {
    const user = await User.findById(userId).session(session).lean();
    if (!user) throw new AppError('User not found', 404);
    await Transaction.create(
      [
        {
          userId,
          type,
          amount: 0,
          balanceAfter: user.walletBalance,
          meta,
        },
      ],
      { session }
    );
    return user.walletBalance;
  }
  if (inc < 0) {
    filter.walletBalance = { $gte: Math.abs(inc) };
  }

  const updated = await User.findOneAndUpdate(
    filter,
    { $inc: { walletBalance: inc } },
    { new: true, session, runValidators: true }
  ).lean();

  if (!updated) {
    if (inc < 0) throw new AppError('Insufficient balance', 402);
    throw new AppError('User not found', 404);
  }

  await Transaction.create(
    [
      {
        userId,
        type,
        amount: inc,
        balanceAfter: updated.walletBalance,
        meta,
      },
    ],
    { session }
  );

  return updated.walletBalance;
}

export async function getTransactions(userId, { page = 1, limit = 20 } = {}) {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  const skip = (p - 1) * l;

  const [items, total] = await Promise.all([
    Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    Transaction.countDocuments({ userId }),
  ]);

  return { items, total, page: p, limit: l };
}
