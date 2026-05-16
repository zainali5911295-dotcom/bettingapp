import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    req.user = { id: String(user._id), role: user.role, user };
    next();
  } catch (e) {
    if (e instanceof AppError) return next(e);
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
  }
  next();
}
