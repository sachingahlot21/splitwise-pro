import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import { findUserById } from './user-store';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
const USE_MONGO = Boolean(process.env.MONGO_URI);

export function signToken(user: { id?: any; _id?: any; email: string; name?: string }) {
  const uid = user.id || user._id;
  return jwt.sign({ id: String(uid), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; name?: string };
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token: string | null) {
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  if (USE_MONGO) {
    await import('./db');
    const user = await User.findById(payload.id).lean();
    return user;
  }

  return await findUserById(payload.id);
}
