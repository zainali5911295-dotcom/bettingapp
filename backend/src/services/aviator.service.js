import mongoose from 'mongoose';
import { AviatorRound } from '../models/AviatorRound.js';
import { AviatorBet } from '../models/AviatorBet.js';
import { GameCounter, AVIATOR_ROUND_COUNTER_ID } from '../models/GameCounter.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import {
  crashMultiplierFromDigest,
  gameDigest,
  generateNonce,
  generateServerSeed,
  sha256Hex,
} from './provablyFair.service.js';
import { applyWalletChange } from './wallet.service.js';
import { TransactionTypes } from '../models/Transaction.js';
import { creditReferralCommissionOnBet } from './referral.service.js';

export const PUBLIC_AVIATOR_CLIENT_SEED =
  process.env.AVIATOR_PUBLIC_CLIENT_SEED || 'public-aviator-client-seed-v1';

function smoothstep(u) {
  const x = Math.min(1, Math.max(0, u));
  return x * x * (3 - 2 * x);
}

/**
 * Deterministic multiplier for clients: 1.00 at start, approaches crashMultiplier at end of flight window.
 */
export function multiplierAtElapsed(crashMultiplier, elapsedMs, flightMs) {
  if (flightMs <= 0) return 1;
  const u = elapsedMs / flightMs;
  const m = 1 + (crashMultiplier - 1) * smoothstep(u);
  return Math.round(m * 100) / 100;
}

export function getFlightDurationMs() {
  return Math.max(1000, env.aviatorRoundIntervalMs - env.aviatorBettingPhaseMs);
}

function isMongoDuplicateKeyError(err) {
  const code = err?.code ?? err?.cause?.code;
  if (code === 11000 || code === 11001) return true;
  const name = err?.name;
  if (name === 'MongoServerError' || name === 'MongoBulkWriteError') {
    if (err?.code === 11000 || err?.code === 11001) return true;
  }
  const msg = String(err?.message ?? '');
  return msg.includes('E11000') || msg.includes('E11001');
}

/**
 * Align the atomic counter with existing rounds (run once at startup and after rare dup-key races).
 * `seq` stores the last assigned roundNumber; the next create uses $inc then inserts that value.
 */
export async function syncAviatorRoundCounterFromAviatorRounds() {
  const [agg, counter] = await Promise.all([
    AviatorRound.aggregate([{ $group: { _id: null, m: { $max: '$roundNumber' } } }]),
    GameCounter.findById(AVIATOR_ROUND_COUNTER_ID).select('seq').lean(),
  ]);
  const maxRound = Number(agg[0]?.m) || 0;
  const cur = Number(counter?.seq) || 0;
  const floor = Math.max(maxRound, cur);
  await GameCounter.findOneAndUpdate(
    { _id: AVIATOR_ROUND_COUNTER_ID },
    { $set: { seq: floor } },
    { upsert: true }
  );
}

async function reserveNextAviatorRoundNumber() {
  const doc = await GameCounter.findOneAndUpdate(
    { _id: AVIATOR_ROUND_COUNTER_ID },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

const CREATE_ROUND_MAX_ATTEMPTS = 10;

export async function createAviatorRound() {
  const now = Date.now();
  const startedAt = new Date(now);
  const bettingEndsAt = new Date(now + env.aviatorBettingPhaseMs);
  const serverSeed = generateServerSeed();
  const serverSeedHash = sha256Hex(serverSeed);
  const nonce = generateNonce();

  let lastError;
  for (let attempt = 0; attempt < CREATE_ROUND_MAX_ATTEMPTS; attempt += 1) {
    try {
      const roundNumber = await reserveNextAviatorRoundNumber();
      const round = await AviatorRound.create({
        roundNumber,
        status: 'betting',
        serverSeed,
        serverSeedHash,
        clientSeed: '',
        nonce,
        startedAt,
        bettingEndsAt,
      });
      return round;
    } catch (e) {
      lastError = e;
      if (!isMongoDuplicateKeyError(e)) {
        throw e;
      }
      // eslint-disable-next-line no-console
      console.warn(
        `[aviator] duplicate roundNumber (attempt ${attempt + 1}/${CREATE_ROUND_MAX_ATTEMPTS}), resyncing counter`
      );
      await syncAviatorRoundCounterFromAviatorRounds();
    }
  }

  throw lastError;
}

export async function startFlyingIfDue(round) {
  if (round.status !== 'betting') return round;
  const now = Date.now();
  if (now < round.bettingEndsAt.getTime()) return round;

  const clientSeed = PUBLIC_AVIATOR_CLIENT_SEED;
  const digest = gameDigest(round.serverSeed, clientSeed, round.nonce);
  let crash =
    round.forcedCrashMultiplier && round.forcedCrashMultiplier >= 1
      ? Math.round(round.forcedCrashMultiplier * 100) / 100
      : crashMultiplierFromDigest(digest, env.aviatorHouseEdge);

  crash = Math.max(1.01, crash);

  const updated = await AviatorRound.findOneAndUpdate(
    { _id: round._id, status: 'betting' },
    {
      $set: {
        status: 'flying',
        clientSeed,
        crashMultiplier: crash,
        flyingStartedAt: new Date(),
      },
    },
    { new: true }
  );

  return updated;
}

export async function completeAviatorRoundIfDue(round) {
  if (round.status !== 'flying' || !round.flyingStartedAt || !round.crashMultiplier) return round;

  const flightMs = getFlightDurationMs();
  const end = round.flyingStartedAt.getTime() + flightMs;
  if (Date.now() < end) return round;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const fresh = await AviatorRound.findOne({ _id: round._id, status: 'flying' }).session(session);
      if (!fresh) return;

      const lostBets = await AviatorBet.find({
        roundId: fresh._id,
        status: 'pending',
      }).session(session);

      for (const bet of lostBets) {
        await AviatorBet.findByIdAndUpdate(
          bet._id,
          { $set: { status: 'lost', profit: 0 } },
          { session }
        );
      }

      fresh.status = 'completed';
      fresh.completedAt = new Date();
      await fresh.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return AviatorRound.findById(round._id);
}

export async function placeAviatorBet({ userId, roundId, amount }) {
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt < 0.01) throw new AppError('Invalid bet amount', 400);
  if (amt > env.maxBetAmount) throw new AppError('Bet exceeds maximum', 400);

  const session = await mongoose.startSession();
  try {
    let bet;
    await session.withTransaction(async () => {
      const round = await AviatorRound.findById(roundId).session(session);
      if (!round || round.status !== 'betting') {
        throw new AppError('Betting closed for this round', 400);
      }
      if (Date.now() >= round.bettingEndsAt.getTime()) {
        throw new AppError('Betting closed for this round', 400);
      }

      await applyWalletChange(
        userId,
        -amt,
        TransactionTypes.BET_AVIATOR,
        { roundId },
        session
      );

      await creditReferralCommissionOnBet({ bettorUserId: userId, betAmount: amt, session });

      const created = await AviatorBet.create(
        [{ userId, roundId, amount: amt }],
        { session }
      );
      bet = created[0];
    });
    return bet;
  } finally {
    await session.endSession();
  }
}

export async function cashOutAviatorBet({ userId, roundId }) {
  const round = await AviatorRound.findById(roundId);
  if (!round || round.status !== 'flying' || !round.crashMultiplier || !round.flyingStartedAt) {
    throw new AppError('Cannot cash out now', 400);
  }

  const flightMs = getFlightDurationMs();
  const elapsed = Date.now() - round.flyingStartedAt.getTime();
  if (elapsed >= flightMs) throw new AppError('Plane already crashed', 400);

  const m = multiplierAtElapsed(round.crashMultiplier, elapsed, flightMs);
  if (m >= round.crashMultiplier) {
    throw new AppError('Plane already crashed', 400);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const bet = await AviatorBet.findOne({ userId, roundId, status: 'pending' }).session(session);
      if (!bet) throw new AppError('No open bet for this round', 404);

      const payout = Math.round(bet.amount * m * 1e6) / 1e6;
      const profit = Math.round((payout - bet.amount) * 1e6) / 1e6;

      await applyWalletChange(
        userId,
        payout,
        TransactionTypes.WIN_AVIATOR,
        { betId: bet._id, roundId, multiplier: m },
        session
      );

      await AviatorBet.findByIdAndUpdate(
        bet._id,
        { $set: { status: 'cashed_out', cashoutMultiplier: m, profit } },
        { session }
      );

      result = { multiplier: m, payout, profit };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function adminSetForcedAviatorCrash(roundId, crashMultiplier) {
  const c = Number(crashMultiplier);
  if (!Number.isFinite(c) && crashMultiplier !== null) {
    throw new AppError('Invalid crash multiplier', 400);
  }
  const round = await AviatorRound.findById(roundId);
  if (!round) throw new AppError('Round not found', 404);
  if (round.status !== 'betting') {
    throw new AppError('Can only force crash while round is in betting phase', 400);
  }
  if (crashMultiplier === null) {
    round.forcedCrashMultiplier = null;
  } else if (c < 1.01) {
    throw new AppError('Crash multiplier must be >= 1.01', 400);
  } else {
    round.forcedCrashMultiplier = Math.round(c * 100) / 100;
  }
  await round.save();
  return round;
}

export async function getRecentAviatorRounds(limit = 30) {
  return AviatorRound.find({ status: 'completed' })
    .sort({ roundNumber: -1 })
    .limit(limit)
    .lean();
}
