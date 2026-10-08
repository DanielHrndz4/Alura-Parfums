import React, { useState } from 'react';
import { INITIAL_CLIENTS } from '../../repositories/salesRepository';

export const PendingCreditView: React.FC = () => {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCollect = (id: string, amount: number) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pendingBalance: Math.max(0, c.pendingBalance - amount) } : c))
    );
    showNotify(`Abono de $${amount.toFixed(2)} USD registrado con éxito.`);
  };

  const totalCredits = clients.reduce((acc, c) => acc + c.pendingBalance, 0);

  return (
    <div className="flex flex-col w-full">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E6DED1]/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#6E665F] font-label-sm uppercase tracking-widest text-xs font-bold">
            <span>Cartera de Clientes VIP</span>
            <span className="text-[#c59b27]">•</span>
            <span>Cuentas por Cobrar</span>
          </div>
          <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl font-semibold mt-1">
            Pendiente de Cobro &amp; Créditos del Salón
          </h1>
          <p className="font-body-md text-[#6E665F] text-sm mt-1">
            Gestión de apartados al 50%, líneas de crédito para patronos y conciliación de abonos privados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-5 py-3 rounded-xl border border-[#E6DED1] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[#6E665F] block">Total Exigible</span>
            <span className="font-mono text-xl font-bold text-[#1A1817]">${totalCredits.toFixed(2)} USD</span>
          </div>
        </div>
      </header>

      {/* Clients Credit Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E6DED1] overflow-hidden">
        <div className="p-4 bg-[#F5F2EB]/50 border-b border-[#E6DED1] flex justify-between items-center">
          <span className="font-title-md text-xs font-semibold text-[#1A1817]">
            Patronos con Saldos Pendientes
          </span>
          <span className="text-xs text-[#6E665F]">Tasa de cobro puntual: 98.2%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase">
                <th className="py-3 px-4 font-semibold">Cliente / Código</th>
                <th className="py-3 px-4 font-semibold">Nivel Atelier</th>
                <th className="py-3 px-4 font-semibold">Casa Preferida</th>
                <th className="py-3 px-4 font-semibold">Última Visita</th>
                <th className="py-3 px-4 text-right font-semibold">Saldo Pendiente</th>
                <th className="py-3 px-4 text-right font-semibold">Acción de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-[#1A1817]">
                    {client.name}
                    <span className="block text-[10px] text-[#6E665F] font-normal">{client.code}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#F5F2EB] text-[#775a00] font-semibold text-[10px] border border-[#E6DED1]">
                      {client.tier}
                    </span>
                  </td>
                  <td className="py-4 px-4">{client.favoriteHouse}</td>
                  <td className="py-4 px-4 text-[#6E665F]">{client.lastPurchase}</td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-sm text-[#1A1817]">
                    ${client.pendingBalance.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {client.pendingBalance > 0 ? (
                      <button
                        onClick={() => handleCollect(client.id, client.pendingBalance)}
                        className="px-3 py-1 rounded bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        Registrar Abono
                      </button>
                    ) : (
                      <span className="text-[#2D5A27] font-semibold">Al día ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-[#1A1817] px-5 py-3.5 rounded-xl shadow-xl border border-[#E6DED1] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#2D5A27]">verified</span>
          <p className="text-xs font-medium">{notification}</p>
        </div>
      )}
    </div>
  );
};
