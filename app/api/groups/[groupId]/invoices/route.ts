import { NextResponse } from 'next/server';
import { getInvoices } from '@/lib/server/services';

export async function GET(
  _: Request,
  { params }: { params: { groupId: string } }
) {
  const invoices = await getInvoices(params.groupId);
  return NextResponse.json(invoices);
}
