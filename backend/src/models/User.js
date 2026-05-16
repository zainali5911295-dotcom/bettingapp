import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Optional default client seed for provably fair games */
    clientSeed: {
      type: String,
      default: '',
      maxlength: 128,
    },
    referralCode: { type: String, unique: true, uppercase: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isBanned: { type: Boolean, default: false },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
