import React, { useState, useEffect } from 'react';
import { ClientProfile } from '../../types/sale';
import { SalesRepository } from '../../repositories/salesRepository';

interface EditClientModalProps {
  isOpen: boolean;
  client: ClientProfile | null;
  onClose: () => void;
  onClientUpdated: (updatedClient: ClientProfile) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  client,
  onClose,
  onClientUpdated,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [favoriteHouse, setFavoriteHouse] = useState('');
  const [lastFragrance, setLastFragrance] = useState('');
  const [lastFormat, setLastFormat] = useState('100ml');
  const [tier, setTier] = useState<string>('Cliente');
  const [pendingBalance, setPendingBalance] = useState('0');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const popularHouses = [
    'Maison Alura',
    'Creed',
    'Dior Privée',
    'Tom Ford',
    'Xerjoff',
    'Roja Parfums',
    'Afnan',
    'Rasasi',
    'Lancôme',
    'Valentino',
  ];

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setPhone(client.phone || '');
      setFavoriteHouse(client.favoriteHouse || 'Maison Alura');
      setLastFragrance(client.lastFragrance || '');
      setLastFormat(client.lastFormat || '100ml');
      setTier(client.tier || 'Cliente');
      setPendingBalance(client.pendingBalance !== undefined ? client.pendingBalance.toString() : '0');
      setNotes(client.notes || '');
      setErrorMessage(null);
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('El nombre del cliente no puede estar vacío.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const parsedBalance = Math.max(0, parseFloat(pendingBalance) || 0);

      const updated: ClientProfile = {
        ...client,
        name: name.trim(),
        phone: phone.trim() || undefined,
        favoriteHouse: favoriteHouse.trim() || 'Maison Alura',
        lastFragrance: lastFragrance.trim() || undefined,
        lastFormat: lastFormat.trim() || undefined,
        tier: tier.trim() || 'Cliente',
        pendingBalance: Number(parsedBalance.toFixed(2)),
        notes: notes.trim() || undefined,
      };

      const result = await SalesRepository.updateClient(updated);
      onClientUpdated(result);
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar cliente:', err);
      setErrorMessage(err.message || 'Error al guardar los cambios en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#775a00]/10 border border-[#775a00]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#775a00] text-2xl">edit</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block font-sans">
                  Cartera de Clientes • Place Vendôme
                </span>
                <span className="text-[10px] font-mono bg-white px-1.5 py-0.2 border border-[#E6DED1] text-[#6E665F]">
                  {client.code}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1A1817] tracking-tight">
                Modificar Perfil de Cliente
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-white hover:bg-neutral-100 text-[#2C2826] flex items-center justify-center transition-colors cursor-pointer border border-[#E6DED1]"
            title="Cerrar ventana"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Nombre Completo */}
            <div>
              <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                Nombre Completo del Cliente *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Éléonore Vance"
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors"
              />
            </div>

            {/* Teléfono & Nivel de Membresía */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+503 7000-0000"
                  className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] font-mono focus:outline-hidden focus:border-[#c59b27] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Nivel de Membresía (Tier)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Cliente', 'VIP', 'Privé'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`py-2 px-1 text-center font-bold text-[11px] border transition-all cursor-pointer rounded-none ${
                        tier === t
                          ? 'bg-[#1A1817] text-[#FAF8F5] border-[#1A1817]'
                          : 'bg-[#FAF8F5] text-[#6E665F] border-[#E6DED1] hover:bg-[#F5F2EB]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Casa Preferida con Sugerencias Rápidas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px]">
                  Casa / Maison Preferida
                </label>
                <span className="text-[10px] text-[#6E665F]">Sugerencias</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {popularHouses.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setFavoriteHouse(h)}
                    className={`px-2 py-0.5 text-[10px] font-semibold border transition-all cursor-pointer rounded-none ${
                      favoriteHouse === h
                        ? 'bg-[#c59b27]/20 border-[#c59b27] text-[#1A1817]'
                        : 'bg-white border-[#E6DED1] text-[#6E665F] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={favoriteHouse}
                onChange={(e) => setFavoriteHouse(e.target.value)}
                placeholder="Escribe otra casa de perfumes..."
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors"
              />
            </div>

            {/* Perfume Comprado / Adquirido */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Perfume Comprado / Frasco Adquirido
                </label>
                <input
                  type="text"
                  value={lastFragrance}
                  onChange={(e) => setLastFragrance(e.target.value)}
                  placeholder="Ej. Hawas, La Vie Est Belle, 9 PM..."
                  className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Formato / Tamaño
                </label>
                <select
                  value={lastFormat}
                  onChange={(e) => setLastFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors cursor-pointer"
                >
                  <option value="100ml">100ml ($15)</option>
                  <option value="50ml">50ml ($10)</option>
                </select>
              </div>
            </div>

            {/* Saldo Pendiente Adeudado */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E6DED1]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px]">
                  Saldo Pendiente Adeudado ($ USD)
                </label>
                <span className="text-[10px] text-[#6E665F]">
                  {parseFloat(pendingBalance) > 0 ? 'Cuenta con deuda activa' : 'Al día (Sin deuda)'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6E665F] font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pendingBalance}
                  onChange={(e) => setPendingBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs font-mono font-bold text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors"
                />
              </div>
              <p className="mt-1 text-[10px] text-[#6E665F]">
                Modifica este saldo únicamente si necesitas ajustar o conciliar manualmente la cuenta por cobrar del cliente.
              </p>
            </div>

            {/* Notas / Observaciones */}
            <div>
              <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                Notas del Atelier &amp; Perfil Olfativo
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas de salida preferidas, ocasiones especiales o recordatorios..."
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors resize-none placeholder:text-[#6E665F]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F5F2EB] border-t border-[#E6DED1] flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[#E6DED1] bg-white text-[#2C2826] text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer rounded-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#1A1817] hover:bg-[#2C2826] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 rounded-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
