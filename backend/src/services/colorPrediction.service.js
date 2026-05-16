import mongoose from 'mongoose';
import { ColorPredictionRound } from '../models/ColorPredictionRound.js';
import { ColorPredictionBet } from '../models/ColorPredictionBet.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import {
  colorFromDigest,
  gameDigest,
  generateNonce,
  generateServerSeed,
  sha256Hex,
} from './provablyFair.service.js';
import { applyWalletChange } from './wallet.service.js';
import { TransactionTypes } from '../models/Transaction.js';
import { creditReferralCommissionOnBet } from './referral.service.js';

export const COLOR_MULTIPLIERS = Object.freeze({
  red: 2,
  green: 2,
  violet: 4.5,
});

/** Public client seed material (commit-reveal). Replace with rotating public value in production. */
export const PUBLIC_COLOR_CLIENT_SEED =
  process.env.COLOR_PUBLIC_CLIENT_SEED || 'public-color-client-seed-v1';

function roundDurationMs(periodMinutes) {
  return periodMinutes * 60 * 1000;
}

export function roundEndsAt(startedAt, periodMinutes) {
  return new Date(startedAt.getTime() + roundDurationMs(periodMinutes));
}

export async function getCurrentRound(periodMinutes) {
  const now = new Date();
  return ColorPredictionRound.findOne({
    periodMinutes,
    status: { $in: ['betting', 'locked'] },
    startedAt: { $lte: now },
    $expr: {
      $gt: [{ $add: ['$startedAt', roundDurationMs(periodMinutes)] }, now],
    },
  })
    .sort({ startedAt: -1 })
    .lean();
}

export async function getRecentRounds(periodMinutes, limit = 20) {
  return ColorPredictionRound.find({ periodMinutes, status: 'completed' })
    .sort({ roundNumber: -1 })
    .limit(limit)
    .lean();
}

async function nextRoundNumber(periodMinutes) {
  const last = await ColorPredictionRound.findOne({ periodMinutes })
    .sort({ roundNumber: -1 })
    .select('roundNumber')
    .lean();
  return (last?.roundNumber ?? 0) + 1;
}

export async function ensureRoundExists(periodMinutes) {
  let open = await getCurrentRound(periodMinutes);
  if (open) return open;

  const last = await ColorPredictionRound.findOne({ periodMinutes })
    .sort({ startedAt: -1 })
    .lean();

  const duration = roundDurationMs(periodMinutes);
  const now = Date.now();

  if (!last) {
    const startedAt = new Date(now);
    const bettingClosesAt = new Date(startedAt.getTime() + duration * env.colorBettingFraction);
    const serverSeed = generateServerSeed();
    const serverSeedHash = sha256Hex(serverSeed);
    const nonce = generateNonce();
    await ColorPredictionRound.create({
      periodMinutes,
      roundNumber: 1,
      status: 'betting',
      serverSeed,
      serverSeedHash,
      clientSeed: '',
      nonce,
      startedAt,
      bettingClosesAt,
    });
    return getCurrentRound(periodMinutes);
  }

  const nextStart = new Date(last.startedAt.getTime() + duration);
  if (last.status !== 'completed' && now < nextStart.getTime()) {
    return ColorPredictionRound.findById(last._id).lean();
  }

  if (last.status === 'completed' && now >= nextStart.getTime()) {
    await spawnRound(periodMinutes, nextStart);
    return getCurrentRound(periodMinutes);
  }

  if (last.status !== 'completed') {
    return ColorPredictionRound.findById(last._id).lean();
  }

  if (now >= nextStart.getTime()) {
    await spawnRound(periodMinutes, nextStart);
    return getCurrentRound(periodMinutes);
  }

  return null;
}

async function spawnRound(periodMinutes, startedAt) {
  const duration = roundDurationMs(periodMinutes);
  const bettingClosesAt = new Date(startedAt.getTime() + duration * env.colorBettingFraction);
  const serverSeed = generateServerSeed();
  const serverSeedHash = sha256Hex(serverSeed);
  const nonce = generateNonce();
  const roundNumber = await nextRoundNumber(periodMinutes);

  await ColorPredictionRound.create({
    periodMinutes,
    roundNumber,
    status: 'betting',
    serverSeed,
    serverSeedHash,
    clientSeed: '',
    nonce,
    startedAt,
    bettingClosesAt,
    forcedOutcome: null,
    outcome: null,
    completedAt: null,
  });
}

async function settleBetsForRoundId(roundId) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const round = await ColorPredictionRound.findOne({ _id: roundId, status: 'betting' }).session(
        session
      );
      if (!round) return;

      const clientSeed = PUBLIC_COLOR_CLIENT_SEED;
      const digest = gameDigest(round.serverSeed, clientSeed, round.nonce);
      const outcome =
        round.forcedOutcome && ['red', 'green', 'violet'].includes(round.forcedOutcome)
          ? round.forcedOutcome
          : colorFromDigest(digest);

      const bets = await ColorPredictionBet.find({ roundId: round._id, status: 'pending' }).session(
        session
      );

      for (const bet of bets) {
        const mult = COLOR_MULTIPLIERS[bet.color];
        const won = bet.color === outcome;
        const payout = won ? Math.round(bet.amount * mult * 1e6) / 1e6 : 0;

        if (won && payout > 0) {
          await applyWalletChange(
            bet.userId,
            payout,
            TransactionTypes.WIN_COLOR,
            { betId: bet._id, roundId: round._id, outcome },
            session
          );
        }

        await ColorPredictionBet.findByIdAndUpdate(
          bet._id,
          { $set: { status: won ? 'won' : 'lost', payout } },
          { session }
        );
      }

      round.status = 'locked';
      round.outcome = outcome;
      round.clientSeed = clientSeed;
      await round.save({ session });
    });
  } finally {
    await session.endSession();
  }
}

export async function tickColorRounds() {
  const now = new Date();

  for (const periodMinutes of [1, 3, 5]) {
    await ensureRoundExists(periodMinutes);

    const duration = roundDurationMs(periodMinutes);
    const active = await ColorPredictionRound.find({
      periodMinutes,
      status: { $in: ['betting', 'locked'] },
    }).sort({ startedAt: 1 });

    for (const r of active) {
      const end = new Date(r.startedAt.getTime() + duration);

      if (r.status === 'betting' && now >= r.bettingClosesAt) {
        await settleBetsForRoundId(r._id);
        continue;
      }

      if (r.status === 'locked' && now >= end) {
        const completed = await ColorPredictionRound.findOneAndUpdate(
          { _id: r._id, status: 'locked' },
          { $set: { status: 'completed', completedAt: now } },
          { new: true }
        );
        if (completed) {
          await spawnRound(periodMinutes, end);
        }
      }
    }
  }
}

export async function placeColorBet({ userId, roundId, color, amount }) {
  const amt = Number(amount);
  if (!['red', 'green', 'violet'].includes(color)) {
    throw new AppError('Invalid color', 400);
  }
  if (!Number.isFinite(amt) || amt < 0.01) {
    throw new AppError('Invalid bet amount', 400);
  }
  if (amt > env.maxBetAmount) {
    throw new AppError('Bet exceeds maximum', 400);
  }

  const round = await ColorPredictionRound.findById(roundId);
  if (!round) throw new AppError('Round not found', 404);
  if (round.status !== 'betting') throw new AppError('Betting closed for this round', 400);

  const now = new Date();
  if (now >= round.bettingClosesAt) throw new AppError('Betting closed for this round', 400);

  const mult = COLOR_MULTIPLIERS[color];

  const session = await mongoose.startSession();
  try {
    let bet;
    await session.withTransaction(async () => {
      const r2 = await ColorPredictionRound.findById(roundId).session(session);
      if (!r2 || r2.status !== 'betting' || new Date() >= r2.bettingClosesAt) {
        throw new AppError('Betting closed for this round', 400);
      }

      await applyWalletChange(
        userId,
        -amt,
        TransactionTypes.BET_COLOR,
        { roundId, color },
        session
      );

      await creditReferralCommissionOnBet({ bettorUserId: userId, betAmount: amt, session });

      const created = await ColorPredictionBet.create(
        [
          {
            userId,
            roundId,
            color,
            amount: amt,
            multiplier: mult,
          },
        ],
        { session }
      );
      bet = created[0];
    });
    return bet;
  } finally {
    await session.endSession();
  }
}

export async function adminSetForcedColorOutcome(roundId, outcome) {
  if (outcome !== null && !['red', 'green', 'violet'].includes(outcome)) {
    throw new AppError('Invalid outcome', 400);
  }
  const round = await ColorPredictionRound.findById(roundId);
  if (!round) throw new AppError('Round not found', 404);
  if (round.status !== 'betting') {
    throw new AppError('Can only force outcome while round is in betting phase', 400);
  }
  round.forcedOutcome = outcome;
  await round.save();
  return round;
}
