import { CashDrawerSummary, WeeklyAuditRecord } from '../types/audit';
import { AuditRepository } from '../repositories/auditRepository';

export class TreasuryService {
  static formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  static verifyCashDrawer(
    countedAmount: number,
    notes: string,
    auditorName: string = 'Directora Atelier'
  ): {
    summary: CashDrawerSummary;
    record: WeeklyAuditRecord;
    isBalanced: boolean;
  } {
    const current = AuditRepository.getDrawerSummary();
    const difference = Number((countedAmount - current.expectedTotal).toFixed(2));

    const updatedSummary: CashDrawerSummary = {
      ...current,
      countedTotal: countedAmount,
      difference,
      auditorName,
      closingNotes: notes,
    };

    AuditRepository.saveDrawerSummary(updatedSummary);

    const now = new Date();
    const dateFormatted = new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(now);

    const newRecord: WeeklyAuditRecord = {
      id: `rec-${Date.now()}`,
      dateStr: `Hoy, ${dateFormatted}`,
      shift: 'Turno en Curso',
      auditor: auditorName,
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
