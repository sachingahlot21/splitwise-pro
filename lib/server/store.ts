import { promises as fs } from 'fs';
import path from 'path';
import { mockGroups, mockInvoices } from '@/lib/mock-data';
import { Group, Invoice } from '@/types';
import { StoreData, StoredGroup, StoredInvoice } from './types';

const STORE_FILE_PATH = path.join(process.cwd(), 'data', 'store.json');

function serializeGroup(group: Group): StoredGroup {
  return {
    ...group,
    createdAt: group.createdAt.toISOString(),
  };
}

function serializeInvoice(invoice: Invoice): StoredInvoice {
  return {
    ...invoice,
    date: invoice.date.toISOString(),
    createdAt: invoice.createdAt.toISOString(),
  };
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

async function ensureDataDirectory() {
  const dataDir = path.dirname(STORE_FILE_PATH);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // ignore if directory exists
  }
}

async function seedStore(): Promise<StoreData> {
  const groups = mockGroups.map(serializeGroup);
  const invoices = mockInvoices.map(serializeInvoice);
  const store: StoreData = { groups, invoices };
  await ensureDataDirectory();
  await fs.writeFile(STORE_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  return store;
}

export async function readStore(): Promise<StoreData> {
  try {
    const contents = await fs.readFile(STORE_FILE_PATH, 'utf-8');
    return JSON.parse(contents) as StoreData;
  } catch (error) {
    return seedStore();
  }
}

export async function writeStore(store: StoreData): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(STORE_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function serializeStoreGroup(group: Group): StoredGroup {
  return serializeGroup(group);
}

export function serializeStoreInvoice(invoice: Invoice): StoredInvoice {
  return serializeInvoice(invoice);
}

export function restoreGroup(group: StoredGroup): Group {
  return deserializeGroup(group);
}

export function restoreInvoice(invoice: StoredInvoice): Invoice {
  return deserializeInvoice(invoice);
}
