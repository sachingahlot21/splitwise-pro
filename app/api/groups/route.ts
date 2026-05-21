import { NextResponse } from 'next/server';
import { createGroup, getGroups } from '@/lib/server/services';
import { verifyToken, getUserFromToken } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/server/db';

export async function GET() {
  const groups = await getGroups();
  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.name || !Array.isArray(body?.members)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Auth: require Bearer token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1] || null;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ensure DB connection when auth is used
  try {
    await connectToDatabase();
  } catch (e) {
    // ignore if no MONGO_URI provided - services may still use file store
  }

  const group = await createGroup({ name: body.name, members: body.members });
  return NextResponse.json(group, { status: 201 });
}
