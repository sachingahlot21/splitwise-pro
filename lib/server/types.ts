import { Group, Invoice } from '@/types';

export interface StoredGroup extends Omit<Group, 'createdAt'> {
  createdAt: string;
}

export interface StoredInvoice extends Omit<Invoice, 'date' | 'createdAt'> {
  date: string;
  createdAt: string;
}

export interface StoreData {
  groups: StoredGroup[];
  invoices: StoredInvoice[];
}
