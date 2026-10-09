import React, { useState, useMemo } from 'react';
import { Perfume } from '../../types/perfume';
import { CartItem, PaymentMethod } from '../../types/sale';
import { SalesRepository } from '../../repositories/salesRepository';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { PosService } from '../../services/posService';

interface PosTerminalViewProps {
  onNavigate: (view: string) => void;
}

export const PosTerminalView: React.FC<PosTerminalViewProps> = ({ onNavigate }) => {
  const perfumes = PerfumeRepository.getAll();
  const clients = SalesRepository.getClients();
  const [salesLog, setSalesLog] = useState(SalesRepository.getAll());

  // POS Search & Filter State
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pos' | 'ledger'>('pos');

  // POS Active Tray Items (Starts clean, NO DECANTS, Standard Prices: 100ml=$15, 50ml=$10)
  const [posTray, setPosTray] = useState<CartItem[]>([]);

  const [selectedClient, setSelectedClient] = useState('Cliente Mostrador');
  const [customClientName, setCustomClientName] = useState('');
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [ticketPrinted, setTicketPrinted] = useState<string | null>(null);

  // Fast Add Bottle to Tray (Standard Prices: 100ml = $15, 50ml = $10)
  const handleFastAdd = (perfume: Perfume) => {
    const itemCapacity = perfume.format.split('•')[0].trim();
    const standardPrice = itemCapacity.includes('50ml') ? 10.0 : 15.0;

    setPosTray((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.perfumeId === perfume.id && item.format === itemCapacity
      );

      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const newItem: CartItem = {
          id: `tray-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          perfumeId: perfume.id,
          name: perfume.name,
          house: perfume.house,
          format: itemCapacity,
          price: standardPrice,
          quantity: 1,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setPosTray((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveTrayItem = (id: string) => {
    setPosTray((prev) => prev.filter((i) => i.id !== id));
  };

  const { subtotal, total } = PosService.calculateTotals(posTray);

  // Credit & Installment calculations
  const chargedToday =
    selectedMethod === 'credit100'
      ? 0
      : selectedMethod === 'credit50'
      ? total / 2
      : total;

  const pendingDue =
    selectedMethod === 'credit100'
      ? total
      : selectedMethod === 'credit50'
      ? total / 2
      : 0;

  const changeDue = Math.max(0, cashTendered - chargedToday);

  const handleConfirmSale = () => {
    if (posTray.length === 0) return;

    const newSale = PosService.completeCheckout(posTray, selectedClient, selectedMethod);
    setSalesLog(SalesRepository.getAll());
    setTicketPrinted(newSale.id);

    // Reset tray to empty state
    setPosTray([]);
  };

  // Filtered perfumes for Vitrina Showcase
  const filteredPerfumes = useMemo(() => {
    return perfumes.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.house.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (p.family && p.family.toLowerCase().includes(searchFilter.toLowerCase()));

      if (!matchesSearch) return false;

      if (categoryFilter === 'all') return true;
      if (categoryFilter === '100ml') return p.format.includes('100ml');
      if (categoryFilter === '50ml') return p.format.includes('50ml');
      if (categoryFilter === 'arabes')
        return p.house.toLowerCase().includes('lattafa') || p.house.toLowerCase().includes('afnan');

      return true;
    });
  }, [perfumes, searchFilter, categoryFilter]);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
      {/* 1. ARCHITECTURAL ATELIER TOOLBAR (ROUNDED-NONE) */}
      <div className="bg-white rounded-none p-4 md:p-5 border border-[#E6DED1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#FAF8F5] flex items-center justify-center text-[#775a00] border border-[#E6DED1] shrink-0">
            <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-[#1A1817] leading-none">
                Punto de Venta &amp; Mostrador
              </h1>
            </div>
            <p className="text-xs text-[#6E665F] mt-1">
              Place Vendôme • Frascos réplica 1:1 con fijación prolongada (+8-12h).
            </p>
          </div>
        </div>

        {/* View Tabs & Daily Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex bg-[#FAF8F5] p-1 border border-[#E6DED1]">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-[#1A1817] text-white'
                  : 'text-[#6E665F] hover:text-[#1A1817]'
              }`}
            >
              Vitrina &amp; Cobro
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-[#1A1817] text-white'
                  : 'text-[#6E665F] hover:text-[#1A1817]'
              }`}
            >
              <span>Historial</span>
              <span className="px-1.5 py-0.2 rounded-none bg-[#c59b27] text-[#1A1817] text-[10px] font-bold">
                {salesLog.length}
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#F0F5EE] border border-[#2D5A27]/20 text-xs">
            <span className="font-mono font-bold text-[#2D5A27]">$195.00</span>
            <span className="text-[#2D5A27] text-[11px]">hoy</span>
          </div>

          <button
            onClick={() => onNavigate('audit')}
            className="px-3.5 py-1.5 rounded-none bg-white text-[#2C2826] hover:bg-[#FAF8F5] font-semibold text-xs border border-[#E6DED1] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#775a00]">schedule</span>
            <span>Corte Diario</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SECTION: Vitrina de Fragancias (7 Cols - Sharp Architectural Cards) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-white rounded-none p-5 border border-[#E6DED1]">
              
              {/* Category Pills & Live Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6E665F]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Buscar fragancia o casa..."
                    className="w-full bg-[#FAF8F5] pl-9 pr-8 py-2 rounded-none text-xs text-[#1A1817] placeholder:text-[#6E665F] border border-[#E6DED1] focus:border-[#1A1817] outline-none transition-all"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6E665F] hover:text-[#1A1817] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>

                {/* Counter */}
                <span className="font-mono text-xs text-[#6E665F] shrink-0 self-center sm:self-auto">
                  {filteredPerfumes.length} fragancias
                </span>
              </div>

              {/* Filter Pills (NO DECANTS) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: '100ml', label: '100ml' },
                  { id: '50ml', label: '50ml' },
                  { id: 'arabes', label: 'Árabes & Nicho' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      categoryFilter === cat.id
                        ? 'bg-[#1A1817] text-white border-[#1A1817]'
                        : 'bg-[#FAF8F5] text-[#2C2826] border-[#E6DED1] hover:bg-[#F5F2EB]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Fragrance Cards Grid: Sharp Architectural Cards (ROUNDED-NONE) */}
              {filteredPerfumes.length === 0 ? (
                <div className="py-16 text-center text-[#6E665F] bg-[#FAF8F5] rounded-none border border-dashed border-[#E6DED1]">
                  <span className="material-symbols-outlined text-4xl text-[#c59b27]/60 mb-2">search_off</span>
                  <p className="font-semibold text-sm text-[#1A1817]">No se encontraron fragancias</p>
                  <p className="text-xs mt-1">Intenta con otro término o categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredPerfumes.map((perfume) => {
                    const isAvailable = perfume.stock > 0;
                    // Extract clean capacity e.g. "100ml" or "50ml"
                    const cleanCapacity = perfume.format.split('•')[0].trim();

                    return (
                      <div
                        key={perfume.id}
                        className="bg-white rounded-none border border-[#E6DED1] hover:border-[#1A1817] transition-all flex flex-col justify-between group overflow-hidden shadow-xs"
                      >
                        <div>
                          {/* Full-Bleed Image Container */}
                          <div className="w-full h-52 sm:h-64 overflow-hidden bg-[#FAF8F5] relative border-b border-[#E6DED1]">
                            <img
                              src={perfume.imageUrl}
                              alt={perfume.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />

                            {/* Floating Status Pill */}
                            <div className="absolute top-3 right-3">
                              <span
                                className={`px-2.5 py-1 rounded-none text-[9px] font-semibold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5 border shadow-xs ${
                                  isAvailable
                                    ? 'bg-[#F0F5EE]/95 text-[#2D5A27] border-[#2D5A27]/30'
                                    : 'bg-[#F5F2EB]/95 text-[#6E665F] border-[#E6DED1]'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isAvailable ? 'bg-[#2D5A27]' : 'bg-[#6E665F]'
                                  }`}
                                ></span>
                                {isAvailable ? 'Disponible' : 'Consultar'}
                              </span>
                            </div>
                          </div>

                          {/* Content Details (Marca + Nombre + Capacidad & Precio) */}
                          <div className="p-4 flex flex-col justify-between">
                            <div>
                              <p className="text-[11px] font-mono uppercase tracking-widest text-[#946E19] font-bold truncate">
                                {perfume.house}
                              </p>
                              <h3 className="font-serif font-bold text-base text-[#1A1817] leading-tight line-clamp-1 mt-0.5 group-hover:text-[#946E19] transition-colors">
                                {perfume.name}
                              </h3>

                              {/* DUAL HERO: Clean Direct Capacity & Price */}
                              <div className="flex items-center justify-between border-y border-[#E6DED1] py-2.5 my-3">
                                <span className="font-serif font-bold text-base text-[#1A1817]">
                                  {cleanCapacity}
                                </span>
                                <span className="font-mono font-bold text-base text-[#1A1817]">
                                  ${perfume.price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Action Button: Flush and Compact */}
                            <button
                              onClick={() => handleFastAdd(perfume)}
                              disabled={!isAvailable}
                              className={`w-full py-2.5 px-4 rounded-none font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                isAvailable
                                  ? 'bg-[#1A1817] hover:bg-[#c59b27] text-white hover:text-[#1A1817]'
                                  : 'bg-[#F5F2EB] text-[#6E665F] cursor-not-allowed opacity-60'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                              <span>{isAvailable ? 'Agregar a Bandeja' : 'Sin Existencias'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Terminal de Cobro Activo (Scrollable & Sticky) */}
          <div id="pos-terminal-checkout" className="lg:col-span-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] flex flex-col scroll-mt-24">
            <div className="bg-white rounded-none p-5 border border-[#E6DED1] relative overflow-y-auto max-h-[calc(100vh-7rem)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#FAF8F5] [&::-webkit-scrollbar-thumb]:bg-[#c59b27] [scrollbar-width:thin] [scrollbar-color:#c59b27_#FAF8F5]">
              
              {/* Gold Top Accent Line */}
              <div className="h-0.5 bg-[#c59b27] mb-4"></div>

              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E6DED1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-none bg-[#FAF8F5] flex items-center justify-center text-[#775a00] border border-[#E6DED1]">
                    <span className="material-symbols-outlined text-[18px]">receipt</span>
                  </div>
                  <div>
                    <h2 className="font-serif text-sm font-bold text-[#1A1817] leading-none">
                      Terminal de Cobro
                    </h2>
                    <p className="text-[10px] text-[#6E665F] mt-0.5">
                      Mostrador 01 • Salón Privé
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-[#F0F5EE] text-[#2D5A27] text-[10px] font-bold border border-[#2D5A27]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                  <span>En Línea</span>
                </span>
              </div>

              {/* Client Selector (Compact & Clean) */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <label className="uppercase font-bold tracking-wider text-[#6E665F] text-[10px]">
                    Cliente del Atelier
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newName = prompt('Nombre del nuevo cliente:');
                      if (newName) setSelectedClient(newName);
                    }}
                    className="text-[#775a00] hover:text-[#946E19] font-bold text-[10px] cursor-pointer"
                  >
                    + Nuevo Cliente
                  </button>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E665F] text-[18px]">
                    person
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={selectedClient}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsAddingNewClient(true);
                          setSelectedClient('');
                        } else {
                          setIsAddingNewClient(false);
                          setSelectedClient(e.target.value);
                        }
                      }}
                      className="w-full bg-[#FAF8F5] pl-9 pr-8 py-2 rounded-none text-xs text-[#1A1817] font-medium border border-[#E6DED1] focus:border-[#1A1817] outline-none transition-all cursor-pointer"
                    >
                      <option value="Cliente Mostrador">Cliente Mostrador</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name.replace(/\(.*?\)/, '').trim()} ({c.code}) {c.pendingBalance > 0 ? `(Debe: $${c.pendingBalance.toFixed(2)})` : ''}
                        </option>
                      ))}
                      <option value="__NEW__">+ Registrar Nuevo Cliente...</option>
                    </select>
                  </div>
                  {isAddingNewClient && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={customClientName}
                        onChange={(e) => {
                          setCustomClientName(e.target.value);
                          setSelectedClient(e.target.value);
                        }}
                        placeholder="Nombre y apellido del cliente..."
                        className="flex-1 bg-white px-3 py-1.5 border border-[#c59b27] text-xs text-[#1A1817] outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customClientName.trim()) {
                            setSelectedClient(customClientName.trim());
                            setIsAddingNewClient(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#c59b27] text-[#1A1817] text-xs font-bold cursor-pointer"
                      >
                        OK
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bandeja de Despacho (ROUNDED-NONE) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="uppercase font-bold tracking-wider text-[#6E665F] text-[10px]">
                    Bandeja de Despacho
                  </span>
                  <span className="font-mono text-xs font-bold text-[#946E19]">
                    {posTray.reduce((acc, curr) => acc + curr.quantity, 0)} {posTray.reduce((acc, curr) => acc + curr.quantity, 0) === 1 ? 'frasco' : 'frascos'}
                  </span>
                </div>

                {posTray.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6E665F] bg-[#FAF8F5] rounded-none border border-dashed border-[#E6DED1]">
                    <span className="material-symbols-outlined text-3xl text-[#c59b27]/60 mb-2">shopping_bag</span>
                    <p className="font-semibold text-xs text-[#1A1817]">Bandeja vacía</p>
                    <p className="text-[11px] mt-0.5">Selecciona fragancias de la vitrina para cobrar.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {posTray.map((item) => {
                      const itemTotal = item.price * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-none border border-[#E6DED1] bg-[#FAF8F5] transition-all"
                        >
                          {/* Row 1: Full Name & Price */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-serif font-bold text-xs text-[#1A1817] leading-tight">
                              {item.name}
                            </span>
                            <span className="font-mono font-bold text-xs shrink-0 text-[#1A1817]">
                              ${itemTotal.toFixed(2)}
                            </span>
                          </div>

                          {/* Row 2: Capacity, Stepper & Subtle Remove Button */}
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-[11px] font-mono font-bold text-[#946E19] bg-white px-2 py-0.5 border border-[#E6DED1]">
                              {item.format}
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Quantity Stepper */}
                              <div className="flex items-center bg-white border border-[#E6DED1] p-0.5">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center text-[#6E665F] hover:text-[#1A1817] hover:bg-[#F5F2EB] font-bold cursor-pointer"
                                  title="Disminuir"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-mono font-bold text-xs text-[#1A1817]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                  className="w-5 h-5 flex items-center justify-center text-[#6E665F] hover:text-[#1A1817] hover:bg-[#F5F2EB] font-bold cursor-pointer"
                                  title="Aumentar"
                                >
                                  +
                                </button>
                              </div>

                              {/* Subtle Remove Icon */}
                              <button
                                onClick={() => handleRemoveTrayItem(item.id)}
                                className="text-[#A89F91] hover:text-[#8A2E2B] transition-colors p-0.5 cursor-pointer"
                                title="Quitar de bandeja"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Totales Financieros */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-none border border-[#E6DED1] space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center text-[#6E665F]">
                  <span>Total de los Frascos</span>
                  <span className="font-mono text-[#1A1817] font-semibold">${total.toFixed(2)} USD</span>
                </div>

                {/* Desglose de 2 Cuotas (50%) */}
                {selectedMethod === 'credit50' && (
                  <div className="p-2 bg-[#F5F2EB] border border-[#c59b27]/40 space-y-1">
                    <div className="flex justify-between items-center text-[#775a00] font-semibold">
                      <span>Modalidad: 2 Cuotas (50% c/u)</span>
                      <span className="font-mono">2× ${(total / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[#6E665F]">
                      <span>2ª Cuota restante (a 15 días):</span>
                      <span className="font-mono font-bold text-[#946E19]">${(total / 2).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Desglose de Crédito Directo (Llevar y Pagar Luego) */}
                {selectedMethod === 'credit100' && (
                  <div className="p-2 bg-[#F5F2EB] border border-[#c59b27]/40 space-y-1">
                    <div className="flex justify-between items-center text-[#775a00] font-semibold">
                      <span>Modalidad: Crédito Directo Atelier</span>
                      <span className="text-[10px] uppercase font-bold bg-[#c59b27] text-[#1A1817] px-1.5 py-0.2">
                        Retira Hoy
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[#6E665F]">
                      <span>Saldo total asignado a su crédito:</span>
                      <span className="font-mono font-bold text-[#8A2E2B]">+${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Fila Principal de Cobro de Hoy */}
                <div className="pt-2 border-t border-[#E6DED1] flex justify-between items-baseline">
                  <div>
                    <span className="font-serif font-bold text-sm text-[#1A1817]">
                      {selectedMethod === 'credit100' ? 'Cobro Inicial Hoy' : 'Total a Cobrar Hoy'}
                    </span>
                    {selectedMethod === 'credit100' && (
                      <p className="text-[10px] text-[#2D5A27] font-bold">Entrega con $0 de anticipo</p>
                    )}
                    {selectedMethod === 'credit50' && (
                      <p className="text-[10px] text-[#775a00] font-bold">1ª Cuota del 50%</p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-2xl text-[#1A1817]">
                    ${chargedToday.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Métodos de Pago & Créditos */}
              <div className="space-y-2 mb-4">
                <span className="uppercase font-bold tracking-wider text-[#6E665F] text-[10px] block">
                  Método de Pago / Financiamiento
                </span>

                {/* Row 1: Pagos Contado Inmediato */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cash', label: 'Efectivo', icon: 'payments' },
                    { id: 'pos', label: 'Tarjeta / POS', icon: 'credit_card' },
                    { id: 'transfer', label: 'Transferencia', icon: 'send_to_mobile' },
                  ].map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                        className={`p-2 rounded-none text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#1A1817] text-white border-[#1A1817]'
                            : 'bg-[#FAF8F5] text-[#2C2826] border-[#E6DED1] hover:bg-[#F5F2EB]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Row 2: Facilidades & Créditos Especiales */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Cuota 2 Pagos (50%) */}
                  <button
                    onClick={() => setSelectedMethod('credit50')}
                    className={`p-2.5 rounded-none text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border text-center ${
                      selectedMethod === 'credit50'
                        ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#2C2826] border-[#E6DED1] hover:bg-[#F5F2EB]'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[16px]">event_repeat</span>
                      <span>2 Cuotas (50%)</span>
                    </div>
                    <span className="text-[10px] opacity-80">Mitad hoy, mitad luego</span>
                  </button>

                  {/* Crédito Directo (Pagar Luego) */}
                  <button
                    onClick={() => setSelectedMethod('credit100')}
                    className={`p-2.5 rounded-none text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border text-center ${
                      selectedMethod === 'credit100'
                        ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#2C2826] border-[#E6DED1] hover:bg-[#F5F2EB]'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                      <span>A Crédito (Pagar Luego)</span>
                    </div>
                    <span className="text-[10px] opacity-80">$0 hoy • Carga a cuenta</span>
                  </button>
                </div>
              </div>

              {/* Vuelto Rápido (si Efectivo y cobro > 0) */}
              {selectedMethod === 'cash' && chargedToday > 0 && (
                <div className="p-2.5 bg-[#FAF8F5] rounded-none mb-4 border border-[#E6DED1] text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#6E665F]">
                      Efectivo Recibido
                    </span>
                    <span className="text-[11px] text-[#6E665F]">
                      Vuelto: <strong className="text-[#1A1817] font-mono">${changeDue.toFixed(2)}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setCashTendered(chargedToday)}
                      className={`py-1 rounded-none font-mono text-xs font-semibold border ${
                        cashTendered === chargedToday
                          ? 'bg-[#1A1817] text-white border-[#1A1817]'
                          : 'bg-white text-[#2C2826] border-[#E6DED1]'
                      }`}
                    >
                      ${chargedToday.toFixed(2)}
                    </button>
                    <button
                      onClick={() => setCashTendered(50.0)}
                      className={`py-1 rounded-none font-mono text-xs font-semibold border ${
                        cashTendered === 50
                          ? 'bg-[#1A1817] text-white border-[#1A1817]'
                          : 'bg-white text-[#2C2826] border-[#E6DED1]'
                      }`}
                    >
                      $50.00
                    </button>
                    <button
                      onClick={() => {
                        const val = prompt('Monto en efectivo recibido:', String(chargedToday));
                        if (val) setCashTendered(parseFloat(val) || chargedToday);
                      }}
                      className="py-1 rounded-none bg-white text-[#2C2826] font-mono text-xs font-semibold border border-[#E6DED1] hover:bg-[#ECE7DE]"
                    >
                      Otro
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Principal de Cobro / Autorización */}
              <button
                onClick={handleConfirmSale}
                disabled={posTray.length === 0}
                className="w-full py-3.5 rounded-none bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-serif font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {selectedMethod === 'credit100' ? 'check_box' : 'verified'}
                </span>
                <span>
                  {selectedMethod === 'credit100'
                    ? `Autorizar Entrega a Crédito ($0.00 hoy)`
                    : selectedMethod === 'credit50'
                    ? `Cobrar 1ª Cuota ($${chargedToday.toFixed(2)}) & Despachar`
                    : `Confirmar Venta Contado ($${chargedToday.toFixed(2)})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 3. HISTORIAL DE FACTURAS Y MOVIMIENTOS (ROUNDED-NONE) */
        <div className="bg-white rounded-none p-5 md:p-6 border border-[#E6DED1]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#775a00] text-[22px]">receipt_long</span>
                <h2 className="font-serif text-lg font-bold text-[#1A1817]">
                  Libro de Movimientos &amp; Facturas Emitidas
                </h2>
              </div>
              <p className="text-xs text-[#6E665F] mt-0.5">
                Bitácora de despacho y tickets certificados del Salón Place Vendôme.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => alert('Exportando libro de ventas diario a formato Excel...')}
                className="px-3 py-1.5 rounded-none bg-[#FAF8F5] text-[#2C2826] font-semibold flex items-center gap-1.5 hover:bg-[#F5F2EB] transition-colors border border-[#E6DED1] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#775a00]">file_download</span>
                <span>Exportar XLS</span>
              </button>
              <button
                onClick={() => alert('Enviando reimpresión del corte a impresora térmica Place Vendôme.')}
                className="px-3 py-1.5 rounded-none bg-[#FAF8F5] text-[#2C2826] font-semibold flex items-center gap-1.5 hover:bg-[#F5F2EB] transition-colors border border-[#E6DED1] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#775a00]">print</span>
                <span>Reimprimir</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-none border border-[#E6DED1]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#6E665F] uppercase font-bold tracking-wider text-[10px] border-b border-[#E6DED1]">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Fragancia</th>
                  <th className="py-3 px-4">Formato</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DED1] text-[#2C2826]">
                {salesLog.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#6E665F]">
                      <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">
                        receipt_long
                      </span>
                      <p className="font-semibold text-xs text-[#1A1817]">No hay facturas o movimientos registrados en esta sesión</p>
                      <p className="text-[11px] text-[#6E665F] mt-1">
                        Las ventas confirmadas en mostrador se registrarán aquí y se sincronizarán con Supabase.
                      </p>
                    </td>
                  </tr>
                ) : (
                  salesLog.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FAF8F5]/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#1A1817]">
                        {sale.id}
                      </td>
                      <td className="py-3 px-4 text-[#6E665F]">{sale.time}</td>
                      <td className="py-3 px-4 font-semibold text-[#1A1817]">
                        {sale.clientName.replace(/\(.*?\)/, '').trim()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1A1817]">{sale.fragranceName}</div>
                        <div className="text-[10px] text-[#6E665F]">{sale.house}</div>
                      </td>
                      <td className="py-3 px-4 text-[#6E665F]">{sale.format}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1">
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
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1817]">
                        ${sale.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-none text-[10px] font-semibold ${
                            sale.status === 'Completado'
                              ? 'bg-[#F0F5EE] text-[#2D5A27]'
                              : 'bg-[#FDF8EA] text-[#946E19]'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setTicketPrinted(sale.id)}
                          className="w-7 h-7 rounded-none bg-[#FAF8F5] hover:bg-[#ECE7DE] text-[#2C2826] inline-flex items-center justify-center transition-colors border border-[#E6DED1] cursor-pointer"
                          title="Imprimir ticket"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TICKET CONFIRMATION MODAL (ROUNDED-NONE) */}
      {ticketPrinted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-none p-6 border border-[#E6DED1] text-center font-mono shadow-2xl">
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
                <span>{selectedClient.replace(/\(.*?\)/, '').trim()}</span>
              </div>
              <div className="flex justify-between">
                <span>Método:</span>
                <span className="font-bold text-[11px]">
                  {selectedMethod === 'credit100'
                    ? 'Crédito (Pagar Luego)'
                    : selectedMethod === 'credit50'
                    ? 'Cuota 2 Pagos (50%)'
                    : selectedMethod.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#E6DED1]">
                <span>Cobrado Hoy:</span>
                <span>${chargedToday.toFixed(2)} USD</span>
              </div>
              {pendingDue > 0 && (
                <div className="flex justify-between text-[#946E19] font-bold">
                  <span>Saldo Pendiente:</span>
                  <span>${pendingDue.toFixed(2)} USD</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-[#6E665F] mb-4">
              Maceración verificada. Fijación prolongada garantizada (+8-12h).
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-none bg-[#FAF8F5] text-[#2C2826] font-sans font-semibold text-xs border border-[#E6DED1] hover:bg-[#F5F2EB] cursor-pointer"
              >
                Imprimir
              </button>
              <button
                onClick={() => setTicketPrinted(null)}
                className="flex-1 py-2 rounded-none bg-[#c59b27] text-[#1A1817] font-sans font-semibold text-xs hover:bg-[#D4AF37] cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Checkout Quick-Bar */}
      {activeTab === 'pos' && posTray.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#1A1817] text-white p-3 shadow-2xl border border-[#c59b27] flex items-center justify-between animate-fadeIn">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#c59b27] block tracking-wider">
              Bandeja ({posTray.reduce((acc, i) => acc + i.quantity, 0)} frascos)
            </span>
            <span className="font-mono text-sm font-bold text-white">
              ${(posTray.reduce((acc, i) => acc + i.price * i.quantity, 0)).toFixed(2)} USD
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('pos-terminal-checkout');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span>Ir a Cobrar</span>
            <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
          </button>
        </div>
      )}
    </div>
  );
};
