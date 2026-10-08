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
          El ejemplar de bóveda solicitado no se encuentra registrado en el sistema del Atelier.
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
    <div className="w-full bg-[#fbf9f5] min-h-screen pt-10 pb-20">
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
        {/* Sticky Header Strip (Fijo y estático al topar el header) */}
        <div className="sticky top-[160px] z-30 bg-[#fbf9f5]/95 backdrop-blur-md pt-3 pb-4 mb-6 border-b border-[#E6DED1]/70 -mx-6 sm:-mx-8 md:-mx-10 lg:-mx-12 px-6 sm:px-8 md:px-10 lg:px-12 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all">
          <div className="flex flex-col gap-2.5">
            {/* Navigation Breadcrumb Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6E665F]">
              <nav className="flex items-center gap-2 flex-wrap">
                <Link to="/" className="hover:text-[#775a00] transition-colors">
                  Boutique
                </Link>
                <span className="text-[#E6DED1]">/</span>
                <Link to="/collection" className="hover:text-[#775a00] transition-colors">
                  Colección Bóveda
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Clean Large Sticky Bottle Showcase (Siempre visible al hacer scroll) */}
          <div className="lg:col-span-5 xl:col-span-6 lg:sticky lg:top-[280px] self-start">
            <div className="bg-[#F5F2EB] rounded-3xl border border-[#E6DED1]/90 shadow-md p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] group transition-all">
              {/* Luxury Badge Tag */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#E6DED1] shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-[#775a00]">workspace_premium</span>
                <span className="font-label-sm text-[10px] uppercase font-bold tracking-widest text-[#775a00]">
                  Pieza de Bóveda
                </span>
              </div>

              {perfume.isBestseller && (
                <div className="absolute top-5 right-5 z-10 bg-[#775a00] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span>Bestseller</span>
                </div>
              )}

              {/* Large Bottle Container */}
              <div className="w-full flex items-center justify-center py-4 my-auto">
                <img
                  src={imgUrl || perfume.imageUrl}
                  alt={perfume.imageAlt || perfume.name}
                  onError={() => {
                    setImgUrl(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvPngHsj9BKYKVtZJzR1hyR1wks53UJxqtsECJioKaz3j0rbckJrRfzMRPLJdIC6useUVfei0VhCE1O5YQ5KHjpRi6v-xlpBCpXtgfU5CDngLnuBhQRn-3yU7bRxNYUSbuDQso2lLm3o-CDigplH3VR5K3MTNY-2qtv-5NH_UCoXM3B8L8Uj-Zua4dyfwW3l907uHQvv6OCWpmRHE2PcMF9Lc7-mLSbWwVe7L8nJ6p'
                    );
                  }}
                  className="w-full h-auto max-h-[420px] sm:max-h-[480px] lg:max-h-[520px] object-contain drop-shadow-[0_20px_35px_rgba(26,24,23,0.18)] group-hover:scale-105 transition-all duration-700 ease-out select-none"
                />
              </div>

              {/* Format & Subtitle Caption */}
              <div className="mt-4 text-center">
                <span className="text-[11px] font-serif uppercase tracking-[0.2em] font-semibold text-[#8C827A]">
                  {perfume.format}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Maison Logo + Acordes Principales + Details */}
          <div className="lg:col-span-7 xl:col-span-6 bg-white rounded-3xl border border-[#E6DED1]/90 shadow-md p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Header Badge & Format */}
              <div className="flex items-center justify-between gap-4">
                <div className="bg-[#F5F2EB] px-4 py-2 rounded-xl border border-[#E6DED1] text-center">
                  <span className="font-serif font-bold text-base text-[#1A1817] block leading-none">
                    {perfume.house}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#B8860B] font-bold block mt-1">
                    HAUTE PARFUMERIE
                  </span>
                </div>

                <span className="font-label-sm uppercase text-[#4e4635] bg-[#F5F2EB] px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#E6DED1]">
                  Familia: {perfume.family}
                </span>
              </div>

              {/* Format & Subtitle */}
              <p className="text-xs text-[#6E665F] font-semibold tracking-wide uppercase border-b border-[#E6DED1]/60 pb-3">
                {perfume.format} • {perfume.subtitle || 'Edición de Bóveda Custodiada'}
              </p>

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

              {/* Pricing & Stock Card */}
              <div className="p-5 rounded-2xl bg-[#F5F2EB]/80 border border-[#E6DED1] flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E665F] tracking-widest block">
                    Precio de Vitrina Atelier
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">
                      ${perfume.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-sans font-semibold text-[#6E665F]">USD</span>
                  </div>
                </div>

                <div>
                  {perfume.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0F5EE] text-[#2D5A27] text-xs font-bold border border-[#2D5A27]/20 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
                      {perfume.stock} {perfume.stock === 1 ? 'unidad en vitrina' : 'unidades en vitrina'}
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-[#FAF0EF] text-[#8A2E2B] text-xs font-bold border border-[#8A2E2B]/20">
                      Agotado Temporalmente
                    </span>
                  )}
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
              <div className="flex items-center gap-4">
                {/* Quantity selector */}
                <div className="flex items-center border border-[#E6DED1] rounded-xl overflow-hidden bg-[#F5F2EB] shadow-xs">
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

                {/* Add to Cart CTA */}
                {perfume.stock > 0 ? (
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-[#775a00] hover:bg-[#B8860B] text-white py-4 px-6 rounded-xl font-label-md text-xs uppercase tracking-wider font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    <span>Añadir a la Bolsa (${(perfume.price * quantity).toFixed(2)} USD)</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-[#E6DED1] text-[#6E665F] py-4 px-6 rounded-xl font-label-md text-xs uppercase tracking-wider font-semibold cursor-not-allowed text-center"
                  >
                    Agotado en Vitrina
                  </button>
                )}
              </div>

              {/* Guarantees strip */}
              <div className="grid grid-cols-3 gap-3 text-center text-[10px] text-[#6E665F]">
                <div className="p-2.5 rounded-xl bg-[#F5F2EB]/60 border border-[#E6DED1]/60 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#775a00]">verified</span>
                  <span className="font-medium">100% Auténtico</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F2EB]/60 border border-[#E6DED1]/60 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#775a00]">local_shipping</span>
                  <span className="font-medium">Envío de Prestige</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F2EB]/60 border border-[#E6DED1]/60 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#775a00]">card_giftcard</span>
                  <span className="font-medium">Muestra Incluida</span>
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
