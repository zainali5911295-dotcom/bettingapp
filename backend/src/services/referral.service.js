import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { applyWalletChange } from './wallet.service.js';
import { TransactionTypes } from '../models/Transaction.js';

export async function creditReferralCommissionOnBet({ bettorUserId, betAmount, session }) {
  if (!env.referralCommissionRate || betAmount <= 0) return;

  const bettor = await User.findById(bettorUserId).select('referredBy').session(session).lean();
  if (!bettor?.referredBy) return;

  const commission = Math.round(betAmount * env.referralCommissionRate * 1e6) / 1e6;
  if (commission <= 0) return;

  await applyWalletChange(
    bettor.referredBy,
    commission,
    TransactionTypes.REFERRAL_COMMISSION,
    { fromUserId: String(bettorUserId), betAmount },
    session
  );
}
