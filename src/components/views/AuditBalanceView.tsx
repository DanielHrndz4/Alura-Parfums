import React, { useState } from 'react';
import { AuditRepository } from '../../repositories/auditRepository';
import { TreasuryService } from '../../services/treasuryService';

export const AuditBalanceView: React.FC = () => {
  const [drawerSummary, setDrawerSummary] = useState(AuditRepository.getDrawerSummary());
  const [weeklyRecords, setWeeklyRecords] = useState(AuditRepository.getWeeklyRecords());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputContado, setInputContado] = useState(drawerSummary.expectedTotal.toFixed(2));
  const [closingNotes, setClosingNotes] = useState(drawerSummary.closingNotes);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveCuadre = () => {
    const countedVal = parseFloat(inputContado) || 0;
    const { summary, record, isBalanced } = TreasuryService.verifyCashDrawer(
      countedVal,
      closingNotes
    );

    setDrawerSummary(summary);
    setWeeklyRecords(AuditRepository.getWeeklyRecords());
    setIsModalOpen(false);

    if (isBalanced) {
      showToast('Cuadre de caja verificado: Saldo equilibrado al 100%');
    } else {
      const diff = countedVal - summary.expectedTotal;
      showToast(
        diff > 0
          ? `Cierre registrado con Sobrante de +$${diff.toFixed(2)} USD`
          : `Cierre registrado con Faltante de -$${Math.abs(diff).toFixed(2)} USD`
      );
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast('Balance contable exportado en PDF/Excel satisfactoriamente.');
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* TOP EDITORIAL HEADER */}
      <div className="relative w-full rounded-xl bg-white p-6 md:p-8 shadow-sm border border-[#E6DED1] mb-6 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#ffdf98]/20 via-[#F5F2EB]/40 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27]"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] text-[10px] font-bold">
                Control Financiero &amp; Tesorería • Auditoría de Atelier
              </span>
              <span className="font-label-sm text-label-sm text-[#6E665F]/60 text-[10px]">
                • Édit. Vendôme
              </span>
            </div>
            <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl md:text-4xl font-semibold">
              Estadísticas &amp; Cuadre de Saldos
            </h1>
            <p className="font-body-md text-[#2C2826]/80 mt-2 max-w-2xl leading-relaxed text-sm">
              Conciliación diaria y mensual de ingresos por venta, cobros de crédito, pagos a mayoristas y balance neto en caja y cuentas bancarias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-lg bg-[#F5F2EB] text-[#2C2826] font-title-md text-xs font-semibold hover:bg-[#ECE7DE] transition-all flex items-center gap-2 shadow-sm border border-[#E6DED1] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#775a00]">
                {isExporting ? 'refresh' : 'download'}
              </span>
              <span>{isExporting ? 'Generando Folio...' : 'Exportar Balance Contable (PDF/Excel)'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-[#c59b27] text-[#1A1817] font-title-md text-xs font-semibold hover:bg-[#D4AF37] transition-all shadow-[0_4px_16px_rgba(197,155,39,0.25)] flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Ejecutar Cuadre de Caja Diario</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE BALANCE SUMMARY (EL GRAN CUADRE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        {/* Card 1 */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E6DED1] flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Ingresos Totales
            </span>
            <div className="w-7 h-7 rounded-full bg-[#F0F5EE] flex items-center justify-center text-[#2D5A27]">
              <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
            </div>
          </div>
          <div>
            <p className="font-headline-md text-[#1A1817] font-mono leading-none tracking-tight font-bold text-xl">
              +$195.00
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-label-md text-[#2D5A27] font-semibold text-[11px]">14 frascos</span>
              <span className="font-body-sm text-[#6E665F] text-[11px]">vendidos hoy</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E6DED1] flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Cobros de Créditos
            </span>
            <div className="w-7 h-7 rounded-full bg-[#F0F5EE] flex items-center justify-center text-[#2D5A27]">
              <span className="material-symbols-outlined text-[16px]">savings</span>
            </div>
          </div>
          <div>
            <p className="font-headline-md text-[#1A1817] font-mono leading-none tracking-tight font-bold text-xl">
              +$75.00
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-label-md text-[#775a00] font-semibold text-[11px]">Abonos VIP</span>
              <span className="font-body-sm text-[#6E665F] text-[11px]">recibidos</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E6DED1] flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Egresos Lotes
            </span>
            <div className="w-7 h-7 rounded-full bg-[#FAF0EF] flex items-center justify-center text-[#8A2E2B]">
              <span className="material-symbols-outlined text-[16px]">call_made</span>
            </div>
          </div>
          <div>
            <p className="font-headline-md text-[#1A1817] font-mono leading-none tracking-tight font-bold text-xl">
              -$192.50
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-label-md text-[#6E665F] font-semibold text-[11px]">Lotes mayoristas</span>
              <span className="font-body-sm text-[#6E665F] text-[11px]">liquidados</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E6DED1] flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Por Cobrar (VIP)
            </span>
            <div className="w-7 h-7 rounded-full bg-[#FDF8EA] flex items-center justify-center text-[#946E19]">
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            </div>
          </div>
          <div>
            <p className="font-headline-md text-[#1A1817] font-mono leading-none tracking-tight font-bold text-xl">
              +$185.00
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-label-md text-[#946E19] font-semibold text-[11px]">Activo exigible</span>
              <span className="font-body-sm text-[#6E665F] text-[11px]">en cuentas</span>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E6DED1] flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Por Pagar (Casas)
            </span>
            <div className="w-7 h-7 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#2C2826]">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            </div>
          </div>
          <div>
            <p className="font-headline-md text-[#1A1817] font-mono leading-none tracking-tight font-bold text-xl">
              -$142.50
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-label-md text-[#6E665F] font-semibold text-[11px]">Pasivo comercial</span>
              <span className="font-body-sm text-[#6E665F] text-[11px]">Grasses/París</span>
            </div>
          </div>
        </div>

        {/* Card 6: Saldo Neto Bóveda */}
        <div className="rounded-xl bg-[#F5F2EB]/90 p-4 shadow-sm border border-[#c59b27]/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm uppercase tracking-wider text-[#2C2826] font-semibold text-[10px]">
              Disponible Bóveda
            </span>
            <div className="w-7 h-7 rounded-full bg-[#c59b27] text-[#1A1817] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">lock</span>
            </div>
          </div>
          <div>
            <p className="font-headline-md text-[#1A1817] font-mono leading-none tracking-tight font-bold text-xl">
              $77.50
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]"></span>
              <span className="font-label-md text-[#2C2826] font-medium text-[11px]">
                Líquido Inmediato
              </span>
            </div>
          </div>
        </div>

        {/* Card 7: Margen Bruto */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E6DED1] flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
              Margen Bruto
            </span>
            <div className="w-7 h-7 rounded-full bg-[#F0F5EE] flex items-center justify-center text-[#2D5A27]">
              <span className="material-symbols-outlined text-[16px]">pie_chart</span>
            </div>
          </div>
          <div>
            <p className="font-headline-md text-[#2D5A27] font-mono leading-none tracking-tight font-bold text-xl">
              42.3%
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-label-md text-[#1A1817] font-semibold text-[11px]">+$82.50 USD</span>
              <span className="font-body-sm text-[#6E665F] text-[11px]">neto</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECONCILIATION & CASH DRAWER ARQUEO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Arqueo Comparativo (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E6DED1]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E6DED1]/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-[#775a00] uppercase font-bold tracking-widest text-[10px]">
                    Protocolo Place Vendôme
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F5F2EB] text-[#6E665F] font-label-sm text-[10px]">
                    Turno Tarde
                  </span>
                </div>
                <h2 className="font-headline-sm text-[#1A1817] mt-1 font-serif text-lg font-semibold">
                  Conciliación de Caja Diaria (Arqueo Físico)
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] border border-[#2D5A27]/20">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="font-label-md uppercase tracking-wider text-xs font-semibold">
                  Caja Cuadrada &amp; Verificada
                </span>
              </div>
            </div>

            {/* Metric Trio: Esperado vs Físico vs Descuadre */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="p-3.5 rounded-lg bg-[#F5F2EB]/50 border border-[#E6DED1]/60">
                <p className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
                  Saldo Esperado Sistema
                </p>
                <p className="font-headline-sm text-[#1A1817] mt-1 font-semibold font-mono text-lg">
                  ${drawerSummary.expectedTotal.toFixed(2)}
                </p>
                <div className="mt-2.5 space-y-1 font-body-sm text-[#6E665F] text-xs">
                  <div className="flex justify-between">
                    <span>Efectivo Físico:</span>
                    <span className="font-mono text-[#2C2826] font-semibold">${drawerSummary.cashPhysical.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zelle Directo:</span>
                    <span className="font-mono text-[#2C2826] font-semibold">${drawerSummary.zelleTransfer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarjetas Atelier:</span>
                    <span className="font-mono text-[#2C2826] font-semibold">${drawerSummary.posCards.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F5F2EB]/50 border border-[#E6DED1]/60">
                <p className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
                  Arqueo Físico Recontado
                </p>
                <p className="font-headline-sm text-[#1A1817] mt-1 font-semibold font-mono text-lg">
                  ${drawerSummary.countedTotal.toFixed(2)}
                </p>
                <p className="font-body-sm text-[#6E665F] mt-2 text-xs">
                  Billetes en gaveta de nogal, vales de tarjeta y liquidaciones Zelle cotejadas con terminal.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F0F5EE] border border-[#2D5A27]/20 flex flex-col justify-between">
                <div>
                  <p className="font-label-sm uppercase tracking-wider text-[#2D5A27] text-[10px]">
                    Diferencia / Descuadre
                  </p>
                  <p className="font-headline-sm text-[#2D5A27] mt-1 font-semibold font-mono text-lg">
                    {drawerSummary.difference === 0
                      ? '$0.00'
                      : (drawerSummary.difference > 0 ? '+' : '') + `$${drawerSummary.difference.toFixed(2)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-[16px] text-[#2D5A27]">task_alt</span>
                  <span className="font-label-sm text-[#2D5A27] font-semibold text-xs">
                    {drawerSummary.difference === 0 ? 'Cuadre Perfecto' : 'Diferencia Registrada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Denominations Table */}
            <div className="bg-[#F5F2EB]/30 rounded-xl p-4 border border-[#E6DED1]/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-title-md text-[#1A1817] text-xs font-semibold">
                  Desglose de Billetes &amp; Métodos
                </h3>
                <span className="font-label-sm text-[#6E665F] uppercase text-[10px]">
                  Moneda Base USD
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <div className="bg-white p-2.5 rounded-lg shadow-sm border border-[#E6DED1]/60 flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-[#6E665F] text-[10px]">$50.00 USD</p>
                    <p className="font-mono text-[#2C2826] text-xs">1 billete</p>
                  </div>
                  <span className="font-title-md text-[#1A1817] font-mono font-semibold text-xs">$50.00</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg shadow-sm border border-[#E6DED1]/60 flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-[#6E665F] text-[10px]">$20.00 USD</p>
                    <p className="font-mono text-[#2C2826] text-xs">1 billete</p>
                  </div>
                  <span className="font-title-md text-[#1A1817] font-mono font-semibold text-xs">$20.00</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg shadow-sm border border-[#E6DED1]/60 flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-[#6E665F] text-[10px]">$5.00 USD</p>
                    <p className="font-mono text-[#2C2826] text-xs">1 billete</p>
                  </div>
                  <span className="font-title-md text-[#1A1817] font-mono font-semibold text-xs">$5.00</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg shadow-sm border border-[#E6DED1]/60 flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-[#6E665F] text-[10px]">Terminal POS</p>
                    <p className="font-mono text-[#2C2826] text-xs">3 vouchers</p>
                  </div>
                  <span className="font-title-md text-[#1A1817] font-mono font-semibold text-xs">$80.00</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 bg-white p-3.5 rounded-lg border border-[#E6DED1]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#775a00] font-serif font-bold text-sm">
                    ÉV
                  </div>
                  <div>
                    <p className="font-title-md text-[#1A1817] leading-tight text-xs font-semibold">
                      Auditoría: {drawerSummary.auditorName}
                    </p>
                    <p className="font-label-sm text-[#6E665F] text-[10px]">
                      Directora Atelier • Firma Criptográfica Validada
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-sm uppercase tracking-wider text-[#2D5A27] bg-[#F0F5EE] px-2.5 py-1 rounded-full font-bold text-[10px] border border-[#2D5A27]/20">
                    {drawerSummary.closureFolio}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sales Breakdown Visual Analytics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E6DED1] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                    Desglose Comercial
                  </span>
                  <h2 className="font-headline-sm text-[#1A1817] font-serif text-lg font-semibold">
                    Ingresos por Familia Olfativa &amp; Casa
                  </h2>
                </div>
                <span className="font-label-sm bg-[#F5F2EB] text-[#2C2826] px-2 py-1 rounded text-xs font-mono font-semibold">
                  Hoy: $195.00
                </span>
              </div>

              {/* Visual Bar List */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#1A1817]">Valentino (Born in Roma Extrait)</span>
                    <span className="font-mono text-[#1A1817] font-bold">
                      $60.00 <span className="text-[#6E665F] font-normal text-[10px]">(30.7%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F5F2EB] overflow-hidden">
                    <div className="h-full rounded-full bg-[#c59b27]" style={{ width: '30.7%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#1A1817]">Lattafa (Khamrah &amp; Yara)</span>
                    <span className="font-mono text-[#1A1817] font-bold">
                      $55.00 <span className="text-[#6E665F] font-normal text-[10px]">(28.2%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F5F2EB] overflow-hidden">
                    <div className="h-full rounded-full bg-[#B8860B]" style={{ width: '28.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#1A1817]">Armaf (Club de Nuit Intense)</span>
                    <span className="font-mono text-[#1A1817] font-bold">
                      $20.00 <span className="text-[#6E665F] font-normal text-[10px]">(10.2%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F5F2EB] overflow-hidden">
                    <div className="h-full rounded-full bg-[#635e54]" style={{ width: '10.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#1A1817]">Armani Privé (Santal Dān Shā)</span>
                    <span className="font-mono text-[#1A1817] font-bold">
                      $20.00 <span className="text-[#6E665F] font-normal text-[10px]">(10.2%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F5F2EB] overflow-hidden">
                    <div className="h-full rounded-full bg-[#6E665F]" style={{ width: '10.2%' }}></div>
                  </div>
                </div>

                {/* Secondary breakdown grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-[#F5F2EB]/50 border border-[#E6DED1]/50">
                    <p className="font-label-sm text-[#6E665F] text-[10px]">Lancôme • Idôle</p>
                    <p className="font-mono text-[#1A1817] font-bold text-xs">$15.00</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F2EB]/50 border border-[#E6DED1]/50">
                    <p className="font-label-sm text-[#6E665F] text-[10px]">Paris Hilton • Gold Rush</p>
                    <p className="font-mono text-[#1A1817] font-bold text-xs">$15.00</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-[#F5F2EB]/50 border border-[#E6DED1]/50">
                    <p className="font-label-sm text-[#6E665F] text-[10px]">DIOR • Sauvage Elixir</p>
                    <p className="font-mono text-[#1A1817] font-bold text-xs">$10.00</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F2EB]/50 border border-[#E6DED1]/50">
                    <p className="font-label-sm text-[#6E665F] text-[10px]">Creed • Aventus Decant</p>
                    <p className="font-mono text-[#1A1817] font-bold text-xs">$10.00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Channel Split */}
            <div className="pt-4 bg-[#F5F2EB]/40 p-3.5 rounded-lg border border-[#E6DED1]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
                  Ventas por Canal
                </span>
                <span className="font-label-sm text-[#775a00] font-bold text-[10px]">
                  Total: $195.00
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2.5 rounded-full bg-[#c59b27] relative group"></div>
                <div className="w-1/3 h-2.5 rounded-full bg-[#e4e2de] relative group"></div>
              </div>
              <div className="flex justify-between font-body-sm text-[#2C2826] text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c59b27]"></span> Salón Place Vendôme: <strong>65%</strong> ($126.75)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e4e2de]"></span> Catálogo Online: <strong>35%</strong> ($68.25)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONVERSION BANNER & HISTORIAL AUDITORIA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Banner: Conversión de Muestras (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-white p-6 shadow-sm border border-[#E6DED1] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-[#ffdf98]/20 pointer-events-none"></div>
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00] mb-4 border border-[#E6DED1]">
              <span className="material-symbols-outlined text-[22px]">science</span>
            </div>
            <span className="font-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
              Efectividad de Degustación
            </span>
            <h3 className="font-headline-sm text-[#1A1817] mt-1 mb-2 font-serif text-lg font-semibold">
              Conversión Olfativa de Testers
            </h3>
            <p className="font-body-md text-[#2C2826]/80 leading-relaxed text-xs">
              Los probadores en mostrador y las viales de obsequio impulsaron directamente la venta cruzada de decants y presentaciones boutique.
            </p>
          </div>
          <div className="mt-6 pt-4 bg-[#F5F2EB]/50 p-4 rounded-xl border border-[#E6DED1]">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-headline-lg text-[#775a00] font-bold font-serif text-3xl">
                38.5%
              </span>
              <span className="font-label-md text-[#6E665F] font-semibold text-xs">
                Tasa de Conversión
              </span>
            </div>
            <p className="font-body-sm text-[#2C2826] text-xs">
              Generaron compras adicionales directas en formatos de 10ml y extractos concentrados.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm font-semibold text-[10px] border border-[#2D5A27]/20">
                +12.4% vs mes anterior
              </span>
            </div>
          </div>
        </div>

        {/* Table: Historial de Cuadres Semanales (8 cols) */}
        <div className="lg:col-span-8 rounded-xl bg-white p-6 shadow-sm border border-[#E6DED1] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="font-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                  Auditoría Continuada
                </span>
                <h3 className="font-headline-sm text-[#1A1817] font-serif text-lg font-semibold">
                  Historial de Cuadres de Saldo Semanales
                </h3>
              </div>
              <span className="font-label-sm text-[#6E665F] text-xs">
                Libro Mayor • Folios de Cierre
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase tracking-wider text-xs">
                    <th className="py-2.5 px-4 rounded-l">Fecha &amp; Turno</th>
                    <th className="py-2.5 px-4">Responsable</th>
                    <th className="py-2.5 px-4 text-right">Esperado</th>
                    <th className="py-2.5 px-4 text-right">Arqueado</th>
                    <th className="py-2.5 px-4 text-right">Diferencia</th>
                    <th className="py-2.5 px-4 text-center rounded-r">Estatus Auditoría</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-xs divide-y divide-[#F5F2EB]">
                  {weeklyRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#1A1817]">
                        {record.dateStr}
                        <span className="block font-label-sm text-[#6E665F] font-normal text-[10px]">
                          {record.shift}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#2C2826]">{record.auditor}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#1A1817]">
                        ${record.expectedAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#1A1817] font-bold">
                        ${record.countedAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#2D5A27] font-bold">
                        {record.difference === 0 ? '$0.00' : `$${record.difference.toFixed(2)}`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] font-label-sm font-semibold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]"></span> {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E6DED1] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6E665F] gap-2">
            <span>
              Total Auditado Semana: <strong className="text-[#1A1817]">$940.00 USD</strong> • Discrepancias acumuladas: <strong className="text-[#2D5A27]">$0.00</strong>
            </span>
            <button
              onClick={() => showToast('Cargando registros históricos del trimestre anterior...')}
              className="text-[#775a00] uppercase tracking-wider font-semibold hover:underline cursor-pointer"
            >
              Ver Historial Trimestral Completo →
            </button>
          </div>
        </div>
      </div>

      {/* MODAL / ARQUEO INTERACTIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative border border-[#E6DED1] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6DED1]">
              <div>
                <span className="font-label-sm text-[#775a00] uppercase font-bold tracking-widest text-[10px]">
                  Protocolo de Cierre
                </span>
                <h3 className="font-headline-sm text-[#1A1817] mt-0.5 font-serif text-lg font-semibold">
                  Ejecutar Cuadre de Turno
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F2EB] text-[#2C2826] flex items-center justify-center hover:bg-[#ECE7DE] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-4 font-body-sm text-xs">
              <div className="p-3 bg-[#F5F2EB]/50 rounded-lg flex justify-between items-center border border-[#E6DED1]">
                <span className="text-[#6E665F]">Total Teórico en Sistema:</span>
                <span className="font-headline-sm text-[#1A1817] font-bold font-mono text-base">
                  ${drawerSummary.expectedTotal.toFixed(2)} USD
                </span>
              </div>

              <div>
                <label className="block font-label-sm uppercase tracking-wider text-[#6E665F] mb-1 text-[10px]">
                  Monto Físico Contado (Efectivo + Comprobantes)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E665F] font-bold">$</span>
                  <input
                    value={inputContado}
                    onChange={(e) => setInputContado(e.target.value)}
                    step="0.50"
                    type="number"
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-[#F5F2EB] text-[#1A1817] font-mono font-bold text-base outline-none border border-[#E6DED1] focus:border-[#c59b27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm uppercase tracking-wider text-[#6E665F] mb-1 text-[10px]">
                  Notas de Cierre de Atelier
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-[#F5F2EB] text-[#1A1817] font-body-sm outline-none resize-none border border-[#E6DED1] text-xs focus:border-[#c59b27]"
                  placeholder="Sin incidencias. Todas las notas olfativas despachadas correctamente..."
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSaveCuadre}
                  className="flex-1 py-2.5 rounded-lg bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-title-md font-semibold text-center transition-all cursor-pointer shadow-sm text-xs"
                >
                  Confirmar y Firmar Cierre
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#F5F2EB] text-[#2C2826] font-title-md hover:bg-[#ECE7DE] transition-all cursor-pointer border border-[#E6DED1] text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
          <div className="bg-white text-[#1A1817] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-[#E6DED1]">
            <span className="material-symbols-outlined text-[#2D5A27]">verified</span>
            <div>
              <p className="font-title-md leading-tight text-[#1A1817] text-xs font-semibold">
                Cuadre Registrado
              </p>
              <p className="font-body-sm text-[#6E665F] text-[11px]">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
