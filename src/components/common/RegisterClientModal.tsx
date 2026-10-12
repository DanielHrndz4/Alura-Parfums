import React, { useState } from 'react';
import { ClientProfile } from '../../types/sale';
import { SalesRepository } from '../../repositories/salesRepository';

interface RegisterClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (newClient: ClientProfile) => void;
  defaultHouse?: string;
}

export const RegisterClientModal: React.FC<RegisterClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated,
  defaultHouse = 'Maison Alura',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState(defaultHouse);
  const [tier, setTier] = useState<'Cliente' | 'VIP' | 'Privé'>('Cliente');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const popularHouses = ['Maison Alura', 'Creed', 'Dior Privée', 'Tom Ford', 'Xerjoff', 'Roja Parfums'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa el nombre del cliente.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const createdClient = await SalesRepository.addClient({
        name: name.trim(),
        phone: phone.trim() || undefined,
        favoriteHouse: house.trim() || 'Maison Alura',
        tier,
        initialBalance: 0,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setName('');
      setPhone('');
      setHouse(defaultHouse);
      setTier('Cliente');
      setNotes('');

      onClientCreated(createdClient);
      onClose();
    } catch (err: any) {
      console.error('Error al registrar cliente:', err);
      setErrorMessage(err.message || 'Error al guardar el cliente en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c59b27]/10 border border-[#c59b27]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#c59b27] text-2xl">person_add</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block font-sans">
                Atelier Place Vendôme • Membresía
              </span>
              <h3 className="font-serif text-lg font-bold text-[#1A1817] tracking-tight">
                Registrar Nuevo Cliente
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            {errorMessage && (
              <div className="p-3 bg-[#FAF0EF] border border-[#8A2E2B]/30 text-[#8A2E2B] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Nombre Completo */}
            <div>
              <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                Nombre Completo del Cliente <span className="text-[#8A2E2B]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E665F] text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Reyes / Carlos Mendoza"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] font-semibold focus:outline-hidden focus:border-[#c59b27] transition-colors"
                />
              </div>
            </div>

            {/* Teléfono / WhatsApp & Membresía */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E665F] text-[18px]">
                    call
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] font-mono focus:outline-hidden focus:border-[#c59b27] transition-colors"
                  />
                </div>
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

            {/* Casa Preferida con Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px]">
                  Casa / Maison Preferida
                </label>
                <span className="text-[10px] text-[#6E665F]">Sugerencias rápidas</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {popularHouses.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHouse(h)}
                    className={`px-2.5 py-1 text-[10px] font-semibold border transition-all cursor-pointer rounded-none ${
                      house === h
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
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                placeholder="Escribe otra casa de perfumes..."
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors"
              />
            </div>

            {/* Notas / Observaciones */}
            <div>
              <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                Notas del Atelier &amp; Perfil Olfativo (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas de salida preferidas, acordes (amaderado, gourmand, cítrico) o comentarios especiales..."
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-[#FAF8F5] border-t border-[#E6DED1] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[#E6DED1] bg-white text-xs font-semibold text-[#6E665F] hover:text-[#1A1817] hover:bg-neutral-100 transition-colors rounded-none cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] text-xs font-bold transition-all rounded-none flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Guardando en Base de Datos...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Registrar &amp; Guardar Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
