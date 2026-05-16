import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import * as colorService from '../services/colorPrediction.service.js';
import { ColorPredictionBet } from '../models/ColorPredictionBet.js';
import { ColorPredictionRound } from '../models/ColorPredictionRound.js';
import { gameDigest, colorFromDigest, sha256Hex } from '../services/provablyFair.service.js';

export const getRounds = asyncHandler(async (req, res) => {
  const period = Number(req.params.period);
  if (![1, 3, 5].includes(period)) throw new AppError('Invalid period', 400);

  await colorService.ensureRoundExists(period);
  const current = await colorService.getCurrentRound(period);
  const history = await colorService.getRecentRounds(period, 30);

  res.json({
    ok: true,
    periodMinutes: period,
    current,
    history,
  });
});

export const placeBet = asyncHandler(async (req, res) => {
  const period = Number(req.params.period);
  if (![1, 3, 5].includes(period)) throw new AppError('Invalid period', 400);

  const { roundId, color, amount } = req.body || {};
  if (!roundId || !color || amount === undefined) {
    throw new AppError('roundId, color, and amount are required', 400);
  }

  const bet = await colorService.placeColorBet({
    userId: req.user.id,
    roundId,
    color,
    amount,
  });

  res.status(201).json({ ok: true, bet });
});

export const getRoundVerify = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const round = await ColorPredictionRound.findById(id).lean();
  if (!round) throw new AppError('Round not found', 404);
  if (round.status !== 'completed') {
    throw new AppError('Round not finalized yet', 400);
  }

  const digest = gameDigest(round.serverSeed, round.clientSeed || '', round.nonce);
  const expected = colorFromDigest(digest);
  const hashOk = sha256Hex(round.serverSeed) === round.serverSeedHash;

  res.json({
    ok: true,
    round: {
      id: round._id,
      periodMinutes: round.periodMinutes,
      roundNumber: round.roundNumber,
      serverSeed: round.serverSeed,
      serverSeedHash: round.serverSeedHash,
      clientSeed: round.clientSeed,
      nonce: round.nonce,
      outcome: round.outcome,
      forcedOutcome: round.forcedOutcome,
      digest,
      expectedFairOutcome: expected,
      hashOk,
    },
  });
});

export const myBets = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ColorPredictionBet.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('roundId', 'periodMinutes roundNumber outcome status')
      .lean(),
    ColorPredictionBet.countDocuments({ userId: req.user.id }),
  ]);

  res.json({ ok: true, items, total, page, limit });
});
