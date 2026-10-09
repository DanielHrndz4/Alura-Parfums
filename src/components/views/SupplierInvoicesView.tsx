import React, { useState } from 'react';
import { SupplierRepository } from '../../repositories/supplierRepository';
import { SupplierBatchInvoice, SupplierPaymentRecord } from '../../types/supplier';

export const SupplierInvoicesView: React.FC = () => {
  const [invoices, setInvoices] = useState<SupplierBatchInvoice[]>(() => SupplierRepository.getAll());
  const [paymentsHistory, setPaymentsHistory] = useState<SupplierPaymentRecord[]>(() => SupplierRepository.getPayments());
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'payments'>('all');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal 1: Register New Expense / Purchase
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newQuantity, setNewQuantity] = useState<number | ''>('');
  const [newTotalAmount, setNewTotalAmount] = useState<number | ''>('');
  const [paymentType, setPaymentType] = useState<'full' | 'credit'>('full');
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | ''>('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'transfer' | 'cash' | 'pos'>('transfer');
  const [newNotes, setNewNotes] = useState('');

  // Modal 2: Pay / Abono to Supplier
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<SupplierBatchInvoice | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'transfer' | 'cash' | 'pos'>('transfer');
  const [payReference, setPayReference] = useState('');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Open pay modal
  const handleOpenPayModal = (inv: SupplierBatchInvoice) => {
    setSelectedInvoiceForPayment(inv);
    setPayAmountInput(inv.pendingAmount.toFixed(2));
    setPayMethod('transfer');
    setPayReference('');
  };

  const handleClosePayModal = () => {
    setSelectedInvoiceForPayment(null);
    setPayAmountInput('');
    setPayReference('');
  };

  // Confirm payment to supplier
  const parsedPayAmount = parseFloat(payAmountInput) || 0;
  const currentDebt = selectedInvoiceForPayment?.pendingAmount || 0;
  const remainingDebt = Math.max(0, currentDebt - parsedPayAmount);
  const isOverpaying = parsedPayAmount > currentDebt;
  const isValidPay = parsedPayAmount > 0 && !isOverpaying;

  const handleConfirmSupplierPayment = () => {
    if (!selectedInvoiceForPayment || !isValidPay) return;

    const res = SupplierRepository.payInvoice(
      selectedInvoiceForPayment.id,
      parsedPayAmount,
      payMethod,
      payReference.trim() || undefined
    );

    if (res) {
      setInvoices(SupplierRepository.getAll());
      setPaymentsHistory(SupplierRepository.getPayments());
      const methodLabel = payMethod === 'transfer' ? 'Transferencia' : payMethod === 'cash' ? 'Efectivo' : 'Tarjeta';

      if (res.newBalance === 0) {
        showNotification(
          `¡Lote saldado al 100%! Pago de $${parsedPayAmount.toFixed(2)} USD registrado a ${selectedInvoiceForPayment.supplierName}.`
        );
      } else {
        showNotification(
          `Abono de $${parsedPayAmount.toFixed(2)} USD registrado vía ${methodLabel}. Saldo restante: $${res.newBalance.toFixed(2)} USD.`
        );
      }
    }

    handleClosePayModal();
  };

  // Create new purchase / expense
  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const total = typeof newTotalAmount === 'number' ? newTotalAmount : parseFloat(newTotalAmount as string) || 0;
    if (!newSupplierName.trim() || !newConcept.trim() || total <= 0) {
      showNotification('Por favor completa el nombre de la empresa proveedora, concepto y monto válido.');
      return;
    }

    let paid = 0;
    if (paymentType === 'full') {
      paid = total;
    } else {
      paid = typeof initialPaymentAmount === 'number' ? initialPaymentAmount : parseFloat(initialPaymentAmount as string) || 0;
      paid = Math.min(paid, total);
    }
    const pending = Math.max(0, Number((total - paid).toFixed(2)));

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    const newInvoice: SupplierBatchInvoice = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      invoiceNumber: newInvoiceNumber.trim() || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: newSupplierName.trim(),
      supplierCode: newSupplierName.slice(0, 2).toUpperCase(),
      concept: newConcept.trim(),
      quantity: typeof newQuantity === 'number' ? newQuantity : undefined,
      issueDate: dateStr,
      dueDate: pending > 0 ? 'En 30 días' : 'Liquidado',
      dueDateHighlight: pending > 0 ? 'Pago pendiente' : 'Liquidado',
      totalAmount: total,
      paidAmount: paid,
      pendingAmount: pending,
      paymentMethod: newPaymentMethod,
      status: pending === 0 ? 'Pagado' : paid > 0 ? 'Abono Parcial' : 'Pendiente',
      statusType: pending === 0 ? 'success' : 'warning',
      notes: newNotes.trim() || undefined,
    };

    SupplierRepository.addInvoice(newInvoice);
    setInvoices(SupplierRepository.getAll());
    setPaymentsHistory(SupplierRepository.getPayments());

    setIsNewPurchaseModalOpen(false);
    // Reset form
    setNewSupplierName('');
    setNewInvoiceNumber('');
    setNewConcept('');
    setNewQuantity('');
    setNewTotalAmount('');
    setPaymentType('full');
    setInitialPaymentAmount('');
    setNewNotes('');

    showNotification(`Compra de "${newConcept}" registrada exitosamente.`);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((item) => {
    // Tab filter
    if (activeTab === 'pending' && item.pendingAmount === 0) return false;
    if (activeTab === 'paid' && item.pendingAmount > 0) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSup = item.supplierName.toLowerCase().includes(q);
      const matchCon = item.concept.toLowerCase().includes(q);
      const matchInv = (item.invoiceNumber || '').toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchSup && !matchCon && !matchInv && !matchId) return false;
    }

    return true;
  });

  const totalExpenses = SupplierRepository.getTotalExpenses();
  const totalPaid = SupplierRepository.getTotalPaid();
  const totalPayable = SupplierRepository.getTotalPayable();

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Editorial Header & Operational Actions */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E6DED1]/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#6E665F] font-label-sm uppercase tracking-widest text-xs font-bold">
            <span>Abastecimiento &amp; Empresas</span>
            <span className="text-[#c59b27]">•</span>
            <span>Compras de Frascos &amp; Gastos</span>
          </div>
          <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl font-semibold mt-1">
            Pago a Proveedores &amp; Gastos de Frascos
          </h1>
          <p className="font-body-md text-[#6E665F] text-sm mt-1">
            Registro de compras de frascos y esencias a empresas, control de gastos de reposición y pagos periódicos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNewPurchaseModalOpen(true)}
            className="px-5 py-2.5 rounded-none bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Registrar Compra / Gasto</span>
          </button>
        </div>
      </header>

      {/* Key Metrics Bento Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1: Saldo Pendiente por Pagar */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
              Saldo Pendiente por Pagar
            </span>
            <span className="w-7 h-7 bg-[#FAF8F5] text-[#b91c1c] border border-[#E6DED1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-mono font-bold text-2xl text-[#b91c1c]">
              ${totalPayable.toFixed(2)}{' '}
              <span className="font-sans text-xs font-normal text-[#6E665F]">USD</span>
            </p>
            <span className="text-[11px] text-[#6E665F] mt-1 block">
              {invoices.filter((i) => i.pendingAmount > 0).length} compras con saldo activo
            </span>
          </div>
        </div>

        {/* KPI 2: Total Pagado */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
              Total Pagado a Empresas
            </span>
            <span className="w-7 h-7 bg-[#F0F5EE] text-[#2D5A27] border border-[#2D5A27]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-mono font-bold text-2xl text-[#2D5A27]">
              ${totalPaid.toFixed(2)}{' '}
              <span className="font-sans text-xs font-normal text-[#6E665F]">USD</span>
            </p>
            <span className="text-[11px] text-[#2D5A27] mt-1 block font-medium">
              Desembolsos conciliados
            </span>
          </div>
        </div>

        {/* KPI 3: Total Compras Registradas */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
              Total Compras / Gastos
            </span>
            <span className="w-7 h-7 bg-[#F5F2EB] text-[#775a00] border border-[#E6DED1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">inventory</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-mono font-bold text-2xl text-[#1A1817]">
              ${totalExpenses.toFixed(2)}{' '}
              <span className="font-sans text-xs font-normal text-[#6E665F]">USD</span>
            </p>
            <span className="text-[11px] text-[#6E665F] mt-1 block">
              Total de insumos adquiridos
            </span>
          </div>
        </div>

        {/* KPI 4: Proveedores Registrados */}
        <div className="bg-white rounded-none p-5 shadow-xs border border-[#E6DED1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[10px] font-bold">
              Empresas Proveedoras
            </span>
            <span className="w-7 h-7 bg-[#F5F2EB] text-[#c59b27] border border-[#E6DED1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">store</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="font-mono font-bold text-2xl text-[#1A1817]">
              {new Set(invoices.map((i) => i.supplierName)).size}{' '}
              <span className="font-sans text-xs font-normal text-[#6E665F]">Empresas</span>
            </p>
            <span className="text-[11px] text-[#6E665F] mt-1 block">
              {invoices.length} facturas registradas
            </span>
          </div>
        </div>
      </section>

      {/* Main Card with Tabs & Ledger */}
      <section className="bg-white rounded-none shadow-xs border border-[#E6DED1] overflow-hidden mb-6">
        {/* Navigation Tabs and Search Bar */}
        <div className="p-4 bg-[#F5F2EB]/50 border-b border-[#E6DED1] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-none font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#1A1817] border border-[#E6DED1] shadow-xs'
                  : 'text-[#6E665F] hover:bg-white/60'
              }`}
            >
              Todas las Compras ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-none font-semibold transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-[#b91c1c] border border-[#E6DED1] shadow-xs'
                  : 'text-[#6E665F] hover:bg-white/60'
              }`}
            >
              Pendientes de Pago ({invoices.filter((i) => i.pendingAmount > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-3 py-1.5 rounded-none font-semibold transition-all cursor-pointer ${
                activeTab === 'paid'
                  ? 'bg-white text-[#2D5A27] border border-[#E6DED1] shadow-xs'
                  : 'text-[#6E665F] hover:bg-white/60'
              }`}
            >
              Liquidadas ({invoices.filter((i) => i.pendingAmount === 0).length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-none font-semibold transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-white text-[#775a00] border border-[#E6DED1] shadow-xs'
                  : 'text-[#6E665F] hover:bg-white/60'
              }`}
            >
              Historial de Pagos ({paymentsHistory.length})
            </button>
          </div>

          {activeTab !== 'payments' && (
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#6E665F]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por empresa, concepto o factura..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] outline-none focus:border-[#c59b27]"
              />
            </div>
          )}
        </div>

        {/* Tab 1, 2, 3: Purchases and Invoices Table */}
        {activeTab !== 'payments' && (
          <div className="overflow-x-auto">
            {filteredInvoices.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase">
                    <th className="py-3 px-4 font-semibold">Factura / Fecha</th>
                    <th className="py-3 px-4 font-semibold">Empresa Proveedora</th>
                    <th className="py-3 px-4 font-semibold">Concepto / Frascos</th>
                    <th className="py-3 px-4 text-right font-semibold">Total ($ USD)</th>
                    <th className="py-3 px-4 text-right font-semibold">Pagado</th>
                    <th className="py-3 px-4 text-right font-semibold">Saldo Pendiente</th>
                    <th className="py-3 px-4 text-center font-semibold">Estatus</th>
                    <th className="py-3 px-4 text-right font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                      {/* ID / Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#1A1817] block">{inv.id}</span>
                        <span className="text-[10px] text-[#6E665F] font-mono">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-[#6E665F] block mt-0.5">{inv.issueDate}</span>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#1A1817] block">{inv.supplierName}</span>
                        {inv.supplierLocation && (
                          <span className="text-[10px] text-[#6E665F]">{inv.supplierLocation}</span>
                        )}
                      </td>

                      {/* Concept */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-medium text-[#1A1817] block">{inv.concept}</span>
                        {inv.quantity && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-[#F5F2EB] text-[#6E665F] text-[10px] border border-[#E6DED1]">
                            {inv.quantity} frascos/uds
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#1A1817]">
                        ${inv.totalAmount.toFixed(2)}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#2D5A27] font-semibold">
                        ${inv.paidAmount.toFixed(2)}
                      </td>

                      {/* Pending */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                        {inv.pendingAmount > 0 ? (
                          <span className="text-[#b91c1c]">${inv.pendingAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-[#2D5A27]">$0.00</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {inv.pendingAmount === 0 ? (
                          <span className="px-2 py-0.5 bg-[#F0F5EE] text-[#2D5A27] border border-[#2D5A27]/20 text-[10px] font-bold">
                            Pagado ✓
                          </span>
                        ) : inv.paidAmount > 0 ? (
                          <span className="px-2 py-0.5 bg-[#FDF8EA] text-[#946E19] border border-[#946E19]/30 text-[10px] font-bold">
                            Abono Parcial
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#FAF0EF] text-[#b91c1c] border border-[#b91c1c]/20 text-[10px] font-bold">
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {inv.pendingAmount > 0 ? (
                          <button
                            onClick={() => handleOpenPayModal(inv)}
                            className="px-3 py-1.5 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs rounded-none transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">payments</span>
                            Abonar / Pagar
                          </button>
                        ) : (
                          <span className="text-[#2D5A27] font-semibold text-xs inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">done_all</span>
                            Liquidado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-[#6E665F]">
                <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">receipt_long</span>
                <p className="text-xs font-semibold text-[#1A1817]">No se encontraron compras o facturas</p>
                <p className="text-[11px] mt-1">Puedes registrar una nueva compra de frascos usando el botón superior.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Payments History Table */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase">
                  <th className="py-3 px-4 font-semibold">Comprobante / Fecha</th>
                  <th className="py-3 px-4 font-semibold">Empresa Proveedora</th>
                  <th className="py-3 px-4 font-semibold">Método de Pago</th>
                  <th className="py-3 px-4 font-semibold">Referencia / Detalle</th>
                  <th className="py-3 px-4 text-right font-semibold">Monto Pagado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
                {paymentsHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#6E665F]">
                      <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">
                        payments
                      </span>
                      <p className="text-xs font-semibold text-[#1A1817]">No hay desembolsos o pagos registrados</p>
                      <p className="text-[11px] mt-1">Los abonos o pagos a facturas de proveedores aparecerán registrados aquí.</p>
                    </td>
                  </tr>
                ) : (
                  paymentsHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-[#1A1817] block">{p.id}</span>
                        <span className="text-[10px] text-[#6E665F]">{p.date}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1A1817]">{p.supplierName}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F5F2EB] border border-[#E6DED1] text-[10px] font-medium">
                          <span className="material-symbols-outlined text-[12px] text-[#c59b27]">
                            {p.paymentMethod === 'transfer' ? 'sync_alt' : p.paymentMethod === 'pos' ? 'credit_card' : 'attach_money'}
                          </span>
                          {p.paymentMethod === 'transfer' ? 'Transferencia' : p.paymentMethod === 'pos' ? 'Tarjeta' : 'Efectivo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6E665F] text-[11px] max-w-xs truncate">
                        {p.reference || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-[#2D5A27] bg-[#2D5A27]/5 px-2 py-0.5 border border-[#2D5A27]/20">
                          ${p.amount.toFixed(2)} USD
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal 1: Registrar Compra / Gasto a Proveedor */}
      {isNewPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden max-h-[92vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                  Abastecimiento de Insumos
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1817] mt-0.5">
                  Registrar Compra / Gasto a Proveedor
                </h3>
              </div>
              <button
                onClick={() => setIsNewPurchaseModalOpen(false)}
                className="w-8 h-8 rounded-none bg-white hover:bg-neutral-200 text-[#2C2826] flex items-center justify-center transition-colors cursor-pointer border border-[#E6DED1]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form id="new-purchase-form" onSubmit={handleCreatePurchase} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Supplier & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                    Empresa Proveedora *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="Ej. Distribuidora de Frascos & Envases"
                    className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                    N° de Factura / Remisión (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    placeholder="Ej. FAC-89104"
                    className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817]"
                  />
                </div>
              </div>

              {/* Concept & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                    Concepto / Frascos Comprados *
                  </label>
                  <input
                    type="text"
                    required
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="Ej. Lote de 30 frascos 100ml cristal con atomizador dorado"
                    className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817]"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                    Cantidad (Uds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="Ej. 30"
                    className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] font-mono"
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                  Monto Total de la Compra ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6E665F] font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newTotalAmount}
                    onChange={(e) => setNewTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 bg-white border border-[#E6DED1] rounded-none text-base font-mono font-bold text-[#1A1817] outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Payment Condition (Contado vs Crédito) */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] space-y-3">
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px]">
                  Condición de Pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-2.5 border text-left rounded-none cursor-pointer transition-all ${
                      paymentType === 'full'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="font-bold block text-xs">Pagado al Contado (100%)</span>
                    <span className="text-[10px] text-[#6E665F]">Se liquida el total de inmediato</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('credit')}
                    className={`p-2.5 border text-left rounded-none cursor-pointer transition-all ${
                      paymentType === 'credit'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="font-bold block text-xs">A Crédito / A Plazos</span>
                    <span className="text-[10px] text-[#6E665F]">Abono inicial o pago posterior</span>
                  </button>
                </div>

                {paymentType === 'credit' && (
                  <div className="mt-2 pt-2 border-t border-[#E6DED1]">
                    <label className="block text-[#1A1817] font-bold text-[11px] mb-1">
                      Monto Abonado Hoy ($ USD) - Opcional
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={initialPaymentAmount}
                      onChange={(e) => setInitialPaymentAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="0.00 (Dejar 0 si aún no se paga nada)"
                      className="w-full p-2 bg-white border border-[#E6DED1] rounded-none font-mono text-xs text-[#1A1817] outline-none focus:border-[#c59b27]"
                    />
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPaymentMethod('transfer')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
                      newPaymentMethod === 'transfer'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                    Transferencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPaymentMethod('pos')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
                      newPaymentMethod === 'pos'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">credit_card</span>
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPaymentMethod('cash')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
                      newPaymentMethod === 'cash'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">attach_money</span>
                    Efectivo
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                  Notas / Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej. Entrega programada para el viernes, contacto: Carlos"
                  className="w-full p-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] outline-none focus:border-[#c59b27]"
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-t border-[#E6DED1] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsNewPurchaseModalOpen(false)}
                className="px-4 py-2.5 sm:py-2 border border-[#E6DED1] bg-white text-xs font-semibold text-[#6E665F] hover:text-[#1A1817] rounded-none cursor-pointer flex items-center justify-center order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="new-purchase-form"
                className="px-5 py-2.5 sm:py-2 text-xs font-bold bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] transition-all rounded-none flex items-center justify-center gap-1.5 cursor-pointer shadow-xs order-1 sm:order-2"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Guardar Compra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Registrar Pago / Abono a Proveedor */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden max-h-[92vh] flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                  Pago a Proveedor
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1817] mt-0.5">
                  Registrar Pago o Abono
                </h3>
              </div>
              <button
                onClick={handleClosePayModal}
                className="w-8 h-8 rounded-none bg-white hover:bg-neutral-200 text-[#2C2826] flex items-center justify-center transition-colors cursor-pointer border border-[#E6DED1]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Supplier Info */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-xs text-[#1A1817]">{selectedInvoiceForPayment.supplierName}</h4>
                  <p className="text-[11px] text-[#6E665F] mt-0.5">{selectedInvoiceForPayment.concept}</p>
                  <span className="text-[10px] font-mono text-[#6E665F]">{selectedInvoiceForPayment.id} • {selectedInvoiceForPayment.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#6E665F] block">Saldo Adeudado</span>
                  <span className="font-mono text-base font-bold text-[#b91c1c]">
                    ${selectedInvoiceForPayment.pendingAmount.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                  Monto a Pagar ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#6E665F] font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedInvoiceForPayment.pendingAmount}
                    value={payAmountInput}
                    onChange={(e) => setPayAmountInput(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E6DED1] rounded-none text-lg font-mono font-bold text-[#1A1817] focus:outline-hidden focus:border-[#c59b27]"
                  />
                </div>

                {isOverpaying && (
                  <p className="text-[11px] text-[#b91c1c] mt-1.5 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    El monto supera el saldo adeudado (${selectedInvoiceForPayment.pendingAmount.toFixed(2)}).
                  </p>
                )}

                {/* Quick Presets */}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayAmountInput(selectedInvoiceForPayment.pendingAmount.toFixed(2))}
                    className="px-3 py-1 text-[11px] font-semibold bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] border border-[#E6DED1] rounded-none cursor-pointer"
                  >
                    Liquidar Total (${selectedInvoiceForPayment.pendingAmount.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmountInput((selectedInvoiceForPayment.pendingAmount / 2).toFixed(2))}
                    className="px-3 py-1 text-[11px] font-semibold bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] border border-[#E6DED1] rounded-none cursor-pointer"
                  >
                    50% (${(selectedInvoiceForPayment.pendingAmount / 2).toFixed(2)})
                  </button>
                </div>
              </div>

              {/* Real-time Calculation */}
              {parsedPayAmount > 0 && !isOverpaying && (
                <div className="p-3 bg-[#F5F2EB]/70 border border-[#E6DED1] space-y-1 text-xs">
                  <div className="flex justify-between text-[#6E665F]">
                    <span>Saldo pendiente actual:</span>
                    <span className="font-mono">${currentDebt.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-[#2D5A27] font-medium">
                    <span>Monto que vas a pagar:</span>
                    <span className="font-mono font-bold">-${parsedPayAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="border-t border-[#E6DED1] pt-1 flex justify-between font-bold text-[#1A1817]">
                    <span>Saldo que quedará adeudado:</span>
                    <span className={`font-mono ${remainingDebt === 0 ? 'text-[#2D5A27]' : 'text-[#1A1817]'}`}>
                      ${remainingDebt.toFixed(2)} USD {remainingDebt === 0 && '(Saldado Total ✓)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('transfer')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
                      payMethod === 'transfer'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                    Transferencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('pos')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
                      payMethod === 'pos'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">credit_card</span>
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('cash')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
                      payMethod === 'cash'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">attach_money</span>
                    Efectivo
                  </button>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-bold text-[#6E665F] uppercase tracking-wider mb-1">
                  Referencia / N° Comprobante (Opcional)
                </label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="Ej. Transferencia BBVA #4920, comprobante pago..."
                  className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] outline-none focus:border-[#c59b27]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-t border-[#E6DED1] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={handleClosePayModal}
                className="px-4 py-2.5 sm:py-2 border border-[#E6DED1] bg-white text-xs font-semibold text-[#6E665F] hover:text-[#1A1817] rounded-none cursor-pointer flex items-center justify-center order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSupplierPayment}
                disabled={!isValidPay}
                className={`px-5 py-2.5 sm:py-2 text-xs font-bold transition-all rounded-none flex items-center justify-center gap-1.5 order-1 sm:order-2 ${
                  isValidPay
                    ? 'bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] cursor-pointer shadow-xs'
                    : 'bg-[#E6DED1] text-[#A8A29E] cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Confirmar Pago {isValidPay ? `($${parsedPayAmount.toFixed(2)})` : ''}
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
