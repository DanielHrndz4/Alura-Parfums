import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditRepository } from '../../repositories/auditRepository';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { SalesRepository } from '../../repositories/salesRepository';
import { SupplierRepository } from '../../repositories/supplierRepository';
import { TreasuryService } from '../../services/treasuryService';

export const AuditBalanceView: React.FC = () => {
  const navigate = useNavigate();

  // Core state from repositories
  const [drawerSummary, setDrawerSummary] = useState(() => AuditRepository.getDrawerSummary());
  const [isCuadreModalOpen, setIsCuadreModalOpen] = useState(false);
  const [inputContado, setInputContado] = useState(drawerSummary.expectedTotal.toFixed(2));
  const [closingNotes, setClosingNotes] = useState(drawerSummary.closingNotes);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Data: Perfumes & Inventory stock
  const perfumes = useMemo(() => PerfumeRepository.getAll(), []);
  const totalStockUnits = useMemo(() => perfumes.reduce((acc, p) => acc + p.stock, 0), [perfumes]);
  const stock100ml = useMemo(
    () => perfumes.filter((p) => p.format.toLowerCase().includes('100ml')).reduce((acc, p) => acc + p.stock, 0),
    [perfumes]
  );
  const stock50ml = useMemo(
    () => perfumes.filter((p) => p.format.toLowerCase().includes('50ml')).reduce((acc, p) => acc + p.stock, 0),
    [perfumes]
  );
  const totalInventoryCommercialValue = useMemo(
    () => perfumes.reduce((acc, p) => acc + p.stock * p.price, 0),
    [perfumes]
  );
  const inStockFragrancesCount = useMemo(() => perfumes.filter((p) => p.stock > 0).length, [perfumes]);
  const outOfStockFragrancesCount = useMemo(() => perfumes.filter((p) => p.stock === 0).length, [perfumes]);

  // 2. Data: Money pending to collect from clients (Cuentas por Cobrar)
  const clients = useMemo(() => SalesRepository.getClients(), []);
  const totalClientReceivable = useMemo(
    () => clients.reduce((acc, c) => acc + c.pendingBalance, 0),
    [clients]
  );
  const clientsWithDebtCount = useMemo(
    () => clients.filter((c) => c.pendingBalance > 0).length,
    [clients]
  );

  // 3. Data: Money pending to pay to suppliers (Cuentas por Pagar)
  const supplierInvoices = useMemo(() => SupplierRepository.getAll(), []);
  const totalSupplierPayable = useMemo(() => SupplierRepository.getTotalPayable(), []);
  const pendingInvoicesCount = useMemo(
    () => supplierInvoices.filter((i) => i.pendingAmount > 0).length,
    [supplierInvoices]
  );
  const totalPaidToSuppliers = useMemo(() => SupplierRepository.getTotalPaid(), []);

  // 4. Data: Sales & Cash expected
  const sales = useMemo(() => SalesRepository.getAll(), []);
  const totalSalesRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.total, 0), [sales]);
  const abonosHistory = useMemo(() => SalesRepository.getAbonos(), []);
  const totalAbonosReceived = useMemo(
    () => abonosHistory.reduce((acc, a) => acc + a.amount, 0),
    [abonosHistory]
  );

  // Dynamic calculation of expected money in store (Caja + Cuentas)
  const expectedTotal = drawerSummary.expectedTotal;
  const countedTotal = drawerSummary.countedTotal;
  const difference = drawerSummary.difference;
  const isBalanced = difference === 0;

  // Projected Net Liquid Position
  const projectedNetLiquidity = expectedTotal + totalClientReceivable - totalSupplierPayable;

  // Cuadre modal verification
  const handleSaveCuadre = () => {
    const countedVal = parseFloat(inputContado) || 0;
    const { summary, isBalanced: balanced } = TreasuryService.verifyCashDrawer(countedVal, closingNotes);

    setDrawerSummary(summary);
    setIsCuadreModalOpen(false);

    if (balanced) {
      showNotification('✓ Cuadre de caja verificado: Saldo físico coincide al 100%');
    } else {
      const diff = countedVal - summary.expectedTotal;
      showNotification(
        diff > 0
          ? `Cierre verificado con Sobrante de +$${diff.toFixed(2)} USD`
          : `Cierre verificado con Faltante de -$${Math.abs(diff).toFixed(2)} USD`
      );
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E6DED1]/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#6E665F] font-label-sm uppercase tracking-widest text-xs font-bold">
            <span>Control Financiero &amp; Operativo</span>
            <span className="text-[#c59b27]">•</span>
            <span>Resumen Ejecutivo</span>
          </div>
          <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-2xl sm:text-3xl font-semibold mt-1">
            Estadísticas &amp; Cuadre de Saldos
          </h1>
          <p className="font-body-md text-[#6E665F] text-xs sm:text-sm mt-1">
            Visualización simple: dinero que debes tener en caja, productos disponibles, cuentas por cobrar y por pagar.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setInputContado(drawerSummary.expectedTotal.toFixed(2));
              setIsCuadreModalOpen(true);
            }}
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-none bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Verificar Cuadre de Caja</span>
          </button>
        </div>
      </header>

      {/* 4 CORE EXECUTIVE METRICS BENTO CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Saldo que Debemos Tener */}
        <div className="bg-white rounded-none p-5 shadow-xs border-2 border-[#c59b27]/50 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
                Saldo que Debemos Tener
              </span>
              <span className="w-7 h-7 bg-[#F5F2EB] text-[#c59b27] border border-[#E6DED1] flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              </span>
            </div>
            <div className="mt-3">
              <p className="font-mono font-bold text-2xl text-[#1A1817]">
                ${expectedTotal.toFixed(2)}{' '}
                <span className="font-sans text-xs font-normal text-[#6E665F]">USD</span>
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-[#6E665F] border-t border-[#F5F2EB] pt-2">
                <div className="flex justify-between">
                  <span>Efectivo en gaveta:</span>
                  <span className="font-mono font-bold text-[#1A1817]">${drawerSummary.cashPhysical.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Terminal POS (Tarjetas):</span>
                  <span className="font-mono font-bold text-[#1A1817]">${drawerSummary.posCards.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transferencias / Zelle:</span>
                  <span className="font-mono font-bold text-[#1A1817]">${drawerSummary.zelleTransfer.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F5F2EB] flex items-center justify-between">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-none flex items-center gap-1 ${
                isBalanced
                  ? 'bg-[#F0F5EE] text-[#2D5A27] border border-[#2D5A27]/20'
                  : 'bg-[#FDF8EA] text-[#946E19] border border-[#946E19]/30'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {isBalanced ? 'check_circle' : 'info'}
              </span>
              {isBalanced ? 'Caja Cuadrada ✓' : `Diferencia: $${difference.toFixed(2)}`}
            </span>
            <button
              onClick={() => setIsCuadreModalOpen(true)}
              className="text-[11px] text-[#775a00] hover:underline font-semibold cursor-pointer"
            >
              Ajustar conteo
            </button>
          </div>
        </div>

        {/* Metric 2: Productos Disponibles (Stock y Cantidad) */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
                Productos Disponibles
              </span>
              <span className="w-7 h-7 bg-[#F5F2EB] text-[#775a00] border border-[#E6DED1] flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              </span>
            </div>
            <div className="mt-3">
              <p className="font-mono font-bold text-2xl text-[#1A1817]">
                {totalStockUnits}{' '}
                <span className="font-sans text-xs font-normal text-[#6E665F]">Frascos en vitrina</span>
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-[#6E665F] border-t border-[#F5F2EB] pt-2">
                <div className="flex justify-between">
                  <span>Frascos 100ml ($15):</span>
                  <span className="font-mono font-bold text-[#1A1817]">{stock100ml} uds</span>
                </div>
                <div className="flex justify-between">
                  <span>Frascos 50ml ($10):</span>
                  <span className="font-mono font-bold text-[#1A1817]">{stock50ml} uds</span>
                </div>
                <div className="flex justify-between text-[#2D5A27]">
                  <span>Valor venta inventario:</span>
                  <span className="font-mono font-bold">${totalInventoryCommercialValue.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[11px]">
            <span className="text-[#6E665F]">
              {inStockFragrancesCount} fragancias con stock
            </span>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-[#775a00] hover:underline font-semibold cursor-pointer"
            >
              Ver inventario →
            </button>
          </div>
        </div>

        {/* Metric 3: Dinero Pendiente de Cobro (Clientes) */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
                Por Cobrar a Clientes
              </span>
              <span className="w-7 h-7 bg-[#FDF8EA] text-[#946E19] border border-[#946E19]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              </span>
            </div>
            <div className="mt-3">
              <p className="font-mono font-bold text-2xl text-[#946E19]">
                ${totalClientReceivable.toFixed(2)}{' '}
                <span className="font-sans text-xs font-normal text-[#6E665F]">USD</span>
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-[#6E665F] border-t border-[#F5F2EB] pt-2">
                <div className="flex justify-between">
                  <span>Clientes con deuda:</span>
                  <span className="font-bold text-[#1A1817]">{clientsWithDebtCount} clientes</span>
                </div>
                <div className="flex justify-between">
                  <span>Abonos recibidos hoy:</span>
                  <span className="font-mono font-bold text-[#2D5A27]">+${totalAbonosReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado de cartera:</span>
                  <span className="text-[#2D5A27] font-semibold">98.2% puntual</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[11px]">
            <span className="text-[#6E665F]">Apartados 50% &amp; Crédito</span>
            <button
              onClick={() => navigate('/admin/credits')}
              className="text-[#775a00] hover:underline font-semibold cursor-pointer"
            >
              Cobrar abonos →
            </button>
          </div>
        </div>

        {/* Metric 4: Dinero Pendiente de Pago (Proveedores) */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
                Por Pagar a Proveedores
              </span>
              <span className="w-7 h-7 bg-[#FAF0EF] text-[#b91c1c] border border-[#b91c1c]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              </span>
            </div>
            <div className="mt-3">
              <p className="font-mono font-bold text-2xl text-[#b91c1c]">
                ${totalSupplierPayable.toFixed(2)}{' '}
                <span className="font-sans text-xs font-normal text-[#6E665F]">USD</span>
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-[#6E665F] border-t border-[#F5F2EB] pt-2">
                <div className="flex justify-between">
                  <span>Compras pendientes:</span>
                  <span className="font-bold text-[#1A1817]">{pendingInvoicesCount} facturas</span>
                </div>
                <div className="flex justify-between">
                  <span>Pagado a empresas:</span>
                  <span className="font-mono font-bold text-[#2D5A27]">${totalPaidToSuppliers.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insumos cubiertos:</span>
                  <span className="text-[#6E665F]">Frascos &amp; esencias</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[11px]">
            <span className="text-[#6E665F]">Obligaciones de compra</span>
            <button
              onClick={() => navigate('/admin/suppliers')}
              className="text-[#775a00] hover:underline font-semibold cursor-pointer"
            >
              Pagar facturas →
            </button>
          </div>
        </div>
      </section>

      {/* LIQUID FINANCIAL HEALTH BANNER */}
      <section className="bg-gradient-to-r from-[#FAF8F5] to-[#F5F2EB] p-5 border border-[#E6DED1] shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c59b27] text-[20px]">account_balance</span>
              <h2 className="font-title-md text-sm font-bold text-[#1A1817] uppercase tracking-wider">
                Balance Neto Líquido Proyectado
              </h2>
            </div>
            <p className="text-xs text-[#6E665F] mt-1">
              Fórmula simple: [Saldo Esperado] + [Por Cobrar a Clientes] - [Por Pagar a Proveedores]
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#6E665F] block uppercase font-sans">En Caja/Bancos</span>
                <span className="font-bold text-[#1A1817]">${expectedTotal.toFixed(2)}</span>
              </div>
              <span className="text-[#c59b27] font-bold">+</span>
              <div>
                <span className="text-[10px] text-[#6E665F] block uppercase font-sans">Por Cobrar</span>
                <span className="font-bold text-[#2D5A27]">${totalClientReceivable.toFixed(2)}</span>
              </div>
              <span className="text-[#b91c1c] font-bold">-</span>
              <div>
                <span className="text-[10px] text-[#6E665F] block uppercase font-sans">Por Pagar</span>
                <span className="font-bold text-[#b91c1c]">${totalSupplierPayable.toFixed(2)}</span>
              </div>
              <span className="text-[#6E665F] font-bold">=</span>
            </div>

            <div className="bg-white px-4 py-2 border border-[#E6DED1] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#6E665F] block">Patrimonio Líquido</span>
              <span className="font-mono text-xl font-bold text-[#2D5A27]">
                ${projectedNetLiquidity.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CASH DRAWER ARQUEO & FLOW SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Cuadre de Caja Físico */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6DED1]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                Arqueo de Efectivo &amp; Terminales
              </span>
              <h3 className="font-serif text-base font-bold text-[#1A1817] mt-0.5">
                Estado del Cuadre de Caja
              </h3>
            </div>
            <button
              onClick={() => setIsCuadreModalOpen(true)}
              className="px-3 py-1.5 bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] font-bold text-xs rounded-none border border-[#E6DED1] transition-colors cursor-pointer"
            >
              Hacer Cuadre Físico
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div className="p-3 bg-[#FAF8F5] border border-[#E6DED1]">
              <span className="text-[10px] text-[#6E665F] uppercase font-bold block">Esperado Sistema</span>
              <span className="font-mono text-base font-bold text-[#1A1817] mt-1 block">
                ${expectedTotal.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#E6DED1]">
              <span className="text-[10px] text-[#6E665F] uppercase font-bold block">Contado Físico</span>
              <span className="font-mono text-base font-bold text-[#1A1817] mt-1 block">
                ${countedTotal.toFixed(2)}
              </span>
            </div>

            <div
              className={`p-3 border ${
                isBalanced
                  ? 'bg-[#F0F5EE] border-[#2D5A27]/20 text-[#2D5A27]'
                  : difference > 0
                  ? 'bg-[#FDF8EA] border-[#946E19]/30 text-[#946E19]'
                  : 'bg-[#FAF0EF] border-[#b91c1c]/20 text-[#b91c1c]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block">Diferencia</span>
              <span className="font-mono text-base font-bold mt-1 block">
                {isBalanced ? '$0.00' : `${difference > 0 ? '+' : ''}$${difference.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#6E665F] py-1 border-b border-[#F5F2EB]">
              <span>Responsable del Cuadre:</span>
              <span className="font-semibold text-[#1A1817]">{drawerSummary.auditorName}</span>
            </div>
            <div className="flex justify-between text-[#6E665F] py-1 border-b border-[#F5F2EB]">
              <span>Folio de Control:</span>
              <span className="font-mono text-[#1A1817]">{drawerSummary.closureFolio}</span>
            </div>
            <div className="flex justify-between text-[#6E665F] py-1">
              <span>Observaciones:</span>
              <span className="italic text-[#1A1817] max-w-xs truncate text-right">
                {drawerSummary.closingNotes || 'Sin incidencias'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Resumen de Entradas vs Salidas */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-4 border-b border-[#E6DED1]">
              <span className="text-[10px] uppercase font-bold text-[#2D5A27] tracking-widest block">
                Flujo Financiero
              </span>
              <h3 className="font-serif text-base font-bold text-[#1A1817] mt-0.5">
                Ingresos vs Gastos
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3.5 bg-[#F0F5EE]/60 border border-[#2D5A27]/20">
                <div className="flex items-center gap-1.5 text-[#2D5A27] text-xs font-bold uppercase mb-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  Entradas Totales
                </div>
                <span className="font-mono text-xl font-bold text-[#2D5A27] block">
                  +${totalSalesRevenue.toFixed(2)} USD
                </span>
                <span className="text-[10px] text-[#6E665F] mt-1 block">
                  Ventas boutique + abonos recibidos
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF0EF]/60 border border-[#b91c1c]/20">
                <div className="flex items-center gap-1.5 text-[#b91c1c] text-xs font-bold uppercase mb-1">
                  <span className="material-symbols-outlined text-[16px]">trending_down</span>
                  Salidas Totales
                </div>
                <span className="font-mono text-xl font-bold text-[#b91c1c] block">
                  -${totalPaidToSuppliers.toFixed(2)} USD
                </span>
                <span className="text-[10px] text-[#6E665F] mt-1 block">
                  Pagos realizados a empresas de frascos
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] border border-[#E6DED1] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#1A1817] block">Margen Operativo Bruto</span>
              <span className="text-[11px] text-[#6E665F]">Diferencial de entradas netas vs costo de reposición</span>
            </div>
            <span className="font-mono text-lg font-bold text-[#2D5A27]">
              +${(totalSalesRevenue - totalPaidToSuppliers).toFixed(2)} USD
            </span>
          </div>
        </div>
      </section>

      {/* RECENT FINANCIAL TRANSACTIONS TABLE */}
      <section className="bg-white rounded-none shadow-xs border border-[#E6DED1] overflow-hidden">
        <div className="p-4 bg-[#F5F2EB]/50 border-b border-[#E6DED1] flex justify-between items-center">
          <div>
            <h3 className="font-title-md text-xs font-bold text-[#1A1817] uppercase tracking-wider">
              Últimos Movimientos Financieros
            </h3>
            <span className="text-[11px] text-[#6E665F]">Ventas en mostrador, abonos de clientes y pagos a proveedores</span>
          </div>
          <span className="text-xs text-[#6E665F] font-mono">{sales.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase">
                <th className="py-3 px-4 font-semibold">Folio / Fecha</th>
                <th className="py-3 px-4 font-semibold">Tipo de Movimiento</th>
                <th className="py-3 px-4 font-semibold">Cliente / Empresa</th>
                <th className="py-3 px-4 font-semibold">Concepto / Detalle</th>
                <th className="py-3 px-4 font-semibold">Método</th>
                <th className="py-3 px-4 text-right font-semibold">Impacto en Caja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E665F]">
                    <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">
                      account_balance
                    </span>
                    <p className="font-semibold text-xs text-[#1A1817]">No hay movimientos financieros registrados</p>
                    <p className="text-[11px] text-[#6E665F] mt-1">
                      Las ventas en mostrador, abonos y desembolsos confirmados aparecerán aquí en tiempo real.
                    </p>
                  </td>
                </tr>
              ) : (
                sales.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-[#1A1817] block">{item.id}</span>
                      <span className="text-[10px] text-[#6E665F]">{item.date} {item.time}</span>
                    </td>
                    <td className="py-3 px-4">
                      {item.fragranceName.includes('Abono') ? (
                        <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#c59b27]/30 text-[#775a00] font-bold text-[10px]">
                          Abono Cliente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#F0F5EE] border border-[#2D5A27]/20 text-[#2D5A27] font-bold text-[10px]">
                          Venta Mostrador
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1A1817]">{item.clientName}</td>
                    <td className="py-3 px-4 text-[#6E665F] max-w-xs truncate">
                      {item.fragranceName} • {item.format}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-white border border-[#E6DED1] text-[10px] font-medium text-[#1A1817]">
                        {item.paymentMethodLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#2D5A27]">
                      +${item.total.toFixed(2)} USD
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL: VERIFICAR CUADRE DE CAJA */}
      {isCuadreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden animate-fadeIn">
            <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                  Conciliación de Cierre
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1817]">
                  Cuadre de Caja Físico
                </h3>
              </div>
              <button
                onClick={() => setIsCuadreModalOpen(false)}
                className="w-8 h-8 rounded-none bg-white hover:bg-neutral-200 text-[#2C2826] flex items-center justify-center border border-[#E6DED1] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E665F] block">Saldo Esperado Sistema</span>
                  <span className="font-mono text-lg font-bold text-[#1A1817]">${expectedTotal.toFixed(2)} USD</span>
                </div>
                <div className="text-right text-[11px] text-[#6E665F]">
                  <span>Ventas + Cobros registrados</span>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Dinero Contado Físicamente en Caja ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#6E665F] font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={inputContado}
                    onChange={(e) => setInputContado(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E6DED1] rounded-none text-lg font-mono font-bold text-[#1A1817] outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Dynamic live difference check */}
              {inputContado && (
                <div
                  className={`p-3 border space-y-1 ${
                    parseFloat(inputContado) === expectedTotal
                      ? 'bg-[#F0F5EE] border-[#2D5A27]/20 text-[#2D5A27]'
                      : parseFloat(inputContado) > expectedTotal
                      ? 'bg-[#FDF8EA] border-[#946E19]/30 text-[#946E19]'
                      : 'bg-[#FAF0EF] border-[#b91c1c]/20 text-[#b91c1c]'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>Resultado del Cuadre:</span>
                    <span>
                      {parseFloat(inputContado) === expectedTotal
                        ? 'Caja Exacta (0.00)'
                        : parseFloat(inputContado) > expectedTotal
                        ? `Sobrante: +$${(parseFloat(inputContado) - expectedTotal).toFixed(2)}`
                        : `Faltante: -$${(expectedTotal - parseFloat(inputContado)).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                  Notas / Observaciones de Cierre (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Ej. Cierre de turno verificado sin incidencias..."
                  className="w-full p-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] outline-none focus:border-[#c59b27]"
                />
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#E6DED1] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsCuadreModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-[#E6DED1] bg-white text-xs font-semibold text-[#6E665F] hover:text-[#1A1817] rounded-none cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCuadre}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] rounded-none cursor-pointer shadow-xs text-center"
              >
                Confirmar y Guardar Cuadre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-[#1A1817] px-5 py-3.5 rounded-none shadow-xl border border-[#E6DED1] flex items-center gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-[#2D5A27]">verified</span>
          <p className="text-xs font-medium">{notification}</p>
        </div>
      )}
    </div>
  );
};
