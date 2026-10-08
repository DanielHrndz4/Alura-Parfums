import React, { useState } from 'react';
import { Perfume } from '../../types/perfume';
import { CartItem, PaymentMethod } from '../../types/sale';
import { SalesRepository, INITIAL_CLIENTS } from '../../repositories/salesRepository';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { PosService } from '../../services/posService';

interface PosTerminalViewProps {
  onNavigate: (view: string) => void;
}

export const PosTerminalView: React.FC<PosTerminalViewProps> = ({ onNavigate }) => {
  const perfumes = PerfumeRepository.getAll();
  const [salesLog, setSalesLog] = useState(SalesRepository.getAll());

  // POS Active Tray Items
  const [posTray, setPosTray] = useState<CartItem[]>([
    {
      id: 'tray-1',
      perfumeId: 'p-1',
      name: 'Donna Born in Roma',
      house: 'Valentino',
      format: '100ml EDP • Valentino',
      price: 60.0,
      quantity: 1,
    },
    {
      id: 'tray-2',
      perfumeId: 'p-4',
      name: 'Santal 33',
      house: 'Le Labo',
      format: 'Decant 10ml • Le Labo',
      price: 10.0,
      quantity: 1,
    },
    {
      id: 'tray-3',
      perfumeId: 'p-12',
      name: 'Muestra de Cortesía',
      house: 'Lancôme Paris',
      format: '2ml Vial • Lancôme La Vie Est Belle',
      price: 5.0,
      quantity: 1,
      isComplimentarySample: true,
    },
  ]);

  const [selectedClient, setSelectedClient] = useState(INITIAL_CLIENTS[0].name);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(100.0);
  const [ticketPrinted, setTicketPrinted] = useState<string | null>(null);

  // Quick Fast-Add from showcase
  const handleFastAdd = (perfume: Perfume) => {
    const newItem: CartItem = {
      id: `tray-${Date.now()}`,
      perfumeId: perfume.id,
      name: perfume.name,
      house: perfume.house,
      format: perfume.format,
      price: perfume.price,
      quantity: 1,
    };
    setPosTray((prev) => [...prev, newItem]);
  };

  const handleRemoveTrayItem = (id: string) => {
    setPosTray((prev) => prev.filter((i) => i.id !== id));
  };

  const { subtotal, total, sampleBonus } = PosService.calculateTotals(posTray);
  const changeDue = Math.max(0, cashTendered - total);

  const handleConfirmSale = () => {
    if (posTray.length === 0) return;

    const newSale = PosService.completeCheckout(posTray, selectedClient, selectedMethod);
    setSalesLog(SalesRepository.getAll());
    setTicketPrinted(newSale.id);

    // Reset tray to fresh state
    setPosTray([]);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Subtle Parisian Atelier Ambient Header */}
      <header className="relative mb-6 bg-[#f5f3ef] rounded-xl p-6 md:p-8 overflow-hidden shadow-sm border border-[#E6DED1]">
        <div className="absolute -right-20 -bottom-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#ffdf98]/20 via-[#c59b27]/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27]"></span>
              <p className="font-label-sm uppercase tracking-widest text-[#6E665F] text-xs font-bold">
                Gestión Comercial • Salón Place Vendôme
              </p>
            </div>
            <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl md:text-4xl font-semibold">
              Punto de Venta &amp; Registro de Movimientos
            </h1>
            <p className="font-body-md text-[#2C2826] max-w-2xl text-sm">
              Terminal de emisión de comprobantes, despacho de frascos y venta asistida de perfumería nicho y comercial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('audit')}
              className="px-5 py-2.5 rounded-lg bg-white text-[#2C2826] hover:bg-[#F5F2EB] transition-all shadow-sm flex items-center gap-2 font-title-md text-xs font-semibold border border-[#E6DED1] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#775a00]">schedule</span>
              <span>Corte Diario Rápido</span>
            </button>
            <button
              onClick={() => setPosTray([
                {
                  id: `tray-${Date.now()}`,
                  perfumeId: 'p-1',
                  name: 'Donna Born in Roma',
                  house: 'Valentino',
                  format: '100ml EDP',
                  price: 60.0,
                  quantity: 1,
                }
              ])}
              className="px-6 py-2.5 rounded-lg bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] transition-all shadow-md flex items-center gap-2 font-title-md text-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              <span>+ Registrar Nueva Venta</span>
            </button>
          </div>
        </div>
      </header>

      {/* Top KPI Metrics Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md uppercase text-[#6E665F] text-xs">Ventas del Día</span>
            <span className="w-7 h-7 rounded-full bg-[#F0F5EE] flex items-center justify-center text-[#2D5A27]">
              <span className="material-symbols-outlined text-[16px]">payments</span>
            </span>
          </div>
          <div>
            <span className="font-headline-md text-[#1A1817] font-mono leading-none font-bold text-2xl">
              $195.00
            </span>
            <span className="font-label-sm text-[#6E665F] ml-1 text-xs">USD</span>
          </div>
          <p className="font-body-sm text-[#2D5A27] mt-2 flex items-center gap-1 text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>14 transacciones cerradas</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md uppercase text-[#6E665F] text-xs">Ticket Promedio</span>
            <span className="w-7 h-7 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
            </span>
          </div>
          <div>
            <span className="font-headline-md text-[#1A1817] font-mono leading-none font-bold text-2xl">
              $13.92
            </span>
            <span className="font-label-sm text-[#6E665F] ml-1 text-xs">USD</span>
          </div>
          <p className="font-body-sm text-[#6E665F] mt-2 text-xs">
            Estándar decant &amp; retail salón
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md uppercase text-[#6E665F] text-xs">Frascos Despachados</span>
            <span className="w-7 h-7 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
              <span className="material-symbols-outlined text-[16px]">science</span>
            </span>
          </div>
          <div>
            <span className="font-headline-md text-[#1A1817] font-mono leading-none font-bold text-2xl">
              14
            </span>
            <span className="font-label-sm text-[#6E665F] ml-1 text-xs">unidades</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-full bg-[#efeeea] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#c59b27] h-1.5 rounded-full" style={{ width: '56%' }}></div>
            </div>
            <span className="font-label-sm text-[#6E665F] text-[10px]">56% Lote</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md uppercase text-[#6E665F] text-xs">Testers Bonificados</span>
            <span className="w-7 h-7 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
              <span className="material-symbols-outlined text-[16px]">redeem</span>
            </span>
          </div>
          <div>
            <span className="font-headline-md text-[#1A1817] font-mono leading-none font-bold text-2xl">
              4
            </span>
            <span className="font-label-sm text-[#6E665F] ml-1 text-xs">decants cortesía</span>
          </div>
          <p className="font-body-sm text-[#6E665F] mt-2 text-xs">
            $0 aplicados en ventas &gt; $50
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md uppercase text-[#6E665F] text-xs">Cierre por Método</span>
            <span className="w-7 h-7 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#6E665F]">Efectivo</span>
              <span className="font-mono text-[#1A1817] font-semibold">$75.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#6E665F]">Tarjeta/POS</span>
              <span className="font-mono text-[#1A1817] font-semibold">$80.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#6E665F]">Transferencia</span>
              <span className="font-mono text-[#1A1817] font-semibold">$40.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Operational Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mb-8">
        {/* LEFT COLUMN (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Vitrina Catalog & Quick Fast-Add */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-[#E6DED1]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#775a00] text-[20px]">shelves</span>
                  <h2 className="font-headline-sm text-[#1A1817] font-serif text-lg font-semibold">
                    Vitrina en Mostrador • Selección Rápida
                  </h2>
                </div>
                <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                  Disponibilidad en tiempo real para despacho inmediato
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#F5F2EB] font-label-md text-[#2C2826] text-xs font-semibold">
                  7 Referencias Activas
                </span>
              </div>
            </div>

            {/* Fragrance Quick Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Item 1: Valentino Donna */}
              <div className="bg-[#F5F2EB]/50 rounded-xl p-4 flex flex-col justify-between hover:bg-[#F5F2EB] transition-all group border border-[#E6DED1]/60">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px] font-bold">
                    Maison Valentino
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm text-[9px] font-bold">
                    1 disp.
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="font-headline-sm text-[#1A1817] leading-snug line-clamp-1 font-serif text-sm font-semibold">
                    Donna Born in Roma
                  </h3>
                  <p className="font-body-sm text-[#6E665F] text-xs">100ml • Eau de Parfum</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DED1]/50">
                  <span className="font-mono text-[#1A1817] font-bold text-sm">$60.00</span>
                  <button
                    onClick={() => handleFastAdd(perfumes[0])}
                    className="w-8 h-8 rounded-lg bg-white text-[#1A1817] group-hover:bg-[#c59b27] group-hover:text-[#1A1817] flex items-center justify-center shadow-sm transition-colors border border-[#E6DED1] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Item 2: Khamrah QAHWA */}
              <div className="bg-[#F5F2EB]/30 rounded-xl p-4 flex flex-col justify-between opacity-80 border border-[#E6DED1]/40">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px] font-bold">
                    Lattafa Nicho
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FDF8EA] text-[#946E19] font-label-sm text-[9px] font-bold">
                    Solo Muestra
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="font-headline-sm text-[#1A1817] leading-snug line-clamp-1 font-serif text-sm font-semibold">
                    Khamrah QAHWA
                  </h3>
                  <p className="font-body-sm text-[#6E665F] text-xs">100ml • Extrait Blend</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DED1]/50">
                  <span className="font-mono text-[#6E665F] text-sm">$35.00</span>
                  <button
                    disabled
                    className="w-8 h-8 rounded-lg bg-[#efeeea] text-[#6E665F] flex items-center justify-center cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                  </button>
                </div>
              </div>

              {/* Item 3: Santal 33 */}
              <div className="bg-[#F5F2EB]/50 rounded-xl p-4 flex flex-col justify-between hover:bg-[#F5F2EB] transition-all group border border-[#E6DED1]/60">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px] font-bold">
                    Le Labo
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm text-[9px] font-bold">
                    1 disp.
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="font-headline-sm text-[#1A1817] leading-snug line-clamp-1 font-serif text-sm font-semibold">
                    Santal 33
                  </h3>
                  <p className="font-body-sm text-[#6E665F] text-xs">Decant 10ml Atelier</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DED1]/50">
                  <span className="font-mono text-[#1A1817] font-bold text-sm">$10.00</span>
                  <button
                    onClick={() => handleFastAdd(perfumes[3])}
                    className="w-8 h-8 rounded-lg bg-white text-[#1A1817] group-hover:bg-[#c59b27] group-hover:text-[#1A1817] flex items-center justify-center shadow-sm transition-colors border border-[#E6DED1] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Item 4: Absolute Aventus */}
              <div className="bg-[#F5F2EB]/50 rounded-xl p-4 flex flex-col justify-between hover:bg-[#F5F2EB] transition-all group border border-[#E6DED1]/60">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px] font-bold">
                    House of Creed
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm text-[9px] font-bold">
                    2 disp.
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="font-headline-sm text-[#1A1817] leading-snug line-clamp-1 font-serif text-sm font-semibold">
                    Absolu Aventus
                  </h3>
                  <p className="font-body-sm text-[#6E665F] text-xs">Decant 10ml Pipeta</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DED1]/50">
                  <span className="font-mono text-[#1A1817] font-bold text-sm">$10.00</span>
                  <button
                    onClick={() => handleFastAdd(perfumes[4])}
                    className="w-8 h-8 rounded-lg bg-white text-[#1A1817] group-hover:bg-[#c59b27] group-hover:text-[#1A1817] flex items-center justify-center shadow-sm transition-colors border border-[#E6DED1] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Item 5: ASAD Bourbon */}
              <div className="bg-[#F5F2EB]/50 rounded-xl p-4 flex flex-col justify-between hover:bg-[#F5F2EB] transition-all group border border-[#E6DED1]/60">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px] font-bold">
                    Lattafa
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm text-[9px] font-bold">
                    1 disp.
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="font-headline-sm text-[#1A1817] leading-snug line-clamp-1 font-serif text-sm font-semibold">
                    ASAD Bourbon
                  </h3>
                  <p className="font-body-sm text-[#6E665F] text-xs">Frasco 100ml EDP</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DED1]/50">
                  <span className="font-mono text-[#1A1817] font-bold text-sm">$10.00</span>
                  <button
                    onClick={() => handleFastAdd(perfumes[14])}
                    className="w-8 h-8 rounded-lg bg-white text-[#1A1817] group-hover:bg-[#c59b27] group-hover:text-[#1A1817] flex items-center justify-center shadow-sm transition-colors border border-[#E6DED1] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Item 6: Yara Candy */}
              <div className="bg-[#F5F2EB]/50 rounded-xl p-4 flex flex-col justify-between hover:bg-[#F5F2EB] transition-all group border border-[#E6DED1]/60">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px] font-bold">
                    Lattafa
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm text-[9px] font-bold">
                    1 disp.
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="font-headline-sm text-[#1A1817] leading-snug line-clamp-1 font-serif text-sm font-semibold">
                    Yara Candy Gourmand
                  </h3>
                  <p className="font-body-sm text-[#6E665F] text-xs">Frasco 100ml EDP</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DED1]/50">
                  <span className="font-mono text-[#1A1817] font-bold text-sm">$15.00</span>
                  <button
                    onClick={() => handleFastAdd(perfumes[12])}
                    className="w-8 h-8 rounded-lg bg-white text-[#1A1817] group-hover:bg-[#c59b27] group-hover:text-[#1A1817] flex items-center justify-center shadow-sm transition-colors border border-[#E6DED1] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Item 7: La Vie Est Belle */}
              <div className="bg-[#F5F2EB]/50 rounded-xl p-4 flex flex-col justify-between hover:bg-[#F5F2EB] transition-all group border border-[#E6DED1]/60">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px] font-bold">
                    Lancôme Paris
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm text-[9px] font-bold">
                    1 disp.
                  </span>
                </div>
                <div className="my-3">
                  <h3 className="font-headline-sm text-[#1A1817] leading-snug line-clamp-1 font-serif text-sm font-semibold">
                    La Vie Est Belle
                  </h3>
                  <p className="font-body-sm text-[#6E665F] text-xs">Frasco 50ml EDP</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DED1]/50">
                  <span className="font-mono text-[#1A1817] font-bold text-sm">$15.00</span>
                  <button
                    onClick={() => handleFastAdd(perfumes[11])}
                    className="w-8 h-8 rounded-lg bg-white text-[#1A1817] group-hover:bg-[#c59b27] group-hover:text-[#1A1817] flex items-center justify-center shadow-sm transition-colors border border-[#E6DED1] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Visual Decanting Card */}
              <div className="relative rounded-xl overflow-hidden p-4 flex flex-col justify-between min-h-[160px] bg-[#efeeea] border border-[#E6DED1]">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgZW735ev8rD-ke9xrM9MfWZdqmfrUomwZql91Ek-W94nMUspHOSgiN2cdVeQm6spGfTKX32QAigdFf36WMVroaOvjmNFHTJZXqh7u0GBBDdHFreyKlZbPZ2N3HKxIwqNu1rYjunEKhaPVCUjcCymTMHtuf2bEg-Wlvp3MGFeEh-JYI_RLrY82DPsuUNRqXjt3d0aUjBU-bTZZmICrRE1cFJVPyWY3nT1qtG4yeJzO')",
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1817]/80 via-[#1A1817]/30 to-transparent"></div>
                <div className="relative z-10">
                  <span className="font-label-sm uppercase tracking-widest text-[#ffdf98] text-[9px] font-bold">
                    Servicio Decanting
                  </span>
                </div>
                <div className="relative z-10 text-white">
                  <p className="font-headline-sm leading-snug font-serif text-xs font-semibold">
                    Vial de 10ml &amp; 5ml a Medida
                  </p>
                  <p className="font-body-sm opacity-90 mt-1 text-[11px]">
                    Con etiqueta en cera de abeja
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Ledger of Movements & Facturas Emitidas */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-[#E6DED1]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#775a00] text-[20px]">receipt_long</span>
                  <h2 className="font-headline-sm text-[#1A1817] font-serif text-lg font-semibold">
                    Últimos Movimientos &amp; Facturas Emitidas
                  </h2>
                </div>
                <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                  Bitácora de salida, despachos y comprobantes del Salón
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => alert('Exportando libro de ventas diario a formato Excel...')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F5F2EB] text-[#2C2826] font-label-md flex items-center gap-1.5 hover:bg-[#ECE7DE] transition-colors border border-[#E6DED1]"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Exportar XLS</span>
                </button>
                <button
                  onClick={() => alert('Enviando reimpresión del corte a impresora térmica Place Vendôme.')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F5F2EB] text-[#2C2826] font-label-md flex items-center gap-1.5 hover:bg-[#ECE7DE] transition-colors border border-[#E6DED1]"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Reimpresión Lote</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase tracking-wider text-xs">
                    <th className="py-3 px-4 font-semibold">Ticket #</th>
                    <th className="py-3 px-4 font-semibold">Hora</th>
                    <th className="py-3 px-4 font-semibold">Cliente</th>
                    <th className="py-3 px-4 font-semibold">Fragancia &amp; Casa</th>
                    <th className="py-3 px-4 font-semibold">Formato</th>
                    <th className="py-3 px-4 font-semibold">Método</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado</th>
                    <th className="py-3 px-4 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB] font-body-sm text-xs text-[#2C2826]">
                  {salesLog.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#F5F2EB]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1817]">
                        {sale.id}
                      </td>
                      <td className="py-3.5 px-4 text-[#6E665F]">{sale.time}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1A1817]">{sale.clientName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-title-md text-[#1A1817] font-semibold text-xs">
                          {sale.fragranceName}
                        </div>
                        <div className="font-label-sm text-[#6E665F] text-[10px]">{sale.house}</div>
                      </td>
                      <td className="py-3.5 px-4">{sale.format}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[#2C2826]">
                          <span className="material-symbols-outlined text-[14px] text-[#775a00]">
                            {sale.paymentMethod === 'cash'
                              ? 'attach_money'
                              : sale.paymentMethod === 'pos'
                              ? 'credit_card'
                              : 'account_balance'}
                          </span>
                          <span>{sale.paymentMethodLabel}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#1A1817]">
                        ${sale.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-semibold ${
                            sale.status === 'Completado'
                              ? 'bg-[#F0F5EE] text-[#2D5A27]'
                              : 'bg-[#FDF8EA] text-[#946E19]'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setTicketPrinted(sale.id)}
                          className="w-7 h-7 rounded bg-[#F5F2EB] hover:bg-[#ECE7DE] text-[#2C2826] inline-flex items-center justify-center transition-colors border border-[#E6DED1] cursor-pointer"
                          title="Imprimir ticket"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E6DED1] text-xs text-[#6E665F]">
              <p>Mostrando {salesLog.length} movimientos del corte actual</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded bg-[#F5F2EB] text-[#2C2826] border border-[#E6DED1]">
                  Anterior
                </button>
                <span className="text-[#775a00] font-bold px-1">1</span>
                <button className="px-3 py-1 rounded bg-[#F5F2EB] text-[#2C2826] border border-[#E6DED1]">
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (xl:col-span-4) - POS Terminal & Ticket (Sticky) */}
        <div className="xl:col-span-4 flex flex-col gap-6 sticky top-24">
          <section className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden border border-[#E6DED1]">
            {/* Gilded Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffdf98] via-[#c59b27] to-[#D4AF37]"></div>

            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6DED1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00] border border-[#E6DED1]">
                  <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                </div>
                <div>
                  <h3 className="font-title-md text-[#1A1817] leading-snug text-sm font-semibold">
                    Terminal de Cobro Activo
                  </h3>
                  <p className="font-label-sm text-[#6E665F] text-[10px]">
                    Mostrador 01 • Place Vendôme
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0F5EE] font-label-sm text-[#2D5A27] text-[10px] font-bold border border-[#2D5A27]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                <span>En Línea</span>
              </span>
            </div>

            {/* Client Selector */}
            <div className="space-y-1.5 mb-6">
              <label className="font-label-md uppercase tracking-wider text-[#6E665F] flex items-center justify-between text-xs">
                <span>Cliente del Atelier</span>
                <span className="text-[#775a00] font-semibold text-[10px] cursor-pointer">
                  + Nuevo VIP
                </span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E665F] text-[18px]">
                  person_search
                </span>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-[#F5F2EB] pl-10 pr-10 py-2.5 rounded-lg font-body-sm text-xs text-[#1A1817] outline-none border border-[#E6DED1] focus:border-[#c59b27] transition-all cursor-pointer font-medium"
                >
                  {INITIAL_CLIENTS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Cart / Order Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-md uppercase tracking-wider text-[#6E665F] text-xs font-semibold">
                  Artículos en Bandeja
                </span>
                <span className="font-label-sm text-[#775a00] font-bold text-xs">
                  {posTray.length} Ítems
                </span>
              </div>

              {posTray.length === 0 ? (
                <div className="p-6 text-center text-[#6E665F] bg-[#F5F2EB]/50 rounded-lg border border-dashed border-[#E6DED1] text-xs">
                  No hay artículos en bandeja. Seleccione un frasco de la vitrina para cobrar.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {posTray.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg flex items-center justify-between gap-3 border ${
                        item.isComplimentarySample
                          ? 'bg-[#F0F5EE]/60 border-[#2D5A27]/20'
                          : 'bg-[#F5F2EB]/50 border-[#E6DED1]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center font-mono text-xs font-semibold flex-shrink-0 ${
                          item.isComplimentarySample
                            ? 'bg-white text-[#2D5A27]'
                            : 'bg-[#F5F2EB] text-[#2C2826]'
                        }`}
                      >
                        {item.quantity}×
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-title-md text-[#1A1817] truncate text-xs font-semibold">
                            {item.name}
                          </p>
                          {item.isComplimentarySample && (
                            <span className="px-1.5 py-0.2 rounded bg-[#2D5A27] text-white font-label-sm text-[8px] uppercase font-bold">
                              Cortesía
                            </span>
                          )}
                        </div>
                        <p className="font-label-sm text-[#6E665F] text-[10px]">{item.format}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`font-mono font-semibold text-xs ${
                            item.isComplimentarySample ? 'text-[#2D5A27]' : 'text-[#1A1817]'
                          }`}
                        >
                          ${(item.isComplimentarySample ? 0 : item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveTrayItem(item.id)}
                          className="text-[#8A2E2B] hover:opacity-80 font-label-sm text-[10px] cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#F5F2EB] rounded-xl space-y-2 mb-6 border border-[#E6DED1]">
              <div className="flex justify-between items-center text-xs text-[#6E665F]">
                <span>Subtotal de Venta</span>
                <span className="font-mono text-[#1A1817] font-semibold">${subtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#6E665F]">
                <span>Descuento / Ajuste Atelier</span>
                <span className="font-mono text-[#1A1817] font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#2D5A27]">
                <span>Muestras Bonificadas</span>
                <span className="font-mono font-semibold">-${sampleBonus.toFixed(2)} (100%)</span>
              </div>
              <div className="pt-2 border-t border-[#E6DED1] flex justify-between items-baseline">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Total a Cobrar</span>
                <div className="text-right">
                  <span className="font-headline-lg text-[#1A1817] leading-none font-mono font-bold text-2xl">
                    ${total.toFixed(2)}
                  </span>
                  <span className="font-label-sm text-[#6E665F] ml-1 text-xs">USD</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <span className="font-label-md uppercase tracking-wider text-[#6E665F] block text-xs font-semibold">
                Método de Pago Seleccionado
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: 'Efectivo', icon: 'payments' },
                  { id: 'pos', label: 'Tarjeta / POS', icon: 'credit_card' },
                  { id: 'transfer', label: 'Zelle / Transf.', icon: 'send_to_mobile' },
                  { id: 'credit50', label: 'Cuota 50%', icon: 'event_repeat' },
                ].map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                      className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27] shadow-sm'
                          : 'bg-[#F5F2EB] text-[#2C2826] border-[#E6DED1] hover:bg-[#ECE7DE]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Calculator Pill Row */}
            <div className="p-3 bg-[#F5F2EB]/70 rounded-xl mb-6 border border-[#E6DED1]">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
                  Entregado en Caja
                </span>
                <span className="text-[#6E665F] text-[11px]">
                  Vuelto sugerido: <strong className="text-[#1A1817] font-mono">${changeDue.toFixed(2)}</strong>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCashTendered(total)}
                  className={`py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors shadow-sm border ${
                    cashTendered === total
                      ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27]'
                      : 'bg-white text-[#2C2826] border-[#E6DED1]'
                  }`}
                >
                  ${total.toFixed(2)} (Exacto)
                </button>
                <button
                  onClick={() => setCashTendered(100.0)}
                  className={`py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors shadow-sm border ${
                    cashTendered === 100
                      ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27]'
                      : 'bg-white text-[#2C2826] border-[#E6DED1]'
                  }`}
                >
                  $100.00
                </button>
                <button
                  onClick={() => {
                    const promptVal = prompt('Ingrese monto entregado en efectivo:', String(total));
                    if (promptVal) setCashTendered(parseFloat(promptVal) || total);
                  }}
                  className="py-1.5 rounded-lg bg-white text-[#2C2826] font-mono text-xs font-semibold hover:bg-[#ECE7DE] transition-colors shadow-sm border border-[#E6DED1]"
                >
                  Otro Monto
                </button>
              </div>
            </div>

            {/* Confirm CTA Button */}
            <button
              onClick={handleConfirmSale}
              disabled={posTray.length === 0}
              className="w-full py-4 rounded-xl bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-headline-sm text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                verified
              </span>
              <span>Confirmar Venta &amp; Emitir Factura</span>
            </button>
            <p className="text-center font-label-sm uppercase tracking-widest text-[#6E665F] mt-4 text-[9px]">
              Comprobante Certificado • Maison Alura 2024
            </p>
          </section>

          {/* Atelier Packaging Rule */}
          <div className="bg-[#F5F2EB] rounded-xl p-4 flex items-start gap-3 border border-[#E6DED1]">
            <span className="material-symbols-outlined text-[#775a00] text-[20px] flex-shrink-0 mt-0.5">
              info
            </span>
            <div>
              <p className="font-title-md text-[#1A1817] text-xs font-semibold">
                Protocolo de Empaque Place Vendôme
              </p>
              <p className="font-body-sm text-[#6E665F] mt-1 text-xs">
                Todo frasco despachado debe ser sellado con cinta de seda marfil y tarjeta de notas olfativas firmada por el perfumista en turno.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Print Confirmation Modal */}
      {ticketPrinted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 border border-[#E6DED1] text-center font-mono">
            <span className="material-symbols-outlined text-4xl text-[#2D5A27] mb-2">check_circle</span>
            <h3 className="font-serif text-lg font-bold text-[#1A1817]">Maison Alura Parfums</h3>
            <p className="text-[11px] text-[#6E665F]">14 Place Vendôme, 75001 Paris</p>
            <div className="my-4 py-3 border-y border-dashed border-[#E6DED1] text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span>Comprobante:</span>
                <span className="font-bold">{ticketPrinted}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span>{selectedClient.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>Método:</span>
                <span className="uppercase">{selectedMethod}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#E6DED1]">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)} USD</span>
              </div>
            </div>
            <p className="text-[10px] text-[#6E665F] mb-4">
              Maceración verificada. ¡Merci de votre visite!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded bg-[#F5F2EB] text-[#2C2826] font-sans font-semibold text-xs border border-[#E6DED1]"
              >
                Imprimir
              </button>
              <button
                onClick={() => setTicketPrinted(null)}
                className="flex-1 py-2 rounded bg-[#c59b27] text-[#1A1817] font-sans font-semibold text-xs"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
