import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/server/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/server/auth';
import { findUserByEmail } from '@/lib/server/user-store';

const USE_MONGO = Boolean(process.env.MONGO_URI);

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body || {};

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    if (USE_MONGO) {
      await connectToDatabase();
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = signToken({ id: user._id, email: user.email, name: user.name });
      return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
