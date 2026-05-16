import mongoose from 'mongoose';

export const TransactionTypes = Object.freeze({
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL_REQUEST: 'WITHDRAWAL_REQUEST',
  WITHDRAWAL_APPROVED: 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED: 'WITHDRAWAL_REJECTED',
  BET_COLOR: 'BET_COLOR',
  WIN_COLOR: 'WIN_COLOR',
  BET_AVIATOR: 'BET_AVIATOR',
  WIN_AVIATOR: 'WIN_AVIATOR',
  REFERRAL_COMMISSION: 'REFERRAL_COMMISSION',
  ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT',
});

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: Object.values(TransactionTypes) },
    /** Positive adds to wallet, negative removes */
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
