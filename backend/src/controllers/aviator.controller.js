import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import * as aviatorService from '../services/aviator.service.js';
import { AviatorBet } from '../models/AviatorBet.js';
import { AviatorRound } from '../models/AviatorRound.js';
import {
  crashMultiplierFromDigest,
  gameDigest,
  sha256Hex,
} from '../services/provablyFair.service.js';
import { env } from '../config/env.js';

export const getRoundVerify = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const round = await AviatorRound.findById(id).lean();
  if (!round) throw new AppError('Round not found', 404);
  if (round.status !== 'completed') {
    throw new AppError('Round not finalized yet', 400);
  }

  const digest = gameDigest(round.serverSeed, round.clientSeed || '', round.nonce);
  const expected = crashMultiplierFromDigest(digest, env.aviatorHouseEdge);
  const hashOk = sha256Hex(round.serverSeed) === round.serverSeedHash;

  res.json({
    ok: true,
    round: {
      id: round._id,
      roundNumber: round.roundNumber,
      serverSeed: round.serverSeed,
      serverSeedHash: round.serverSeedHash,
      clientSeed: round.clientSeed,
      nonce: round.nonce,
      crashMultiplier: round.crashMultiplier,
      forcedCrashMultiplier: round.forcedCrashMultiplier,
      digest,
      expectedFairCrash: Math.max(1.01, Math.round(expected * 100) / 100),
      hashOk,
    },
  });
});

export const getState = asyncHandler(async (req, res) => {
  const recent = await aviatorService.getRecentAviatorRounds(20);
  res.json({ ok: true, recent });
});

export const myBets = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    AviatorBet.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('roundId', 'roundNumber crashMultiplier status')
      .lean(),
    AviatorBet.countDocuments({ userId: req.user.id }),
  ]);

  res.json({ ok: true, items, total, page, limit });
});
