import React, { useState } from 'react';
import { CartItem } from '../../types/sale';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onNavigateToCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onNavigateToCatalog,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; fixed?: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponOpen, setIsCouponOpen] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.percent) {
      discount = (subtotal * appliedDiscount.percent) / 100;
    } else if (appliedDiscount.fixed) {
      discount = Math.min(subtotal, appliedDiscount.fixed);
    }
  }
  discount = Number(discount.toFixed(2));
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'ALURA10' || clean === 'BIENVENIDA' || clean === 'PROMO10') {
      setAppliedDiscount({ code: clean, percent: 10 });
      setCouponError(null);
    } else if (clean === 'ALURA15' || clean === 'VIP15') {
      setAppliedDiscount({ code: clean, percent: 15 });
      setCouponError(null);
    } else if (clean === 'ALURA20' || clean === 'AMIGO20') {
      setAppliedDiscount({ code: clean, percent: 20 });
      setCouponError(null);
    } else if (clean === 'AMIGO5' || clean === 'REGALO5') {
      setAppliedDiscount({ code: clean, fixed: 5.0 });
      setCouponError(null);
    } else {
      setCouponError('Cupón no válido. Prueba con ALURA10 (10% OFF)');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;
    
    let message = `*¡Hola Alura Parfums! Deseo realizar el siguiente pedido:*\n\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.house}) - ${item.format}\n   Cantidad: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)} USD\n\n`;
    });

    if (discount > 0 && appliedDiscount) {
      message += `*Subtotal:* $${subtotal.toFixed(2)} USD\n`;
      message += `*Descuento Aplicado (${appliedDiscount.code}):* -$${discount.toFixed(2)} USD\n`;
      message += `*Total Final:* $${finalTotal.toFixed(2)} USD\n\n`;
    } else {
      message += `*Total:* $${subtotal.toFixed(2)} USD\n\n`;
    }

    message += `*Formato:* Réplicas de Alta Calidad 1:1 (+8-12h fijación)\n¿Me indican los métodos de pago y tiempo de entrega?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A1817]/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#E6DED1] z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#E6DED1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#775a00] text-xl">shopping_bag</span>
            <h3 className="font-serif font-bold text-lg text-[#1A1817]">Tu Bolsa de Compra</h3>
            <span className="text-xs bg-[#F5F2EB] text-[#775a00] px-2 py-0.5 rounded-full font-semibold">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F5F2EB] flex items-center justify-center text-[#6E665F] hover:text-[#1A1817] transition-colors cursor-pointer"
            title="Cerrar bolsa"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-20 text-center text-[#6E665F]">
              <span className="material-symbols-outlined text-5xl text-[#E6DED1] mb-3 block">
                shopping_bag
              </span>
              <p className="font-serif font-medium text-base text-[#1A1817]">Tu bolsa está vacía</p>
              <p className="text-xs text-[#6E665F] mt-1 max-w-xs mx-auto">
                Explora nuestras réplicas de ultra-lujo 1:1 en frascos de 50ml ($10) y 100ml ($15 USD).
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCatalog();
                }}
                className="mt-5 bg-[#775a00] text-white hover:bg-[#B8860B] text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Explorar Catálogo</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-[#E6DED1] shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#B8860B] block font-semibold">
                    {item.house}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#1A1817] truncate">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] bg-[#FAF8F5] text-[#775a00] px-1.5 py-0.5 rounded border border-[#E6DED1] font-semibold">
                      {item.format}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1A1817]">
                      ${item.price.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-[#8A2E2B] hover:text-red-700 p-1 text-xs cursor-pointer"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>

                  <div className="flex items-center border border-[#E6DED1] rounded-md overflow-hidden bg-[#FAF8F5]">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-[#1A1817] hover:bg-[#ECE7DE] font-bold text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-[#1A1817] hover:bg-[#ECE7DE] font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Summary and Action */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#E6DED1] bg-white space-y-4">
            <div className="flex items-center justify-between text-xs text-[#6E665F]">
              <span>Garantía de Fidelidad:</span>
              <span className="font-semibold text-[#775a00]">1:1 Mismo Aroma (+12h)</span>
            </div>

            {/* Cupón de Descuento */}
            <div className="pt-2 border-t border-[#E6DED1]/60">
              {!appliedDiscount ? (
                <div>
                  {!isCouponOpen ? (
                    <button
                      type="button"
                      onClick={() => setIsCouponOpen(true)}
                      className="text-xs font-semibold text-[#775a00] hover:text-[#946E19] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">sell</span>
                      <span>¿Tienes un cupón o código de descuento?</span>
                    </button>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Ej: ALURA10"
                          className="flex-1 bg-[#FAF8F5] border border-[#E6DED1] rounded-lg px-3 py-1.5 text-xs uppercase font-mono font-bold text-[#1A1817] outline-none focus:border-[#775a00]"
                        />
                        <button
                          type="submit"
                          className="bg-[#1A1817] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
                        >
                          Aplicar
                        </button>
                      </div>
                      {couponError && <p className="text-[10px] text-[#8A2E2B] font-medium">{couponError}</p>}
                    </form>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#FAF0EF] p-2 rounded-lg border border-[#8A2E2B]/20 text-xs">
                  <div className="flex items-center gap-1.5 text-[#8A2E2B]">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span className="font-bold">
                      Cupón {appliedDiscount.code} ({appliedDiscount.percent ? `${appliedDiscount.percent}% OFF` : `$${appliedDiscount.fixed} OFF`})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-[#8A2E2B] hover:underline font-bold cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            {/* Desglose de totales */}
            <div className="space-y-1 pt-1 border-t border-[#E6DED1]/60 text-xs">
              <div className="flex justify-between text-[#6E665F]">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${subtotal.toFixed(2)} USD</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#8A2E2B] font-semibold">
                  <span>Descuento aplicado:</span>
                  <span className="font-mono">-${discount.toFixed(2)} USD</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#E6DED1]/60">
              <span className="font-serif font-bold text-base text-[#1A1817]">Total Final</span>
              <span className="font-mono font-bold text-xl text-[#775a00]">
                ${finalTotal.toFixed(2)} <span className="text-xs font-sans text-[#6E665F]">USD</span>
              </span>
            </div>

            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              <span>Ordenar por WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-[#6E665F] hover:text-[#1A1817] py-1 cursor-pointer font-medium"
            >
              Seguir explorando la boutique
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
