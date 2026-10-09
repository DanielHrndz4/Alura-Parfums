export type PaymentMethod = 'cash' | 'pos' | 'transfer' | 'credit50' | 'credit100';

export interface CartItem {
  id: string;
  perfumeId: string;
  name: string;
  house: string;
  format: string;
  price: number;
  quantity: number;
  isComplimentarySample?: boolean;
}

export interface SaleTransaction {
  id: string; // e.g. #TK-0142
  time: string; // e.g. "16:42"
  date: string; // e.g. "Hoy, 24 Oct"
  clientName: string;
  clientType?: 'Cliente' | 'Mostrador' | 'Online' | string;
  fragranceName: string;
  house: string;
  format: string;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  subtotal: number;
  discount: number;
  total: number;
  status: 'Completado' | 'Apartado 50%' | 'Pendiente';
  notes?: string;
  sampleGiven?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  code: string;
  tier: string;
  pendingBalance: number;
  lastPurchase: string;
  favoriteHouse: string;
  phone?: string;
  notes?: string;
}

export interface AbonoTransaction {
  id: string;
  date: string;
  time: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  clientTier: string;
  amount: number;
  remainingBalance: number;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  paymentMethodLabel: string;
  reference?: string;
  status: 'Completado' | 'Conciliado';
}

