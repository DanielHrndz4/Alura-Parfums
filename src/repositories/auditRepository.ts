import { WeeklyAuditRecord, CashDrawerSummary } from '../types/audit';
import { LocalStorageAdapter, supabase } from '../db/supabaseClient';
import { SalesRepository } from './salesRepository';

export class AuditRepository {
  private static STORAGE_KEY_DRAWER = 'cash_drawer_summary';
  private static STORAGE_KEY_WEEKLY = 'weekly_audit_records';

  /**
   * Calculates live expected drawer totals dynamically from real POS transactions and abonos.
   */
  static calculateLiveExpected(): CashDrawerSummary {
    const sales = SalesRepository.getAll();
    const abonos = SalesRepository.getAbonos();

    let cashPhysical = 0;
    let posCards = 0;
    let zelleTransfer = 0;

    for (const s of sales) {
      if (s.paymentMethod === 'cash') {
        cashPhysical += s.total;
      } else if (s.paymentMethod === 'pos') {
        posCards += s.total;
      } else if (s.paymentMethod === 'transfer') {
        zelleTransfer += s.total;
      } else if (s.paymentMethod === 'credit50') {
        // First 50% instalment received
        cashPhysical += s.total / 2;
      }
    }

    for (const a of abonos) {
      if (a.paymentMethod === 'cash') {
        cashPhysical += a.amount;
      } else if (a.paymentMethod === 'pos') {
        posCards += a.amount;
      } else if (a.paymentMethod === 'transfer') {
        zelleTransfer += a.amount;
      }
    }

    const expectedTotal = Number((cashPhysical + posCards + zelleTransfer).toFixed(2));

    return {
      expectedTotal,
      cashPhysical: Number(cashPhysical.toFixed(2)),
      zelleTransfer: Number(zelleTransfer.toFixed(2)),
      posCards: Number(posCards.toFixed(2)),
      countedTotal: expectedTotal,
      difference: 0,
      auditorName: 'Directora Atelier',
      closureFolio: `CIERRE-#${Date.now().toString().slice(-4)}`,
      closingNotes: 'Conciliación en tiempo real con Supabase.',
    };
  }

  static getDrawerSummary(): CashDrawerSummary {
    const cached = LocalStorageAdapter.get<CashDrawerSummary | null>(this.STORAGE_KEY_DRAWER, null);
    if (cached) return cached;
    return this.calculateLiveExpected();
  }

  static async fetchDrawerFromSupabase(): Promise<CashDrawerSummary> {
    try {
      const { data, error } = await supabase
        .from('cash_drawer_summary')
        .select('*')
        .eq('id', 'current')
        .maybeSingle();

      if (error || !data) return this.getDrawerSummary();

      const mapped: CashDrawerSummary = {
        expectedTotal: Number(data.expected_total),
        cashPhysical: Number(data.cash_physical),
        zelleTransfer: Number(data.zelle_transfer),
        posCards: Number(data.pos_cards),
        countedTotal: Number(data.counted_total),
        difference: Number(data.difference),
        auditorName: data.auditor_name || 'Directora Atelier',
        closureFolio: data.closure_folio || `CIERRE-#${Date.now().toString().slice(-4)}`,
        closingNotes: data.closing_notes || '',
      };

      LocalStorageAdapter.set(this.STORAGE_KEY_DRAWER, mapped);
      return mapped;
    } catch {
      return this.getDrawerSummary();
    }
  }

  static saveDrawerSummary(summary: CashDrawerSummary): void {
    LocalStorageAdapter.set(this.STORAGE_KEY_DRAWER, summary);

    try {
      supabase
        .from('cash_drawer_summary')
        .upsert({
          id: 'current',
          expected_total: summary.expectedTotal,
          cash_physical: summary.cashPhysical,
          zelle_transfer: summary.zelleTransfer,
          pos_cards: summary.posCards,
          counted_total: summary.countedTotal,
          difference: summary.difference,
          auditor_name: summary.auditorName,
          closure_folio: summary.closureFolio,
          closing_notes: summary.closingNotes,
          updated_at: new Date().toISOString(),
        })
        .then();
    } catch (e) {
      console.warn('Supabase cash drawer sync error:', e);
    }
  }

  static getWeeklyRecords(): WeeklyAuditRecord[] {
    return LocalStorageAdapter.get<WeeklyAuditRecord[]>(this.STORAGE_KEY_WEEKLY, []);
  }

  static async fetchWeeklyRecordsFromSupabase(): Promise<WeeklyAuditRecord[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_audit_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return this.getWeeklyRecords();

      const mapped: WeeklyAuditRecord[] = data.map((d: any) => ({
        id: d.id,
        dateStr: d.date_str,
        shift: d.shift,
        auditor: d.auditor,
        expectedAmount: Number(d.expected_amount),
        countedAmount: Number(d.counted_amount),
        difference: Number(d.difference),
        status: d.status,
      }));

      LocalStorageAdapter.set(this.STORAGE_KEY_WEEKLY, mapped);
      return mapped;
    } catch {
      return this.getWeeklyRecords();
    }
  }

  static addWeeklyRecord(record: WeeklyAuditRecord): void {
    const list = this.getWeeklyRecords();
    list.unshift(record);
    LocalStorageAdapter.set(this.STORAGE_KEY_WEEKLY, list);

    try {
      supabase
        .from('weekly_audit_records')
        .insert({
          id: record.id,
          date_str: record.dateStr,
          shift: record.shift,
          auditor: record.auditor,
          expected_amount: record.expectedAmount,
          counted_amount: record.countedAmount,
          difference: record.difference,
          status: record.status,
        })
        .then();
    } catch (e) {
      console.warn('Supabase weekly record sync error:', e);
    }
  }
}
