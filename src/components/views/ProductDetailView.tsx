import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { Perfume } from '../../types/perfume';

interface ProductDetailViewProps {
  onAddToCart: (perfume: Perfume, quantity?: number) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const perfume = id ? PerfumeRepository.getById(id) : undefined;
  const allPerfumes = PerfumeRepository.getAll();

  const [imgUrl, setImgUrl] = useState<string>(perfume?.imageUrl || '');

  useEffect(() => {
    if (perfume?.imageUrl) {
      setImgUrl(perfume.imageUrl);
    }
  }, [perfume?.id, perfume?.imageUrl]);

  if (!perfume) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 pt-36 pb-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#775a00]">
          <span className="material-symbols-outlined text-[32px]">find_in_page</span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#1A1817]">Fragancia No Encontrada</h2>
        <p className="text-[#6E665F] mt-2 text-sm max-w-md mx-auto">
          El ejemplar solicitado no se encuentra registrado en el sistema del Atelier.
        </p>
        <button
          onClick={() => navigate('/collection')}
          className="mt-6 bg-[#775a00] hover:bg-[#B8860B] text-white px-6 py-3 rounded-xl font-label-md text-xs uppercase tracking-wider font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Volver a la Colección</span>
        </button>
      </div>
    );
  }

  // Related perfumes from same house or family
  const relatedPerfumes = allPerfumes
    .filter((p) => p.id !== perfume.id && (p.house === perfume.house || p.family === perfume.family))
    .slice(0, 3);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(perfume);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // Gender label helper
  const getGenderText = (gender: string) => {
    if (gender === 'unisex') return 'para Hombres y Mujeres';
    if (gender === 'fem') return 'para Mujeres';
    return 'para Hombres';
  };

  // Default accords fallback if accords not specified
  const accords = perfume.accords || [
    { name: perfume.family, percentage: 95 },
    { name: 'Atalcado / Suave', percentage: 80 },
    { name: 'Cálido Especiado', percentage: 65 },
    { name: 'Ámbar Noble', percentage: 50 },
  ];

  // Notes pyramid
  const notes = perfume.notes || {
    top: ['Bergamota de Calabria', 'Pimienta rosa', 'Cítricos frescos'],
    heart: ['Pétalos de Jazmín', 'Rosa de Grasse', 'Flor de azahar'],
    base: ['Vainilla Bourbon', 'Sándalo de Mysore', 'Ámbar noble'],
  };

  return (
    <div className="w-full bg-[#fbf9f5] min-h-screen pt-4 sm:pt-6 pb-20">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-28 right-6 z-50 bg-[#2D5A27] text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border border-white/20">
          <span className="material-symbols-outlined text-[22px]">check_circle</span>
          <div className="text-xs font-medium">
            <span className="font-bold font-serif">{perfume.name}</span> añadido a la bolsa ({quantity} ud.)
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12">
        <div className="pt-1 pb-4 mb-5 border-b border-[#E6DED1]/70">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6E665F]">
              <nav className="flex items-center gap-2 flex-wrap">
                <Link to="/" className="hover:text-[#775a00] transition-colors">
                  Boutique
                </Link>
                <span className="text-[#E6DED1]">/</span>
                <Link to="/collection" className="hover:text-[#775a00] transition-colors">
                  Colección
                </Link>
                <span className="text-[#E6DED1]">/</span>
                <span className="text-[#B8860B] font-semibold">{perfume.house}</span>
                <span className="text-[#E6DED1]">/</span>
                <span className="text-[#1A1817] font-bold font-serif">{perfume.name}</span>
              </nav>

              <button
                onClick={() => navigate('/collection')}
                className="inline-flex items-center gap-1.5 text-xs text-[#775a00] hover:text-[#B8860B] font-semibold transition-colors group cursor-pointer self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                <span>Volver al Catálogo</span>
              </button>
            </div>

            {/* Structural Title Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1817] leading-tight flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{perfume.name}</span>
                <span className="font-normal text-[#775a00]">{perfume.house}</span>
                <span className="font-sans text-xs sm:text-sm font-medium text-[#2563EB] bg-[#EFF6FF] px-3 py-0.5 rounded-full border border-[#BFDBFE] inline-block align-middle">
                  {getGenderText(perfume.gender)}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Main Product Showcase Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Left Column: Clean Full-Space Bottle Showcase (Ocupa solo el espacio necesario para la imagen) */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 lg:sticky lg:top-24 self-start flex justify-center">
            <div className="relative w-full aspect-square max-h-[calc(100vh-140px)] max-w-[calc(100vh-140px)] sm:w-[420px] md:w-[460px] lg:w-[clamp(340px,calc(100vh-140px),460px)] rounded-3xl overflow-hidden border border-[#E6DED1]/90 shadow-md bg-[#F5F2EB] group transition-all">
              {/* Full Showcase Image occupying complete container (Limpia sin badges encima) */}
              <img
                src={imgUrl || perfume.imageUrl}
                alt={perfume.imageAlt || perfume.name}
                referrerPolicy="no-referrer"
                onError={() => {
                  setImgUrl(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDvPngHsj9BKYKVtZJzR1hyR1wks53UJxqtsECJioKaz3j0rbckJrRfzMRPLJdIC6useUVfei0VhCE1O5YQ5KHjpRi6v-xlpBCpXtgfU5CDngLnuBhQRn-3yU7bRxNYUSbuDQso2lLm3o-CDigplH3VR5K3MTNY-2qtv-5NH_UCoXM3B8L8Uj-Zua4dyfwW3l907uHQvv6OCWpmRHE2PcMF9Lc7-mLSbWwVe7L8nJ6p'
                  );
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out select-none"
              />
            </div>
          </div>

          {/* Right Column: Acordes Principales + Details (Ocupa todo el resto del espacio) */}
          <div className="flex-1 w-full min-w-0 bg-white rounded-3xl border border-[#E6DED1]/90 shadow-md p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Refined Luxury Olfactory Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#E6DED1]/60">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#775a00] bg-[#F5F2EB] px-3.5 py-1.5 rounded-full border border-[#E6DED1] shadow-2xs">
                    <span className="material-symbols-outlined text-[15px]">spa</span>
                    <span>Familia {perfume.family}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6E665F] bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-[#E6DED1]/70">
                    <span className="material-symbols-outlined text-[14px] text-[#B8860B]">verified</span>
                    <span>Autenticidad Garantizada</span>
                  </span>
                </div>

                <span className="text-xs text-[#6E665F] font-serif italic">
                  {perfume.subtitle && !perfume.subtitle.toLowerCase().includes(perfume.format.toLowerCase())
                    ? perfume.subtitle
                    : 'Edición Especial Custodiada'}
                </span>
              </div>

              {/* ACORDES PRINCIPALES (BAR CHARTS EN ESTILO ALURA) */}
              <div className="space-y-3 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DED1]/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-label-sm text-xs uppercase tracking-[0.2em] text-[#775a00] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    <span>Acordes Principales</span>
                  </h3>
                  <span className="text-[10px] text-[#6E665F] font-semibold uppercase">Intensidad Sensorial</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {accords.map((accord, idx) => {
                    // Golden gradient bar style
                    const barGradients = [
                      'from-[#775a00] to-[#B8860B]',
                      'from-[#8C6B1B] to-[#C59B27]',
                      'from-[#A37B24] to-[#D4AF37]',
                      'from-[#B8860B] to-[#E6C665]',
                      'from-[#6E665F] to-[#998F84]',
                    ];
                    const grad = barGradients[idx % barGradients.length];

                    return (
                      <div key={accord.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[#1A1817] font-semibold capitalize">{accord.name}</span>
                          <span className="font-mono text-[#6E665F] text-[11px]">{accord.percentage}%</span>
                        </div>
                        <div className="w-full h-3 bg-[#E6DED1]/50 rounded-full overflow-hidden p-0.5 border border-[#E6DED1]">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-1000 ease-out shadow-xs`}
                            style={{ width: `${accord.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dual Hero: Capacidad & Precio con la misma jerarquía de importancia */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#F5F2EB] to-[#FAF8F5] border border-[#E6DED1] shadow-xs space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E6DED1]/70">
                  {/* Capacidad Prominente */}
                  <div className="border-r border-[#E6DED1]/70 pr-3">
                    <span className="text-[10px] uppercase font-bold text-[#775a00] tracking-widest block flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">vital_signs</span>
                      <span>Capacidad / Volumen</span>
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">
                        {perfume.format.split('•')[0].trim()}
                      </span>
                      <span className="text-xs font-sans font-bold text-[#B8860B] uppercase">
                        {perfume.format.split('•')[1]?.trim() || 'Extracto'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6E665F] font-medium block mt-0.5">
                      Frasco Completo Sellado
                    </span>
                  </div>

                  {/* Precio Prominente */}
                  <div className="pl-1 sm:pl-2">
                    <span className="text-[10px] uppercase font-bold text-[#775a00] tracking-widest block flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">payments</span>
                      <span>Precio Exclusivo</span>
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">
                        ${perfume.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-sans font-semibold text-[#6E665F]">USD</span>
                    </div>
                    <span className="text-[10px] text-[#2D5A27] font-semibold block mt-0.5">
                      Ahorro directo de hasta el 85%
                    </span>
                  </div>
                </div>

                {/* Stock status & Alura replica highlight */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                  <div className="flex items-center gap-1.5 text-[#4e4635] text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[15px] text-[#B8860B]">verified</span>
                    <span>Inspiración Premium 1:1 • Mismo Olor</span>
                  </div>

                  {perfume.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F5EE] text-[#2D5A27] text-xs font-bold border border-[#2D5A27]/20 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
                      <span>Disponible</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EF] text-[#8A2E2B] text-xs font-bold border border-[#8A2E2B]/20">
                      <span className="w-2 h-2 rounded-full bg-[#8A2E2B]"></span>
                      <span>Preguntar por existencias</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Fórmula Alura: Mismo Olor • Mayor Duración • Mucho Más Barato */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6DED1] shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-[#E6DED1]/60 pb-2">
                  <span className="text-[11px] font-bold text-[#775a00] uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">science</span>
                    <span>Garantía de Fórmula Alura</span>
                  </span>
                  <span className="text-[10px] text-[#B8860B] font-serif uppercase tracking-wider font-semibold">
                    Réplica Exacta &amp; Fijación Superior
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Feature 1: Mismo Olor */}
                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E6DED1]/70">
                    <span className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00] flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                    </span>
                    <div>
                      <span className="font-serif font-bold text-xs text-[#1A1817] block leading-snug">
                        Mismo Olor
                      </span>
                      <span className="text-[10px] text-[#6E665F] block leading-tight mt-0.5">
                        Calibración 1:1 idéntica a la fórmula original de {perfume.house}.
                      </span>
                    </div>
                  </div>

                  {/* Feature 2: Mayor Duración */}
                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E6DED1]/70">
                    <span className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00] flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                    </span>
                    <div>
                      <span className="font-serif font-bold text-xs text-[#1A1817] block leading-snug">
                        Mayor Duración
                      </span>
                      <span className="text-[10px] text-[#6E665F] block leading-tight mt-0.5">
                        Mayor concentración de aceites esenciales: 8 a 12+ horas de estela viva.
                      </span>
                    </div>
                  </div>

                  {/* Feature 3: Más Barato */}
                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E6DED1]/70">
                    <span className="w-7 h-7 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#775a00] flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">savings</span>
                    </span>
                    <div>
                      <span className="font-serif font-bold text-xs text-[#1A1817] block leading-snug">
                        Más Accesible
                      </span>
                      <span className="text-[10px] text-[#6E665F] block leading-tight mt-0.5">
                        Misma experiencia de lujo a una fracción del precio comercial.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maison Reseña Olfativa */}
              <div className="space-y-2 pt-2">
                <h3 className="font-label-sm text-xs uppercase tracking-widest text-[#1A1817] font-bold">
                  Reseña Olfativa de la Maison
                </h3>
                <div className="border-l-2 border-[#c59b27] pl-4 py-1">
                  <p className="font-serif italic text-base text-[#4e4635] leading-relaxed">
                    "{perfume.description}"
                  </p>
                </div>
              </div>

              {/* Architectural Olfactory Pyramid (Pirámide Olfativa) */}
              <div className="pt-6 border-t border-[#E6DED1]/70 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-label-sm text-xs uppercase tracking-[0.2em] text-[#775a00] font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">local_florist</span>
                    <span>Pirámide Olfativa</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Top Notes */}
                  <div className="p-3.5 rounded-xl bg-[#F5F2EB]/80 border border-[#E6DED1] flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[#B8860B] mb-2">
                      <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Notas de Salida</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {notes.top.map((note) => (
                        <span key={note} className="bg-white text-[#2C2826] text-[10px] px-2 py-0.5 rounded-md font-medium border border-[#E6DED1]/60">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Heart Notes */}
                  <div className="p-3.5 rounded-xl bg-[#F5F2EB]/80 border border-[#E6DED1] flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[#775a00] mb-2">
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Corazón Sensorial</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {notes.heart.map((note) => (
                        <span key={note} className="bg-white text-[#2C2826] text-[10px] px-2 py-0.5 rounded-md font-medium border border-[#E6DED1]/60">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Base Notes */}
                  <div className="p-3.5 rounded-xl bg-[#F5F2EB]/80 border border-[#E6DED1] flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[#4e4635] mb-2">
                      <span className="material-symbols-outlined text-[16px]">park</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Fondo &amp; Estela</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {notes.base.map((note) => (
                        <span key={note} className="bg-white text-[#2C2826] text-[10px] px-2 py-0.5 rounded-md font-medium border border-[#E6DED1]/60">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Controls & Actions */}
            <div className="pt-6 border-t border-[#E6DED1] space-y-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Quantity selector */}
                <div className="flex items-center justify-between sm:justify-start border border-[#E6DED1] rounded-xl overflow-hidden bg-[#F5F2EB] shadow-xs px-2 sm:px-0">
                  <span className="sm:hidden text-xs font-semibold text-[#6E665F] pl-2">Cantidad:</span>
                  <div className="flex items-center">
                    <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-11 text-[#1A1817] hover:bg-[#eae1d4] disabled:opacity-30 transition-colors font-bold text-base cursor-pointer flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-base text-[#1A1817]">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= perfume.stock}
                      onClick={() => setQuantity((q) => Math.min(perfume.stock, q + 1))}
                      className="w-10 h-11 text-[#1A1817] hover:bg-[#eae1d4] disabled:opacity-30 transition-colors font-bold text-base cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart CTA */}
                {perfume.stock > 0 ? (
                  <button
                    onClick={handleAdd}
                    className="flex-1 w-full bg-[#775a00] hover:bg-[#B8860B] text-white py-3.5 sm:py-4 px-6 rounded-xl font-label-md text-xs uppercase tracking-wider font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    <span>Añadir a la Bolsa (${(perfume.price * quantity).toFixed(2)} USD)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`Hola, quisiera preguntar por existencias del perfume ${perfume.name} (${perfume.house})`);
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    }}
                    className="flex-1 w-full bg-[#F5F2EB] hover:bg-[#eae1d4] text-[#775a00] border border-[#E6DED1] py-3.5 sm:py-4 px-6 rounded-xl font-label-md text-xs uppercase tracking-wider font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    <span>Preguntar por existencias</span>
                  </button>
                )}
              </div>

              {/* Guarantees strip: Mismo Olor • Mayor Duración • Capacidad Íntegra */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center text-[10px] text-[#6E665F]">
                <div className="p-2.5 rounded-xl bg-[#F5F2EB]/70 border border-[#E6DED1]/70 flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#775a00]">sync</span>
                  <span className="font-semibold text-[#1A1817]">Mismo Olor 1:1</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F2EB]/70 border border-[#E6DED1]/70 flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#775a00]">schedule</span>
                  <span className="font-semibold text-[#1A1817]">Fijación +8-12h</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F2EB]/70 border border-[#E6DED1]/70 flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#775a00]">vital_signs</span>
                  <span className="font-semibold text-[#1A1817]">{perfume.format.split('•')[0].trim()} Íntegros</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations Section */}
        {relatedPerfumes.length > 0 && (
          <div className="mt-20 space-y-8">
            <div className="flex items-center justify-between border-b border-[#E6DED1] pb-4">
              <div>
                <span className="font-label-sm uppercase tracking-[0.2em] text-[#B8860B] text-[10px] font-bold block mb-1">
                  Atelier Vendôme • Recomendaciones
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1817]">
                  Creaciones Relacionadas de la Maison
                </h2>
              </div>
              <Link
                to="/collection"
                className="text-xs text-[#775a00] hover:text-[#B8860B] font-semibold uppercase tracking-wider flex items-center gap-1"
              >
                <span>Ver Catálogo Completo</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPerfumes.map((item) => (
                <article
                  key={item.id}
                  onClick={() => {
                    navigate(`/product/${item.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E6DED1]/80 hover:border-[#c59b27]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="relative w-full aspect-square bg-[#F5F2EB] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#B8860B] uppercase tracking-wider block">
                        {item.house}
                      </span>
                      <h3 className="font-serif text-xl font-semibold text-[#1A1817] group-hover:text-[#775a00] transition-colors mt-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#6E665F] line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E6DED1]/50">
                      <span className="font-bold font-mono text-base text-[#1A1817]">
                        ${item.price.toFixed(2)} USD
                      </span>
                      <span className="text-xs font-semibold text-[#775a00] uppercase tracking-wider flex items-center gap-1">
                        <span>Ver Detalle</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
