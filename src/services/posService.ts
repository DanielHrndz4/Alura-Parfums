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
      pos: 'Tarjeta / POS',
      transfer: 'Transferencia',
      credit50: 'Cuota 2 Pagos (50%)',
      credit100: 'Crédito Directo (Pagar Luego)',
    };

    const mainFragrance = items.length > 0 ? items[0].name : 'Fragancia Haute Parfumerie';
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
      discount: 0,
      total,
      status:
        paymentMethod === 'credit100'
          ? 'Pendiente'
          : paymentMethod === 'credit50'
          ? 'Apartado 50%'
          : 'Completado',
      sampleGiven: complimentarySampleName,
    };

    SalesRepository.add(newSale);

    // If sale involves credit, update/create client balance with Supabase persistence
    if (paymentMethod === 'credit100') {
      SalesRepository.recordCreditForSale(newSale, total);
    } else if (paymentMethod === 'credit50') {
      SalesRepository.recordCreditForSale(newSale, total / 2);
    }

    return newSale;
  }
}
