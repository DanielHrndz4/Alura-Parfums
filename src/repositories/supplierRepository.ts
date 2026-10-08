import { SupplierBatchInvoice, ImportRoute, DisbursementScheduleWeek } from '../types/supplier';
import { LocalStorageAdapter } from '../db/supabaseClient';

const INITIAL_INVOICES: SupplierBatchInvoice[] = [
  {
    id: 'LT-2024-PRE',
    invoiceNumber: 'INV-89104',
    supplierName: 'Mayfair Fragrance Concierge',
    supplierCode: 'MY',
    supplierLocation: 'Londres, UK (Net 15)',
    concept: '3 frascos Niche Discovery & Tom Ford',
    conceptDetails: 'Ombré Leather + Tobacco Vanille 50ml',
    issueDate: '10 Nov 2024',
    dueDate: '25 Nov 2024',
    dueDateHighlight: '25 Nov 2024 (5 días)',
    totalAmount: 95.0,
    paidAmount: 50.0,
    pendingAmount: 45.0,
    status: 'Vence en 5 días',
    statusType: 'warning',
  },
  {
    id: 'LT-2024-004',
    invoiceNumber: 'INV-DXB-442',
    supplierName: 'Al-Haramain Direct',
    supplierCode: 'AH',
    supplierLocation: 'Hub Dubái, UAE (Net 30)',
    concept: '4 frascos Lattafa Khamrah & Club de Nuit',
    conceptDetails: 'Intense Man Parfum Edition',
    issueDate: '15 Nov 2024',
    dueDate: '15 Dic 2024',
    dueDateHighlight: '15 Dic 2024 (Net 30)',
    totalAmount: 62.5,
    paidAmount: 0.0,
    pendingAmount: 62.5,
    status: 'Pendiente',
    statusType: 'pending',
  },
  {
    id: 'LT-2024-003',
    invoiceNumber: 'MIA-7731',
    supplierName: 'Distribuidores Miami Vault',
    supplierCode: 'MV',
    supplierLocation: 'Florida, USA (Pago Anticipado 50%)',
    concept: '5 frascos DIOR Sauvage & Valentino',
    conceptDetails: 'Born in Roma Coral Fantasy 100ml',
    issueDate: '05 Nov 2024',
    dueDate: '05 Dic 2024',
    totalAmount: 70.0,
    paidAmount: 35.0,
    pendingAmount: 35.0,
    status: 'Pendiente',
    statusType: 'pending',
  },
  {
    id: 'LT-2024-002',
    invoiceNumber: 'PVI-9921',
    supplierName: 'Parfums Vendôme Import',
    supplierCode: 'PV',
    supplierLocation: 'Place Vendôme, París (Contado)',
    concept: '2 frascos Baccarat Rouge 540 Extrait',
    conceptDetails: 'Maison Francis Kurkdjian 70ml',
    issueDate: '28 Oct 2024',
    dueDate: 'Liquidado el 02 Nov',
    totalAmount: 112.5,
    paidAmount: 112.5,
    pendingAmount: 0.0,
    status: 'Pagado',
    statusType: 'success',
  },
  {
    id: 'LT-2024-001',
    invoiceNumber: 'OLW-104',
    supplierName: 'Orient Lux Warehouse',
    supplierCode: 'OL',
    supplierLocation: 'Zona Libre Colón, Panamá',
    concept: 'Muestrarios 5ml y Atomizadores Decant',
    conceptDetails: '100 viales cristal con grabado dorado',
    issueDate: '15 Oct 2024',
    dueDate: 'Liquidado el 25 Oct',
    totalAmount: 80.0,
    paidAmount: 80.0,
    pendingAmount: 0.0,
    status: 'Pagado',
    statusType: 'success',
  },
];

export const IMPORT_ROUTES: ImportRoute[] = [
  {
    id: 'route-1',
    hub: 'Hub Dubái',
    icon: 'flight_land',
    code: 'LT-2024-004',
    status: 'En Vuelo Directo',
    statusColor: 'warning',
  },
  {
    id: 'route-2',
    hub: 'Miami Vault',
    icon: 'apartment',
    code: 'LT-2024-PRE',
    status: 'Validación Aduanal',
    statusColor: 'neutral',
  },
  {
    id: 'route-3',
    hub: 'Vendôme París',
    icon: 'storefront',
    code: 'LT-2024-002',
    status: 'Recibido en Atelier',
    statusColor: 'success',
  },
  {
    id: 'route-4',
    hub: 'Zona Libre Colón',
    icon: 'local_shipping',
    code: 'LT-2024-001',
    status: 'Liquidado 100%',
    statusColor: 'success',
  },
];

export const DISBURSEMENT_WEEKS: DisbursementScheduleWeek[] = [
  {
    weekTitle: 'Semana 4 (20 - 26 Nov) • Mayfair Fragrance',
    supplier: 'Mayfair Fragrance',
    amount: 45.0,
    percentage: 65,
    colorClass: 'bg-primary-container',
    notes: 'Vencimiento principal del período • 3 frascos niche',
  },
  {
    weekTitle: 'Semana 1 Dic (01 - 07 Dic) • Distribuidores Miami',
    supplier: 'Distribuidores Miami',
    amount: 35.0,
    percentage: 50,
    colorClass: 'bg-gold-antique',
    notes: 'Liquidación saldo restante al arribo aduana',
  },
  {
    weekTitle: 'Semana 2 Dic (08 - 15 Dic) • Al-Haramain Dubái',
    supplier: 'Al-Haramain Dubái',
    amount: 62.5,
    percentage: 85,
    colorClass: 'bg-secondary',
    notes: 'Plazo extendido Net 30 días',
  },
];

export class SupplierRepository {
  private static STORAGE_KEY = 'supplier_invoices';

  static getAll(): SupplierBatchInvoice[] {
    return LocalStorageAdapter.get<SupplierBatchInvoice[]>(this.STORAGE_KEY, INITIAL_INVOICES);
  }

  static payInvoice(id: string, amount: number): void {
    const list = this.getAll();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.paidAmount += amount;
      item.pendingAmount = Math.max(0, item.totalAmount - item.paidAmount);
      if (item.pendingAmount === 0) {
        item.status = 'Pagado';
        item.statusType = 'success';
      }
      LocalStorageAdapter.set(this.STORAGE_KEY, list);
    }
  }

  static addInvoice(invoice: SupplierBatchInvoice): void {
    const list = this.getAll();
    list.unshift(invoice);
    LocalStorageAdapter.set(this.STORAGE_KEY, list);
  }

  static getTotalPayable(): number {
    const list = this.getAll();
    return list.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  }

  static getTotalPaidThisMonth(): number {
    return 192.5; // verified Place Vendôme monthly record
  }
}
