import { SupplierBatchInvoice, SupplierPaymentRecord } from '../types/supplier';
import { LocalStorageAdapter, supabase } from '../db/supabaseClient';

export class SupplierRepository {
  private static STORAGE_KEY = 'supplier_invoices';
  private static PAYMENTS_KEY = 'supplier_payments_history';

  static getAll(): SupplierBatchInvoice[] {
    return LocalStorageAdapter.get<SupplierBatchInvoice[]>(this.STORAGE_KEY, []);
  }

  static async fetchInvoicesFromSupabase(): Promise<SupplierBatchInvoice[]> {
    try {
      const { data, error } = await supabase
        .from('supplier_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return this.getAll();

      const mapped: SupplierBatchInvoice[] = data.map((d: any) => ({
        id: d.id,
        invoiceNumber: d.invoice_number,
        supplierName: d.supplier_name,
        supplierCode: d.supplier_code,
        supplierLocation: d.supplier_location,
        concept: d.concept,
        conceptDetails: d.concept_details,
        quantity: d.quantity,
        issueDate: d.issue_date,
        dueDate: d.due_date,
        dueDateHighlight: d.due_date_highlight,
        totalAmount: Number(d.total_amount),
        paidAmount: Number(d.paid_amount),
        pendingAmount: Number(d.pending_amount),
        paymentMethod: d.payment_method,
        status: d.status,
        statusType: d.status_type,
        notes: d.notes,
      }));

      if (mapped.length > 0) {
        LocalStorageAdapter.set(this.STORAGE_KEY, mapped);
        return mapped;
      }
      return this.getAll();
    } catch {
      return this.getAll();
    }
  }

  static getPayments(): SupplierPaymentRecord[] {
    return LocalStorageAdapter.get<SupplierPaymentRecord[]>(this.PAYMENTS_KEY, []);
  }

  static async fetchPaymentsFromSupabase(): Promise<SupplierPaymentRecord[]> {
    try {
      const { data, error } = await supabase
        .from('supplier_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return this.getPayments();

      const mapped: SupplierPaymentRecord[] = data.map((d: any) => ({
        id: d.id,
        expenseId: d.expense_id,
        date: d.date,
        supplierName: d.supplier_name,
        amount: Number(d.amount),
        paymentMethod: d.payment_method,
        reference: d.reference,
      }));

      if (mapped.length > 0) {
        LocalStorageAdapter.set(this.PAYMENTS_KEY, mapped);
        return mapped;
      }
      return this.getPayments();
    } catch {
      return this.getPayments();
    }
  }

  static payInvoice(
    id: string,
    amount: number,
    paymentMethod: 'cash' | 'pos' | 'transfer' = 'transfer',
    reference?: string
  ): { invoice: SupplierBatchInvoice; newBalance: number } | null {
    const list = this.getAll();
    const item = list.find((i) => i.id === id);
    if (!item) return null;

    item.paidAmount = Number((item.paidAmount + amount).toFixed(2));
    item.pendingAmount = Math.max(0, Number((item.totalAmount - item.paidAmount).toFixed(2)));

    if (item.pendingAmount === 0) {
      item.status = 'Pagado';
      item.statusType = 'success';
      item.dueDateHighlight = 'Liquidado';
    } else {
      item.status = 'Abono Parcial';
      item.statusType = 'warning';
    }

    LocalStorageAdapter.set(this.STORAGE_KEY, list);

    // Record into payments history
    const payments = this.getPayments();
    const newPayment: SupplierPaymentRecord = {
      id: `PAG-${Date.now().toString().slice(-4)}`,
      expenseId: item.id,
      date: 'Hoy, ' + new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      supplierName: item.supplierName,
      amount: amount,
      paymentMethod: paymentMethod,
      reference: reference || `Pago a factura ${item.invoiceNumber || item.id}`,
    };
    payments.unshift(newPayment);
    LocalStorageAdapter.set(this.PAYMENTS_KEY, payments);

    // Sync to Supabase
    try {
      supabase
        .from('supplier_invoices')
        .update({
          paid_amount: item.paidAmount,
          pending_amount: item.pendingAmount,
          status: item.status,
          status_type: item.statusType,
          due_date_highlight: item.dueDateHighlight,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
        .then();

      supabase
        .from('supplier_payments')
        .insert({
          id: newPayment.id,
          expense_id: newPayment.expenseId,
          date: newPayment.date,
          supplier_name: newPayment.supplierName,
          amount: newPayment.amount,
          payment_method: newPayment.paymentMethod,
          reference: newPayment.reference,
        })
        .then();
    } catch (e) {
      console.warn('Supabase supplier payment sync error:', e);
    }

    return { invoice: item, newBalance: item.pendingAmount };
  }

  static addInvoice(invoice: SupplierBatchInvoice): void {
    const list = this.getAll();
    list.unshift(invoice);
    LocalStorageAdapter.set(this.STORAGE_KEY, list);

    // Sync to Supabase
    try {
      supabase
        .from('supplier_invoices')
        .insert({
          id: invoice.id,
          invoice_number: invoice.invoiceNumber,
          supplier_name: invoice.supplierName,
          supplier_code: invoice.supplierCode,
          supplier_location: invoice.supplierLocation,
          concept: invoice.concept,
          concept_details: invoice.conceptDetails,
          quantity: invoice.quantity,
          issue_date: invoice.issueDate,
          due_date: invoice.dueDate,
          due_date_highlight: invoice.dueDateHighlight,
          total_amount: invoice.totalAmount,
          paid_amount: invoice.paidAmount,
          pending_amount: invoice.pendingAmount,
          payment_method: invoice.paymentMethod,
          status: invoice.status,
          status_type: invoice.statusType,
          notes: invoice.notes,
        })
        .then();
    } catch (e) {
      console.warn('Supabase supplier invoice sync error:', e);
    }

    // If initial payment was made, record it
    if (invoice.paidAmount > 0) {
      const payments = this.getPayments();
      const pRecord: SupplierPaymentRecord = {
        id: `PAG-${Date.now().toString().slice(-4)}`,
        expenseId: invoice.id,
        date: invoice.issueDate,
        supplierName: invoice.supplierName,
        amount: invoice.paidAmount,
        paymentMethod: invoice.paymentMethod || 'transfer',
        reference: `Pago inicial registrado en compra ${invoice.invoiceNumber || invoice.id}`,
      };
      payments.unshift(pRecord);
      LocalStorageAdapter.set(this.PAYMENTS_KEY, payments);

      try {
        supabase
          .from('supplier_payments')
          .insert({
            id: pRecord.id,
            expense_id: pRecord.expenseId,
            date: pRecord.date,
            supplier_name: pRecord.supplierName,
            amount: pRecord.amount,
            payment_method: pRecord.paymentMethod,
            reference: pRecord.reference,
          })
          .then();
      } catch (e) {
        console.warn('Supabase supplier initial payment sync error:', e);
      }
    }
  }

  static getTotalExpenses(): number {
    const list = this.getAll();
    return list.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }

  static getTotalPayable(): number {
    const list = this.getAll();
    return list.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  }

  static getTotalPaid(): number {
    const list = this.getAll();
    return list.reduce((acc, curr) => acc + curr.paidAmount, 0);
  }
}
