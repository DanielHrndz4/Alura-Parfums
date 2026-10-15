import { CartItem, SaleTransaction, PaymentMethod } from '../types/sale';
import { SalesRepository } from '../repositories/salesRepository';
import { PerfumeRepository } from '../repositories/perfumeRepository';

export interface DiscountOption {
  type: 'percent' | 'fixed';
  value: number;
  reason?: string;
}

export class PosService {
  static calculateTotals(
    items: CartItem[],
    discountInput?: DiscountOption | number
  ): {
    subtotal: number;
    discount: number;
    sampleBonus: number;
    total: number;
  } {
    let subtotal = 0;
    let sampleBonus = 0;

    items.forEach((item) => {
      if (item.isComplimentarySample) {
        sampleBonus += item.price;
      } else {
        subtotal += item.price * item.quantity;
      }
    });

    let discount = 0;
    if (typeof discountInput === 'number') {
      discount = Math.min(subtotal, Math.max(0, discountInput));
    } else if (discountInput && discountInput.value > 0) {
      if (discountInput.type === 'percent') {
        const pct = Math.min(100, Math.max(0, discountInput.value));
        discount = (subtotal * pct) / 100;
      } else {
        discount = Math.min(subtotal, Math.max(0, discountInput.value));
      }
    }

    discount = Number(discount.toFixed(2));
    const total = Number(Math.max(0, subtotal - discount).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discount,
      sampleBonus: Number(sampleBonus.toFixed(2)),
      total,
    };
  }

  static completeCheckout(
    items: CartItem[],
    clientName: string,
    paymentMethod: PaymentMethod,
    discountInput?: DiscountOption | number,
    complimentarySampleName: string = 'Lancôme La Vie Est Belle (2ml VIAL)'
  ): SaleTransaction {
    const { total, subtotal, discount } = this.calculateTotals(items, discountInput);
    const discountReason =
      typeof discountInput === 'object' && discountInput?.reason ? discountInput.reason : undefined;
    const dateNow = new Date();
    const hours = String(dateNow.getHours()).padStart(2, '0');
    const minutes = String(dateNow.getMinutes()).padStart(2, '0');

    // Decrement stock for standard items
    items.forEach((item) => {
      if (!item.isComplimentarySample && item.perfumeId) {
        PerfumeRepository.updateStock(item.perfumeId, -item.quantity);
      }
    });

    const newTicketId = `#TK-0${Math.floor(100 + Math.random() * 900)}`;

    const paymentLabels: Record<PaymentMethod, string> = {
      cash: 'Efectivo',
      pos: 'Tarjeta / POS',
      transfer: 'Transferencia',
      credit50: 'Cuota 2 Pagos (50%)',
      credit100: 'Crédito Directo (Pagar Luego)',
    };

    const mainFragrance =
      items.length > 0
        ? items.map((i) => `${i.name} (x${i.quantity || 1})`).join(', ')
        : 'Fragancia Haute Parfumerie';
    const mainHouse = items.length > 0 ? items[0].house : 'Maison Alura';

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dateStr = `Hoy, ${dateNow.getDate()} ${months[dateNow.getMonth()]}`;
    const cleanClientName = clientName ? clientName.trim() : 'Cliente Mostrador';

    const newSale: SaleTransaction = {
      id: newTicketId,
      time: `${hours}:${minutes}`,
      date: dateStr,
      clientName: cleanClientName,
      clientType: cleanClientName.toLowerCase().includes('mostrador') ? 'Mostrador' : 'Cliente',
      fragranceName: mainFragrance,
      house: mainHouse,
      format: items.length > 1 ? `${items.length} Artículos Atelier` : items[0]?.format || '100ml',
      paymentMethod,
      paymentMethodLabel: paymentLabels[paymentMethod],
      subtotal,
      discount,
      total,
      status:
        paymentMethod === 'credit100'
          ? 'Pendiente'
          : paymentMethod === 'credit50'
          ? 'Apartado 50%'
          : 'Completado',
      notes: discountReason,
      sampleGiven: complimentarySampleName,
    };

    SalesRepository.add(newSale);

    // Sincronizar automáticamente el frasco y formato adquirido en el perfil del cliente
    const creditAmount =
      paymentMethod === 'credit100'
        ? total
        : paymentMethod === 'credit50'
        ? total / 2
        : 0;
    SalesRepository.recordSaleForClient(newSale, items, creditAmount);

    return newSale;
  }
}
