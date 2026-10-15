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
      <div className="max-w-[1760px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-[#E6DED1]">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <h4 className="font-headline-sm text-headline-sm text-[#1A1817] mb-2 font-serif text-lg font-semibold">
              ALURA PARFUMS
            </h4>
            <p className="font-body-sm text-body-sm text-[#6E665F] leading-relaxed mb-4 text-xs">
              Creación y distribución de contratipos finos de alta gama con la mayor fijación y fidelidad olfativa en El Salvador.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B8860B] text-[10px] font-bold">
                San Salvador • El Salvador
              </span>
            </div>

            {/* Social Media Links (Instagram & Facebook) */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/alurasparfums"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[#E6DED1] flex items-center justify-center text-[#775a00] hover:bg-[#775a00] hover:text-white transition-all shadow-xs"
                title="Síguenos en Instagram @alurasparfums"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/alurasparfums"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[#E6DED1] flex items-center justify-center text-[#775a00] hover:bg-[#775a00] hover:text-white transition-all shadow-xs"
                title="Síguenos en Facebook Alura Parfums"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <span className="font-label-sm text-[11px] text-[#6E665F]">@alurasparfums</span>
            </div>
          </div>

          {/* Boutique Salons / Entregas */}
          <div>
            <h5 className="font-label-md text-label-md uppercase tracking-wider text-[#2C2826] mb-3 text-xs font-semibold">
              Atelier &amp; Entregas
            </h5>
            <div className="space-y-4 font-body-sm text-body-sm text-[#6E665F] text-xs">
              <div>
                <p className="text-[#1A1817] font-semibold text-xs">San Salvador &amp; La Libertad</p>
                <p>San Salvador, Santa Tecla, Antiguo Cuscatlán</p>
                <p className="text-[#B8860B] font-label-sm text-label-sm mt-0.5 text-[10px]">
                  Entregas Inmediatas • Lunes a Sábado
                </p>
              </div>
              <div>
                <p className="text-[#1A1817] font-semibold text-xs">Envíos a Nivel Nacional</p>
                <p>Cobertura segura a los 14 departamentos de El Salvador</p>
                <p className="text-[#B8860B] font-label-sm text-label-sm mt-0.5 text-[10px]">
                  Frascos sellados y protegidos
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
                Asesoría de Fragancias WhatsApp
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#shipping">
                Envíos y Puntos de Entrega
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#auth">
                Garantía de Fidelidad Olfativa
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#care">
                Consejos de Fijación y Cuidado
              </a>
              <a className="hover:text-[#775a00] transition-colors" href="#faq">
                Preguntas Frecuentes
              </a>
            </div>
          </div>

          {/* Gazette / Newsletter */}
          <div>
            <h5 className="font-label-md text-label-md uppercase tracking-wider text-[#2C2826] mb-3 text-xs font-semibold">
              Comunidad Alura
            </h5>
            <p className="font-body-sm text-body-sm text-[#6E665F] mb-4 leading-relaxed text-xs">
              Reciba avisos de nuevos ingresos de contratipos, lotes exclusivos y promociones directas en San Salvador.
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
          <div>© 2025 Alura Parfums. Todos los derechos reservados. San Salvador, El Salvador.</div>
          <div className="flex items-center gap-6 font-label-sm text-label-sm uppercase tracking-wider text-[10px]">
            <a
              className="hover:text-[#775a00] transition-colors flex items-center gap-1 font-semibold"
              href="https://www.instagram.com/alurasparfums"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              className="hover:text-[#775a00] transition-colors flex items-center gap-1 font-semibold"
              href="https://www.facebook.com/alurasparfums"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a className="hover:text-[#775a00] transition-colors" href="#privacy">
              Privacidad
            </a>
            <a className="hover:text-[#775a00] transition-colors" href="#terms">
              Términos de Venta
            </a>
            <a className="hover:text-[#775a00] transition-colors" href="/admin/inventory" title="Acceso exclusivo administradores">
              Portal Administrativo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
