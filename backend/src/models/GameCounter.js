import mongoose from 'mongoose';

/** Atomic sequence for Aviator round numbers (avoids E11000 on concurrent creates). */
const gameCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: 'gamecounters' }
);

export const GameCounter = mongoose.model('GameCounter', gameCounterSchema);

export const AVIATOR_ROUND_COUNTER_ID = 'aviatorRound';
