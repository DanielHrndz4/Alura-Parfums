import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { Perfume } from '../../types/perfume';
import { getFragranticaAccordColor } from '../../services/geminiService';
import { WhenToWearCard } from '../common/WhenToWearCard';

interface ProductDetailViewProps {
  onAddToCart: (perfume: Perfume, quantity?: number) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Sibling format detection (e.g. 50ml vs 100ml for the exact same fragrance)
  const cleanName = (perfume.name || '').trim().toLowerCase();
  const cleanHouse = (perfume.house || '').trim().toLowerCase();
  const siblingPerfume = allPerfumes.find(
    (p) =>
      p.id !== perfume.id &&
      (p.name || '').trim().toLowerCase() === cleanName &&
      (p.house || '').trim().toLowerCase() === cleanHouse
  );

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

  // Real accords only - never invent dummy accords
  const accords = perfume.accords && perfume.accords.length > 0 ? perfume.accords : [];

  // Notes pyramid - only real notes
  const notes = perfume.notes || { top: [], heart: [], base: [] };
  const hasNotes = Boolean(
    (notes.top && notes.top.length > 0) ||
    (notes.heart && notes.heart.length > 0) ||
    (notes.base && notes.base.length > 0)
  );

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

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {(location.state as any)?.fromAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/inventory', { state: { editPerfumeId: perfume.id } })}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6E665F] hover:text-[#1A1817] font-medium transition-colors bg-white hover:bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E6DED1] hover:border-[#c59b27] cursor-pointer shadow-2xs"
                  title={`Editar datos de ${perfume.name}`}
                >
                  <span className="material-symbols-outlined text-[15px] text-[#775a00]">edit</span>
                  <span>Editar</span>
                </button>
              )}

              <button
                onClick={() => navigate('/collection')}
                className="inline-flex items-center gap-1 text-xs text-[#775a00] hover:text-[#B8860B] font-semibold transition-colors group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                <span>Volver al Catálogo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Product Showcase Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Left Column: Clean Full-Space Bottle Showcase (Ocupa solo el espacio necesario para la imagen) */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 lg:sticky lg:top-24 self-start flex justify-center">
            <div className="relative w-full aspect-square max-h-[calc(100vh-140px)] max-w-[calc(100vh-140px)] sm:w-[420px] md:w-[460px] lg:w-[clamp(340px,calc(100vh-140px),460px)] rounded-3xl overflow-hidden border border-[#E6DED1]/90 shadow-md bg-white group transition-all">
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
          <div className="flex-1 w-full min-w-0 bg-white rounded-3xl border border-[#E6DED1]/90 shadow-md p-6 sm:p-8 lg:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Title & Refined Luxury Olfactory Header: Título a la derecha arriba de la familia */}
              <div className="space-y-3.5 border-b border-[#E6DED1]/60">
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1817] leading-tight flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span>{perfume.name}</span>
                  <span className="font-normal text-[#775a00]">{perfume.house}</span>
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#2563EB] bg-[#EFF6FF] px-3 py-0.5 rounded-full border border-[#BFDBFE] inline-block align-middle">
                    {getGenderText(perfume.gender)}
                  </span>
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#775a00] bg-[#F5F2EB] px-3.5 py-1.5 rounded-full border border-[#E6DED1] shadow-2xs">
                      <span className="material-symbols-outlined text-[15px]">spa</span>
                      <span>Familia {perfume.family}</span>
                    </span>

                    {/* Concentration Badge (Eau de Parfum, Extrait, EDT, etc.) */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1817] bg-[#F5F2EB] px-3.5 py-1.5 rounded-full border border-[#E6DED1] shadow-2xs">
                      <span className="material-symbols-outlined text-[15px] text-[#775a00]">water_drop</span>
                      <span>
                        {perfume.concentration ||
                          (perfume.format?.includes('•')
                            ? perfume.format.split('•')[1].trim()
                            : perfume.format?.includes('Extrait')
                            ? 'Extrait de Parfum'
                            : perfume.format?.includes('EDT') || perfume.format?.includes('Toilette')
                            ? 'Eau de Toilette'
                            : perfume.format?.includes('Elixir')
                            ? 'Elixir'
                            : 'Eau de Parfum')}
                      </span>
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
              </div>

              {/* ACORDES PRINCIPALES (BAR CHARTS EN ESTILO ALURA) */}
              {accords.length > 0 && (
                <div className="space-y-3 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DED1]/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-label-sm text-xs uppercase tracking-[0.2em] text-[#775a00] font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                      <span>Acordes Principales</span>
                    </h3>
                    <span className="text-[10px] text-[#6E665F] font-semibold uppercase">Intensidad Sensorial</span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {accords.map((accord) => {
                      const color = accord.color || getFragranticaAccordColor(accord.name);
                      const isLightColor =
                        color === '#FDD835' ||
                        color === '#FBC02D' ||
                        color === '#C7A75C' ||
                        color === '#80CBC4' ||
                        color === '#80DEEA' ||
                        color === '#81D4FA' ||
                        color === '#B39DDB' ||
                        color === '#D4C5A9' ||
                        color === '#D7CCC8';
                      const textColor = isLightColor ? '#1A1817' : '#FFFFFF';

                      return (
                        <div key={accord.name} className="flex items-center group">
                          <div
                            className="h-7 sm:h-7.5 flex items-center justify-between px-3.5 transition-all duration-500 ease-out shadow-xs rounded-r-md hover:brightness-110 cursor-default"
                            style={{
                              width: `${Math.max(34, Math.min(100, accord.percentage))}%`,
                              backgroundColor: color,
                            }}
                          >
                            <span
                              className="text-xs font-bold tracking-wide whitespace-nowrap capitalize drop-shadow-xs"
                              style={{ color: textColor }}
                            >
                              {accord.name}
                            </span>
                            <span
                              className="font-mono text-[10px] font-bold opacity-90 pl-2"
                              style={{ color: textColor }}
                            >
                              {accord.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CUÁNDO USARLO (TEMPORALIDAD & OCASIÓN SEGÚN FRAGRANTICA) */}
              {perfume.whenToWear && perfume.whenToWear.length > 0 && (
                <WhenToWearCard items={perfume.whenToWear} variant="dark" />
              )}

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

                {/* Alura replica highlight */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                  <div className="flex items-center gap-1.5 text-[#4e4635] text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[15px] text-[#B8860B]">verified</span>
                    <span>Inspiración Premium 1:1 • Mismo Olor</span>
                  </div>
                </div>

                {/* Si existe el otro tamaño en vitrina, enlace sutil y elegante */}
                {siblingPerfume && (
                  <div className="pt-3 border-t border-[#E6DED1]/70 flex items-center justify-between text-xs">
                    <span className="text-[#6E665F]">
                      También disponible en {siblingPerfume.format.split('•')[0].trim()}:
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/perfume/${siblingPerfume.id}`)}
                      className="inline-flex items-center gap-1 font-semibold text-[#775a00] hover:text-[#B8860B] transition-colors cursor-pointer"
                    >
                      <span>Ver versión ({siblingPerfume.price.toFixed(2)} USD)</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                )}
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
              {hasNotes && (
                <div className="pt-6 border-t border-[#E6DED1]/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-label-sm text-xs uppercase tracking-[0.2em] text-[#775a00] font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">local_florist</span>
                      <span>Pirámide Olfativa</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Top Notes */}
                    {notes.top && notes.top.length > 0 && (
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
                    )}

                    {/* Heart Notes */}
                    {notes.heart && notes.heart.length > 0 && (
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
                    )}

                    {/* Base Notes */}
                    {notes.base && notes.base.length > 0 && (
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
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Controls & Actions */}
            <div className="pt-6 border-t border-[#E6DED1] space-y-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Quantity selector (solo si hay stock disponible) */}
                {perfume.stock > 0 && (
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
                )}

                {/* Add to Cart CTA or Consultar Disponibilidad */}
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
                      const msg = encodeURIComponent(`Hola Alura Parfums, quisiera consultar la disponibilidad del perfume ${perfume.name} (${perfume.house}).`);
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    }}
                    className="flex-1 w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#775a00] border-2 border-[#c59b27]/60 py-3.5 sm:py-4 px-6 rounded-xl font-label-md text-xs uppercase tracking-wider font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[22px] text-[#B8860B]">chat</span>
                    <span>Consultar Disponibilidad</span>
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
