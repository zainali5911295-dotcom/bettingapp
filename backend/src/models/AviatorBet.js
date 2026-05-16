import mongoose from 'mongoose';

const aviatorBetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AviatorRound',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    cashoutMultiplier: { type: Number, default: null },
    profit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'cashed_out', 'lost'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

aviatorBetSchema.index({ roundId: 1, userId: 1 });

export const AviatorBet = mongoose.model('AviatorBet', aviatorBetSchema);
