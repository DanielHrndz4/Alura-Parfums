export type BatchStatus = 'Vence en 5 días' | 'Pendiente' | 'Pagado' | 'En Tránsito';

export interface SupplierBatchInvoice {
  id: string; // e.g. "LT-2024-PRE"
  invoiceNumber: string; // e.g. "INV-89104"
  supplierName: string;
  supplierCode: string;
  supplierLocation: string; // e.g. "Londres, UK (Net 15)"
  concept: string; // e.g. "3 frascos Niche Discovery & Tom Ford"
  conceptDetails: string;
  issueDate: string;
  dueDate: string;
  dueDateHighlight?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: BatchStatus;
  statusType: 'warning' | 'pending' | 'success' | 'info';
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
