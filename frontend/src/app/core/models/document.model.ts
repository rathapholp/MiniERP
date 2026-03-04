export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'VOID';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'PROMPTPAY';
export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
export type BillStatus = 'DRAFT' | 'RECEIVED' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type ExpenseStatus = 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';

export interface DocumentLine {
  id?: number;
  productId?: number;
  description: string;
  qty: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  amount: number;
  product?: { code: string; name: string; unit: string };
}

export interface Quotation {
  id: number;
  number: string;
  contactId: number;
  date: string;
  validUntil?: string;
  status: QuotationStatus;
  subtotal: number;
  vatAmount: number;
  total: number;
  note?: string;
  contact?: { name: string; code: string };
  lines?: DocumentLine[];
}

export interface Invoice {
  id: number;
  number: string;
  contactId: number;
  quotationId?: number;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  subtotal: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  note?: string;
  contact?: { name: string; code: string };
  lines?: DocumentLine[];
  receipts?: Receipt[];
}

export interface Receipt {
  id: number;
  number: string;
  invoiceId: number;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  note?: string;
}

export interface PurchaseOrder {
  id: number;
  number: string;
  contactId: number;
  date: string;
  expectedDate?: string;
  status: PurchaseOrderStatus;
  subtotal: number;
  vatAmount: number;
  total: number;
  note?: string;
  contact?: { name: string; code: string };
  lines?: DocumentLine[];
}

export interface Bill {
  id: number;
  number: string;
  contactId: number;
  purchaseOrderId?: number;
  date: string;
  dueDate?: string;
  status: BillStatus;
  subtotal: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  note?: string;
  contact?: { name: string; code: string };
  lines?: DocumentLine[];
  payments?: any[];
}

export interface Expense {
  id: number;
  number: string;
  categoryId?: number;
  date: string;
  description: string;
  amount: number;
  vatAmount: number;
  total: number;
  status: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  reference?: string;
  note?: string;
  category?: { name: string };
}
