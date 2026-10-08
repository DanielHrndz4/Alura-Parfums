import { CartItem, SaleTransaction, PaymentMethod } from '../types/sale';
import { SalesRepository } from '../repositories/salesRepository';
import { PerfumeRepository } from '../repositories/perfumeRepository';

export class PosService {
  static calculateTotals(items: CartItem[]): {
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

    const total = Math.max(0, subtotal);

    return {
      subtotal,
      discount: 0,
      sampleBonus,
      total,
    };
  }

  static completeCheckout(
    items: CartItem[],
    clientName: string,
    paymentMethod: PaymentMethod,
    complimentarySampleName: string = 'Lancôme La Vie Est Belle (2ml VIAL)'
  ): SaleTransaction {
    const { total, subtotal } = this.calculateTotals(items);
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
      pos: 'Stripe POS',
      transfer: 'Zelle Express',
      credit50: 'Apartado 50%',
    };

    const mainFragrance = items.length > 0 ? items[0].name : 'Fragancia Haute Parfumerie';
    const mainHouse = items.length > 0 ? items[0].house : 'Maison Alura';

    const newSale: SaleTransaction = {
      id: newTicketId,
      time: `${hours}:${minutes}`,
      date: 'Hoy, 24 Oct',
      clientName: clientName || 'Beatriz Montero',
      clientType: 'VIP',
      fragranceName: mainFragrance,
      house: mainHouse,
      format: items.length > 1 ? `${items.length} Artículos Atelier` : items[0]?.format || '100ml EDP',
      paymentMethod,
      paymentMethodLabel: paymentLabels[paymentMethod],
      subtotal,
      discount: 0,
      total,
      status: paymentMethod === 'credit50' ? 'Apartado 50%' : 'Completado',
      sampleGiven: complimentarySampleName,
    };

    SalesRepository.add(newSale);
    return newSale;
  }
}
