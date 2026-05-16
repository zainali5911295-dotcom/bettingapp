import mongoose from 'mongoose';

const colorPredictionBetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ColorPredictionRound',
      required: true,
      index: true,
    },
    color: { type: String, enum: ['red', 'green', 'violet'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    multiplier: { type: Number, required: true },
    payout: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'won', 'lost', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

colorPredictionBetSchema.index({ roundId: 1, userId: 1 });

export const ColorPredictionBet = mongoose.model('ColorPredictionBet', colorPredictionBetSchema);
