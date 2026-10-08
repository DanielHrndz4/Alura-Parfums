import React, { useState } from 'react';
import { SupplierRepository, IMPORT_ROUTES, DISBURSEMENT_WEEKS } from '../../repositories/supplierRepository';

export const SupplierInvoicesView: React.FC = () => {
  const [invoices, setInvoices] = useState(SupplierRepository.getAll());
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'paid' | 'transit'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredInvoices = invoices.filter((item) => {
    if (filterTab === 'pending') return item.pendingAmount > 0;
    if (filterTab === 'paid') return item.pendingAmount === 0;
    if (filterTab === 'transit') return item.id === 'LT-2024-004';
    return true;
  });

  const handlePayInvoice = (id: string, amount: number) => {
    SupplierRepository.payInvoice(id, amount);
    setInvoices(SupplierRepository.getAll());
    showNotification(`Pago de $${amount.toFixed(2)} USD aplicado al lote ${id} exitosamente.`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Editorial Header & Operational Actions */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E6DED1]/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#6E665F] font-label-sm uppercase tracking-widest text-xs font-bold">
            <span>Abastecimiento &amp; Adquisiciones</span>
            <span className="text-[#c59b27]">•</span>
            <span>Cuentas por Pagar</span>
          </div>
          <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl md:text-4xl font-semibold">
            Pago a Proveedores &amp; Gestión de Lotes
          </h1>
          <p className="font-body-md text-[#6E665F] max-w-3xl leading-relaxed text-sm">
            Control de pasivos comerciales, liquidación de compras mayoristas, fletes internacionales aduanales y previsión de tesorería para compras de reposición en atelier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => showNotification('Generando Orden de Compra oficial de Place Vendôme...')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#2C2826] font-title-md text-xs font-semibold shadow-sm border border-[#E6DED1] hover:bg-[#F5F2EB] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#775a00]">description</span>
            <span>Emitir Orden de Compra</span>
          </button>
          <button
            onClick={() => showNotification('Formulario de alta de factura de proveedor abierto.')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#c59b27] text-[#1A1817] font-title-md text-xs font-semibold shadow-sm hover:bg-[#D4AF37] transition-all shadow-[0_4px_16px_rgba(197,155,39,0.18)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Registrar Factura Proveedor</span>
          </button>
        </div>
      </header>

      {/* Key Metrics Bento Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 py-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6DED1] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Total Cuentas por Pagar
            </span>
            <span className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display-lg text-[#1A1817] leading-none tracking-tight font-mono font-bold text-2xl">
              $142.50 <span className="font-title-md text-xs font-normal text-[#6E665F]">USD</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#946E19]"></span>
              <span className="font-body-sm text-[#6E665F] text-xs">3 facturas pendientes</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c59b27]/40 via-[#c59b27] to-transparent"></div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6DED1] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Pagado este Mes
            </span>
            <span className="w-7 h-7 rounded-lg bg-[#F0F5EE] flex items-center justify-center text-[#2D5A27]">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display-lg text-[#1A1817] leading-none tracking-tight font-mono font-bold text-2xl">
              $192.50 <span className="font-title-md text-xs font-normal text-[#6E665F]">USD</span>
            </p>
            <p className="font-body-sm text-[#2D5A27] mt-2 flex items-center gap-1 text-xs">
              <span className="material-symbols-outlined text-[14px]">done_all</span> Lotes recibidos e ingresados
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6DED1] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Presupuesto Reposición
            </span>
            <span className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
              <span className="material-symbols-outlined text-[16px]">savings</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display-lg text-[#1A1817] leading-none tracking-tight font-mono font-bold text-2xl">
              $115.00 <span className="font-title-md text-xs font-normal text-[#6E665F]">USD</span>
            </p>
            <p className="font-body-sm text-[#6E665F] mt-2 text-xs">
              Tesorería activa para nuevos pedidos
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6DED1] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Próximo Vencimiento
            </span>
            <span className="w-7 h-7 rounded-lg bg-[#FDF8EA] flex items-center justify-center text-[#946E19]">
              <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-title-md text-[#1A1817] leading-snug text-sm font-semibold">
              25 Nov 2024
            </p>
            <p className="font-body-sm text-[#946E19] font-medium mt-1 text-xs">
              $45.00 USD Mayfair Concierge
            </p>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E6DED1] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Proveedores Activos
            </span>
            <span className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
              <span className="material-symbols-outlined text-[16px]">public</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display-lg text-[#1A1817] leading-none tracking-tight font-bold text-2xl">
              4 <span className="font-title-md text-xs font-normal text-[#6E665F]">Casas</span>
            </p>
            <p className="font-body-sm text-[#6E665F] mt-2 truncate text-xs">
              Dubái, Miami, París, Panamá
            </p>
          </div>
        </div>
      </section>

      {/* Atelier Visual Break & Supplier Network Strip */}
      <section className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
                Red de Importación y Arribos
              </span>
              <h2 className="font-headline-sm text-[#1A1817] mt-1 font-serif text-lg font-semibold">
                Rutas Mayoristas en Proceso de Despacho
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EB] text-[#775a00] font-body-sm text-xs border border-[#E6DED1]">
              <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
              Aduana Aeropuerto CDMX &amp; DHL Express
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {IMPORT_ROUTES.map((route) => (
              <div key={route.id} className="p-3 rounded-lg bg-[#F5F2EB]/50 border border-[#E6DED1]/60">
                <div className="flex items-center gap-1.5 text-[#6E665F] font-label-sm uppercase text-[10px]">
                  <span className="material-symbols-outlined text-[14px] text-[#775a00]">
                    {route.icon}
                  </span>{' '}
                  {route.hub}
                </div>
                <p className="font-title-md text-[#1A1817] mt-2 font-mono text-xs font-bold">
                  {route.code}
                </p>
                <span
                  className={`inline-block mt-1 font-body-sm text-[11px] ${
                    route.statusColor === 'warning'
                      ? 'text-[#946E19]'
                      : route.statusColor === 'success'
                      ? 'text-[#2D5A27]'
                      : 'text-[#6E665F]'
                  }`}
                >
                  {route.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Atelier Packaging Visual Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div className="relative h-32 w-full overflow-hidden bg-[#ECE7DE]">
            <img
              className="w-full h-full object-cover"
              alt="Luxury perfume bottles packed inside wooden crates with gold embossed seals"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfToRSpXcp5B74iRQ6ubrqO-Uij95XQYMlkdAhN6OaGpPXvuqbgzjE53qG5M_pgSksBFkFwRGLt2iO3JIQZERFne6_dlBmvV3gzT4eAqkRFfgjhaMdAzFnmFYF0eOfNHLBQSRHOQwBpe1UCmNBUrwn6685a8xO63BeEeKJ-l9uQ9Ng1p8bcU6AeG1FsVcXBZEphq8-PmW8XApjs7Jpa3FDQ-_fu_2T3hRRmEO56Qgr"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1817]/70 to-transparent flex items-end p-4">
              <p className="font-headline-sm text-white font-serif text-sm font-semibold">
                Protocolo de Verificación
              </p>
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <p className="font-body-sm text-[#6E665F] leading-relaxed text-xs">
              Cada lote recibido pasa por inspección olfativa de atomizador, batch code en fondo de botella y precinto celofán antes de autorizar la liquidación final.
            </p>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F5F2EB]">
              <span className="font-label-sm text-[#6E665F] uppercase text-[10px]">Criterio Calidad</span>
              <span className="font-body-sm text-[#2D5A27] font-medium text-xs">100% Auténtico</span>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Master Ledger Section */}
      <section className="bg-white rounded-xl shadow-sm border border-[#E6DED1] overflow-hidden mb-6">
        {/* Filter Bar & Search */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F5F2EB]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-title-md transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-[#F5F2EB] text-[#1A1817] font-semibold border border-[#E6DED1]'
                  : 'text-[#6E665F] hover:bg-[#F5F2EB]'
              }`}
            >
              Todas las Obligaciones
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg font-title-md transition-all cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-[#F5F2EB] text-[#1A1817] font-semibold border border-[#E6DED1]'
                  : 'text-[#6E665F] hover:bg-[#F5F2EB]'
              }`}
            >
              Pendientes de Pago (3)
            </button>
            <button
              onClick={() => setFilterTab('paid')}
              className={`px-3.5 py-1.5 rounded-lg font-title-md transition-all cursor-pointer ${
                filterTab === 'paid'
                  ? 'bg-[#F5F2EB] text-[#1A1817] font-semibold border border-[#E6DED1]'
                  : 'text-[#6E665F] hover:bg-[#F5F2EB]'
              }`}
            >
              Liquidadas (4)
            </button>
            <button
              onClick={() => setFilterTab('transit')}
              className={`px-3.5 py-1.5 rounded-lg font-title-md transition-all cursor-pointer ${
                filterTab === 'transit'
                  ? 'bg-[#F5F2EB] text-[#1A1817] font-semibold border border-[#E6DED1]'
                  : 'text-[#6E665F] hover:bg-[#F5F2EB]'
              }`}
            >
              En Tránsito Aduanal
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#6E665F]">
                filter_list
              </span>
              <select className="bg-[#F5F2EB]/60 font-body-sm text-xs text-[#2C2826] pl-8 pr-6 py-1.5 rounded-lg outline-none cursor-pointer border border-[#E6DED1]">
                <option>Ordenar por: Próximo Vencimiento</option>
                <option>Ordenar por: Mayor Monto Pendiente</option>
                <option>Ordenar por: Proveedor</option>
              </select>
            </div>
            <button
              onClick={() => showNotification('Descargando archivo CSV de cuentas por pagar...')}
              className="p-1.5 rounded-lg bg-[#F5F2EB] text-[#2C2826] hover:text-[#775a00] transition-colors border border-[#E6DED1] cursor-pointer"
              title="Exportar reporte CSV"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-semibold">Lote / Factura</th>
                <th className="py-3 px-4 font-semibold">Proveedor Mayorista</th>
                <th className="py-3 px-4 font-semibold">Concepto / Fragancias</th>
                <th className="py-3 px-4 font-semibold">Emisión / Vence</th>
                <th className="py-3 px-4 font-semibold text-right">Importe Total</th>
                <th className="py-3 px-4 font-semibold text-right">Pagado</th>
                <th className="py-3 px-4 font-semibold text-right">Saldo Pendiente</th>
                <th className="py-3 px-4 font-semibold text-center">Estatus</th>
                <th className="py-3 px-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] font-body-sm text-xs text-[#2C2826]">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#f5f3ef]/60 transition-colors">
                  <td className="py-4 px-4 font-medium text-[#1A1817] whitespace-nowrap">
                    <span className="font-mono text-[#2C2826] font-bold">{inv.id}</span>
                    <span className="block font-label-sm text-[#6E665F] text-[10px]">{inv.invoiceNumber}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#F5F2EB] text-[#775a00] flex items-center justify-center font-bold text-[10px] border border-[#E6DED1]">
                        {inv.supplierCode}
                      </span>
                      <div>
                        <p className="font-medium text-[#1A1817] text-xs">{inv.supplierName}</p>
                        <p className="font-label-sm text-[#6E665F] text-[10px]">{inv.supplierLocation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#2C2826] max-w-xs">
                    <p className="font-medium truncate">{inv.concept}</p>
                    <p className="font-label-sm text-[#6E665F] text-[10px]">{inv.conceptDetails}</p>
                  </td>
                  <td className="py-4 px-4 text-[#2C2826] whitespace-nowrap">
                    <p>{inv.issueDate}</p>
                    <p
                      className={`font-label-sm font-medium text-[10px] ${
                        inv.statusType === 'warning'
                          ? 'text-[#946E19]'
                          : inv.statusType === 'success'
                          ? 'text-[#2D5A27]'
                          : 'text-[#6E665F]'
                      }`}
                    >
                      {inv.dueDateHighlight || inv.dueDate}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-[#1A1817] whitespace-nowrap">
                    ${inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-[#6E665F] whitespace-nowrap">
                    ${inv.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-[#1A1817] font-bold whitespace-nowrap">
                    ${inv.pendingAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-semibold ${
                        inv.statusType === 'warning'
                          ? 'bg-[#FDF8EA] text-[#946E19] border border-[#946E19]/20'
                          : inv.statusType === 'success'
                          ? 'bg-[#F0F5EE] text-[#2D5A27] border border-[#2D5A27]/20'
                          : 'bg-[#F5F2EB] text-[#2C2826]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          inv.statusType === 'warning'
                            ? 'bg-[#946E19]'
                            : inv.statusType === 'success'
                            ? 'bg-[#2D5A27]'
                            : 'bg-[#6E665F]'
                        }`}
                      ></span>{' '}
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.pendingAmount > 0 ? (
                        <button
                          onClick={() => handlePayInvoice(inv.id, inv.pendingAmount)}
                          className="px-2.5 py-1 rounded bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-medium transition-all text-xs cursor-pointer shadow-xs"
                        >
                          Liquidar
                        </button>
                      ) : (
                        <button
                          onClick={() => showNotification(`Comprobante de ${inv.id} generado.`)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[#6E665F] hover:bg-[#F5F2EB] hover:text-[#1A1817] transition-colors text-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">receipt</span> Comprobante
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInvoice(inv.id)}
                        className="p-1 rounded text-[#6E665F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                        title="Ver Factura PDF"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ledger Bottom Summary */}
        <div className="p-4 bg-[#f5f3ef] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#6E665F] font-body-sm text-xs border-t border-[#E6DED1]">
          <div className="flex items-center gap-4">
            <span>
              Mostrando <strong>{filteredInvoices.length}</strong> lotes de aduanas &amp; proveedores
            </span>
            <span className="hidden sm:inline text-[#E6DED1]">|</span>
            <span className="hidden sm:inline">
              Divisa base: <strong>USD Dólar Americano</strong>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>
              Saldo por Pagar Consolidado:{' '}
              <strong className="text-[#1A1817] font-mono text-sm">
                ${SupplierRepository.getTotalPayable().toFixed(2)}
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Secondary Section: Cashflow Calendar & Supplier Conditions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Card: Calendario de Desembolsos (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
                  Flujo de Salida Semanal
                </span>
                <h3 className="font-headline-sm text-[#1A1817] mt-0.5 font-serif text-lg font-semibold">
                  Calendario de Desembolsos Programados
                </h3>
              </div>
              <span className="font-mono text-[#775a00] px-3 py-1 bg-[#F5F2EB] rounded-full text-xs font-semibold">
                Noviembre - Diciembre 2024
              </span>
            </div>

            <p className="font-body-sm text-[#6E665F] mb-6 text-xs">
              Previsión cronológica de tesorería para evitar penalizaciones por mora de importación y conservar cupos de crédito mayorista.
            </p>

            <div className="space-y-4">
              {DISBURSEMENT_WEEKS.map((week, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-medium text-[#1A1817]">{week.weekTitle}</span>
                    <span className="font-mono text-[#1A1817] font-bold">${week.amount.toFixed(2)} USD</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F5F2EB] overflow-hidden">
                    <div
                      className={`h-full ${week.colorClass} rounded-full`}
                      style={{ width: `${week.percentage}%` }}
                    ></div>
                  </div>
                  <p className="font-label-sm text-[#6E665F] mt-1 text-[10px]">{week.notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-[#F5F2EB]/70 border border-[#E6DED1] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#775a00] text-[22px]">trending_up</span>
              <div>
                <p className="font-title-md text-[#1A1817] text-xs font-semibold">
                  Fondo de Cobertura Disponible
                </p>
                <p className="font-label-sm text-[#6E665F] text-[10px]">
                  Tesorería cubre el 80.7% del pasivo total programado sin requerir reinversión externa.
                </p>
              </div>
            </div>
            <button
              onClick={() => showNotification('Desembolso programado en agenda bancaria.')}
              className="px-3 py-1.5 bg-white text-[#2C2826] rounded border border-[#E6DED1] font-title-md text-xs shadow-xs hover:bg-[#F5F2EB] transition-all whitespace-nowrap cursor-pointer font-medium"
            >
              Programar Pago
            </button>
          </div>
        </div>

        {/* Right Card: Condiciones de Pago & Crédito con Mayoristas (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
                  Términos Comerciales
                </span>
                <h3 className="font-headline-sm text-[#1A1817] mt-0.5 font-serif text-lg font-semibold">
                  Condiciones &amp; Crédito con Mayoristas
                </h3>
              </div>
              <span className="w-8 h-8 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00] border border-[#E6DED1]">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </span>
            </div>

            <ul className="space-y-3.5 mt-4">
              <li className="p-3 rounded-lg bg-[#f5f3ef] flex items-start gap-3 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[#775a00] text-[20px] mt-0.5">schedule</span>
                <div>
                  <p className="font-title-md text-[#1A1817] text-xs font-semibold">
                    Tiempos de Entrega &amp; Aduanas
                  </p>
                  <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                    4 a 6 días hábiles vía DHL Express Courier con desaduanamiento exprés e impuestos DDP.
                  </p>
                </div>
              </li>

              <li className="p-3 rounded-lg bg-[#f5f3ef] flex items-start gap-3 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[#775a00] text-[20px] mt-0.5">credit_score</span>
                <div>
                  <p className="font-title-md text-[#1A1817] text-xs font-semibold">
                    Plazos Homologados
                  </p>
                  <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                    <strong>Net 15</strong> para perfumería europea, <strong>Net 30</strong> para lotes orientales de Medio Oriente.
                  </p>
                </div>
              </li>

              <li className="p-3 rounded-lg bg-[#f5f3ef] flex items-start gap-3 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[#775a00] text-[20px] mt-0.5">account_balance</span>
                <div>
                  <p className="font-title-md text-[#1A1817] text-xs font-semibold">
                    Liquidación Internacional
                  </p>
                  <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                    Transferencia SWIFT en USD / EUR a Mayfair Concierge (Barclays UK) y cuenta Wise Business.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F5F2EB] flex items-center justify-between text-[#6E665F]">
            <span className="font-label-sm uppercase text-[10px]">Agente Comercial Alura:</span>
            <span className="font-title-md text-[#775a00] text-xs font-semibold flex items-center gap-1">
              <span>Éléonore Vance (Directora)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </section>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 border border-[#E6DED1]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DED1]">
              <h3 className="font-serif text-lg font-bold text-[#1A1817]">Detalle de Lote {selectedInvoice}</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full bg-[#F5F2EB] text-[#2C2826] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#2C2826]">
              <p>Inspección fitosanitaria completada.</p>
              <p>Sellos de cera y numeración de frasco correlativos.</p>
              <p>Guía de transporte aéreo archivada en Mayfair Hub.</p>
            </div>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="mt-6 w-full py-2 rounded-lg bg-[#c59b27] text-[#1A1817] font-semibold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-[#1A1817] px-5 py-3.5 rounded-xl shadow-xl border border-[#E6DED1] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#2D5A27]">verified</span>
          <p className="text-xs font-medium">{notification}</p>
        </div>
      )}
    </div>
  );
};
