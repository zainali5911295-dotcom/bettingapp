import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import * as aviatorService from '../services/aviator.service.js';
import { AviatorRound } from '../models/AviatorRound.js';

function verifySocketToken(token) {
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function attachAviatorSockets(httpServer) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: env.clientOrigin === '*' ? true : env.clientOrigin, credentials: true },
  });

  const aviatorNs = io.of('/aviator');

  aviatorNs.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const payload = verifySocketToken(token);
    if (!payload?.sub) {
      return next(new Error('Unauthorized'));
    }
    socket.userId = String(payload.sub);
    next();
  });

  aviatorNs.on('connection', (socket) => {
    socket.join('aviator:all');

    socket.on('place_bet', async (payload, ack) => {
      try {
        const amount = Number(payload?.amount);
        const round = await AviatorRound.findOne({ status: 'betting' }).sort({ roundNumber: -1 });
        if (!round) throw new Error('No active round');
        const bet = await aviatorService.placeAviatorBet({
          userId: socket.userId,
          roundId: round._id,
          amount,
        });
        if (typeof ack === 'function') ack({ ok: true, bet });
        aviatorNs.emit('bet_placed', { userId: socket.userId, roundId: String(round._id) });
      } catch (e) {
        if (typeof ack === 'function') ack({ ok: false, message: e.message || 'error' });
      }
    });

    socket.on('cash_out', async (payload, ack) => {
      try {
        const roundId = payload?.roundId;
        if (!roundId) throw new Error('roundId required');
        const result = await aviatorService.cashOutAviatorBet({
          userId: socket.userId,
          roundId,
        });
        if (typeof ack === 'function') ack({ ok: true, ...result });
        aviatorNs.emit('cash_out', { userId: socket.userId, roundId: String(roundId), ...result });
      } catch (e) {
        if (typeof ack === 'function') ack({ ok: false, message: e.message || 'error' });
      }
    });
  });

  return { io, aviatorNs };
}

export async function broadcastAviatorState(aviatorNs) {
  if (!aviatorNs) return;

  const round = await AviatorRound.findOne({ status: { $in: ['betting', 'flying'] } })
    .sort({ roundNumber: -1 })
    .lean();

  if (!round) {
    aviatorNs.emit('state', { phase: 'idle' });
    return;
  }

  if (round.status === 'betting') {
    aviatorNs.emit('state', {
      phase: 'betting',
      roundId: String(round._id),
      roundNumber: round.roundNumber,
      serverSeedHash: round.serverSeedHash,
      nonce: round.nonce,
      bettingEndsAt: round.bettingEndsAt,
    });
    return;
  }

  const flightMs = aviatorService.getFlightDurationMs();
  const elapsed = Date.now() - new Date(round.flyingStartedAt).getTime();
  const m = aviatorService.multiplierAtElapsed(round.crashMultiplier, elapsed, flightMs);
  const crashed = elapsed >= flightMs;

  aviatorNs.emit('state', {
    phase: crashed ? 'crashed' : 'flying',
    roundId: String(round._id),
    roundNumber: round.roundNumber,
    multiplier: m,
    crashMultiplier: round.crashMultiplier,
    serverSeedHash: round.serverSeedHash,
    nonce: round.nonce,
    clientSeed: round.clientSeed,
    elapsedMs: elapsed,
    flightMs,
  });
}
