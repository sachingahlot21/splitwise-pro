'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Group, Invoice, Member } from '../types';

interface ViewBalancesModalProps {
  open: boolean;
  onClose: () => void;
  group: Group;
  invoices: Invoice[];
}

interface BalanceEntry {
  from: Member;
  to: Member;
  amount: number;
}

interface BalanceSummary {
  totalExpense: number;
  totalOutstanding: number;
  debts: BalanceEntry[];
}

export function ViewBalancesModal({
  open,
  onClose,
  group,
  invoices,
}: ViewBalancesModalProps) {

  const balanceSummary = useMemo(() => {
    const allMemberIds = group.members.map((member) => member.id);
    const pairwise: Record<string, Record<string, number>> = {};

    group.members.forEach((member) => {
      pairwise[member.id] = {};
      allMemberIds.forEach((otherId) => {
        pairwise[member.id][otherId] = 0;
      });
    });

    invoices.forEach((invoice) => {
      if (invoice.status !== 'reviewed' || !invoice.whoPaid) return;
      const payerId = invoice.whoPaid;

      invoice.items.forEach((item) => {
        const itemTotal = item.quantity * item.price;
        const participants = item.splitAmong && item.splitAmong.length > 0
          ? item.splitAmong
          : allMemberIds;
        const sharePerParticipant = itemTotal / participants.length;

        participants.forEach((participantId) => {
          if (participantId === payerId) return;
          pairwise[participantId][payerId] += sharePerParticipant;
        });
      });
    });

    const debts: BalanceEntry[] = [];
    group.members.forEach((from) => {
      group.members.forEach((to) => {
        if (from.id === to.id) return;
        const amount = pairwise[from.id][to.id] - pairwise[to.id][from.id];
        if (amount > 0) {
          debts.push({ from, to, amount });
        }
      });
    });

    const sortedDebts = debts.sort((a, b) => b.amount - a.amount);
    const totalExpense = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalOutstanding = sortedDebts.reduce((sum, debt) => sum + debt.amount, 0);

    return { totalExpense, totalOutstanding, debts: sortedDebts };
  }, [group, invoices]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Group Balances - {group.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${balanceSummary.totalExpense.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                ${balanceSummary.totalOutstanding.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
          </div>

          {/* Pairwise Balances */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Outstanding Balances</h3>
            <div className="space-y-2">
              {balanceSummary.debts.length > 0 ? balanceSummary.debts.map((balance, index) => (
                <div key={`${balance.from.id}-${balance.to.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: balance.from.color }}
                      >
                        {balance.from.avatar}
                      </div>
                      <span className="font-medium">{balance.from.name}</span>
                    </div>
                    <span className="text-muted-foreground">owes</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: balance.to.color }}
                      >
                        {balance.to.avatar}
                      </div>
                      <span className="font-medium">{balance.to.name}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-red-600">
                    ${balance.amount.toFixed(2)}
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  All balances are settled! 🎉
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}