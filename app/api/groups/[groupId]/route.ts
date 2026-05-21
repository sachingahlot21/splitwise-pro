import { NextResponse } from 'next/server';
import { deleteGroup, getGroup, updateGroup } from '@/lib/server/services';

export async function GET(
  _: Request,
  { params }: { params: { groupId: string } }
) {
  const group = await getGroup(params.groupId);
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json(group);
}

export async function PATCH(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  const body = await request.json();
  if (!body?.name) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const updatedGroup = await updateGroup(params.groupId, { name: body.name });
  if (!updatedGroup) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json(updatedGroup);
}

export async function DELETE(
  _: Request,
  { params }: { params: { groupId: string } }
) {
  await deleteGroup(params.groupId);
  return NextResponse.json(null, { status: 204 });
}
