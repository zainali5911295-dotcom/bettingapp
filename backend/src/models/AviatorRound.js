import mongoose from 'mongoose';

const aviatorRoundSchema = new mongoose.Schema(
  {
    /** Monotonic id; unique index — allocated via GameCounter atomically (see aviator.service). */
    roundNumber: { type: Number, required: true, unique: true },
    status: {
      type: String,
      enum: ['betting', 'flying', 'completed'],
      default: 'betting',
    },
    serverSeed: { type: String, default: '' },
    serverSeedHash: { type: String, required: true },
    clientSeed: { type: String, default: '' },
    nonce: { type: String, required: true },
    crashMultiplier: { type: Number, default: null },
    forcedCrashMultiplier: { type: Number, default: null },
    startedAt: { type: Date, required: true },
    bettingEndsAt: { type: Date, required: true },
    flyingStartedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

aviatorRoundSchema.index({ status: 1 });

export const AviatorRound = mongoose.model('AviatorRound', aviatorRoundSchema);
