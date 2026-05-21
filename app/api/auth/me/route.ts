import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/server/auth';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.substring(7) : null;
  const user = await getUserFromToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } });
}
