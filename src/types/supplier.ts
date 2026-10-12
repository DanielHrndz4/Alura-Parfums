export type ExpenseStatus = 'Pagado' | 'Pendiente' | 'Parcial';

export interface SupplierBatchInvoice {
  id: string; // e.g. "CMP-2024-01"
  invoiceNumber: string; // e.g. "FAC-89104"
  supplierName: string; // e.g. "Distribuidora de Frascos & Envases"
  supplierCode?: string; // e.g. "DF"
  supplierLocation?: string; // e.g. "Ciudad de México"
  concept: string; // e.g. "Lote de 20 frascos 100ml y tapas doradas"
  conceptDetails?: string;
  quantity?: number;
  issueDate: string;
  dueDate: string;
  dueDateHighlight?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod?: 'cash' | 'pos' | 'transfer';
  status: string;
  statusType: 'warning' | 'pending' | 'success' | 'info';
  notes?: string;
}

export interface SupplierPaymentRecord {
  id: string;
  expenseId: string;
  date: string;
  supplierName: string;
  amount: number;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  reference?: string;
}

export interface ImportRoute {
  id: string;
  hub: string;
  icon: string;
  code: string;
  status: string;
  statusColor: 'warning' | 'success' | 'neutral';
}

export interface DisbursementScheduleWeek {
  weekTitle: string;
  supplier: string;
  amount: number;
  percentage: number;
  colorClass: string;
  notes: string;
}

