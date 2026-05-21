import { NextResponse } from 'next/server';
import { removeMember } from '@/lib/server/services';

export async function DELETE(
  _: Request,
  { params }: { params: { groupId: string; memberId: string } }
) {
  try {
    await removeMember(params.groupId, params.memberId);
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
