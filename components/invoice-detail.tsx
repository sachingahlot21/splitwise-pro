import { Invoice, Member } from '../types';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ArrowLeft, FileText, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface InvoiceDetailProps {
  invoice: Invoice;
  groupMembers: Member[];
  mode: 'view' | 'edit';
  onBack: () => void;
  onUpdate: (invoice: Invoice) => void;
}

export function InvoiceDetail({
  invoice,
  groupMembers,
  mode,
  onBack,
  onUpdate,
}: InvoiceDetailProps) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const [itemSplits, setItemSplits] = useState<Record<string, string[]>>(
    invoice.items.reduce(
      (acc, item) => ({
        ...acc,
        [item.id]: item.splitAmong || [],
      }),
      {}
    )
  );

  const toggleMemberForItem = (itemId: string, memberId: string) => {
    setItemSplits((prev) => {
      const currentSplit = prev[itemId] || [];
      const newSplit = currentSplit.includes(memberId)
        ? currentSplit.filter((id) => id !== memberId)
        : [...currentSplit, memberId];
      return { ...prev, [itemId]: newSplit };
    });
  };

  const calculateMemberTotal = (memberId: string) => {
    let total = 0;
    invoice.items.forEach((item) => {
      const split = itemSplits[item.id] || [];
      if (split.includes(memberId) && split.length > 0) {
        total += (item.quantity * item.price) / split.length;
      }
    });
    return total;
  };

  const handleFinalize = () => {
    const updatedInvoice = {
      ...invoice,
      status: 'reviewed' as const,
      items: invoice.items.map((item) => ({
        ...item,
        splitAmong: itemSplits[item.id] || [],
      })),
    };
    onUpdate(updatedInvoice);
  };

  const allItemsAssigned = invoice.items.every(
    (item) => itemSplits[item.id]?.length > 0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Button>

      {/* Invoice Summary Card */}
      <div className="bg-card border border-border/40 rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl mb-2">{invoice.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {invoice.merchant}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(invoice.date, 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                ${invoice.total.toFixed(2)}
              </div>
            </div>
          </div>
          {invoice.status === 'reviewed' ? (
            <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Finalized
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Draft
            </Badge>
          )}
        </div>

        {invoice.status !== 'reviewed' && !allItemsAssigned && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            ⚠️ Please assign members to all items before finalizing
          </div>
        )}
      </div>

      {/* Split Management */}
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h3 className="text-xl mb-1">Item-wise Split</h3>
          <p className="text-sm text-muted-foreground">
            Select which members should split each expense item
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Item</TableHead>
              <TableHead className="text-right w-[100px]">Amount</TableHead>
              {groupMembers.map((member) => (
                <TableHead key={member.id} className="text-center w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.avatar}
                    </div>
                    <div className="text-xs truncate max-w-[100px]">{member.name.split(' ')[0]}</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => {
              const itemTotal = item.quantity * item.price;
              const splitCount = itemSplits[item.id]?.length || 0;
              const perPersonAmount = splitCount > 0 ? itemTotal / splitCount : 0;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div>{item.name}</div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>${itemTotal.toFixed(2)}</div>
                    {splitCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        ${perPersonAmount.toFixed(2)} each
                      </div>
                    )}
                  </TableCell>
                  {groupMembers.map((member) => (
                    <TableCell key={member.id} className="text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={itemSplits[item.id]?.includes(member.id)}
                          disabled={isViewMode}
                          onCheckedChange={() =>
                            toggleMemberForItem(item.id, member.id)
                          }
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            <TableRow className="bg-muted/30 font-medium">
              <TableCell>Total per person</TableCell>
              <TableCell className="text-right">
                ${invoice.total.toFixed(2)}
              </TableCell>
              {groupMembers.map((member) => {
                const total = calculateMemberTotal(member.id);
                return (
                  <TableCell key={member.id} className="text-center">
                    ${total.toFixed(2)}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Actions */}
      {isEditMode && invoice.status !== 'reviewed' && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            Save Draft
          </Button>
          <Button
            onClick={handleFinalize}
            disabled={!allItemsAssigned}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Finalize Split
          </Button>
        </div>
      )}
    </div>
  );
}
