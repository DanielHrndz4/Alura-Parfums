import { SaleTransaction, ClientProfile } from '../types/sale';
import { LocalStorageAdapter } from '../db/supabaseClient';

const INITIAL_SALES: SaleTransaction[] = [
  {
    id: '#TK-0142',
    time: '16:42',
    date: 'Hoy, 24 Oct',
    clientName: 'Beatriz Montero',
    clientType: 'VIP',
    fragranceName: 'Donna Born in Roma',
    house: 'Valentino Paris',
    format: 'Frasco 100ml',
    paymentMethod: 'pos',
    paymentMethodLabel: 'Stripe POS',
    subtotal: 60.0,
    discount: 0,
    total: 60.0,
    status: 'Completado',
  },
  {
    id: '#TK-0141',
    time: '15:15',
    date: 'Hoy, 24 Oct',
    clientName: 'Valeria Castillo',
    clientType: 'Mostrador',
    fragranceName: 'Yara Candy + Santal 33',
    house: 'Lattafa & Le Labo',
    format: '2 Decants 10ml',
    paymentMethod: 'cash',
    paymentMethodLabel: 'Efectivo',
    subtotal: 25.0,
    discount: 0,
    total: 25.0,
    status: 'Completado',
  },
  {
    id: '#TK-0140',
    time: '14:02',
    date: 'Hoy, 24 Oct',
    clientName: 'Cliente Mostrador VIP',
    clientType: 'VIP',
    fragranceName: 'Absolu Aventus',
    house: 'House of Creed',
    format: 'Frasco Sellado',
    paymentMethod: 'transfer',
    paymentMethodLabel: 'Zelle Express',
    subtotal: 80.0,
    discount: 0,
    total: 40.0,
    status: 'Apartado 50%',
  },
  {
    id: '#TK-0139',
    time: '12:30',
    date: 'Hoy, 24 Oct',
    clientName: 'Ignacio Arismendi',
    clientType: 'Mostrador',
    fragranceName: 'ASAD Bourbon 100ml',
    house: 'Lattafa',
    format: 'Frasco 100ml',
    paymentMethod: 'cash',
    paymentMethodLabel: 'Efectivo',
    subtotal: 10.0,
    discount: 0,
    total: 10.0,
    status: 'Completado',
  },
  {
    id: '#TK-0138',
    time: '11:05',
    date: 'Hoy, 24 Oct',
    clientName: 'Dominique Laurent',
    clientType: 'Mostrador',
    fragranceName: 'La Vie Est Belle + Decant',
    house: 'Lancôme',
    format: 'Set Atelier',
    paymentMethod: 'pos',
    paymentMethodLabel: 'Visa Débito',
    subtotal: 60.0,
    discount: 0,
    total: 60.0,
    status: 'Completado',
  },
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'c-1',
    name: 'Beatriz Montero (Cliente VIP #104)',
    code: 'VIP #104',
    tier: 'VIP',
    pendingBalance: 0,
    lastPurchase: 'Hoy 16:42',
    favoriteHouse: 'Valentino',
  },
  {
    id: 'c-2',
    name: 'Marcos Casares (Madrid Privé)',
    code: 'VIP #105',
    tier: 'Privé',
    pendingBalance: 40.0,
    lastPurchase: '23 Oct',
    favoriteHouse: 'House of Creed',
  },
  {
    id: 'c-3',
    name: 'Elena de la Vega (Coleccionista)',
    code: 'VIP #108',
    tier: 'Privé',
    pendingBalance: 85.0,
    lastPurchase: '22 Oct',
    favoriteHouse: 'Lancôme',
  },
  {
    id: 'c-4',
    name: 'Julián Lozano (Miembro Atelier)',
    code: 'AT-882',
    tier: 'Atelier Regular',
    pendingBalance: 60.0,
    lastPurchase: '21 Oct',
    favoriteHouse: 'Lattafa',
  },
];

export class SalesRepository {
  private static STORAGE_KEY = 'sales_transactions';

  static getAll(): SaleTransaction[] {
    return LocalStorageAdapter.get<SaleTransaction[]>(this.STORAGE_KEY, INITIAL_SALES);
  }

  static add(sale: SaleTransaction): void {
    const list = this.getAll();
    list.unshift(sale);
    LocalStorageAdapter.set(this.STORAGE_KEY, list);
  }

  static getDailyTotal(): number {
    // Expected daily total is $195.00
    const sales = this.getAll();
    return sales.reduce((acc, curr) => acc + curr.total, 0);
  }
}
