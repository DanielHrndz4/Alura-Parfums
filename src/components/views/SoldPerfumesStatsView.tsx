import React, { useState, useMemo } from 'react';
import { SalesRepository } from '../../repositories/salesRepository';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { SaleTransaction } from '../../types/sale';
import { Perfume } from '../../types/perfume';

interface SoldItemStat {
  fragranceName: string;
  cleanName: string;
  house: string;
  format: string;
  unitsSold: number;
  totalRevenue: number;     // Real facturado neto
  totalGross: number;       // Subtotal regular antes de descuento
  totalDiscount: number;    // Descuentos totales aplicados
  catalogPerfume?: Perfume;
  sales: Array<{
    ticketId: string;
    clientName: string;
    date: string;
    time: string;
    units: number;
    amount: number;         // Real neto cobrado
    grossAmount: number;    // Subtotal regular
    discount: number;       // Descuento en esta venta
    paymentMethodLabel: string;
    status: string;
  }>;
}

export const SoldPerfumesStatsView: React.FC = () => {
  // Sales & Catalog data
  const [sales] = useState<SaleTransaction[]>(() => SalesRepository.getAll());
  const catalogPerfumes = useMemo(() => PerfumeRepository.getAll(), []);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modal for buyers details of a selected fragrance
  const [selectedFragranceForModal, setSelectedFragranceForModal] = useState<SoldItemStat | null>(null);

  // Filter legitimate product sales (exclude standalone abonos like #AB-)
  const productSales = useMemo(() => {
    return sales.filter((s) => !s.id.startsWith('#AB-') && !s.fragranceName.toLowerCase().includes('abono'));
  }, [sales]);

  // Aggregate stats per sold perfume
  const soldStats = useMemo(() => {
    const map = new Map<string, SoldItemStat>();

    // Helper to find perfume in catalog
    const findInCatalog = (name: string, house: string) => {
      const clean = name.toLowerCase().replace(/[\(\)-]/g, '').trim();
      return catalogPerfumes.find((p) => {
        const pClean = p.name.toLowerCase().replace(/[\(\)-]/g, '').trim();
        return pClean.includes(clean) || clean.includes(pClean);
      });
    };

    productSales.forEach((sale) => {
      // Check period filter on sale date
      const dateLower = sale.date.toLowerCase();
      if (selectedPeriod === 'today' && !dateLower.includes('hoy')) return;
      if (selectedPeriod === 'week' && !dateLower.includes('hoy') && !dateLower.includes('oct') && !dateLower.includes('nov') && !dateLower.includes('dic')) return;

      const itemsRaw = sale.fragranceName.split(',').map((s) => s.trim()).filter(Boolean);
      const saleTotal = Number(sale.total) || 0;
      const saleSubtotal = Number(sale.subtotal) || saleTotal;
      const saleDiscount = Number(sale.discount) || 0;

      // Extract item info for all items in this sale first to calculate prorated revenue
      const parsedItems = itemsRaw.map((itemStr) => {
        const qtyMatch = itemStr.match(/\(x(\d+)\)/i) || itemStr.match(/\((\d+)\s*(?:uds|frascos|piezas)?\)/i);
        const units = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        const cleanName = itemStr.replace(/\(x\d+\)/gi, '').replace(/\(\d+\s*(?:uds|frascos|piezas)?\)/gi, '').trim();
        const house = sale.house || 'Maison Alura';
        const format = sale.format && sale.format.toLowerCase().includes('50ml') ? '50ml' : '100ml';
        const catalogMatch = findInCatalog(cleanName, house);
        const unitStandardPrice = catalogMatch ? catalogMatch.price : format.includes('50ml') ? 10 : 15;
        const grossAmount = unitStandardPrice * units;

        return {
          cleanName,
          house: catalogMatch ? catalogMatch.house : house,
          format: catalogMatch ? (catalogMatch.format.includes('50ml') ? '50ml' : '100ml') : format,
          units,
          grossAmount,
          catalogMatch,
        };
      });

      const totalGrossItems = parsedItems.reduce((sum, i) => sum + i.grossAmount, 0) || saleSubtotal || 1;

      parsedItems.forEach((item) => {
        let netRevenue = 0;
        let itemDiscount = 0;

        if (parsedItems.length === 1) {
          // If only 1 item in ticket, net revenue is exactly sale.total
          netRevenue = saleTotal;
          itemDiscount = saleDiscount;
        } else {
          // Prorate sale.total and sale.discount proportionally to each item's gross amount
          const ratio = item.grossAmount / totalGrossItems;
          netRevenue = Number((saleTotal * ratio).toFixed(2));
          itemDiscount = Number((saleDiscount * ratio).toFixed(2));
        }

        const key = `${item.cleanName.toLowerCase()}_${item.format.toLowerCase()}`;

        if (!map.has(key)) {
          map.set(key, {
            fragranceName: item.cleanName,
            cleanName: item.cleanName,
            house: item.house,
            format: item.format,
            unitsSold: 0,
            totalRevenue: 0,
            totalGross: 0,
            totalDiscount: 0,
            catalogPerfume: item.catalogMatch,
            sales: [],
          });
        }

        const entry = map.get(key)!;
        entry.unitsSold += item.units;
        entry.totalRevenue = Number((entry.totalRevenue + netRevenue).toFixed(2));
        entry.totalGross = Number((entry.totalGross + item.grossAmount).toFixed(2));
        entry.totalDiscount = Number((entry.totalDiscount + itemDiscount).toFixed(2));

        entry.sales.push({
          ticketId: sale.id,
          clientName: sale.clientName || 'Cliente Mostrador',
          date: sale.date,
          time: sale.time,
          units: item.units,
          amount: netRevenue,
          grossAmount: item.grossAmount,
          discount: itemDiscount,
          paymentMethodLabel: sale.paymentMethodLabel || 'Contado',
          status: sale.status,
        });
      });
    });

    return Array.from(map.values()).sort((a, b) => b.unitsSold - a.unitsSold || b.totalRevenue - a.totalRevenue);
  }, [productSales, catalogPerfumes, selectedPeriod]);

  // Filtered stats by search, house, and format
  const filteredStats = useMemo(() => {
    return soldStats.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.fragranceName.toLowerCase().includes(q);
        const matchesHouse = item.house.toLowerCase().includes(q);
        if (!matchesName && !matchesHouse) return false;
      }
      if (selectedHouse !== 'ALL' && item.house.toLowerCase() !== selectedHouse.toLowerCase()) {
        return false;
      }
      if (selectedFormat !== 'ALL' && !item.format.toLowerCase().includes(selectedFormat.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [soldStats, searchQuery, selectedHouse, selectedFormat]);

  // Overall KPIs
  const totalUnitsSold = useMemo(() => soldStats.reduce((sum, item) => sum + item.unitsSold, 0), [soldStats]);
  const totalRevenue = useMemo(() => soldStats.reduce((sum, item) => sum + item.totalRevenue, 0), [soldStats]);
  const totalGross = useMemo(() => soldStats.reduce((sum, item) => sum + item.totalGross, 0), [soldStats]);
  const totalDiscounts = useMemo(() => soldStats.reduce((sum, item) => sum + item.totalDiscount, 0), [soldStats]);
  const bestseller = soldStats[0];
  const uniqueFragrancesCount = soldStats.length;
  const avgRevenuePerUnit = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0;

  // Breakdown by House
  const houseBreakdown = useMemo(() => {
    const map = new Map<string, { house: string; units: number; revenue: number }>();
    soldStats.forEach((item) => {
      const h = item.house || 'Maison Alura';
      if (!map.has(h)) {
        map.set(h, { house: h, units: 0, revenue: 0 });
      }
      const e = map.get(h)!;
      e.units += item.unitsSold;
      e.revenue += item.totalRevenue;
    });
    return Array.from(map.values()).sort((a, b) => b.units - a.units);
  }, [soldStats]);

  // Breakdown by Format
  const formatBreakdown = useMemo(() => {
    let units100 = 0;
    let units50 = 0;
    let rev100 = 0;
    let rev50 = 0;
    soldStats.forEach((item) => {
      if (item.format.includes('50ml')) {
        units50 += item.unitsSold;
        rev50 += item.totalRevenue;
      } else {
        units100 += item.unitsSold;
        rev100 += item.totalRevenue;
      }
    });
    return { units100, units50, rev100, rev50 };
  }, [soldStats]);

  // Available houses for filter
  const availableHouses = useMemo(() => {
    const set = new Set<string>();
    soldStats.forEach((s) => set.add(s.house));
    return Array.from(set).sort();
  }, [soldStats]);

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = ['Perfume', 'Casa/Maison', 'Formato', 'Frascos Vendidos', 'Ingresos USD', 'Stock Disponible'];
    const rows = filteredStats.map((item) => [
      `"${item.fragranceName}"`,
      `"${item.house}"`,
      `"${item.format}"`,
      item.unitsSold,
      `$${item.totalRevenue.toFixed(2)}`,
      item.catalogPerfume ? item.catalogPerfume.stock : 'N/D',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Alura_Parfums_Ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* 1. HEADER */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E6DED1]/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#6E665F] uppercase tracking-widest text-xs font-bold font-mono">
            <span>Métricas &amp; Rendimiento</span>
            <span className="text-[#c59b27]">•</span>
            <span>Inteligencia Comercial</span>
          </div>
          <h1 className="text-[#1A1817] tracking-tight font-serif text-2xl sm:text-3xl font-semibold mt-1">
            Estadísticas de Ventas
          </h1>
          <p className="text-[#6E665F] text-xs sm:text-sm mt-1">
            Análisis consolidado de frascos despachados, fragancias más demandadas e ingresos generados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-none bg-white border border-[#E6DED1] hover:bg-[#F5F2EB] text-[#1A1817] font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#775a00]">print</span>
            <span>Imprimir Reporte</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-none bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Exportar CSV / Excel</span>
          </button>
        </div>
      </header>

      {/* 2. CORE KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Unidades Vendidas */}
        <div className="bg-white rounded-none p-5 border border-[#E6DED1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider text-[#6E665F] text-[10px] font-bold font-mono">
              Frascos Vendidos
            </span>
            <span className="w-8 h-8 bg-[#FAF8F5] text-[#c59b27] border border-[#E6DED1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">local_florist</span>
            </span>
          </div>
          <div className="mt-3">
            <p className="font-mono font-bold text-3xl text-[#1A1817]">
              {totalUnitsSold}{' '}
              <span className="font-sans text-xs font-normal text-[#6E665F]">unidades</span>
            </p>
            <p className="text-[11px] text-[#6E665F] mt-1">
              En {uniqueFragrancesCount} fragancias distintas del catálogo
            </p>
          </div>
        </div>

        {/* Card 2: Ingresos Totales de Perfumes */}
        <div className="bg-white rounded-none p-5 border border-[#E6DED1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider text-[#6E665F] text-[10px] font-bold font-mono">
              Total Facturado Neto
            </span>
            <span className="w-8 h-8 bg-[#FAF8F5] text-[#2D5A27] border border-[#E6DED1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </span>
          </div>
          <div className="mt-3">
            <p className="font-mono font-bold text-3xl text-[#1A1817]">
              ${totalRevenue.toFixed(2)}{' '}
              <span className="font-sans text-xs font-normal text-[#6E665F]">USD</span>
            </p>
            {totalDiscounts > 0 ? (
              <p className="text-[11px] text-[#2D5A27] font-semibold mt-1 flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-[13px]">loyalty</span>
                <span>Subtotal: ${totalGross.toFixed(2)} (-${totalDiscounts.toFixed(2)} desc.)</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#6E665F] mt-1 font-mono">
                Promedio: ${avgRevenuePerUnit.toFixed(2)} USD por frasco
              </p>
            )}
          </div>
        </div>

        {/* Card 3: Perfume Bestseller */}
        <div className="bg-white rounded-none p-5 border-2 border-[#c59b27]/60 shadow-xs flex flex-col justify-between relative bg-gradient-to-br from-white to-[#FAF8F5]">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider text-[#775a00] text-[10px] font-bold font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">military_tech</span>
              <span>Bestseller Estrella</span>
            </span>
            <span className="w-8 h-8 bg-[#c59b27] text-[#1A1817] flex items-center justify-center font-bold">
              ★
            </span>
          </div>
          <div className="mt-3">
            <p className="font-serif font-bold text-lg text-[#1A1817] leading-tight truncate">
              {bestseller ? bestseller.fragranceName : 'Sin ventas aún'}
            </p>
            <p className="text-[11px] font-mono text-[#775a00] font-bold mt-1">
              {bestseller ? `${bestseller.unitsSold} frascos vendidos (${bestseller.house})` : '—'}
            </p>
          </div>
        </div>

        {/* Card 4: Desglose 100ml vs 50ml */}
        <div className="bg-white rounded-none p-5 border border-[#E6DED1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider text-[#6E665F] text-[10px] font-bold font-mono">
              Preferencia de Formato
            </span>
            <span className="w-8 h-8 bg-[#FAF8F5] text-[#775a00] border border-[#E6DED1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">view_column</span>
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#1A1817] font-semibold">100ml: {formatBreakdown.units100} uds</span>
              <span className="text-[#775a00] font-bold">${formatBreakdown.rev100.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#1A1817] font-semibold">50ml: {formatBreakdown.units50} uds</span>
              <span className="text-[#775a00] font-bold">${formatBreakdown.rev50.toFixed(2)} USD</span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full bg-[#E6DED1] h-1.5 flex mt-1 overflow-hidden">
              <div
                className="bg-[#1A1817] h-full"
                style={{
                  width: totalUnitsSold > 0 ? `${(formatBreakdown.units100 / totalUnitsSold) * 100}%` : '50%',
                }}
              />
              <div
                className="bg-[#c59b27] h-full"
                style={{
                  width: totalUnitsSold > 0 ? `${(formatBreakdown.units50 / totalUnitsSold) * 100}%` : '50%',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISUAL CHARTS & HOUSE ANALYTICS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top 5 Perfumes Ranking */}
        <div className="lg:col-span-2 bg-white rounded-none p-5 sm:p-6 border border-[#E6DED1] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DED1] mb-4">
            <div>
              <h2 className="font-serif font-bold text-base text-[#1A1817]">
                Top Fragancias Más Vendidas
              </h2>
              <p className="text-[11px] text-[#6E665F]">
                Ranking según volumen de frascos despachados en boutique
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E6DED1] text-[#775a00] font-mono font-bold text-[11px]">
              Ranking Boutique
            </span>
          </div>

          {soldStats.length === 0 ? (
            <div className="py-12 text-center text-[#6E665F]">
              <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">
                sentiment_dissatisfied
              </span>
              <p className="text-xs">No hay ventas registradas en el período seleccionado.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {soldStats.slice(0, 5).map((item, idx) => {
                const maxUnits = soldStats[0]?.unitsSold || 1;
                const percentage = Math.round((item.unitsSold / maxUnits) * 100);

                return (
                  <div key={item.fragranceName} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 flex items-center justify-center font-bold text-[10px] font-mono border ${
                            idx === 0
                              ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27]'
                              : idx === 1
                              ? 'bg-[#E6DED1] text-[#1A1817] border-[#E6DED1]'
                              : idx === 2
                              ? 'bg-[#F5F2EB] text-[#775a00] border-[#E6DED1]'
                              : 'bg-white text-[#6E665F] border-[#E6DED1]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-serif font-bold text-[#1A1817] text-sm">
                          {item.fragranceName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#FAF8F5] border border-[#E6DED1] text-[#775a00] font-mono">
                          {item.format}
                        </span>
                        <span className="text-[11px] text-[#6E665F] hidden sm:inline">• {item.house}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-[#1A1817] text-sm">{item.unitsSold} frascos</span>
                        <span className="text-[#775a00] text-[11px] ml-2 font-semibold">
                          (${item.totalRevenue.toFixed(2)})
                        </span>
                        {item.totalDiscount > 0 && (
                          <span className="text-[10px] text-[#2D5A27] font-mono ml-1 font-semibold">
                            (Desc. -${item.totalDiscount.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#FAF8F5] border border-[#E6DED1] h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          idx === 0 ? 'bg-[#c59b27]' : idx === 1 ? 'bg-[#1A1817]' : 'bg-[#9C948A]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ventas por Casa / Maison */}
        <div className="bg-white rounded-none p-5 sm:p-6 border border-[#E6DED1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DED1] mb-4">
              <div>
                <h2 className="font-serif font-bold text-base text-[#1A1817]">
                  Ventas por Casa
                </h2>
                <p className="text-[11px] text-[#6E665F]">
                  Participación de cada Maison
                </p>
              </div>
              <span className="material-symbols-outlined text-[#c59b27] text-[20px]">
                pie_chart
              </span>
            </div>

            <div className="space-y-3">
              {houseBreakdown.map((h) => {
                const housePct = totalUnitsSold > 0 ? Math.round((h.units / totalUnitsSold) * 100) : 0;
                return (
                  <div key={h.house} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#1A1817] font-mono">{h.house}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-[#1A1817]">{h.units} uds</span>
                        <span className="text-[10px] text-[#775a00] font-bold">({housePct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#FAF8F5] border border-[#E6DED1] h-1.5 overflow-hidden">
                      <div
                        className="bg-[#c59b27] h-full transition-all duration-500"
                        style={{ width: `${housePct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E6DED1] text-center">
            <span className="text-[11px] text-[#6E665F] font-mono">
              Total casas representadas: {houseBreakdown.length}
            </span>
          </div>
        </div>
      </section>

      {/* 4. FILTERS TOOLBAR */}
      <section className="bg-white rounded-none p-4 border border-[#E6DED1] mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E665F] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar perfume o casa (ej. Born in Roma, Hawas, Valentino)..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E6DED1] text-xs text-[#1A1817] focus:border-[#1A1817] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E665F] hover:text-[#1A1817] text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Period Filter */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#E6DED1] text-[#1A1817] outline-none font-medium cursor-pointer"
            >
              <option value="all">Todo el Histórico</option>
              <option value="today">Ventas de Hoy</option>
              <option value="week">Esta Semana</option>
            </select>

            {/* House Filter */}
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#E6DED1] text-[#1A1817] outline-none font-medium cursor-pointer"
            >
              <option value="ALL">Todas las Casas</option>
              {availableHouses.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#E6DED1] text-[#1A1817] outline-none font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Formatos</option>
              <option value="100ml">Formato 100ml ($15)</option>
              <option value="50ml">Formato 50ml ($10)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. MAIN TABLE: DESGLOSE DE PERFUMES VENDIDOS */}
      <section className="bg-white rounded-none border border-[#E6DED1] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E6DED1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif font-bold text-base text-[#1A1817]">
              Catálogo de Perfumes Despachados
            </h2>
            <p className="text-[11px] text-[#6E665F]">
              Mostrando {filteredStats.length} de {soldStats.length} fragancias vendidas
            </p>
          </div>
          <span className="text-xs font-mono text-[#775a00] font-bold">
            Total en vista: {filteredStats.reduce((acc, curr) => acc + curr.unitsSold, 0)} frascos (${filteredStats.reduce((acc, curr) => acc + curr.totalRevenue, 0).toFixed(2)} USD)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E6DED1] text-[#6E665F] uppercase font-mono tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Fragancia</th>
                <th className="py-3.5 px-4 font-bold">Maison / Casa</th>
                <th className="py-3.5 px-4 font-bold">Formato</th>
                <th className="py-3.5 px-4 font-bold text-center">Frascos Vendidos</th>
                <th className="py-3.5 px-4 font-bold text-right">Facturado USD</th>
                <th className="py-3.5 px-4 font-bold text-center">Stock Actual</th>
                <th className="py-3.5 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DED1]/60">
              {filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6E665F]">
                    <span className="material-symbols-outlined text-4xl text-[#c59b27]/40 mb-2 block">
                      search_off
                    </span>
                    <p className="font-bold text-sm text-[#1A1817]">No se encontraron perfumes vendidos</p>
                    <p className="text-xs mt-1">Prueba cambiando los filtros de búsqueda o fecha.</p>
                  </td>
                </tr>
              ) : (
                filteredStats.map((item) => {
                  const currentStock = item.catalogPerfume ? item.catalogPerfume.stock : null;

                  return (
                    <tr key={`${item.fragranceName}-${item.format}`} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      {/* Fragrance details with image preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FAF8F5] border border-[#E6DED1] shrink-0 overflow-hidden flex items-center justify-center">
                            {item.catalogPerfume?.imageUrl ? (
                              <img
                                src={item.catalogPerfume.imageUrl}
                                alt={item.fragranceName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[#c59b27] text-[20px]">
                                local_florist
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-serif font-bold text-[#1A1817] text-sm block">
                              {item.fragranceName}
                            </span>
                            <span className="text-[10px] text-[#6E665F] font-mono">
                              {item.sales.length} {item.sales.length === 1 ? 'transacción' : 'transacciones'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Casa */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E6DED1] text-[#775a00] font-semibold text-[11px] font-mono">
                          {item.house}
                        </span>
                      </td>

                      {/* Formato */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#1A1817]">
                        {item.format}
                      </td>

                      {/* Frascos Vendidos */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1A1817] text-white font-mono font-bold text-xs">
                          {item.unitsSold} uds
                        </span>
                      </td>

                      {/* Facturado */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono">
                        <span className="font-bold text-sm text-[#1A1817] block">
                          ${item.totalRevenue.toFixed(2)} USD
                        </span>
                        {item.totalDiscount > 0 && (
                          <span className="text-[10px] text-[#2D5A27] font-semibold block">
                            -${item.totalDiscount.toFixed(2)} desc.
                          </span>
                        )}
                      </td>

                      {/* Stock Actual en Bodega */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {currentStock !== null ? (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase font-mono border ${
                              currentStock > 3
                                ? 'bg-[#F0F5EE] text-[#2D5A27] border-[#2D5A27]/20'
                                : currentStock > 0
                                ? 'bg-[#FAF8F5] text-[#775a00] border-[#c59b27]/40'
                                : 'bg-[#FAF0EF] text-[#8A2E2B] border-[#8A2E2B]/20'
                            }`}
                          >
                            {currentStock > 0 ? `${currentStock} disp.` : 'Agotado'}
                          </span>
                        ) : (
                          <span className="text-[#9C948A] text-[10px] italic">No catalogado</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedFragranceForModal(item)}
                          className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E6DED1] text-[#1A1817] font-semibold text-[11px] transition-all flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px] text-[#c59b27]">
                            receipt_long
                          </span>
                          <span>Ver Compradores ({item.sales.length})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. BUYERS DETAIL SLIDE-OVER / MODAL */}
      {selectedFragranceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-none border border-[#E6DED1] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E6DED1] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-[#E6DED1] flex items-center justify-center text-[#c59b27]">
                  <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1A1817] leading-tight">
                    Historial de Compradores: {selectedFragranceForModal.fragranceName}
                  </h3>
                  <p className="text-[11px] text-[#6E665F] font-mono mt-0.5">
                    {selectedFragranceForModal.house} • {selectedFragranceForModal.format} • {selectedFragranceForModal.unitsSold} frascos vendidos en total
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFragranceForModal(null)}
                className="w-8 h-8 rounded-none bg-white border border-[#E6DED1] text-[#6E665F] hover:text-[#1A1817] hover:bg-[#F5F2EB] flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Transactions List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-[#E6DED1]">
                <span className="text-[#6E665F] uppercase font-bold">Cliente / Ticket</span>
                <span className="text-[#6E665F] uppercase font-bold">Fecha • Unidades • Monto</span>
              </div>

              {selectedFragranceForModal.sales.map((sale, idx) => (
                <div
                  key={`${sale.ticketId}-${idx}`}
                  className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#1A1817]">
                        {sale.clientName}
                      </span>
                      <span className="font-mono text-[10px] text-[#775a00] font-bold px-1.5 py-0.2 bg-white border border-[#E6DED1]">
                        {sale.ticketId}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6E665F] mt-0.5 flex items-center gap-2">
                      <span>{sale.date} a las {sale.time}</span>
                      <span>•</span>
                      <span>{sale.paymentMethodLabel}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-sm text-[#1A1817] block">
                      {sale.units} {sale.units === 1 ? 'frasco' : 'frascos'}
                    </span>
                    <span className="text-xs text-[#2D5A27] font-semibold block">
                      ${sale.amount.toFixed(2)} USD
                    </span>
                    {sale.discount > 0 && (
                      <span className="text-[10px] text-[#8A2E2B] block">
                        (Desc. -${sale.discount.toFixed(2)} | Reg. ${sale.grossAmount.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E6DED1] bg-[#FAF8F5] flex justify-between items-center text-xs">
              <span className="font-mono text-[#6E665F]">
                Total neto recaudado: <strong className="text-[#1A1817]">${selectedFragranceForModal.totalRevenue.toFixed(2)} USD</strong>
                {selectedFragranceForModal.totalDiscount > 0 && (
                  <span className="ml-2 text-[#2D5A27]">
                    (Subtotal regular: ${selectedFragranceForModal.totalGross.toFixed(2)} | Descuentos: -${selectedFragranceForModal.totalDiscount.toFixed(2)})
                  </span>
                )}
              </span>
              <button
                onClick={() => setSelectedFragranceForModal(null)}
                className="px-4 py-2 bg-[#1A1817] text-white font-bold text-xs cursor-pointer hover:bg-[#333]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
