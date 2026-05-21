import { NextResponse } from 'next/server';
import { addMember, getGroup } from '@/lib/server/services';
import { verifyToken } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/server/db';

export async function GET(
  _: Request,
  { params }: { params: { groupId: string } }
) {
  const group = await getGroup(params.groupId);
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json(group.members);
}

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  const body = await request.json();
  if (!body?.name || !body?.email) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1] || null;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
  } catch (e) {}

  const member = await addMember(params.groupId, {
    name: body.name,
    email: body.email,
    avatar: body.avatar || body.name
      .split(' ')
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join(''),
    color: body.color || '#3b82f6',
  });

  return NextResponse.json(member, { status: 201 });
}
