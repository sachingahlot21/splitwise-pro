import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/server/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/server/auth';
import { findUserByEmail, addLocalUser } from '@/lib/server/user-store';

const USE_MONGO = Boolean(process.env.MONGO_URI);

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, avatar, color } = body || {};

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    if (USE_MONGO) {
      await connectToDatabase();
      const existing = await User.findOne({ email }).lean();
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash, avatar: avatar || '', color: color || '#3b82f6' });
      const token = signToken({ id: user._id, email: user.email, name: user.name });

      return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } }, { status: 201 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await addLocalUser({ name, email, passwordHash, avatar: avatar || '', color: color || '#3b82f6' });
    const token = signToken({ id: user.id, email: user.email, name: user.name });

    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
