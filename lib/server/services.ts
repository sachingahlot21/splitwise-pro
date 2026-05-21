import { Group, Invoice, Member, InvoiceItem } from '@/types';
import { readStore, writeStore, serializeStoreGroup, serializeStoreInvoice } from './store';
import { StoredGroup, StoredInvoice, StoreData } from './types';

interface BalanceEntry {
  from: Member;
  to: Member;
  amount: number;
}

function deserializeGroup(group: StoredGroup): Group {
  return {
    ...group,
    createdAt: new Date(group.createdAt),
  };
}

function deserializeInvoice(invoice: StoredInvoice): Invoice {
  return {
    ...invoice,
    date: new Date(invoice.date),
    createdAt: new Date(invoice.createdAt),
  };
}

function serializeGroup(group: Group): StoredGroup {
  return serializeStoreGroup(group);
}

function serializeInvoice(invoice: Invoice): StoredInvoice {
  return serializeStoreInvoice(invoice);
}

function computeGroupBalances(group: Group, invoices: Invoice[]) {
  const memberIds = group.members.map((member) => member.id);
  const pairwise: Record<string, Record<string, number>> = {};

  group.members.forEach((member) => {
    pairwise[member.id] = {};
    memberIds.forEach((id) => {
      pairwise[member.id][id] = 0;
    });
  });

  invoices
    .filter((invoice) => invoice.status === 'reviewed' && invoice.whoPaid)
    .forEach((invoice) => {
      const payerId = invoice.whoPaid;

      invoice.items.forEach((item) => {
        const itemTotal = item.quantity * item.price;
        const participants = item.splitAmong && item.splitAmong.length > 0 ? item.splitAmong : memberIds;
        const share = itemTotal / participants.length;

        participants.forEach((participantId) => {
          if (participantId === payerId) {
            return;
          }
          pairwise[participantId][payerId] += share;
        });
      });
    });

  const debts: BalanceEntry[] = [];

  group.members.forEach((from) => {
    group.members.forEach((to) => {
      if (from.id === to.id) {
        return;
      }

      const amount = pairwise[from.id][to.id] - pairwise[to.id][from.id];
      if (amount > 0) {
        debts.push({ from, to, amount });
      }
    });
  });

  const sortedDebts = debts.sort((a, b) => b.amount - a.amount);
  const totalOutstanding = sortedDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalExpense = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

  return {
    debts: sortedDebts,
    totalExpense,
    pendingBalance: totalOutstanding,
  };
}

function syncGroupMetrics(store: StoreData): StoreData {
  const groups = store.groups.map((storedGroup) => {
    const group = deserializeGroup(storedGroup);
    const groupInvoices = store.invoices
      .filter((invoice) => invoice.groupId === group.id)
      .map(deserializeInvoice);
    const balances = computeGroupBalances(group, groupInvoices);

    return {
      ...storedGroup,
      totalExpense: balances.totalExpense,
      pendingBalance: balances.pendingBalance,
    };
  });

  return { ...store, groups };
}

async function commitStore(store: StoreData) {
  await writeStore(syncGroupMetrics(store));
}

export async function getGroups(): Promise<Group[]> {
  const store = await readStore();
  return store.groups.map(deserializeGroup);
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const store = await readStore();
  const storedGroup = store.groups.find((group) => group.id === groupId);
  return storedGroup ? deserializeGroup(storedGroup) : null;
}

export async function createGroup(input: { name: string; members: Omit<Member, 'id'>[] }): Promise<Group> {
  const store = await readStore();
  const newGroup: Group = {
    id: `g-${Date.now()}`,
    name: input.name,
    members: input.members.map((member, index) => ({
      id: `m-${Date.now()}-${index}`,
      ...member,
    })),
    totalExpense: 0,
    pendingBalance: 0,
    createdAt: new Date(),
  };

  store.groups.unshift(serializeGroup(newGroup));
  await commitStore(store);
  return newGroup;
}

export async function updateGroup(groupId: string, updates: Partial<Pick<Group, 'name'>>): Promise<Group | null> {
  const store = await readStore();
  const index = store.groups.findIndex((group) => group.id === groupId);
  if (index === -1) {
    return null;
  }

  store.groups[index] = {
    ...store.groups[index],
    ...updates,
  };

  await commitStore(store);
  return getGroup(groupId);
}

export async function deleteGroup(groupId: string): Promise<void> {
  const store = await readStore();
  store.groups = store.groups.filter((group) => group.id !== groupId);
  store.invoices = store.invoices.filter((invoice) => invoice.groupId !== groupId);
  await commitStore(store);
}

export async function getInvoices(groupId?: string): Promise<Invoice[]> {
  const store = await readStore();
  const invoices = store.invoices
    .filter((invoice) => (groupId ? invoice.groupId === groupId : true))
    .map(deserializeInvoice);
  return invoices;
}

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  const store = await readStore();
  const storedInvoice = store.invoices.find((invoice) => invoice.id === invoiceId);
  return storedInvoice ? deserializeInvoice(storedInvoice) : null;
}

export async function createInvoice(input: {
  groupId: string;
  merchant: string;
  date: string;
  total: number;
  items: InvoiceItem[];
  whoPaid: string;
}): Promise<Invoice> {
  const store = await readStore();
  const groupExists = store.groups.some((group) => group.id === input.groupId);
  if (!groupExists) {
    throw new Error('Group not found');
  }

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    groupId: input.groupId,
    name: `Invoice from ${input.merchant}`,
    merchant: input.merchant,
    date: new Date(input.date),
    total: input.total,
    status: 'needs-review',
    items: input.items,
    uploadedBy: 'm1',
    whoPaid: input.whoPaid,
    createdAt: new Date(),
  };

  store.invoices.push(serializeInvoice(newInvoice));
  await commitStore(store);
  return newInvoice;
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  const store = await readStore();
  const index = store.invoices.findIndex((invoice) => invoice.id === invoiceId);
  if (index === -1) {
    return null;
  }

  const current = deserializeInvoice(store.invoices[index]);
  const updatedInvoice: Invoice = {
    ...current,
    ...updates,
    date: updates.date ? new Date(updates.date) : current.date,
    createdAt: current.createdAt,
  };

  store.invoices[index] = serializeInvoice(updatedInvoice);
  await commitStore(store);
  return updatedInvoice;
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  const store = await readStore();
  store.invoices = store.invoices.filter((invoice) => invoice.id !== invoiceId);
  await commitStore(store);
}

export async function addMember(groupId: string, member: Omit<Member, 'id'>): Promise<Member> {
  const store = await readStore();
  const groupIndex = store.groups.findIndex((group) => group.id === groupId);
  if (groupIndex === -1) {
    throw new Error('Group not found');
  }

  const newMember: Member = {
    id: `m-${Date.now()}`,
    ...member,
  };

  store.groups[groupIndex].members.push(newMember);
  await commitStore(store);
  return newMember;
}

function hasOutstandingBalance(group: Group, invoices: Invoice[], memberId: string): boolean {
  const balances = computeGroupBalances(group, invoices);
  return balances.debts.some((debt) => debt.from.id === memberId || debt.to.id === memberId);
}

export async function removeMember(groupId: string, memberId: string): Promise<void> {
  const store = await readStore();
  const groupIndex = store.groups.findIndex((group) => group.id === groupId);
  if (groupIndex === -1) {
    throw new Error('Group not found');
  }

  const group = deserializeGroup(store.groups[groupIndex]);
  const groupInvoices = store.invoices
    .filter((invoice) => invoice.groupId === groupId)
    .map(deserializeInvoice);

  if (hasOutstandingBalance(group, groupInvoices, memberId)) {
    throw new Error('Cannot remove member with outstanding balances. Please settle all balances first.');
  }

  store.groups[groupIndex].members = store.groups[groupIndex].members.filter(
    (member) => member.id !== memberId
  );

  await commitStore(store);
}

export async function getGroupBalances(groupId: string) {
  const store = await readStore();
  const storedGroup = store.groups.find((group) => group.id === groupId);
  if (!storedGroup) {
    return null;
  }

  const group = deserializeGroup(storedGroup);
  const groupInvoices = store.invoices
    .filter((invoice) => invoice.groupId === groupId)
    .map(deserializeInvoice);

  return computeGroupBalances(group, groupInvoices);
}
