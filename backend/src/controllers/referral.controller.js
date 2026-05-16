import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

export const referralStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [referees, referrer] = await Promise.all([
    User.countDocuments({ referredBy: userId }),
    User.findById(userId).select('referralCode referredBy').lean(),
  ]);

  res.json({
    ok: true,
    referralCode: referrer?.referralCode,
    referredBy: referrer?.referredBy ?? null,
    refereeCount: referees,
  });
});

export const listReferees = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find({ referredBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('username createdAt')
      .lean(),
    User.countDocuments({ referredBy: req.user.id }),
  ]);

  res.json({ ok: true, items, total, page, limit });
});
