import React, { useState } from 'react';
import { PerfumeRepository, OLFACTORY_FAMILIES_DATA } from '../../repositories/perfumeRepository';
import { Perfume } from '../../types/perfume';

interface StorefrontViewProps {
  onNavigate: (view: string) => void;
  onAddToCart: (perfume: Perfume, format?: string) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  onNavigate,
  onAddToCart,
}) => {
  const [bestsellerFilter, setBestsellerFilter] = useState<'all' | 'full' | 'decants'>('all');
  const perfumes = PerfumeRepository.getAll();

  // Curated 4 bestsellers for salon section
  const bestsellers = perfumes.filter((p) => p.isBestseller).slice(0, 4);

  const filteredBestsellers = bestsellers.filter((p) => {
    if (bestsellerFilter === 'full') return !p.format.includes('Decant');
    if (bestsellerFilter === 'decants') return p.format.includes('Decant') || p.hasSample;
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#fbf9f5] pb-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[600px]">
            {/* Left Editorial Copy (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-8 z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[1px] bg-[#c59b27]"></span>
                <span className="font-label-sm text-label-sm tracking-[0.3em] uppercase text-[#B8860B] text-xs font-bold">
                  Place Vendôme • Édition Privée
                </span>
              </div>
              <h1 className="font-display-lg text-[#1A1817] tracking-tight mb-4 leading-none font-serif text-4xl sm:text-5xl md:text-6xl">
                L’Art du <br />
                <span className="italic font-normal text-[#775a00]">Parfum Rare</span>
              </h1>
              <p className="font-body-lg text-[#6E665F] max-w-xl mb-8 leading-relaxed text-base sm:text-lg">
                Creaciones exclusivas de alta perfumería, extractos puros de destilación artesanal y casas de autor seleccionadas a mano. Una biblioteca sensorial concebida bajo la luz serena de nuestro taller parisino.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={() => onNavigate('vault')}
                  className="bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-title-md text-title-md px-6 sm:px-8 py-3 rounded-lg shadow-[0_4px_20px_rgba(197,155,39,0.22)] transition-all flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <span>Explorar Catálogo</span>
                  <span className="material-symbols-outlined text-[18px]">north_east</span>
                </button>
                <button
                  onClick={() => onNavigate('vault')}
                  className="bg-white hover:bg-[#F5F2EB] text-[#2C2826] font-title-md text-title-md px-6 sm:px-8 py-3 rounded-lg border border-[#E6DED1] shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <span>Descubrir Muestras &amp; Testers</span>
                  <span className="material-symbols-outlined text-[18px] text-[#B8860B]">science</span>
                </button>
              </div>

              {/* Subtle metrics strip */}
              <div className="flex items-center gap-6 sm:gap-8 pt-4 border-t border-[#E6DED1]/60">
                <div className="flex flex-col">
                  <span className="font-display-lg text-[28px] leading-tight text-[#1A1817] font-semibold font-serif">
                    100%
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                    Batch Verificado
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#e4e2de]"></div>
                <div className="flex flex-col">
                  <span className="font-display-lg text-[28px] leading-tight text-[#1A1817] font-semibold font-serif">
                    48h
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                    Bóveda Climatizada
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#e4e2de]"></div>
                <div className="flex flex-col">
                  <span className="font-display-lg text-[28px] leading-tight text-[#1A1817] font-semibold font-serif">
                    5 ml
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                    Decants de Autor
                  </span>
                </div>
              </div>
            </div>

            {/* Right Asymmetric Visual Showcase (5 Cols) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-[#F5F2EB] flex items-end p-6 group border border-[#E6DED1]">
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Valentino Born in Roma luxury flacon in Place Vendome daylight"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz24uTjZLim_h9_1GDajwn7SISwbAMgGYrufp5AERB22hHQ2LrvJjMiLS5F1mgttHLm1_RD0IgNFX2IVd4ha1INsjbjaIfBjYa0KqeYO4Ffeuccp59QTATCeYFrQcxdMS-ilyM28OZHjZ19AUBWv0fYQfC9HGm8Gs-Ctmb7fhpVxaXgTdUY_RNem64pqqXFWbwFX-PRuA769Bw8OOYFaUFkgj6nG8AVUz5Pki45we7"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1817]/75 via-[#1A1817]/25 to-transparent"></div>
                
                <div className="relative z-10 w-full bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-md flex items-center justify-between border border-[#E6DED1]">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B8860B] block text-[10px] font-bold">
                      Pièce de Résistance
                    </span>
                    <p className="font-headline-sm text-headline-sm text-[#1A1817] font-serif font-semibold">
                      Valentino Born in Roma
                    </p>
                    <p className="font-body-sm text-body-sm text-[#6E665F] text-xs">
                      Extracto Floral Ambarino • 100ml
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-title-md text-title-md font-semibold text-[#1A1817] block font-mono">
                      $60.00
                    </span>
                    <span className="font-label-sm text-label-sm text-[#2D5A27] bg-[#F0F5EE] px-2 py-0.5 rounded uppercase font-bold text-[10px]">
                      1 en vitrina
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary floating decant pill (Negative offset) */}
              <div className="hidden sm:flex absolute -bottom-6 -left-8 bg-[#F5F2EB]/95 backdrop-blur-xl p-4 rounded-xl shadow-xl max-w-xs items-center gap-4 z-20 border border-[#E6DED1]">
                <div className="w-12 h-14 rounded overflow-hidden flex-shrink-0 bg-[#ECE7DE]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Creed Absolute Aventus travel decant"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMfsvHoKnB7JQ803rlLOU1A9CfFjGYiprcUzYeKkdXhdCaYS8PSgviJG2BCAZwQsdFVCVi2e1sXmTNjsLIBIBd7uUt79M5SeKgIU6nXG1TRvCMt_OQ0ZwKSCWYMclDVebTNhJvX1MBFZ5MnpACI4PS9wL9SehCMeKZlb_TLfI3q4InpU8L7JjO9FDb-YNXiaDIgRWPLxFDfSQE_hxNUsX7ZZIT794P8tAFGeJlX55s"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-[#775a00] uppercase tracking-widest font-bold text-[10px]">
                    Decant Privé
                  </span>
                  <p className="font-title-md text-title-md text-[#1A1817] leading-snug text-xs font-semibold">
                    Creed Absolute Aventus
                  </p>
                  <p className="font-body-sm text-body-sm text-[#6E665F] text-[11px]">
                    5ml Tester • $10.00 USD
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION STRIP */}
      <section className="w-full bg-[#F5F2EB] py-6 shadow-sm border-y border-[#E6DED1]/60">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#775a00] shadow-sm flex-shrink-0 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">100% Autenticidad</span>
                <span className="font-body-sm text-[#6E665F] text-xs">Lote verificado y trazabilidad directa</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#775a00] shadow-sm flex-shrink-0 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[24px]">redeem</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Muestra de Cortesía</span>
                <span className="font-body-sm text-[#6E665F] text-xs">Decant artesanal de 2ml en cada orden</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#775a00] shadow-sm flex-shrink-0 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[24px]">ac_unit</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Bóveda Climatizada</span>
                <span className="font-body-sm text-[#6E665F] text-xs">Preservación a 16°C &amp; alta seguridad</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#775a00] shadow-sm flex-shrink-0 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Asesoría Olfativa</span>
                <span className="font-body-sm text-[#6E665F] text-xs">Concierge privado para su estela única</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED SHOWCASE / 'SELECCIÓN DEL SALON' */}
      <section className="w-full bg-[#fbf9f5] py-12" id="catalogo">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-[#B8860B] text-xs font-bold">
                  Inventario en Tiempo Real
                </span>
              </div>
              <h2 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl font-semibold">
                Selección del Salon • Bestsellers
              </h2>
              <p className="font-body-md text-[#6E665F] mt-1 text-sm">
                Piezas maestras y decants de descubrimiento disponibles de inmediato en nuestras vitrinas.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <button
                onClick={() => setBestsellerFilter('all')}
                className={`px-4 py-1.5 rounded-lg font-label-md text-label-md uppercase tracking-wider text-xs transition-all ${
                  bestsellerFilter === 'all'
                    ? 'bg-white text-[#2C2826] shadow-sm border border-[#E6DED1] font-semibold'
                    : 'bg-[#F5F2EB] text-[#6E665F] hover:text-[#1A1817]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setBestsellerFilter('full')}
                className={`px-4 py-1.5 rounded-lg font-label-md text-label-md uppercase tracking-wider text-xs transition-all ${
                  bestsellerFilter === 'full'
                    ? 'bg-white text-[#2C2826] shadow-sm border border-[#E6DED1] font-semibold'
                    : 'bg-[#F5F2EB] text-[#6E665F] hover:text-[#1A1817]'
                }`}
              >
                Frascos Completos
              </button>
              <button
                onClick={() => setBestsellerFilter('decants')}
                className={`px-4 py-1.5 rounded-lg font-label-md text-label-md uppercase tracking-wider text-xs transition-all ${
                  bestsellerFilter === 'decants'
                    ? 'bg-white text-[#2C2826] shadow-sm border border-[#E6DED1] font-semibold'
                    : 'bg-[#F5F2EB] text-[#6E665F] hover:text-[#1A1817]'
                }`}
              >
                Decants • Testers
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBestsellers.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(`/product/${item.id}`)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#E6DED1]/70 cursor-pointer"
              >
                <div className="relative w-full aspect-square bg-[#f5f3ef] overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt={item.imageAlt}
                    src={item.imageUrl}
                    referrerPolicy="no-referrer"
                  />
                  <button
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-[#6E665F] hover:text-[#ba1a1a] flex items-center justify-center transition-colors shadow-sm z-10"
                    title="Favoritos"
                  >
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-sm text-label-sm tracking-wider uppercase text-[#6E665F] text-[10px]">
                        {item.house}
                      </span>
                      <span className="font-label-sm text-label-sm uppercase text-[#B8860B] bg-[#F5F2EB] px-2 py-0.5 rounded text-[10px]">
                        {item.family}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-[#1A1817] mb-1 group-hover:text-[#775a00] transition-colors font-serif font-semibold">
                      {item.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-[#6E665F] mb-4 text-xs">
                      {item.subtitle}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4 pt-1 border-t border-[#E6DED1]/50">
                      <div>
                        <span className="font-display-lg text-[22px] leading-tight font-bold text-[#1A1817] font-mono">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="font-label-sm text-label-sm text-[#6E665F] block text-[10px]">
                          USD / {item.format}
                        </span>
                      </div>
                      <div className="text-right">
                        {item.stock > 0 ? (
                          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#2D5A27] bg-[#F0F5EE] px-2 py-0.5 rounded font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>{' '}
                            {item.stock} disponible{item.stock > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#B8860B] bg-[#F5F2EB] px-2 py-0.5 rounded font-bold text-[10px]">
                            Reserva Abierta
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToCart(item)}
                      className={`w-full py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs uppercase font-semibold tracking-wider cursor-pointer ${
                        item.stock > 0
                          ? 'bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817]'
                          : 'bg-[#F5F2EB] hover:bg-[#eae1d4] text-[#2C2826]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {item.stock > 0 ? 'shopping_bag' : 'bookmark_border'}
                      </span>
                      <span>{item.stock > 0 ? 'Añadir a la Bolsa' : 'Apartar Preventa'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Stock Notification Bar */}
          <div className="mt-8 p-4 bg-[#F5F2EB] rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-[#E6DED1]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#c59b27] text-[#1A1817] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
              <div>
                <p className="font-title-md text-title-md text-[#1A1817] font-semibold text-sm">
                  ¿Busca una referencia específica o decant a medida?
                </p>
                <p className="font-body-sm text-body-sm text-[#6E665F] text-xs">
                  Nuestra bóveda cuenta con más de 140 extractos listos para decantar al momento en viales estériles.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('vault')}
              className="bg-white hover:bg-[#FAF8F4] text-[#2C2826] font-label-md text-label-md uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-all whitespace-nowrap border border-[#E6DED1] text-xs font-semibold"
            >
              Consultar con Concierge
            </button>
          </div>
        </div>
      </section>

      {/* 4. 'EL RITO DE LAS MUESTRAS' (THE SAMPLE ATELIER) */}
      <section className="w-full bg-[#F5F2EB] py-16" id="atelier-muestras">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Visual Composition (5 Cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-[#ECE7DE] border border-[#E6DED1]">
                <img
                  className="w-full h-full object-cover"
                  alt="Glass pipettes extracting perfume oil into decant vials in Paris"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSKoOXMYMTsJu1AyuAp-n8j_eNRUiMtElVYsy8KlyvYV3XXGhQc_fxyo2EGaW8_UFpI2g0_wmTxntjBslpQHgNzsenTr2dazbgdWZUtILlbEa1qva0uqXJHxHGWFfILtv58EiDiL9nVjDMERujVYJUhm_9SB0uUIMERTd_IMHeLpqOq_uKgIGDpGaSv_fjsVD1g0u7MgtUCQz0zPpI4m3RTf0_V_4Q92EBAb0UoCEr"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl max-w-xs border border-[#E6DED1]">
                <div className="flex items-center gap-1 text-[#B8860B] mb-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest font-bold text-[10px]">
                    Garantía de Pureza
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-[#6E665F] leading-snug text-xs">
                  Decantado estéril individualizado al recibir su orden, sellado herméticamente en frascos de cristal neutro.
                </p>
              </div>
            </div>

            {/* Right Informative Interactive Process (7 Cols) */}
            <div className="lg:col-span-7 pl-0 lg:pl-10 mt-8 lg:mt-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-[#B8860B] text-xs font-bold">
                  Filosofía Alura
                </span>
              </div>
              <h2 className="font-headline-lg text-[#1A1817] tracking-tight mb-4 font-serif text-3xl md:text-4xl">
                El Rito de las Muestras • <br />
                <span className="italic font-normal text-[#775a00]">Decants de Descubrimiento</span>
              </h2>
              <p className="font-body-lg text-[#6E665F] mb-6 leading-relaxed text-sm md:text-base">
                Un perfume auténtico es una sinfonía que evoluciona durante ocho horas sobre la calidez particular de su piel. Antes de comprometerse con un frasco completo de $300+, le invitamos a vivir la experiencia de nuestra selección de decants oficiales de 5ml y 10ml.
              </p>

              {/* 3 Steps */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#E6DED1]/70">
                  <span className="font-display-lg text-[24px] text-[#775a00] font-semibold leading-none pt-1 font-serif">
                    01
                  </span>
                  <div>
                    <h4 className="font-title-md text-[#1A1817] font-semibold text-sm">
                      Seleccione 3 a 5 esencias raras
                    </h4>
                    <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                      Explore desde acordes de sándalo ahumado hasta gourmands especiados con café de Arabia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#E6DED1]/70">
                  <span className="font-display-lg text-[24px] text-[#775a00] font-semibold leading-none pt-1 font-serif">
                    02
                  </span>
                  <div>
                    <h4 className="font-title-md text-[#1A1817] font-semibold text-sm">
                      Pruébelas en su piel durante 3 días completos
                    </h4>
                    <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                      Observe las notas de salida, la transformación del corazón y la permanencia en el fondo tras horas de uso.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#E6DED1]/70">
                  <span className="font-display-lg text-[24px] text-[#775a00] font-semibold leading-none pt-1 font-serif">
                    03
                  </span>
                  <div>
                    <h4 className="font-title-md text-[#1A1817] font-semibold text-sm">
                      Crédito del 100% hacia su frasco completo
                    </h4>
                    <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                      El valor total invertido en su set de descubrimiento se deduce automáticamente al adquirir su frasco de 100ml.
                    </p>
                  </div>
                </div>
              </div>

              {/* Discovery Set CTA */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('vault')}
                  className="bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-title-md text-title-md px-6 py-3 rounded-lg shadow-md transition-all flex items-center gap-2 font-semibold text-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                  <span>Crear Set Personalizado (3 x 5ml)</span>
                </button>
                <span className="font-label-md text-label-md uppercase tracking-wider text-[#6E665F] text-xs">
                  Desde $25.00 USD
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OLFACTORY FAMILIES EXPLORER */}
      <section className="w-full bg-[#fbf9f5] py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-[#B8860B] block mb-1 text-xs font-bold">
              Taxonomía Sensorial
            </span>
            <h2 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl font-semibold">
              Familias Olfativas
            </h2>
            <p className="font-body-md text-[#6E665F] mt-2 text-sm">
              Navegue nuestra colección por acordes maestros y descubra la resonancia que define su presencia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OLFACTORY_FAMILIES_DATA.map((fam) => (
              <button
                key={fam.id}
                onClick={() => onNavigate('vault')}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-[#F5F2EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 text-left border border-[#E6DED1]"
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={fam.name}
                  src={fam.imageUrl}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1817]/85 via-[#1A1817]/30 to-transparent"></div>
                <div className="relative z-10 text-white">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#ffdf98] block mb-1 text-[10px] font-bold">
                    {fam.creationsCount} Creaciones
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-white font-semibold mb-1 group-hover:translate-x-1 transition-transform font-serif">
                    {fam.name}
                  </h3>
                  <p className="font-body-sm text-[#eae8e4] line-clamp-2 text-xs">
                    {fam.description}
                  </p>
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-wider text-[#ffdf98] mt-3 group-hover:underline text-[10px]">
                    Explorar notas →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRESS QUOTES & TESTIMONIALS */}
      <section className="w-full bg-[#F5F2EB] py-16 border-t border-[#E6DED1]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="pb-8 mb-10 text-center">
            <span className="font-label-sm text-label-sm uppercase tracking-[0.3em] text-[#B8860B] block mb-2 text-xs font-bold">
              Elogios de la Crítica Internacional
            </span>
            <div className="max-w-3xl mx-auto">
              <blockquote className="font-headline-lg text-2xl sm:text-3xl leading-tight text-[#1A1817] italic font-normal my-4 font-serif">
                “Alura ha devuelto el misterio, el tiempo y la sacralidad a la perfumería de autor. Su concepto de decants de alta gama democratiza el acceso a lotes que antes solo existían en los salones privados de París.”
              </blockquote>
              <cite className="font-label-md text-label-md uppercase tracking-[0.2em] text-[#6E665F] not-italic block mt-2 text-xs">
                — VOGUE ÉDITION BEAUTÉ • PARIS
              </cite>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between border border-[#E6DED1]">
              <div>
                <div className="flex items-center gap-1 text-[#c59b27] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[16px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-[#2C2826] leading-relaxed italic mb-4 text-xs">
                  “Compré el decant de Absolu Aventus para probarlo durante una semana antes de invertir. El packaging es digno de una casa de alta joyería. La muestra de cortesía superó mis expectativas.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#E6DED1]/60">
                <div className="w-8 h-8 rounded-full bg-[#ECE7DE] flex items-center justify-center font-bold text-[#1A1817] font-label-sm text-xs">
                  MC
                </div>
                <div>
                  <span className="font-title-md text-[#1A1817] font-semibold block leading-tight text-xs">
                    Marcos Casares
                  </span>
                  <span className="font-label-sm text-[#6E665F] text-[10px]">
                    Madrid • Cliente Privé
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between border border-[#E6DED1]">
              <div>
                <div className="flex items-center gap-1 text-[#c59b27] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[16px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-[#2C2826] leading-relaxed italic mb-4 text-xs">
                  “Donna Born in Roma llegó perfectamente refrigerado y con el código de lote impreso con su certificado de autenticidad. La atención del concierge por chat fue impecable.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#E6DED1]/60">
                <div className="w-8 h-8 rounded-full bg-[#ECE7DE] flex items-center justify-center font-bold text-[#1A1817] font-label-sm text-xs">
                  ED
                </div>
                <div>
                  <span className="font-title-md text-[#1A1817] font-semibold block leading-tight text-xs">
                    Elena de la Vega
                  </span>
                  <span className="font-label-sm text-[#6E665F] text-[10px]">
                    Ciudad de México • Coleccionista
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between border border-[#E6DED1]">
              <div>
                <div className="flex items-center gap-1 text-[#c59b27] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[16px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-[#2C2826] leading-relaxed italic mb-4 text-xs">
                  “Khamrah Qahwa es un tesoro gourmand que no conseguía en ninguna tienda física. El envío asegurado llegó en 48 horas sin contratiempos. Volveré por el decant de Santal 33.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#E6DED1]/60">
                <div className="w-8 h-8 rounded-full bg-[#ECE7DE] flex items-center justify-center font-bold text-[#1A1817] font-label-sm text-xs">
                  JL
                </div>
                <div>
                  <span className="font-title-md text-[#1A1817] font-semibold block leading-tight text-xs">
                    Julián Lozano
                  </span>
                  <span className="font-label-sm text-[#6E665F] text-[10px]">
                    Bogotá • Miembro Atelier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRIVATE CONCIERGE CALLOUT BANNER */}
      <section className="w-full bg-[#fbf9f5] py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="bg-[#F5F2EB] rounded-xl p-8 md:p-12 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-[#E6DED1]">
            <div className="max-w-xl z-10">
              <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-[#B8860B] block mb-1 text-xs font-bold">
                Servicio de Concierge
              </span>
              <h3 className="font-headline-lg text-[#1A1817] mb-2 font-serif text-2xl md:text-3xl font-semibold">
                ¿Desea una cita olfativa privada?
              </h3>
              <p className="font-body-md text-[#6E665F] text-sm">
                Nuestros sommeliers de fragancias diseñan cartas personalizadas para ocasiones memorables, obsequios diplomáticos y bodas de alta gala.
              </p>
            </div>
            <div className="flex items-center gap-4 z-10 flex-shrink-0">
              <button
                onClick={() => onNavigate('pos')}
                className="bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-title-md text-title-md px-6 sm:px-8 py-3 rounded-lg shadow-sm transition-all font-semibold text-sm cursor-pointer"
              >
                Agendar con Sommelier
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
