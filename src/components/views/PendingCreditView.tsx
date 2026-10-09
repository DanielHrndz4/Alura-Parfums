import React, { useState, useMemo } from 'react';
import { SalesRepository } from '../../repositories/salesRepository';
import { ClientProfile, AbonoTransaction } from '../../types/sale';

export const PendingCreditView: React.FC = () => {
  const [clients, setClients] = useState<ClientProfile[]>(() => SalesRepository.getClients());
  const [abonosHistory, setAbonosHistory] = useState<AbonoTransaction[]>(() => SalesRepository.getAbonos());
  const [notification, setNotification] = useState<string | null>(null);

  // Modal state for recording abono
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [abonoInput, setAbonoInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pos' | 'transfer'>('cash');
  const [referenceNote, setReferenceNote] = useState<string>('');

  // Filters state for Abonos History
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('ALL');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('ALL');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('ALL');

  // New Client Modal state
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientHouse, setNewClientHouse] = useState('Maison Alura');
  const [newClientBalance, setNewClientBalance] = useState('0');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [clientToDelete, setClientToDelete] = useState<ClientProfile | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const created = SalesRepository.addClient({
      name: newClientName,
      phone: newClientPhone,
      favoriteHouse: newClientHouse,
      initialBalance: parseFloat(newClientBalance) || 0,
      notes: newClientNotes,
    });

    setClients(SalesRepository.getClients());
    showNotify(`Cliente "${created.name}" registrado exitosamente.`);
    setIsAddClientModalOpen(false);

    // Reset
    setNewClientName('');
    setNewClientPhone('');
    setNewClientHouse('Maison Alura');
    setNewClientBalance('0');
    setNewClientNotes('');
  };

  const confirmDeleteClient = () => {
    if (!clientToDelete) return;
    SalesRepository.deleteClient(clientToDelete.id);
    setClients(SalesRepository.getClients());
    showNotify(`Cliente "${clientToDelete.name}" eliminado del registro.`);
    setClientToDelete(null);
  };

  const handleOpenAbonoModal = (client: ClientProfile) => {
    setSelectedClient(client);
    setAbonoInput(client.pendingBalance.toFixed(2));
    setPaymentMethod('cash');
    setReferenceNote('');
  };

  const handleCloseAbonoModal = () => {
    setSelectedClient(null);
    setAbonoInput('');
    setReferenceNote('');
  };

  const parsedAmount = parseFloat(abonoInput) || 0;
  const currentPending = selectedClient?.pendingBalance || 0;
  const remainingAfterAbono = Math.max(0, currentPending - parsedAmount);
  const isOverpaying = parsedAmount > currentPending;
  const isValidAmount = parsedAmount > 0 && !isOverpaying;

  const handleConfirmAbono = () => {
    if (!selectedClient || !isValidAmount) return;

    const result = SalesRepository.recordAbono(
      selectedClient.id,
      parsedAmount,
      paymentMethod,
      referenceNote.trim() || undefined
    );

    if (result) {
      setClients(SalesRepository.getClients());
      setAbonosHistory(SalesRepository.getAbonos());

      const methodLabel = paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'pos' ? 'POS' : 'Transferencia';
      if (result.newBalance === 0) {
        showNotify(`¡Cuenta liquidada! Abono de $${parsedAmount.toFixed(2)} USD registrado vía ${methodLabel}.`);
      } else {
        showNotify(
          `Abono de $${parsedAmount.toFixed(2)} USD registrado vía ${methodLabel}. Saldo restante: $${result.newBalance.toFixed(2)} USD.`
        );
      }
    }

    handleCloseAbonoModal();
  };

  const totalCredits = clients.reduce((acc, c) => acc + c.pendingBalance, 0);

  // Filtered Abonos Logic
  const filteredAbonos = useMemo(() => {
    return abonosHistory.filter((abono) => {
      // Search query (client name, code, receipt id, reference)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = abono.clientName.toLowerCase().includes(query);
        const matchCode = abono.clientCode.toLowerCase().includes(query);
        const matchId = abono.id.toLowerCase().includes(query);
        const matchRef = (abono.reference || '').toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchId && !matchRef) {
          return false;
        }
      }

      // Client filter
      if (selectedClientFilter !== 'ALL') {
        if (abono.clientId !== selectedClientFilter && abono.clientName !== selectedClientFilter) {
          return false;
        }
      }

      // Method filter
      if (selectedMethodFilter !== 'ALL') {
        if (abono.paymentMethod !== selectedMethodFilter) {
          return false;
        }
      }

      // Period filter
      if (selectedPeriodFilter === 'today') {
        if (!abono.date.toLowerCase().includes('hoy')) {
          return false;
        }
      }

      return true;
    });
  }, [abonosHistory, searchQuery, selectedClientFilter, selectedMethodFilter, selectedPeriodFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredAbonos.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredAbonos]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedClientFilter !== 'ALL' ||
    selectedMethodFilter !== 'ALL' ||
    selectedPeriodFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClientFilter('ALL');
    setSelectedMethodFilter('ALL');
    setSelectedPeriodFilter('ALL');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E6DED1]/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#6E665F] font-label-sm uppercase tracking-widest text-xs font-bold">
            <span>Cartera de Clientes</span>
            <span className="text-[#c59b27]">•</span>
            <span>Cuentas por Cobrar &amp; Conciliaciones</span>
          </div>
          <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl font-semibold mt-1">
            Clientes &amp; Cuentas por Cobrar
          </h1>
          <p className="font-body-md text-[#6E665F] text-sm mt-1">
            Gestión de clientes, registro de cuentas, apartados y conciliación de abonos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddClientModalOpen(true)}
            className="px-4 py-2.5 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Registrar Cliente</span>
          </button>

          <div className="bg-white px-5 py-2.5 rounded-none border border-[#E6DED1] shadow-xs text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-[#6E665F] block">Total Exigible</span>
            <span className="font-mono text-lg font-bold text-[#1A1817]">${totalCredits.toFixed(2)} USD</span>
          </div>
        </div>
      </header>

      {/* 1. Clients Table */}
      <div className="bg-white rounded-none shadow-xs border border-[#E6DED1] overflow-hidden mb-10">
        <div className="p-4 bg-[#F5F2EB]/50 border-b border-[#E6DED1] flex justify-between items-center">
          <div>
            <span className="font-title-md text-xs font-semibold text-[#1A1817] block">
              Directorio de Clientes
            </span>
            <span className="text-[11px] text-[#6E665F]">
              Clientes registrados y cuentas activas en Alura Parfums
            </span>
          </div>
          <span className="text-xs text-[#6E665F] font-mono">Total Clientes: {clients.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase">
                <th className="py-3 px-4 font-semibold">Cliente</th>
                <th className="py-3 px-4 font-semibold">Teléfono / WhatsApp</th>
                <th className="py-3 px-4 font-semibold">Casa Preferida</th>
                <th className="py-3 px-4 font-semibold">Último Movimiento</th>
                <th className="py-3 px-4 text-right font-semibold">Saldo Pendiente</th>
                <th className="py-3 px-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center text-[#6E665F]">
                    <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">
                      group
                    </span>
                    <p className="text-xs font-semibold text-[#1A1817]">No hay clientes registrados</p>
                    <p className="text-[11px] text-[#6E665F] mt-1">
                      Usa el botón "+ Registrar Cliente" para agregar nuevos clientes a la boutique.
                    </p>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#1A1817]">
                      {client.name}
                      <span className="block text-[10px] text-[#6E665F] font-normal font-mono">{client.code}</span>
                    </td>
                    <td className="py-4 px-4 text-[#6E665F]">
                      {client.phone ? (
                        <span className="font-mono text-xs">{client.phone}</span>
                      ) : (
                        <span className="text-[#9C948A] italic text-[11px]">No registrado</span>
                      )}
                    </td>
                    <td className="py-4 px-4">{client.favoriteHouse || 'Maison Alura'}</td>
                    <td className="py-4 px-4 text-[#6E665F]">{client.lastPurchase || 'Reciente'}</td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-sm text-[#1A1817]">
                      ${client.pendingBalance.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {client.pendingBalance > 0 ? (
                          <button
                            onClick={() => handleOpenAbonoModal(client)}
                            className="px-3 py-1.5 rounded-none bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-semibold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[15px]">payments</span>
                            Abonar
                          </button>
                        ) : (
                          <span className="text-[#2D5A27] font-semibold inline-flex items-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined text-[15px]">check_circle</span>
                            Al día
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setClientToDelete(client)}
                          className="w-7 h-7 rounded-none bg-white hover:bg-[#FAF0EF] text-[#8A2E2B] border border-[#E6DED1] hover:border-[#8A2E2B]/40 inline-flex items-center justify-center transition-colors cursor-pointer"
                          title={`Eliminar cliente "${client.name}"`}
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Historial de Abonos con Filtros */}
      <div className="bg-white rounded-none shadow-xs border border-[#E6DED1] overflow-hidden">
        {/* Historial Header */}
        <div className="p-4 bg-[#F5F2EB]/50 border-b border-[#E6DED1] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c59b27] text-[18px]">history</span>
              <h2 className="font-title-md text-xs font-semibold text-[#1A1817] uppercase tracking-wider">
                Historial de Abonos &amp; Conciliaciones
              </h2>
            </div>
            <p className="text-[11px] text-[#6E665F] mt-0.5">
              Auditoría cronológica de cobros, abonos parciales y liquidaciones registradas en el Atelier.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 border border-[#E6DED1] flex items-center gap-2 text-xs">
              <span className="text-[#6E665F] text-[10px] uppercase font-bold">Total Filtrado:</span>
              <span className="font-mono font-bold text-[#2D5A27]">${totalFilteredAmount.toFixed(2)} USD</span>
            </div>
            <div className="bg-white px-3 py-1.5 border border-[#E6DED1] text-xs font-mono text-[#6E665F]">
              {filteredAbonos.length} {filteredAbonos.length === 1 ? 'registro' : 'registros'}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E6DED1] flex flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="material-symbols-outlined text-[16px] text-[#6E665F] absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, código, recibo (#AB) o nota..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] placeholder:text-[#9C948A] focus:outline-hidden focus:border-[#c59b27]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6E665F] hover:text-[#1A1817]"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Client Filter */}
          <div className="w-full sm:w-auto sm:min-w-[170px]">
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] cursor-pointer"
            >
              <option value="ALL">Todos los Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.split('(')[0].trim()} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <select
              value={selectedMethodFilter}
              onChange={(e) => setSelectedMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] cursor-pointer"
            >
              <option value="ALL">Todos los Métodos</option>
              <option value="cash">Efectivo</option>
              <option value="pos">Terminal POS</option>
              <option value="transfer">Transferencia / Zelle</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="w-full sm:w-auto sm:min-w-[130px]">
            <select
              value={selectedPeriodFilter}
              onChange={(e) => setSelectedPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] cursor-pointer"
            >
              <option value="ALL">Todo el Período</option>
              <option value="today">Solo Hoy</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-semibold text-[#b91c1c] hover:bg-[#b91c1c]/10 border border-[#b91c1c]/30 rounded-none transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          {filteredAbonos.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase">
                  <th className="py-3 px-4 font-semibold">Recibo / Fecha</th>
                  <th className="py-3 px-4 font-semibold">Cliente / Código</th>
                  <th className="py-3 px-4 font-semibold">Método de Pago</th>
                  <th className="py-3 px-4 font-semibold">Referencia / Detalle</th>
                  <th className="py-3 px-4 font-semibold">Estado Posterior</th>
                  <th className="py-3 px-4 text-right font-semibold">Monto Abonado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
                {filteredAbonos.map((abono) => (
                  <tr key={abono.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                    {/* Recibo / Fecha */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#1A1817] block">{abono.id}</span>
                      <span className="text-[11px] text-[#6E665F] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {abono.date} {abono.time}
                      </span>
                    </td>

                    {/* Cliente / Código */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1A1817] flex items-center gap-1.5">
                        <span>{abono.clientName}</span>
                        <span className="px-1.5 py-0.2 rounded-none bg-[#F5F2EB] text-[#775a00] font-semibold text-[9px] border border-[#E6DED1]">
                          {abono.clientTier}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6E665F] font-mono">{abono.clientCode}</span>
                    </td>

                    {/* Método de Pago */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E6DED1] text-[#1A1817] font-medium text-[11px]">
                        <span className="material-symbols-outlined text-[14px] text-[#c59b27]">
                          {abono.paymentMethod === 'cash'
                            ? 'attach_money'
                            : abono.paymentMethod === 'pos'
                            ? 'credit_card'
                            : 'sync_alt'}
                        </span>
                        {abono.paymentMethodLabel}
                      </span>
                    </td>

                    {/* Referencia / Detalle */}
                    <td className="py-3.5 px-4 text-[#6E665F] max-w-[240px]">
                      {abono.reference ? (
                        <span className="italic block truncate text-[11px]">{abono.reference}</span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Estado Posterior */}
                    <td className="py-3.5 px-4">
                      {abono.remainingBalance === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2D5A27]/10 text-[#2D5A27] font-bold text-[10px] border border-[#2D5A27]/20">
                          <span className="material-symbols-outlined text-[12px]">task_alt</span>
                          Liquidado Total
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#6E665F]">
                          <span>Saldo remanente:</span>
                          <span className="font-mono font-bold text-[#1A1817]">
                            ${abono.remainingBalance.toFixed(2)}
                          </span>
                        </span>
                      )}
                    </td>

                    {/* Monto Abonado */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-sm text-[#2D5A27] bg-[#2D5A27]/5 px-2.5 py-1 border border-[#2D5A27]/20 inline-block">
                        +${abono.amount.toFixed(2)} USD
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 px-4 text-center">
              <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">
                search_off
              </span>
              <p className="text-xs font-semibold text-[#1A1817]">No se encontraron abonos registrados</p>
              <p className="text-[11px] text-[#6E665F] mt-1">
                Prueba a ajustar o restablecer los filtros de búsqueda aplicados.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-3.5 py-1.5 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-semibold text-xs rounded-none cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                  Restablecer Filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Registrar Abono con Monto Personalizado */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden max-h-[92vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                  Conciliación de Crédito
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1817] mt-0.5">
                  Registrar Abono a Cuenta
                </h3>
              </div>
              <button
                onClick={handleCloseAbonoModal}
                className="w-8 h-8 rounded-none bg-white hover:bg-neutral-200 text-[#2C2826] flex items-center justify-center transition-colors cursor-pointer border border-[#E6DED1]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Client Info Banner */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-xs text-[#1A1817]">{selectedClient.name}</h4>
                  <span className="text-[11px] text-[#6E665F] font-mono">
                    {selectedClient.code} • {selectedClient.tier}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#6E665F] block">Saldo Adeudado</span>
                  <span className="font-mono text-base font-bold text-[#b91c1c]">
                    ${selectedClient.pendingBalance.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Amount Input Section */}
              <div>
                <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5">
                  Monto a Registrar ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#6E665F] font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedClient.pendingBalance}
                    value={abonoInput}
                    onChange={(e) => setAbonoInput(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E6DED1] rounded-none text-lg font-mono font-bold text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27] transition-all"
                  />
                </div>

                {/* Overpaying warning */}
                {isOverpaying && (
                  <p className="text-[11px] text-[#b91c1c] mt-1.5 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    El monto ingresado (${parsedAmount.toFixed(2)}) supera el saldo adeudado ($
                    {selectedClient.pendingBalance.toFixed(2)}).
                  </p>
                )}

                {/* Quick Presets */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAbonoInput(selectedClient.pendingBalance.toFixed(2))}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] border border-[#E6DED1] transition-colors rounded-none cursor-pointer"
                  >
                    Total (${selectedClient.pendingBalance.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbonoInput((selectedClient.pendingBalance / 2).toFixed(2))}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] border border-[#E6DED1] transition-colors rounded-none cursor-pointer"
                  >
                    50% (${(selectedClient.pendingBalance / 2).toFixed(2)})
                  </button>
                  {selectedClient.pendingBalance >= 15 && (
                    <button
                      type="button"
                      onClick={() => setAbonoInput('15.00')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] border border-[#E6DED1] transition-colors rounded-none cursor-pointer"
                    >
                      $15.00
                    </button>
                  )}
                  {selectedClient.pendingBalance >= 10 && (
                    <button
                      type="button"
                      onClick={() => setAbonoInput('10.00')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] border border-[#E6DED1] transition-colors rounded-none cursor-pointer"
                    >
                      $10.00
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time Balance Calculation Preview */}
              {parsedAmount > 0 && !isOverpaying && (
                <div className="p-3 bg-[#F5F2EB]/70 border border-[#E6DED1] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#6E665F]">
                    <span>Saldo actual adeudado:</span>
                    <span className="font-mono font-medium">${currentPending.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-[#2D5A27] font-medium">
                    <span>Monto a abonar ahora:</span>
                    <span className="font-mono font-bold">-${parsedAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="border-t border-[#E6DED1] pt-1.5 flex justify-between font-bold text-[#1A1817]">
                    <span>Nuevo saldo pendiente:</span>
                    <span className={`font-mono ${remainingAfterAbono === 0 ? 'text-[#2D5A27]' : 'text-[#1A1817]'}`}>
                      ${remainingAfterAbono.toFixed(2)} USD {remainingAfterAbono === 0 && '(Liquidado ✓)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-2">
                  Método de Pago del Abono
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded-none ${
                      paymentMethod === 'cash'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">attach_money</span>
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pos')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded-none ${
                      paymentMethod === 'pos'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`py-2 px-3 border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded-none ${
                      paymentMethod === 'transfer'
                        ? 'border-[#c59b27] bg-[#c59b27]/10 text-[#1A1817]'
                        : 'border-[#E6DED1] bg-white text-[#6E665F] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                    Transferencia
                  </button>
                </div>
              </div>

              {/* Optional Note / Reference */}
              <div>
                <label className="block text-xs font-bold text-[#6E665F] uppercase tracking-wider mb-1">
                  Nota / Referencia (Opcional)
                </label>
                <input
                  type="text"
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  placeholder="Ej. Recibo #4829, abono quincenal, pago Zelle..."
                  className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27]"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-t border-[#E6DED1] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseAbonoModal}
                className="px-4 py-2.5 sm:py-2 border border-[#E6DED1] bg-white text-xs font-semibold text-[#6E665F] hover:text-[#1A1817] hover:bg-neutral-100 transition-colors rounded-none cursor-pointer flex items-center justify-center order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAbono}
                disabled={!isValidAmount}
                className={`px-5 py-2.5 sm:py-2 text-xs font-bold transition-all rounded-none flex items-center justify-center gap-2 order-1 sm:order-2 ${
                  isValidAmount
                    ? 'bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] cursor-pointer shadow-xs'
                    : 'bg-[#E6DED1] text-[#A8A29E] cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Confirmar Abono {isValidAmount ? `($${parsedAmount.toFixed(2)})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Nuevo Cliente */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden max-h-[92vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#c59b27] text-2xl">person_add</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                    Gestión de Clientes
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1817]">
                    Registrar Nuevo Cliente
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="w-8 h-8 rounded-none bg-white hover:bg-neutral-200 text-[#2C2826] flex items-center justify-center transition-colors cursor-pointer border border-[#E6DED1]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateClient} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Nombre */}
                <div>
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                    Nombre Completo del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ej. Sofia Reyes / Carlos Mendoza"
                    className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] font-medium focus:outline-hidden focus:border-[#c59b27]"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Teléfono / WhatsApp */}
                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="Ej. +52 55 1234 5678"
                      className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27]"
                    />
                  </div>

                  {/* Casa Preferida */}
                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Casa Preferida
                    </label>
                    <input
                      type="text"
                      value={newClientHouse}
                      onChange={(e) => setNewClientHouse(e.target.value)}
                      placeholder="Ej. Creed, Maison Alura, Tom Ford"
                      className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27]"
                    />
                  </div>
                </div>

                {/* Saldo Inicial Pendiente */}
                <div>
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1 flex items-center justify-between">
                    <span>Saldo Inicial Adeudado ($ USD)</span>
                    <span className="text-[10px] text-[#6E665F] font-normal">Dejar en 0 si no adeuda nada</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6E665F] font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newClientBalance}
                      onChange={(e) => setNewClientBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs font-mono font-bold text-[#1A1817] focus:outline-hidden focus:border-[#c59b27]"
                    />
                  </div>
                </div>

                {/* Notas / Observaciones */}
                <div>
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                    Notas u Observaciones del Cliente (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={newClientNotes}
                    onChange={(e) => setNewClientNotes(e.target.value)}
                    placeholder="Preferencias de fragancias, dirección de entrega o comentarios especiales..."
                    className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-t border-[#E6DED1] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2.5 sm:py-2 border border-[#E6DED1] bg-white text-xs font-semibold text-[#6E665F] hover:text-[#1A1817] hover:bg-neutral-100 transition-colors rounded-none cursor-pointer flex items-center justify-center order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 sm:py-2 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] text-xs font-bold transition-all rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-xs order-1 sm:order-2"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar Cliente */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-none shadow-2xl border border-[#E6DED1] p-5 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-[#8A2E2B] mb-2 pb-2 border-b border-[#FAF0EF]">
              <span className="material-symbols-outlined text-2xl">person_remove</span>
              <h3 className="font-serif text-base font-bold text-[#1A1817]">¿Eliminar Cliente?</h3>
            </div>
            <p className="text-xs text-[#6E665F] mb-3">
              ¿Estás seguro de que deseas eliminar permanentemente a{' '}
              <strong className="text-[#1A1817]">"{clientToDelete.name}"</strong> ({clientToDelete.code})?
            </p>
            {clientToDelete.pendingBalance > 0 && (
              <div className="p-2.5 mb-3 bg-[#FAF0EF] border border-[#8A2E2B]/20 text-[#8A2E2B] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>
                  Este cliente tiene un saldo pendiente de{' '}
                  <strong className="font-mono">${clientToDelete.pendingBalance.toFixed(2)} USD</strong>.
                </span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-3.5 py-1.5 border border-[#E6DED1] text-xs font-semibold text-[#6E665F] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteClient}
                className="px-4 py-1.5 bg-[#8A2E2B] hover:bg-[#722624] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Sí, Eliminar
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
