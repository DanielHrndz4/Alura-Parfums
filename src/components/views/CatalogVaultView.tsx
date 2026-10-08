import React, { useState, useMemo } from 'react';
import { Perfume, OlfactoryFamily } from '../../types/perfume';
import { CartItem } from '../../types/sale';
import { PerfumeRepository } from '../../repositories/perfumeRepository';

interface CatalogVaultViewProps {
  cartItems: CartItem[];
  onAddToCart: (perfume: Perfume) => void;
  onRemoveFromCart: (cartItemId: string) => void;
  isCartOpen: boolean;
  onCloseCart: () => void;
  onOpenCart: () => void;
  onProceedCheckout: () => void;
}

export const CatalogVaultView: React.FC<CatalogVaultViewProps> = ({
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  isCartOpen,
  onCloseCart,
  onOpenCart,
  onProceedCheckout,
}) => {
  const allPerfumes = PerfumeRepository.getAll();

  // Filters State
  const [selectedGender, setSelectedGender] = useState<'all' | 'fem' | 'masc'>('all');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [soldoutOnly, setSoldoutOnly] = useState(false);
  const [samplesOnly, setSamplesOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(60);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<OlfactoryFamily[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [complimentarySample, setComplimentarySample] = useState('Lancôme La Vie Est Belle (2ml VIAL)');

  // Handlers
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleFamilyToggle = (family: OlfactoryFamily) => {
    setSelectedFamilies((prev) =>
      prev.includes(family) ? prev.filter((f) => f !== family) : [...prev, family]
    );
  };

  const handleResetFilters = () => {
    setSelectedGender('all');
    setInStockOnly(true);
    setSoldoutOnly(false);
    setSamplesOnly(false);
    setMaxPrice(60);
    setSelectedBrands([]);
    setSelectedFamilies([]);
    setSortBy('popular');
  };

  // Filtered & Sorted List
  const filteredPerfumes = useMemo(() => {
    let result = allPerfumes.filter((item) => {
      // Price
      if (item.price > maxPrice) return false;

      // Gender
      if (selectedGender !== 'all' && item.gender !== selectedGender) return false;

      // Brands
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.house)) return false;

      // Families
      if (selectedFamilies.length > 0 && !selectedFamilies.includes(item.family)) return false;

      // Stock
      if (inStockOnly && !soldoutOnly && item.stock <= 0) return false;
      if (!inStockOnly && soldoutOnly && item.stock > 0) return false;

      // Samples
      if (samplesOnly && !item.hasSample) return false;

      return true;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock') {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [allPerfumes, maxPrice, selectedGender, selectedBrands, selectedFamilies, inStockOnly, soldoutOnly, samplesOnly, sortBy]);

  // Cart Calculations
  const cartSubtotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div className="flex flex-col w-full relative">
      {/* Sub-Header Atelier Banner */}
      <section className="relative w-full bg-[#F5F2EB] px-4 md:px-10 py-10 overflow-hidden shadow-sm border-b border-[#E6DED1]">
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-[#775a00]/5 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-[#B8860B]/5 blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-[#B8860B] font-label-sm text-label-sm uppercase tracking-[0.2em] text-xs font-bold">
              <span className="inline-block w-2 h-2 rounded-full bg-[#B8860B] animate-pulse"></span>
              <span>Inventario Real de Bóveda • Salons Vendôme • Mayfair</span>
            </div>
            <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl md:text-4xl font-semibold">
              Catálogo General &amp; Ediciones de Bóveda
            </h1>
            <p className="font-body-md text-[#6E665F] text-sm">
              Selección viva de extractos y frascos custodiados en vitrinas climatizadas. Cada ejemplar incluye certificado de sellado y maceración verificada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-white px-6 py-4 rounded-lg shadow-sm flex items-center gap-4 border border-[#E6DED1]">
              <div className="w-10 h-10 rounded-full bg-[#F0F5EE] flex items-center justify-center text-[#2D5A27]">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
              <div>
                <div className="font-title-md text-[#1A1817] flex items-center gap-1 text-sm font-semibold">
                  <span>15</span>
                  <span className="font-body-sm text-[#6E665F] font-normal text-xs">Fragancias Curadas</span>
                </div>
                <div className="font-label-sm text-[#2D5A27] uppercase font-bold tracking-wider text-[10px]">
                  11 Disponibles para Envío Inmediato
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="bg-[#775a00] text-white hover:bg-[#B8860B] px-6 py-4 rounded-lg shadow-sm transition-all flex items-center gap-2 font-label-md uppercase tracking-wider text-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>Bolsa Activa ({cartItems.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Storefront Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filter Sidebar (Col 1-3) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-6 sticky top-48 border border-[#E6DED1]">
              <div className="flex items-center justify-between pb-2 bg-[#F5F2EB]/50 p-2 rounded-lg border border-[#E6DED1]/50">
                <span className="font-title-md text-[#1A1817] flex items-center gap-1 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-[#B8860B]">tune</span>
                  Filtros de Bóveda
                </span>
                <button
                  onClick={handleResetFilters}
                  className="font-label-sm text-[#B8860B] hover:text-[#775a00] uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                >
                  Restablecer
                </button>
              </div>

              {/* Género */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Género &amp; Estilo
                </h2>
                <div className="space-y-1">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer transition-colors text-xs">
                    <span className="flex items-center gap-2 text-[#1A1817]">
                      <input
                        checked={selectedGender === 'all'}
                        onChange={() => setSelectedGender('all')}
                        className="accent-[#775a00]"
                        name="gender"
                        type="radio"
                        value="all"
                      />
                      Todos
                    </span>
                    <span className="font-mono text-[#6E665F]">15</span>
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer transition-colors text-xs">
                    <span className="flex items-center gap-2 text-[#1A1817]">
                      <input
                        checked={selectedGender === 'fem'}
                        onChange={() => setSelectedGender('fem')}
                        className="accent-[#775a00]"
                        name="gender"
                        type="radio"
                        value="fem"
                      />
                      Femenino
                    </span>
                    <span className="font-mono text-[#6E665F]">9</span>
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer transition-colors text-xs">
                    <span className="flex items-center gap-2 text-[#1A1817]">
                      <input
                        checked={selectedGender === 'masc'}
                        onChange={() => setSelectedGender('masc')}
                        className="accent-[#775a00]"
                        name="gender"
                        type="radio"
                        value="masc"
                      />
                      Masculino
                    </span>
                    <span className="font-mono text-[#6E665F]">6</span>
                  </label>
                </div>
              </div>

              {/* Disponibilidad */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Disponibilidad en Vitrina
                </h2>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer text-xs">
                    <input
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="accent-[#775a00] rounded"
                      type="checkbox"
                    />
                    <span className="text-[#1A1817] flex-1">En Stock Inmediato</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#F0F5EE] text-[#2D5A27]">
                      11
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer text-xs">
                    <input
                      checked={soldoutOnly}
                      onChange={(e) => setSoldoutOnly(e.target.checked)}
                      className="accent-[#775a00] rounded"
                      type="checkbox"
                    />
                    <span className="text-[#1A1817] flex-1">Lista de Espera / Pre-orden</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#FDF8EA] text-[#946E19]">
                      4
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer text-xs">
                    <input
                      checked={samplesOnly}
                      onChange={(e) => setSamplesOnly(e.target.checked)}
                      className="accent-[#775a00] rounded"
                      type="checkbox"
                    />
                    <span className="text-[#1A1817] flex-1">Con Muestra / Tester</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#F5F2EB] text-[#B8860B]">
                      4
                    </span>
                  </label>
                </div>
              </div>

              {/* Rango de Precio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] text-xs font-semibold">
                    Rango de Inversión
                  </h2>
                  <span className="font-mono text-xs text-[#1A1817] font-semibold">
                    ${maxPrice} USD máx
                  </span>
                </div>
                <input
                  className="w-full accent-[#775a00] bg-[#F5F2EB] h-1.5 rounded-lg appearance-none cursor-pointer"
                  max={60}
                  min={10}
                  step={5}
                  type="range"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="flex justify-between font-label-sm text-[#6E665F] mt-1 text-[10px]">
                  <span>$10 USD</span>
                  <span>$35 USD</span>
                  <span>$60 USD</span>
                </div>
              </div>

              {/* Casas Olfativas */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Casas Olfativas
                </h2>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-xs text-[#1A1817]">
                  {[
                    { name: 'Lattafa Perfumes', count: 5 },
                    { name: 'Valentino', count: 1 },
                    { name: 'Le Labo', count: 1 },
                    { name: 'House of Creed', count: 1 },
                    { name: 'Christian DIOR', count: 1 },
                    { name: 'Lancôme Paris', count: 1 },
                    { name: 'Carolina Herrera', count: 1 },
                    { name: 'Marc Jacobs', count: 1 },
                    { name: 'Armaf', count: 1 },
                    { name: 'Emporio Armani', count: 1 },
                    { name: 'Paris Hilton', count: 1 },
                  ].map((brand) => (
                    <label
                      key={brand.name}
                      className="flex items-center justify-between hover:bg-[#F5F2EB] p-1.5 rounded cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() => handleBrandToggle(brand.name)}
                          className="accent-[#775a00]"
                          type="checkbox"
                        />
                        {brand.name}
                      </span>
                      <span className="text-[#6E665F] font-mono">{brand.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Capacidad & Frasco */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Capacidad &amp; Frasco
                </h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-[#F5F2EB] hover:bg-[#eae1d4] cursor-pointer text-[#1A1817] transition-colors">
                    100ml (9)
                  </span>
                  <span className="px-2 py-1 rounded bg-[#F5F2EB] hover:bg-[#eae1d4] cursor-pointer text-[#1A1817] transition-colors">
                    50ml (6)
                  </span>
                  <span className="px-2 py-1 rounded bg-[#F5F2EB] hover:bg-[#eae1d4] cursor-pointer text-[#1A1817] transition-colors">
                    Testers / Decants
                  </span>
                </div>
              </div>

              {/* Familias Olfativas Chips */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Familia Olfativa
                </h2>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {(['Floral', 'Amaderado', 'Gourmand', 'Cuero', 'Cítrico', 'Especiado'] as OlfactoryFamily[]).map((fam) => {
                    const isSelected = selectedFamilies.includes(fam);
                    return (
                      <button
                        key={fam}
                        onClick={() => handleFamilyToggle(fam)}
                        className={`px-2 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#775a00] text-white font-semibold'
                            : 'bg-[#F5F2EB] text-[#6E665F] hover:text-[#1A1817]'
                        }`}
                      >
                        {fam}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Catalog Grid (Col 4-12) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#E6DED1]">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6E665F]">Mostrando:</span>
                <span className="font-mono text-[#1A1817] font-bold">
                  {filteredPerfumes.length} Piezas Maestras
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#B8860B]"></span>
                <span className="text-[#B8860B] font-label-sm uppercase tracking-wider font-semibold">
                  Cotejo en Directo
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
                <label className="text-[#6E665F] whitespace-nowrap">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F5F2EB] text-[#1A1817] px-3 py-1.5 rounded-lg outline-none cursor-pointer border border-[#E6DED1]"
                >
                  <option value="popular">Más Populares (Atelier Vendôme)</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="stock">Disponibilidad Inmediata</option>
                </select>
              </div>
            </div>

            {/* Perfumes Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPerfumes.map((perfume) => (
                <article
                  key={perfume.id}
                  className="product-card group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#E6DED1]/70"
                >
                  <div className="relative bg-[#F5F2EB] p-6 flex flex-col items-center justify-center min-h-[220px]">
                    {perfume.categoryTag && (
                      <span className="absolute top-3 left-3 bg-[#775a00] text-white font-label-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm font-semibold">
                        {perfume.categoryTag}
                      </span>
                    )}

                    {perfume.hasSample && (
                      <span className="absolute top-3 right-3 bg-[#F0F5EE] text-[#2D5A27] font-label-sm text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[12px]">science</span> Muestra Activa
                      </span>
                    )}

                    {perfume.stock === 0 && !perfume.hasSample && (
                      <span className="absolute top-3 right-3 bg-[#FAF0EF] text-[#8A2E2B] font-label-sm text-[10px] px-2 py-0.5 rounded font-semibold">
                        Agotado
                      </span>
                    )}

                    <img
                      className={`h-44 object-contain group-hover:scale-105 transition-transform duration-500 ${
                        perfume.stock === 0 ? 'opacity-80' : ''
                      }`}
                      alt={perfume.imageAlt}
                      src={perfume.imageUrl}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start text-[#B8860B] font-label-sm uppercase tracking-widest text-[10px] font-bold">
                        <span>{perfume.house}</span>
                        <span className="text-[#6E665F] font-normal">{perfume.format}</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-[#1A1817] mt-1 group-hover:text-[#775a00] transition-colors font-serif font-semibold text-base">
                        {perfume.name}
                      </h3>
                      <p className="font-body-sm text-[#6E665F] mt-1 line-clamp-2 text-xs">
                        {perfume.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#E6DED1]/50">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px]">
                            {perfume.stock > 0 ? 'Precio Botella' : 'Precio Bóveda'}
                          </span>
                          <span className="font-headline-sm text-[#1A1817] font-bold font-mono text-lg">
                            ${perfume.price.toFixed(2)}{' '}
                            <span className="font-body-sm font-normal text-[#6E665F] text-xs">USD</span>
                          </span>
                        </div>
                        <div className="text-right">
                          {perfume.stock > 0 ? (
                            <span className="font-label-sm text-[#2D5A27] bg-[#F0F5EE] px-2 py-1 rounded text-[10px] font-bold">
                              {perfume.stock} en vitrina
                            </span>
                          ) : (
                            <span className="font-label-sm text-[#8A2E2B] bg-[#FAF0EF] px-2 py-1 rounded text-[10px] font-semibold">
                              Agotado
                            </span>
                          )}
                        </div>
                      </div>

                      {perfume.stock > 0 ? (
                        <button
                          onClick={() => onAddToCart(perfume)}
                          className="w-full bg-[#775a00] text-white hover:bg-[#B8860B] font-label-md uppercase tracking-wider py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                          <span>Añadir a Bolsa</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddToCart(perfume)}
                          className="w-full bg-[#F5F2EB] hover:bg-[#eae1d4] text-[#2C2826] font-label-md uppercase tracking-wider py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
                          <span>Apartar con 50% (${(perfume.price * 0.5).toFixed(2)})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </section>

      {/* VIP Concierge & Reserve Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 pb-12 w-full">
        <div className="relative bg-[#F5F2EB] rounded-2xl p-8 md:p-12 overflow-hidden shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#E6DED1]">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="flex items-center gap-2 text-[#B8860B] font-label-sm uppercase tracking-widest text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Conciergerie Privée • Place Vendôme</span>
            </div>
            <h2 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-2xl md:text-3xl font-semibold">
              ¿Buscas una pieza agotada o cosecha descontinuada?
            </h2>
            <p className="font-body-md text-[#6E665F] leading-relaxed text-sm">
              Nuestro servicio de Concierge gestiona lotes directos con aduana, coleccionistas europeos y casas mayoristas en París, Grasse y Dubái para obtener cualquier extracto con procedencia verificada.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => alert('[CONCIERGE PRIVÉ]\n\nSolicitud enviada al Maestro Curador de Bóveda en Place Vendôme.')}
                className="bg-[#775a00] text-white hover:bg-[#B8860B] px-6 py-2.5 rounded-lg transition-all font-label-md uppercase tracking-wider shadow-sm flex items-center gap-2 text-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Contactar Concierge Privado
              </button>
              <a
                className="font-label-md text-[#B8860B] hover:text-[#1A1817] uppercase tracking-wider transition-colors flex items-center gap-1 text-xs font-semibold"
                href="#auth"
              >
                <span>Protocolo de Autenticidad</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white p-6 rounded-xl shadow-sm relative z-10 space-y-2 border border-[#E6DED1]">
            <div className="font-label-md uppercase tracking-wider text-[#2C2826] text-xs font-semibold">
              Tiempos de Adquisición
            </div>
            <div className="space-y-2 font-body-sm text-[#6E665F] text-xs">
              <div className="flex justify-between">
                <span>París • Grasse</span>
                <span className="font-bold text-[#1A1817]">4 - 6 días hábiles</span>
              </div>
              <div className="flex justify-between">
                <span>Dubái • Emiratos</span>
                <span className="font-bold text-[#1A1817]">5 - 8 días hábiles</span>
              </div>
              <div className="flex justify-between">
                <span>Cosechas Privadas</span>
                <span className="font-bold text-[#1A1817]">Sobre Solicitud</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide-out Cart Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between border-l border-[#E6DED1] ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 bg-[#F5F2EB] flex items-center justify-between border-b border-[#E6DED1]">
          <div>
            <h3 className="font-headline-sm text-[#1A1817] font-serif text-lg font-semibold">
              Bolsa del Atelier
            </h3>
            <p className="font-label-sm text-[#B8860B] uppercase tracking-wider text-[10px] font-bold">
              Envío de Alta Perfumería Incluido
            </p>
          </div>
          <button
            onClick={onCloseCart}
            className="w-8 h-8 rounded-full bg-white border border-[#E6DED1] flex items-center justify-center text-[#6E665F] hover:text-[#1A1817] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-[#6E665F]">
              <span className="material-symbols-outlined text-4xl text-[#E6DED1] mb-2">shopping_bag</span>
              <p className="text-sm font-medium">Su bolsa está vacía</p>
              <p className="text-xs mt-1">Seleccione un extracto o decant para añadirlo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-[#F5F2EB]/50 p-3 rounded-lg border border-[#E6DED1]/70"
                >
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-1 border border-[#E6DED1]">
                    <span className="material-symbols-outlined text-[24px] text-[#B8860B]">
                      local_florist
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-title-md text-[#1A1817] text-xs font-semibold">
                      {item.name}
                    </div>
                    <div className="font-body-sm text-[#6E665F] text-[11px]">
                      {item.format} • {item.quantity} unidad{item.quantity > 1 ? 'es' : ''}
                    </div>
                    <div className="font-mono text-[#1A1817] font-bold mt-0.5 text-xs">
                      ${(item.price * item.quantity).toFixed(2)} USD
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-[#6E665F] hover:text-[#8A2E2B] transition-colors p-1"
                    title="Eliminar de la bolsa"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Complimentary Sample Selection Box */}
          <div className="bg-[#F5F2EB] p-4 rounded-xl space-y-2 border border-[#E6DED1]">
            <div className="flex items-center gap-1.5 text-[#B8860B] font-label-md uppercase tracking-wider text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">redeem</span>
              <span>Muestra de Cortesía Alura (2ml)</span>
            </div>
            <p className="font-body-sm text-[#6E665F] text-xs">
              Selecciona una muestra sellada en tubo de vidrio artesanal para acompañar tu orden:
            </p>
            <select
              value={complimentarySample}
              onChange={(e) => setComplimentarySample(e.target.value)}
              className="w-full bg-white text-[#1A1817] font-body-sm text-xs p-2 rounded-lg outline-none border border-[#E6DED1]"
            >
              <option value="Lancôme La Vie Est Belle (2ml VIAL)">Lancôme La Vie Est Belle (2ml VIAL)</option>
              <option value="Lattafa Yara Candy (2ml VIAL)">Lattafa Yara Candy (2ml VIAL)</option>
              <option value="Lattafa Yara Tous (2ml VIAL)">Lattafa Yara Tous (2ml VIAL)</option>
              <option value="Valentino Donna Born in Roma (2ml VIAL)">Valentino Donna Born in Roma (2ml VIAL)</option>
            </select>
          </div>
        </div>

        {/* Drawer Footer / Calculations */}
        <div className="p-6 bg-[#F5F2EB]/80 space-y-4 border-t border-[#E6DED1]">
          <div className="space-y-1 font-body-sm text-[#6E665F] text-xs">
            <div className="flex justify-between">
              <span>Subtotal Inventario</span>
              <span className="font-mono text-[#1A1817] font-bold">${cartSubtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span>Seguro de Bóveda &amp; Tránsito</span>
              <span className="text-[#2D5A27] font-medium">Bonificado</span>
            </div>
            <div className="flex justify-between">
              <span>Muestra de Cortesía (2ml)</span>
              <span className="text-[#2D5A27] font-medium">Gratis</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E6DED1] text-base text-[#1A1817] font-bold font-mono">
              <span>Total</span>
              <span>${cartSubtotal.toFixed(2)} USD</span>
            </div>
          </div>

          <button
            onClick={onProceedCheckout}
            disabled={cartItems.length === 0}
            className="w-full bg-[#775a00] text-white hover:bg-[#B8860B] font-label-md uppercase tracking-wider py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            <span>Proceder al Pago Seguro</span>
            <span className="material-symbols-outlined text-[18px]">lock</span>
          </button>

          <div className="flex items-center justify-center gap-4 text-[#6E665F] font-label-sm uppercase tracking-wider text-[10px]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shield</span> Garantía 100% Original
            </span>
            <span>•</span>
            <span>Entrega Express 24/48h</span>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {isCartOpen && (
        <div
          onClick={onCloseCart}
          className="fixed inset-0 bg-[#1A1817]/40 backdrop-blur-xs z-40 transition-opacity"
        ></div>
      )}
    </div>
  );
};
