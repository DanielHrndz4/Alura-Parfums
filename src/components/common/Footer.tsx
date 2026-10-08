import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#F5F2EB] text-[#1b1c1a] pt-12 pb-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-t border-[#E6DED1]/60">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-[#E6DED1]">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <h4 className="font-headline-sm text-headline-sm text-[#1A1817] mb-2 font-serif text-lg font-semibold">
              ALURA PARFUMS
            </h4>
            <p className="font-body-sm text-body-sm text-[#6E665F] leading-relaxed mb-4 text-xs">
              Santuario de creación olfativa artesanal concebido bajo la luz de la Place Vendôme y el refinamiento de Mayfair.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B8860B] text-[10px] font-bold">
                Haute Parfumerie • Paris
              </span>
            </div>
          </div>

          {/* Boutique Salons */}
          <div>
            <h5 className="font-label-md text-label-md uppercase tracking-wider text-[#2C2826] mb-3 text-xs font-semibold">
              Boutique Salons
            </h5>
            <div className="space-y-4 font-body-sm text-body-sm text-[#6E665F] text-xs">
              <div>
                <p className="text-[#1A1817] font-semibold text-xs">Salon Place Vendôme</p>
                <p>14 Place Vendôme, 75001 Paris</p>
                <p className="text-[#B8860B] font-label-sm text-label-sm mt-0.5 text-[10px]">
                  Lunes a Sábado, 10h – 19h
                </p>
              </div>
              <div>
                <p className="text-[#1A1817] font-semibold text-xs">Salon Mayfair</p>
                <p>28 Mount Street, London W1K 2SX</p>
                <p className="text-[#B8860B] font-label-sm text-label-sm mt-0.5 text-[10px]">
                  Lunes a Sábado, 10h – 18h30
                </p>
              </div>
            </div>
          </div>

          {/* Atención al Cliente */}
          <div>
            <h5 className="font-label-md text-label-md uppercase tracking-wider text-[#2C2826] mb-3 text-xs font-semibold">
              Atención al Cliente
            </h5>
            <div className="flex flex-col space-y-2 font-body-sm text-body-sm text-[#6E665F] text-xs">
              <a className="hover:text-[#775a00] transition-colors" href="#concierge">
                Consultas &amp; Citas Privadas
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#shipping">
                Envío de Alta Joyería &amp; Devoluciones
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#auth">
                Certificado de Autenticidad
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#care">
                Preservación de Esencias
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#faq">
                Preguntas Frecuentes
              </a>
            </div>
          </div>

          {/* Gazette / Newsletter */}
          <div>
            <h5 className="font-label-md text-label-md uppercase tracking-wider text-[#2C2826] mb-3 text-xs font-semibold">
              La Gazette Alura
            </h5>
            <p className="font-body-sm text-body-sm text-[#6E665F] mb-4 leading-relaxed text-xs">
              Reciba invitaciones a lanzamientos privados de cosechas raras y cuadernos de viaje de nuestros maestros perfumistas.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-1.5">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-[#1b1c1a] placeholder:text-[#6E665F] font-body-sm text-body-sm px-3 py-2 rounded-lg outline-none flex-1 border border-[#E6DED1] text-xs focus:border-[#c59b27]"
                placeholder="Su correo electrónico..."
                type="email"
                required
              />
              <button
                className="bg-[#c59b27] text-[#1A1817] hover:bg-[#D4AF37] font-label-md text-label-md uppercase tracking-wider px-3 py-2 rounded-lg transition-all shadow-[0_4px_16px_rgba(197,155,39,0.2)] text-xs font-semibold whitespace-nowrap cursor-pointer"
                type="submit"
              >
                {subscribed ? 'Inscrito ✓' : 'Inscribirse'}
              </button>
            </form>
          </div>
        </div>

        {/* Legal bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-2 gap-4 font-body-sm text-body-sm text-[#6E665F] text-xs">
          <div>© 2025 Alura Parfums SAS. Tous droits réservés. Haute Parfumerie • Paris.</div>
          <div className="flex items-center gap-6 font-label-sm text-label-sm uppercase tracking-wider text-[10px]">
            <a className="hover:text-[#775a00] transition-colors" href="#privacy">
              Privacidad
            </a>
            <a className="hover:text-[#775a00] transition-colors" href="#terms">
              Términos de Venta
            </a>
            <a className="hover:text-[#775a00] transition-colors" href="#access">
              Accesibilidad
            </a>
            <a className="hover:text-[#775a00] transition-colors" href="#legal">
              Aviso Legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
