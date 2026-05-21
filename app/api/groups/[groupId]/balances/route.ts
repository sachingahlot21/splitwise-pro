import { NextResponse } from 'next/server';
import { getGroupBalances } from '@/lib/server/services';

export async function GET(
  _: Request,
  { params }: { params: { groupId: string } }
) {
  const balances = await getGroupBalances(params.groupId);
  if (!balances) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json(balances);
}
