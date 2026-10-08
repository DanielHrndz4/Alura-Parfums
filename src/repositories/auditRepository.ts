import { WeeklyAuditRecord, CashDrawerSummary, CashDenomination } from '../types/audit';
import { LocalStorageAdapter } from '../db/supabaseClient';

const INITIAL_WEEKLY_RECORDS: WeeklyAuditRecord[] = [
  {
    id: 'rec-1',
    dateStr: 'Hoy, 24 Oct',
    shift: 'Turno Vespertino',
    auditor: 'Éléonore Vance',
    expectedAmount: 195.0,
    countedAmount: 195.0,
    difference: 0.0,
    status: 'Aprobado',
  },
  {
    id: 'rec-2',
    dateStr: '23 Oct 2024',
    shift: 'Turno Completo',
    auditor: 'Marc-Antoine Ruiz',
    expectedAmount: 320.0,
    countedAmount: 320.0,
    difference: 0.0,
    status: 'Aprobado',
  },
  {
    id: 'rec-3',
    dateStr: '22 Oct 2024',
    shift: 'Turno Mañana',
    auditor: 'Éléonore Vance',
    expectedAmount: 180.0,
    countedAmount: 180.0,
    difference: 0.0,
    status: 'Aprobado',
  },
  {
    id: 'rec-4',
    dateStr: '21 Oct 2024',
    shift: 'Turno Completo',
    auditor: 'Marc-Antoine Ruiz',
    expectedAmount: 245.0,
    countedAmount: 245.0,
    difference: 0.0,
    status: 'Aprobado',
  },
];

const INITIAL_DRAWER_SUMMARY: CashDrawerSummary = {
  expectedTotal: 195.0,
  cashPhysical: 75.0,
  zelleTransfer: 40.0,
  posCards: 80.0,
  countedTotal: 195.0,
  difference: 0.0,
  auditorName: 'Éléonore Vance',
  closureFolio: 'CIERRE FOLIO #AL-2024-089',
  closingNotes: 'Conciliado sin incidencias. Gaveta cerrada con sello de seguridad #4419.',
};

export const INITIAL_DENOMINATIONS: CashDenomination[] = [
  { name: '$50.00 USD', count: 1, total: 50.0, type: 'bill' },
  { name: '$20.00 USD', count: 1, total: 20.0, type: 'bill' },
  { name: '$5.00 USD', count: 1, total: 5.0, type: 'bill' },
  { name: 'Terminal POS (3 vouchers)', count: 3, total: 80.0, type: 'voucher' },
];

export class AuditRepository {
  private static STORAGE_KEY_DRAWER = 'cash_drawer_summary';
  private static STORAGE_KEY_WEEKLY = 'weekly_audit_records';

  static getDrawerSummary(): CashDrawerSummary {
    return LocalStorageAdapter.get<CashDrawerSummary>(this.STORAGE_KEY_DRAWER, INITIAL_DRAWER_SUMMARY);
  }

  static saveDrawerSummary(summary: CashDrawerSummary): void {
    LocalStorageAdapter.set(this.STORAGE_KEY_DRAWER, summary);
  }

  static getWeeklyRecords(): WeeklyAuditRecord[] {
    return LocalStorageAdapter.get<WeeklyAuditRecord[]>(this.STORAGE_KEY_WEEKLY, INITIAL_WEEKLY_RECORDS);
  }

  static addWeeklyRecord(record: WeeklyAuditRecord): void {
    const list = this.getWeeklyRecords();
    list.unshift(record);
    LocalStorageAdapter.set(this.STORAGE_KEY_WEEKLY, list);
  }
}
