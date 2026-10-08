import { CashDrawerSummary, WeeklyAuditRecord } from '../types/audit';
import { AuditRepository } from '../repositories/auditRepository';

export class TreasuryService {
  static formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  static verifyCashDrawer(countedAmount: number, notes: string): {
    summary: CashDrawerSummary;
    record: WeeklyAuditRecord;
    isBalanced: boolean;
  } {
    const current = AuditRepository.getDrawerSummary();
    const difference = countedAmount - current.expectedTotal;

    const updatedSummary: CashDrawerSummary = {
      ...current,
      countedTotal: countedAmount,
      difference,
      closingNotes: notes,
    };

    AuditRepository.saveDrawerSummary(updatedSummary);

    const newRecord: WeeklyAuditRecord = {
      id: `rec-${Date.now()}`,
      dateStr: 'Hoy, 24 Oct',
      shift: 'Turno Vespertino',
      auditor: 'Éléonore Vance',
      expectedAmount: current.expectedTotal,
      countedAmount,
      difference,
      status: difference === 0 ? 'Aprobado' : 'Observación',
    };

    AuditRepository.addWeeklyRecord(newRecord);

    return {
      summary: updatedSummary,
      record: newRecord,
      isBalanced: difference === 0,
    };
  }
}
