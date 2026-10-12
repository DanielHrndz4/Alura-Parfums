import { WeeklyAuditRecord, CashDrawerSummary } from '../types/audit';
import { LocalStorageAdapter, supabase } from '../db/supabaseClient';
import { SalesRepository } from './salesRepository';
import { SupplierRepository } from './supplierRepository';

export class AuditRepository {
  private static STORAGE_KEY_DRAWER = 'cash_drawer_summary';
  private static STORAGE_KEY_WEEKLY = 'weekly_audit_records';

  /**
   * Calculates live expected drawer totals dynamically from real POS transactions, abonos, and supplier expenses.
   */
  static calculateLiveExpected(): CashDrawerSummary {
    const sales = SalesRepository.getAll();
    const abonos = SalesRepository.getAbonos();
    const supplierPayments = SupplierRepository.getPayments();

    let cashPhysical = 0;
    let posCards = 0;
    let zelleTransfer = 0;

    // 1. Ingresos por ventas de perfumes (despachos de mostrador)
    for (const s of sales) {
      // Si el registro corresponde a un abono asentado en el historial de ventas, lo omitimos aquí para no duplicarlo con abonos_history
      if (s.id.startsWith('#AB-') || s.fragranceName.toLowerCase().includes('abono')) {
        continue;
      }

      if (s.paymentMethod === 'cash') {
        cashPhysical += s.total;
      } else if (s.paymentMethod === 'pos') {
        posCards += s.total;
      } else if (s.paymentMethod === 'transfer') {
        zelleTransfer += s.total;
      } else if (s.paymentMethod === 'credit50') {
        // En cuota inicial 50%, sólo ingresa a caja la primera mitad (el restante 50% es por cobrar)
        cashPhysical += s.total / 2;
      }
      // Si fue credit100 (100% a crédito), ingresó $0.00 hoy
    }

    // 2. Ingresos por abonos de clientes (cobro de créditos y liquidaciones)
    for (const a of abonos) {
      if (a.paymentMethod === 'cash') {
        cashPhysical += a.amount;
      } else if (a.paymentMethod === 'pos') {
        posCards += a.amount;
      } else if (a.paymentMethod === 'transfer') {
        zelleTransfer += a.amount;
      }
    }

    // 3. Egresos / Desembolsos pagados a empresas proveedoras
    for (const p of supplierPayments) {
      if (p.paymentMethod === 'cash') {
        cashPhysical -= p.amount;
      } else if (p.paymentMethod === 'pos') {
        posCards -= p.amount;
      } else if (p.paymentMethod === 'transfer') {
        zelleTransfer -= p.amount;
      }
    }

    // Evitar decimales flotantes y valores negativos menores a cero
    cashPhysical = Number(Math.max(0, cashPhysical).toFixed(2));
    posCards = Number(Math.max(0, posCards).toFixed(2));
    zelleTransfer = Number(Math.max(0, zelleTransfer).toFixed(2));

    const expectedTotal = Number((cashPhysical + posCards + zelleTransfer).toFixed(2));

    return {
      expectedTotal,
      cashPhysical,
      zelleTransfer,
      posCards,
      countedTotal: expectedTotal,
      difference: 0,
      auditorName: 'Directora Atelier',
      closureFolio: `CIERRE-#${Date.now().toString().slice(-4)}`,
      closingNotes: 'Conciliación en tiempo real con Supabase.',
    };
  }

  static getDrawerSummary(): CashDrawerSummary {
    const live = this.calculateLiveExpected();
    const cached = LocalStorageAdapter.get<CashDrawerSummary | null>(this.STORAGE_KEY_DRAWER, null);

    if (cached && typeof cached.countedTotal === 'number' && cached.closureFolio && cached.difference !== 0) {
      const diff = Number((cached.countedTotal - live.expectedTotal).toFixed(2));
      return {
        ...live,
        countedTotal: cached.countedTotal,
        difference: diff,
        auditorName: cached.auditorName || live.auditorName,
        closureFolio: cached.closureFolio || live.closureFolio,
        closingNotes: cached.closingNotes || live.closingNotes,
      };
    }

    return live;
  }

  static async fetchDrawerFromSupabase(): Promise<CashDrawerSummary> {
    try {
      const { data, error } = await supabase
        .from('cash_drawer_summary')
        .select('*')
        .eq('id', 'current')
        .maybeSingle();

      const live = this.calculateLiveExpected();

      if (error || !data) return this.getDrawerSummary();

      const countedTotal = typeof data.counted_total === 'number' ? Number(data.counted_total) : live.expectedTotal;
      const difference = Number((countedTotal - live.expectedTotal).toFixed(2));

      const mapped: CashDrawerSummary = {
        ...live,
        countedTotal,
        difference,
        auditorName: data.auditor_name || live.auditorName,
        closureFolio: data.closure_folio || live.closureFolio,
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
