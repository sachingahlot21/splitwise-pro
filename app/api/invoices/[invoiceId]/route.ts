import { NextResponse } from 'next/server';
import { deleteInvoice, getInvoice, updateInvoice } from '@/lib/server/services';

export async function GET(
  _: Request,
  { params }: { params: any }
) {
  const { invoiceId } = await params;
  const invoice = await getInvoice(invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json(invoice);
}

export async function PATCH(
  request: Request,
  { params }: { params: any }
) {
  const body = await request.json();
  const { invoiceId } = await params;
  const invoice = await updateInvoice(invoiceId, body);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json(invoice);
}

export async function DELETE(
  _: Request,
  { params }: { params: any }
) {
  const { invoiceId } = await params;
  await deleteInvoice(invoiceId);
  return NextResponse.json(null, { status: 204 });
}
