import { AviatorRound } from '../models/AviatorRound.js';
import * as aviatorService from './aviator.service.js';

/**
 * Advances Aviator rounds and returns the latest active round (lean).
 */
export async function tickAviatorRound() {
  let round = await AviatorRound.findOne({ status: { $in: ['betting', 'flying'] } })
    .sort({ roundNumber: -1 });

  if (!round) {
    round = await aviatorService.createAviatorRound();
    return round.toObject();
  }

  if (round.status === 'betting') {
    const started = await aviatorService.startFlyingIfDue(round);
    const doc = started || round;
    return doc.toObject ? doc.toObject() : doc;
  }

  if (round.status === 'flying') {
    const completed = await aviatorService.completeAviatorRoundIfDue(round);
    if (completed && completed.status === 'completed') {
      const next = await aviatorService.createAviatorRound();
      return next.toObject();
    }
    const fresh = await AviatorRound.findById(round._id).lean();
    return fresh;
  }

  return round.toObject();
}
