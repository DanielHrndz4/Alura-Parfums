export type PaymentMethod = 'cash' | 'pos' | 'transfer' | 'credit50';

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
  clientType?: 'VIP' | 'Mostrador' | 'Online';
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
  tier: 'VIP' | 'Privé' | 'Atelier Regular';
  pendingBalance: number;
  lastPurchase: string;
  favoriteHouse: string;
}
