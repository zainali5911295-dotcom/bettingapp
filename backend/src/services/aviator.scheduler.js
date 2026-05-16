import { AviatorRound } from '../models/AviatorRound.js';
import * as aviatorService from './aviator.service.js';

async function safeCreateRound(context) {
  try {
    return await aviatorService.createAviatorRound();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[aviator] ${context}:`, e?.message || e);
    let r = await AviatorRound.findOne({ status: { $in: ['betting', 'flying'] } }).sort({
      roundNumber: -1,
    });
    if (!r) {
      r = await AviatorRound.findOne().sort({ roundNumber: -1 });
    }
    return r;
  }
}

/**
 * Advances Aviator rounds and returns the latest active round (lean).
 */
export async function tickAviatorRound() {
  let round = await AviatorRound.findOne({ status: { $in: ['betting', 'flying'] } })
    .sort({ roundNumber: -1 });

  if (!round) {
    const created = await safeCreateRound('create initial round');
    return created?.toObject ? created.toObject() : created;
  }

  if (round.status === 'betting') {
    const started = await aviatorService.startFlyingIfDue(round);
    const doc = started || round;
    return doc.toObject ? doc.toObject() : doc;
  }

  if (round.status === 'flying') {
    const completed = await aviatorService.completeAviatorRoundIfDue(round);
    if (completed && completed.status === 'completed') {
      const next = await safeCreateRound('create next round after complete');
      return next?.toObject ? next.toObject() : next;
    }
    const fresh = await AviatorRound.findById(round._id).lean();
    return fresh;
  }

  return round.toObject();
}
