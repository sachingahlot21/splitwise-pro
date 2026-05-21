import { NextResponse } from 'next/server';
import { createInvoice, getInvoices } from '@/lib/server/services';
import { verifyToken } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/server/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const groupId = url.searchParams.get('groupId') || undefined;
  const invoices = await getInvoices(groupId);
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (
    !body?.groupId ||
    !body?.merchant ||
    !body?.date ||
    typeof body?.total !== 'number' ||
    !Array.isArray(body?.items) ||
    !body?.whoPaid
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1] || null;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try { await connectToDatabase(); } catch (e) {}

  const invoice = await createInvoice({
    groupId: body.groupId,
    merchant: body.merchant,
    date: body.date,
    total: body.total,
    items: body.items,
    whoPaid: body.whoPaid,
  });

  return NextResponse.json(invoice, { status: 201 });
}
