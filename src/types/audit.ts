export interface CashDenomination {
  name: string; // e.g. "$50.00 USD"
  count: number;
  total: number;
  type: 'bill' | 'voucher';
}

export interface WeeklyAuditRecord {
  id: string;
  dateStr: string;
  shift: string;
  auditor: string;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  status: 'Aprobado' | 'Observación' | 'Pendiente';
}

export interface CashDrawerSummary {
  expectedTotal: number;
  cashPhysical: number;
  zelleTransfer: number;
  posCards: number;
  countedTotal: number;
  difference: number;
  auditorName: string;
  closureFolio: string;
  closingNotes: string;
}
