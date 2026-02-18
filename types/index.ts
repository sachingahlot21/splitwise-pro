export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  totalExpense: number;
  pendingBalance: number;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  splitAmong?: string[]; // member IDs
}

export interface Invoice {
  id: string; 
  groupId: string;
  name: string;
  merchant: string;
  date: Date;
  total: number;
  status: 'reviewed' | 'needs-review' | 'draft';
  imageUrl?: string;
  items: InvoiceItem[];
  uploadedBy: string;
  createdAt: Date;
}

export interface Balance {
  memberId: string;
  amount: number; // positive = owed to them, negative = they owe
}
