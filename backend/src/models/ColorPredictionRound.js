import mongoose from 'mongoose';

export const ColorPeriods = Object.freeze([1, 3, 5]);

const colorPredictionRoundSchema = new mongoose.Schema(
  {
    periodMinutes: { type: Number, required: true, enum: [1, 3, 5] },
    roundNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['betting', 'locked', 'completed'],
      default: 'betting',
    },
    serverSeed: { type: String, default: '' },
    serverSeedHash: { type: String, required: true },
    /** Public material for verification (server may merge user default client seed) */
    clientSeed: { type: String, default: '' },
    nonce: { type: String, required: true },
    outcome: {
      type: String,
      enum: ['red', 'green', 'violet', null],
      default: null,
    },
    /** Admin override before lock */
    forcedOutcome: {
      type: String,
      enum: ['red', 'green', 'violet', null],
      default: null,
    },
    startedAt: { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

colorPredictionRoundSchema.index({ periodMinutes: 1, roundNumber: -1 });
colorPredictionRoundSchema.index({ periodMinutes: 1, status: 1 });

export const ColorPredictionRound = mongoose.model('ColorPredictionRound', colorPredictionRoundSchema);
