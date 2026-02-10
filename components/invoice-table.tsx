import { Invoice } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Eye, Pencil, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoiceId: string) => void;
  onEditInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

export function InvoiceTable({
  invoices,
  onViewInvoice,
  onEditInvoice,
  onDeleteInvoice,
}: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="bg-card border border-border/40 rounded-xl p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl mb-2">No invoices yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by adding your first invoice to track and split expenses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Invoice</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <div className="max-w-[200px]">
                  <div className="truncate">{invoice.name}</div>
                  <div className="text-xs text-muted-foreground">{invoice.items.length} items</div>
                </div>
              </TableCell>
              <TableCell>{invoice.merchant}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(invoice.date, 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
              <TableCell>
                {invoice.status === 'reviewed' ? (
                  <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Reviewed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                    <AlertCircle className="h-3 w-3" />
                    Needs Review
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewInvoice(invoice.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditInvoice(invoice.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteInvoice(invoice.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
