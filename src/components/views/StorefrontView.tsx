import React, { useState, useEffect, useMemo } from 'react';
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
  const [bestsellerFilter, setBestsellerFilter] = useState<'all' | '100ml' | '50ml'>('all');
  const [perfumes, setPerfumes] = useState<Perfume[]>(() => PerfumeRepository.getAll());

  useEffect(() => {
    PerfumeRepository.fetchFromSupabase().then((data) => {
      if (data && data.length > 0) setPerfumes(data);
    });
  }, []);

  // Real products from the database for the hero section
  const heroPerfume = useMemo(() => {
    return perfumes.find((p) => p.isBestseller) || perfumes[0] || {
      id: 'default-hero',
      name: 'Absolu Aventus',
      house: 'Creed',
      price: 15,
      format: '100ml • Eau de Parfum',
      imageUrl: '/images/hero_luxury_flacon.jpg',
      stock: 2,
    };
  }, [perfumes]);

  const heroSecondaryPerfume = useMemo(() => {
    return perfumes.find((p) => p.id !== heroPerfume?.id && p.gender === 'fem') || perfumes[1];
  }, [perfumes, heroPerfume]);

  // Real bestsellers from the database
  const bestsellers = useMemo(() => {
    const list = perfumes.filter((p) => p.isBestseller);
    return list.length > 0 ? list : perfumes.slice(0, 6);
  }, [perfumes]);

  const filteredBestsellers = useMemo(() => {
    return bestsellers.filter((p) => {
      if (bestsellerFilter === '100ml') return p.format.toLowerCase().includes('100ml');
      if (bestsellerFilter === '50ml') return p.format.toLowerCase().includes('50ml');
      return true;
    });
  }, [bestsellers, bestsellerFilter]);

  // Dynamic Olfactory Families with real counts from database
  const dynamicFamilies = useMemo(() => {
    return OLFACTORY_FAMILIES_DATA.map((fam) => {
      const count = perfumes.filter((p) => {
        const familyName = p.family?.toLowerCase() || '';
        const famTarget = fam.name.toLowerCase();
        return familyName.includes(famTarget) || famTarget.includes(familyName);
      }).length;
      return {
        ...fam,
        creationsCount: count > 0 ? count : fam.creationsCount,
      };
    });
  }, [perfumes]);

  return (
    <div className="flex flex-col w-full">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#fbf9f5] pb-10">
        <div className="max-w-[1760px] mx-auto px-4 md:px-10 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[600px]">
            {/* Left Editorial Copy (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-8 z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[1px] bg-[#c59b27]"></span>
                <span className="font-label-sm text-label-sm tracking-[0.3em] uppercase text-[#B8860B] text-xs font-bold">
                  Haute Parfumerie • Contratipos Finos
                </span>
              </div>
              <h1 className="font-display-lg text-[#1A1817] tracking-tight mb-4 leading-none font-serif text-4xl sm:text-5xl md:text-6xl">
                Contratipos de Lujo • <br />
                <span className="italic font-normal text-[#775a00]">Mismo Olor, Mayor Fijación</span>
              </h1>
              <p className="font-body-lg text-[#6E665F] max-w-xl mb-8 leading-relaxed text-base sm:text-lg">
                Elaboramos los mejores contratipos finos de los perfumes más exclusivos del mundo con el estándar de calidad más alto. Fórmulas de alta concentración con la misma pirámide olfativa y fijación prolongada de 8 a 12 horas, en frascos sellados de 50ml ($10 USD) y 100ml ($15 USD) en San Salvador.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
                <button
                  onClick={() => onNavigate('vault')}
                  className="w-full sm:w-auto justify-center bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-title-md text-title-md px-6 sm:px-8 py-3 rounded-lg shadow-[0_4px_20px_rgba(197,155,39,0.22)] transition-all flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <span>Explorar Catálogo</span>
                  <span className="material-symbols-outlined text-[18px]">north_east</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('calidad-garantia');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto justify-center bg-white hover:bg-[#F5F2EB] text-[#2C2826] font-title-md text-title-md px-6 sm:px-8 py-3 rounded-lg border border-[#E6DED1] shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <span>Garantía de Fidelidad Olfativa</span>
                  <span className="material-symbols-outlined text-[18px] text-[#B8860B]">verified</span>
                </button>
              </div>

              {/* Subtle metrics strip */}
              <div className="flex items-center gap-6 sm:gap-8 pt-4 border-t border-[#E6DED1]/60">
                <div className="flex flex-col">
                  <span className="font-display-lg text-[28px] leading-tight text-[#1A1817] font-semibold font-serif">
                    Fiel
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                    Mismo Olor Exacto
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#e4e2de]"></div>
                <div className="flex flex-col">
                  <span className="font-display-lg text-[28px] leading-tight text-[#1A1817] font-semibold font-serif">
                    +12h
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                    Fijación Superior
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-[#e4e2de]"></div>
                <div className="flex flex-col">
                  <span className="font-display-lg text-[28px] leading-tight text-[#1A1817] font-semibold font-serif">
                    $10 - $15
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] text-[10px]">
                    50ml &amp; 100ml Íntegros
                  </span>
                </div>
              </div>
            </div>

            {/* Right Asymmetric Visual Showcase (5 Cols) - Tied to real database */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div
                onClick={() => onNavigate(`/product/${heroPerfume.id}`)}
                className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-[#F5F2EB] flex items-end p-6 group border border-[#E6DED1] cursor-pointer"
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={`Contratipo fino ${heroPerfume.name} de ${heroPerfume.house}`}
                  src={heroPerfume.imageUrl}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1817]/80 via-[#1A1817]/25 to-transparent"></div>
                
                <div className="relative z-10 w-full bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-md flex items-center justify-between border border-[#E6DED1]">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B8860B] block text-[10px] font-bold">
                      Edición Maestra • Contratipo Fino
                    </span>
                    <p className="font-headline-sm text-headline-sm text-[#1A1817] font-serif font-semibold">
                      {heroPerfume.name}
                    </p>
                    <p className="font-body-sm text-body-sm text-[#6E665F] text-xs">
                      {heroPerfume.house} • {heroPerfume.format}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-title-md text-title-md font-semibold text-[#1A1817] block font-mono">
                      ${heroPerfume.price.toFixed(2)}
                    </span>
                    <span className="font-label-sm text-label-sm text-[#2D5A27] bg-[#F0F5EE] px-2 py-0.5 rounded uppercase font-bold text-[10px]">
                      {heroPerfume.stock > 0 ? 'En Stock' : 'Bajo Pedido'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary floating bottle pill (Negative offset) */}
              {heroSecondaryPerfume && (
                <div
                  onClick={() => onNavigate(`/product/${heroSecondaryPerfume.id}`)}
                  className="hidden sm:flex absolute -bottom-6 -left-8 bg-[#F5F2EB]/95 backdrop-blur-xl p-4 rounded-xl shadow-xl max-w-xs items-center gap-4 z-20 border border-[#E6DED1] cursor-pointer"
                >
                  <div className="w-12 h-14 rounded overflow-hidden flex-shrink-0 bg-white border border-[#E6DED1]">
                    <img
                      className="w-full h-full object-cover"
                      alt={heroSecondaryPerfume.name}
                      src={heroSecondaryPerfume.imageUrl}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B8860B] block text-[9px] font-bold">
                      {heroSecondaryPerfume.house}
                    </span>
                    <p className="font-title-md text-[#1A1817] font-semibold text-xs leading-tight">
                      {heroSecondaryPerfume.name}
                    </p>
                    <span className="font-mono text-xs text-[#775a00] font-bold">
                      ${heroSecondaryPerfume.price.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              )}
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
                <span className="material-symbols-outlined text-[24px]">sync</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Mismo Olor &amp; Esencia</span>
                <span className="font-body-sm text-[#6E665F] text-xs">Calibración idéntica a la fórmula original</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#775a00] shadow-sm flex-shrink-0 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[24px]">schedule</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Fijación Superior</span>
                <span className="font-body-sm text-[#6E665F] text-xs">+8 a 12 horas de duración verificada</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#775a00] shadow-sm flex-shrink-0 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Tarifas Claras</span>
                <span className="font-body-sm text-[#6E665F] text-xs">Frascos 50ml ($10) y 100ml ($15 USD)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#775a00] shadow-sm flex-shrink-0 border border-[#E6DED1]/60">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#1A1817] font-semibold text-sm">Ahorro del 85%</span>
                <span className="font-body-sm text-[#6E665F] text-xs">Misma calidad sin el sobreprecio de marca</span>
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
                Contratipos de ultra-lujo en presentaciones de 50ml y 100ml disponibles de inmediato.
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
                onClick={() => setBestsellerFilter('100ml')}
                className={`px-4 py-1.5 rounded-lg font-label-md text-label-md uppercase tracking-wider text-xs transition-all ${
                  bestsellerFilter === '100ml'
                    ? 'bg-white text-[#2C2826] shadow-sm border border-[#E6DED1] font-semibold'
                    : 'bg-[#F5F2EB] text-[#6E665F] hover:text-[#1A1817]'
                }`}
              >
                Frascos 100ml
              </button>
              <button
                onClick={() => setBestsellerFilter('50ml')}
                className={`px-4 py-1.5 rounded-lg font-label-md text-label-md uppercase tracking-wider text-xs transition-all ${
                  bestsellerFilter === '50ml'
                    ? 'bg-white text-[#2C2826] shadow-sm border border-[#E6DED1] font-semibold'
                    : 'bg-[#F5F2EB] text-[#6E665F] hover:text-[#1A1817]'
                }`}
              >
                Frascos 50ml
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
                    </div>

                    <button
                      onClick={() => {
                        if (item.stock > 0) {
                          onAddToCart(item);
                        } else {
                          const msg = encodeURIComponent(`Hola Alura Parfums, quisiera consultar la disponibilidad del perfume ${item.name} (${item.house}).`);
                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                        }
                      }}
                      className={`w-full py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs uppercase font-semibold tracking-wider cursor-pointer ${
                        item.stock > 0
                          ? 'bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817]'
                          : 'bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#775a00] border border-[#c59b27]/40 shadow-xs'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {item.stock > 0 ? 'shopping_bag' : 'chat'}
                      </span>
                      <span>{item.stock > 0 ? 'Añadir a la Bolsa' : 'Consultar Disponibilidad'}</span>
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
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </div>
              <div>
                <p className="font-title-md text-title-md text-[#1A1817] font-semibold text-sm">
                  ¿Buscas una fragancia específica en versión 50ml o 100ml?
                </p>
                <p className="font-body-sm text-body-sm text-[#6E665F] text-xs">
                  Contamos con los mejores contratipos finos de Creed, Valentino, Tom Ford, Lancôme, Lattafa y más.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('vault')}
              className="bg-white hover:bg-[#FAF8F4] text-[#2C2826] font-label-md text-label-md uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-all whitespace-nowrap border border-[#E6DED1] text-xs font-semibold cursor-pointer"
            >
              Explorar Vitrina
            </button>
          </div>
        </div>
      </section>

      {/* 4. 'EL SECRETO DE NUESTRA CALIDAD' (CONTRATIPOS DE ALTA GAMA & LONGEVIDAD) */}
      <section className="w-full bg-[#F5F2EB] py-16" id="calidad-garantia">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Visual Composition (5 Cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-[#ECE7DE] border border-[#E6DED1]">
                <img
                  className="w-full h-full object-cover"
                  alt="Laboratorio de formulación y maceración artesanal de contratipos Alura Parfums"
                  src="/images/atelier_craft.jpg"
                />
              </div>
              <div className="hidden sm:block absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl max-w-xs border border-[#E6DED1]">
                <div className="flex items-center gap-1 text-[#B8860B] mb-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest font-bold text-[10px]">
                    Garantía de Fidelidad Insuperable
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-[#6E665F] leading-snug text-xs">
                  Fórmulas exactas elaboradas con aceites de máxima pureza. Maceración intensiva para fijación de 8 a 12 horas.
                </p>
              </div>
            </div>

            {/* Right Informative Interactive Process (7 Cols) */}
            <div className="lg:col-span-7 pl-0 lg:pl-10 mt-8 lg:mt-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-[#B8860B] text-xs font-bold">
                  Maestría Olfativa
                </span>
              </div>
              <h2 className="font-headline-lg text-[#1A1817] tracking-tight mb-4 font-serif text-3xl md:text-4xl">
                El Secreto de Nuestra Calidad • <br />
                <span className="italic font-normal text-[#775a00]">El Contratipo Perfecto</span>
              </h2>
              <p className="font-body-lg text-[#6E665F] mb-6 leading-relaxed text-sm md:text-base">
                No creemos en imitaciones diluidas ni en fórmulas efímeras. En Alura elaboramos contratipos de la más alta graduación con la misma arquitectura olfativa que los perfumes originales más exclusivos. Frascos de 50ml y 100ml diseñados para ofrecerte presencia, estela y duración extraordinaria.
              </p>

              {/* 3 Steps / Pillars */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#E6DED1]/70">
                  <span className="font-display-lg text-[24px] text-[#775a00] font-semibold leading-none pt-1 font-serif">
                    01
                  </span>
                  <div>
                    <h4 className="font-title-md text-[#1A1817] font-semibold text-sm">
                      Fórmula de Alta Fidelidad al Original
                    </h4>
                    <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                      Replicamos con precisión milimétrica la pirámide aromática: salida vibrante, corazón seductor y fondo denso y duradero.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#E6DED1]/70">
                  <span className="font-display-lg text-[24px] text-[#775a00] font-semibold leading-none pt-1 font-serif">
                    02
                  </span>
                  <div>
                    <h4 className="font-title-md text-[#1A1817] font-semibold text-sm">
                      Concentración Superior: +12 Horas de Fijación
                    </h4>
                    <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                      Maceración prolongada en extracto de perfumería que garantiza una proyección envolvente durante toda tu jornada.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#E6DED1]/70">
                  <span className="font-display-lg text-[24px] text-[#775a00] font-semibold leading-none pt-1 font-serif">
                    03
                  </span>
                  <div>
                    <h4 className="font-title-md text-[#1A1817] font-semibold text-sm">
                      Frascos Completos de 50ml ($10) y 100ml ($15 USD)
                    </h4>
                    <p className="font-body-sm text-[#6E665F] mt-0.5 text-xs">
                      Sin intermediarios ni marketing inflado: tu fragancia insignia en tamaño completo a un precio honesto y transparente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action CTA */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('vault')}
                  className="bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-title-md text-title-md px-6 py-3 rounded-lg shadow-md transition-all flex items-center gap-2 font-semibold text-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span>Explorar Contratipos de Lujo</span>
                </button>
                <span className="font-label-md text-label-md uppercase tracking-wider text-[#6E665F] text-xs font-semibold">
                  50ml ($10 USD) • 100ml ($15 USD)
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
            {dynamicFamilies.map((fam) => (
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
              Testimonios de Clientes Satisfechos
            </span>
            <div className="max-w-3xl mx-auto">
              <blockquote className="font-headline-lg text-2xl sm:text-3xl leading-tight text-[#1A1817] italic font-normal my-4 font-serif">
                “Alura ha redefinido el estándar de contratipos de ultra-lujo en San Salvador. Su fidelidad olfativa premium y fijación de más de 10 horas rivalizan con los frascos originales de diseñador, brindando la máxima distinción a un precio inigualable.”
              </blockquote>
              <cite className="font-label-md text-label-md uppercase tracking-[0.2em] text-[#6E665F] not-italic block mt-2 text-xs">
                — CLIENTES EN SAN SALVADOR, EL SALVADOR
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
                  “Compré el contratipo de Absolu Aventus en 100ml ($15 USD) y quedé atónito. El secado ahumado con piña es idéntico al perfume de nicho. Me duró más de 10 horas en camisa y piel aquí en San Salvador.”
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
                    San Salvador, El Salvador • Cliente Verificado
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
                  “Donna Born in Roma de 100ml es espectacular. La fijación del jazmín y la vainilla bourbon me dura todo el día en el trabajo. La entrega en Santa Tecla fue súper rápida y llegó sellado. Ya es mi compra fija.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#E6DED1]/60">
                <div className="w-8 h-8 rounded-full bg-[#ECE7DE] flex items-center justify-center font-bold text-[#1A1817] font-label-sm text-xs">
                  EV
                </div>
                <div>
                  <span className="font-title-md text-[#1A1817] font-semibold block leading-tight text-xs">
                    Elena Vásquez
                  </span>
                  <span className="font-label-sm text-[#6E665F] text-[10px]">
                    Santa Tecla, El Salvador • Cliente VIP
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
                  “Tengo varios perfumes de diseñador y quise probar Khamrah Qahwa en versión 50ml ($10 USD). Es una auténtica joya, proyección pesada y cumplidos constantes. El mejor contratipo que he probado en El Salvador.”
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
                    Antiguo Cuscatlán, El Salvador • Coleccionista
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
                Asesoría Personalizada
              </span>
              <h3 className="font-headline-lg text-[#1A1817] mb-2 font-serif text-2xl md:text-3xl font-semibold">
                ¿Buscas tu fragancia favorita?
              </h3>
              <p className="font-body-md text-[#6E665F] text-sm">
                Nuestros especialistas te asesoran de inmediato para recomendarte el contratipo exacto de tu perfume predilecto según la ocasión y tus notas olfativas favoritas.
              </p>
            </div>
            <div className="flex items-center gap-4 z-10 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => onNavigate('vault')}
                className="w-full md:w-auto text-center justify-center bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-title-md text-title-md px-6 sm:px-8 py-3 rounded-lg shadow-sm transition-all font-semibold text-sm cursor-pointer"
              >
                Ver Catálogo Completo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
