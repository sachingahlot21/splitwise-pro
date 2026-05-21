import { NextResponse } from 'next/server';
import { deleteInvoice, getInvoice, updateInvoice } from '@/lib/server/services';

export async function GET(
  _: Request,
  { params }: { params: { invoiceId: string } }
) {
  const invoice = await getInvoice(params.invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json(invoice);
}

export async function PATCH(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  const body = await request.json();
  const invoice = await updateInvoice(params.invoiceId, body);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json(invoice);
}

export async function DELETE(
  _: Request,
  { params }: { params: { invoiceId: string } }
) {
  await deleteInvoice(params.invoiceId);
  return NextResponse.json(null, { status: 204 });
}
