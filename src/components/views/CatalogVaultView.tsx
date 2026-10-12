import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const allPerfumes = PerfumeRepository.getAll();

  // Read URL query parameters
  const genderParam = searchParams.get('gender');
  const formatParam = searchParams.get('format');
  const samplesParam = searchParams.get('samples');
  const bestsellerParam = searchParams.get('bestsellers');
  const queryParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort');

  // Filters State
  const [selectedGender, setSelectedGender] = useState<'all' | 'fem' | 'masc'>('all');
  const [selectedFormat, setSelectedFormat] = useState<'all' | '50ml' | '100ml'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [soldoutOnly, setSoldoutOnly] = useState(false);
  const [samplesOnly, setSamplesOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(60);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<OlfactoryFamily[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [complimentarySample, setComplimentarySample] = useState('Lancôme La Vie Est Belle (2ml VIAL)');

  // Sync state whenever URL query parameters change (e.g. from NavigationBar)
  useEffect(() => {
    if (genderParam === 'fem' || genderParam === 'masc') {
      setSelectedGender(genderParam);
    } else {
      setSelectedGender('all');
    }

    if (formatParam === '50ml' || formatParam === '100ml') {
      setSelectedFormat(formatParam);
    } else {
      setSelectedFormat('all');
    }

    if (samplesParam === 'true') {
      setSamplesOnly(true);
    } else {
      setSamplesOnly(false);
    }

    if (bestsellerParam === 'true') {
      setBestsellerOnly(true);
    } else {
      setBestsellerOnly(false);
    }

    if (sortParam) {
      setSortBy(sortParam);
    }

    setCurrentPage(1);
  }, [genderParam, formatParam, samplesParam, bestsellerParam, sortParam, queryParam]);

  // Pagination & Detail Modal State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [detailPerfume, setDetailPerfume] = useState<Perfume | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active filters count for mobile indicator
  const activeFiltersCount =
    (selectedGender !== 'all' ? 1 : 0) +
    (selectedFormat !== 'all' ? 1 : 0) +
    selectedBrands.length +
    selectedFamilies.length +
    (maxPrice < 60 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (bestsellerOnly ? 1 : 0) +
    (soldoutOnly ? 1 : 0) +
    (queryParam ? 1 : 0);

  // Reset pagination on filter changes & sync with URL
  const handleGenderChange = (gender: 'all' | 'fem' | 'masc') => {
    setSelectedGender(gender);
    const newParams = new URLSearchParams(searchParams);
    if (gender === 'all') {
      newParams.delete('gender');
    } else {
      newParams.set('gender', gender);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleFormatChange = (fmt: 'all' | '50ml' | '100ml') => {
    setSelectedFormat(fmt);
    const newParams = new URLSearchParams(searchParams);
    if (fmt === 'all') {
      newParams.delete('format');
    } else {
      newParams.set('format', fmt);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleInStockChange = (checked: boolean) => {
    setInStockOnly(checked);
    setCurrentPage(1);
  };

  const handleSoldoutChange = (checked: boolean) => {
    setSoldoutOnly(checked);
    setCurrentPage(1);
  };

  const handlePriceChange = (val: number) => {
    setMaxPrice(val);
    setCurrentPage(1);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handleFamilyToggle = (family: OlfactoryFamily) => {
    setSelectedFamilies((prev) =>
      prev.includes(family) ? prev.filter((f) => f !== family) : [...prev, family]
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedGender('all');
    setSelectedFormat('all');
    setInStockOnly(false);
    setBestsellerOnly(false);
    setSoldoutOnly(false);
    setMaxPrice(60);
    setSelectedBrands([]);
    setSelectedFamilies([]);
    setSortBy('popular');
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  // Filtered & Sorted List
  const filteredPerfumes = useMemo(() => {
    let result = allPerfumes.filter((item) => {
      // Search text query
      if (queryParam) {
        const q = queryParam.toLowerCase().trim();
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesHouse = (item.house || '').toLowerCase().includes(q);
        const matchesFamily = (item.family || '').toLowerCase().includes(q);
        const matchesNotes =
          item.notes?.top?.some((n) => n.toLowerCase().includes(q)) ||
          item.notes?.heart?.some((n) => n.toLowerCase().includes(q)) ||
          item.notes?.base?.some((n) => n.toLowerCase().includes(q));
        const matchesAccords = item.accords?.some((a) => a.name.toLowerCase().includes(q));

        if (!matchesName && !matchesHouse && !matchesFamily && !matchesNotes && !matchesAccords) {
          return false;
        }
      }

      // Price
      if (item.price > maxPrice) return false;

      // Gender
      if (selectedGender !== 'all' && item.gender !== selectedGender) return false;

      // Format (50ml / 100ml)
      if (selectedFormat === '50ml' && !item.format.toLowerCase().includes('50ml')) return false;
      if (selectedFormat === '100ml' && !item.format.toLowerCase().includes('100ml')) return false;

      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.house)) return false;

      // Olfactory Family
      if (selectedFamilies.length > 0 && !selectedFamilies.includes(item.family)) return false;

      // Delivery Status
      if (inStockOnly && !soldoutOnly && item.stock === 0) return false;
      if (soldoutOnly && !inStockOnly && item.stock > 0) return false;

      // Más Vendidos
      if (bestsellerOnly && !item.isBestseller) return false;

      return true;
    });

    if (sortBy === 'popular' || sortBy === 'bestseller') {
      result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stock') {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [allPerfumes, maxPrice, selectedGender, selectedFormat, selectedBrands, selectedFamilies, inStockOnly, bestsellerOnly, soldoutOnly, sortBy, queryParam]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPerfumes.length / itemsPerPage) || 1;

  const paginatedPerfumes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPerfumes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPerfumes, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col w-full relative">
      {/* Main Storefront Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Filter Sidebar (Col 1-4 on LG, 1-3 on XL) */}
          <aside className={`lg:col-span-4 xl:col-span-3 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm space-y-6 sticky top-24 border border-[#E6DED1]">
              <div className="flex items-center justify-between pb-2 bg-[#F5F2EB]/50 p-2 rounded-lg border border-[#E6DED1]/50">
                <span className="font-title-md text-[#1A1817] flex items-center gap-1 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-[#B8860B]">tune</span>
                  Filtros del Catálogo
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="font-label-sm text-[#B8860B] hover:text-[#775a00] uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                  >
                    Restablecer
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden p-1 text-[#6E665F] hover:text-[#1A1817] rounded cursor-pointer"
                    title="Cerrar filtros"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
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
                        onChange={() => handleGenderChange('all')}
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
                        onChange={() => handleGenderChange('fem')}
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
                        onChange={() => handleGenderChange('masc')}
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

              {/* Presentación & Precio */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Presentación &amp; Precio
                </h2>
                <div className="space-y-1">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer transition-colors text-xs">
                    <span className="flex items-center gap-2 text-[#1A1817]">
                      <input
                        checked={selectedFormat === 'all'}
                        onChange={() => handleFormatChange('all')}
                        className="accent-[#775a00]"
                        name="format"
                        type="radio"
                        value="all"
                      />
                      Todos los Frascos
                    </span>
                    <span className="font-mono text-[#6E665F] text-[11px]">{allPerfumes.length}</span>
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer transition-colors text-xs">
                    <span className="flex items-center gap-2 text-[#1A1817]">
                      <input
                        checked={selectedFormat === '50ml'}
                        onChange={() => handleFormatChange('50ml')}
                        className="accent-[#775a00]"
                        name="format"
                        type="radio"
                        value="50ml"
                      />
                      50ml ($10 USD)
                    </span>
                    <span className="font-mono text-[#775a00] font-semibold text-[11px]">
                      {allPerfumes.filter((p) => p.format.toLowerCase().includes('50ml')).length}
                    </span>
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer transition-colors text-xs">
                    <span className="flex items-center gap-2 text-[#1A1817]">
                      <input
                        checked={selectedFormat === '100ml'}
                        onChange={() => handleFormatChange('100ml')}
                        className="accent-[#775a00]"
                        name="format"
                        type="radio"
                        value="100ml"
                      />
                      100ml ($15 USD)
                    </span>
                    <span className="font-mono text-[#775a00] font-semibold text-[11px]">
                      {allPerfumes.filter((p) => p.format.toLowerCase().includes('100ml')).length}
                    </span>
                  </label>
                </div>
              </div>

              {/* Estado de Entrega & Colección */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Disponibilidad &amp; Vitrina
                </h2>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer text-xs">
                    <input
                      checked={inStockOnly}
                      onChange={(e) => handleInStockChange(e.target.checked)}
                      className="accent-[#775a00] rounded"
                      type="checkbox"
                    />
                    <span className="text-[#1A1817] flex-1 font-medium">Disponibles (Inmediato)</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#F0F5EE] text-[#2D5A27]">
                      {allPerfumes.filter((p) => p.stock > 0).length}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer text-xs">
                    <input
                      checked={bestsellerOnly}
                      onChange={(e) => {
                        setBestsellerOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="accent-[#c59b27] rounded"
                      type="checkbox"
                    />
                    <span className="text-[#1A1817] flex-1 font-semibold flex items-center gap-1 text-[#775a00]">
                      <span className="text-[#c59b27]">★</span> Más Vendidos
                    </span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#FDF8EA] text-[#946E19] font-bold">
                      {allPerfumes.filter((p) => p.isBestseller).length}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F2EB] cursor-pointer text-xs">
                    <input
                      checked={soldoutOnly}
                      onChange={(e) => handleSoldoutChange(e.target.checked)}
                      className="accent-[#775a00] rounded"
                      type="checkbox"
                    />
                    <span className="text-[#1A1817] flex-1">Bajo Pedido Especial</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#FDF8EA] text-[#946E19]">
                      {allPerfumes.filter((p) => p.stock === 0).length}
                    </span>
                  </label>
                </div>
              </div>

              {/* Rango de Inversión */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] text-xs font-semibold">
                    Rango de Inversión
                  </h2>
                  <span className="font-mono text-xs font-bold text-[#775a00]">
                    ${maxPrice} USD máx
                  </span>
                </div>
                <input
                  max="60"
                  min="10"
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  step="5"
                  className="w-full accent-[#775a00] cursor-pointer"
                  type="range"
                  value={maxPrice}
                />
                <div className="flex justify-between text-[10px] text-[#6E665F] font-mono mt-1">
                  <span>$10 USD</span>
                  <span>$35 USD</span>
                  <span>$60 USD</span>
                </div>
              </div>

              {/* Casas Perfumistas */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Casas Perfumistas (Maisons)
                </h2>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {[
                    'Valentino',
                    'Lattafa Perfumes',
                    'Armaf',
                    'House of Creed',
                    'Nishane',
                    'Xerjoff',
                    'Maison Francis Kurkdjian',
                    'Parfums de Marly',
                    'Le Labo',
                    'Byredo',
                  ].map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-[#F5F2EB] cursor-pointer text-xs"
                    >
                      <input
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="accent-[#775a00] rounded"
                        type="checkbox"
                      />
                      <span className="text-[#1A1817] flex-1 truncate">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Familias Olfativas */}
              <div>
                <h2 className="font-label-md uppercase tracking-wider text-[#2C2826] mb-2 text-xs font-semibold">
                  Familia Olfativa
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      'Floral',
                      'Amaderado',
                      'Gourmand',
                      'Cuero',
                      'Cítrico',
                      'Especiado',
                    ] as OlfactoryFamily[]
                  ).map((fam) => {
                    const isSelected = selectedFamilies.includes(fam);
                    return (
                      <button
                        key={fam}
                        onClick={() => handleFamilyToggle(fam)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#775a00] text-white border-[#775a00] font-semibold'
                            : 'bg-[#F5F2EB] text-[#4e4635] border-[#E6DED1] hover:border-[#775a00]'
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

          {/* Main Catalog Grid */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border border-[#E6DED1]">
              {/* Left: Fragrance Count & Active Filter Tags */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#6E665F]">Mostrando:</span>
                  <span className="font-bold text-[#1A1817] text-sm">
                    {filteredPerfumes.length}
                  </span>
                  <span className="text-[#6E665F]">
                    {filteredPerfumes.length === 1 ? 'fragancia' : 'fragancias'}
                  </span>
                </div>

                {/* Active filter badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedGender !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF8F5] border border-[#c59b27]/60 text-[#775a00] rounded-full text-[11px] font-medium">
                      <span>{selectedGender === 'fem' ? 'Mujer' : 'Hombre'}</span>
                      <button
                        onClick={() => handleGenderChange('all')}
                        className="hover:text-red-700 cursor-pointer font-bold leading-none text-xs ml-0.5"
                        title="Quitar filtro"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {selectedFormat !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF8F5] border border-[#c59b27]/60 text-[#775a00] rounded-full text-[11px] font-medium">
                      <span>{selectedFormat === '50ml' ? '50ml ($10)' : '100ml ($15)'}</span>
                      <button
                        onClick={() => handleFormatChange('all')}
                        className="hover:text-red-700 cursor-pointer font-bold leading-none text-xs ml-0.5"
                        title="Quitar filtro"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {queryParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF8F5] border border-[#c59b27]/60 text-[#775a00] rounded-full text-[11px] font-medium">
                      <span>"{queryParam}"</span>
                      <button
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.delete('q');
                          setSearchParams(newParams);
                        }}
                        className="hover:text-red-700 cursor-pointer font-bold leading-none text-xs ml-0.5"
                        title="Borrar búsqueda"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {selectedBrands.map((brand) => (
                    <span
                      key={brand}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF8F5] border border-[#E6DED1] text-[#2C2826] rounded-full text-[11px]"
                    >
                      <span>{brand}</span>
                      <button
                        onClick={() => handleBrandToggle(brand)}
                        className="hover:text-red-700 cursor-pointer font-bold leading-none text-xs ml-0.5"
                        title="Quitar marca"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F0F5EE] border border-[#2D5A27]/30 text-[#2D5A27] rounded-full text-[11px] font-medium">
                      <span>Disponibles</span>
                      <button
                        onClick={() => handleInStockChange(false)}
                        className="hover:text-red-700 cursor-pointer font-bold leading-none text-xs ml-0.5"
                        title="Quitar filtro"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {bestsellerOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FDF8EA] border border-[#c59b27]/40 text-[#775a00] rounded-full text-[11px] font-medium">
                      <span>★ Más Vendidos</span>
                      <button
                        onClick={() => {
                          setBestsellerOnly(false);
                          setCurrentPage(1);
                        }}
                        className="hover:text-red-700 cursor-pointer font-bold leading-none text-xs ml-0.5"
                        title="Quitar filtro"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] text-[#B8860B] hover:text-[#775a00] hover:underline cursor-pointer ml-1 font-semibold"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden ml-auto flex items-center gap-1.5 px-3 py-1 bg-[#F5F2EB] hover:bg-[#eae1d4] border border-[#E6DED1] rounded-lg text-xs font-semibold text-[#1A1817] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#B8860B]">tune</span>
                  <span>Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
                </button>
              </div>

              {/* Right: Quick Format Pills & Sort Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
                {/* Quick Size Toggle */}
                <div className="hidden sm:flex items-center bg-[#F5F2EB] p-0.5 rounded-lg border border-[#E6DED1]">
                  <button
                    type="button"
                    onClick={() => handleFormatChange('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedFormat === 'all'
                        ? 'bg-white text-[#1A1817] shadow-xs'
                        : 'text-[#6E665F] hover:text-[#1A1817]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatChange('50ml')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedFormat === '50ml'
                        ? 'bg-[#775a00] text-white shadow-xs font-bold'
                        : 'text-[#6E665F] hover:text-[#1A1817]'
                    }`}
                  >
                    50ml ($10)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatChange('100ml')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedFormat === '100ml'
                        ? 'bg-[#775a00] text-white shadow-xs font-bold'
                        : 'text-[#6E665F] hover:text-[#1A1817]'
                    }`}
                  >
                    100ml ($15)
                  </button>
                </div>

                <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                  <label className="text-[#6E665F] whitespace-nowrap text-xs">Ordenar:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-[#F5F2EB] text-[#1A1817] px-3 py-1.5 rounded-lg outline-none cursor-pointer border border-[#E6DED1] text-xs font-medium"
                  >
                    <option value="popular">★ Más Vendidos / Populares</option>
                    <option value="price-asc">Menor Precio ($10 primero)</option>
                    <option value="price-desc">Mayor Precio ($15 primero)</option>
                    <option value="name-asc">Nombre (A - Z)</option>
                    <option value="stock">Entrega Inmediata</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Perfumes Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPerfumes.length === 0 ? (
                <div className="col-span-full py-16 text-center text-[#6E665F] bg-white rounded-xl border border-dashed border-[#E6DED1] p-8">
                  <span className="material-symbols-outlined text-4xl text-[#c59b27]/60 mb-2 block">search_off</span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1817]">No se encontraron fragancias</h3>
                  <p className="text-xs mt-1">Prueba a restablecer los filtros de búsqueda o registra nuevas creaciones en el Atelier.</p>
                </div>
              ) : (
                paginatedPerfumes.map((perfume) => (
                <article
                  key={perfume.id}
                  onClick={() => navigate(`/product/${perfume.id}`)}
                  className="product-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-[#E6DED1]/70 hover:border-[#c59b27]/40 cursor-pointer"
                >
                  <div className="relative w-full aspect-square bg-white overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                      alt={perfume.imageAlt || perfume.name}
                      src={perfume.imageUrl}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start text-[#B8860B] font-label-sm uppercase tracking-widest text-[10px] font-bold">
                        <span>{perfume.house}</span>
                        <span className="text-[#775a00] font-semibold bg-[#F5F2EB] px-2 py-0.5 rounded border border-[#E6DED1]">
                          {perfume.format.split('•')[0].trim()}
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-[#1A1817] mt-1 group-hover:text-[#775a00] transition-colors font-serif font-semibold text-base">
                        {perfume.name}
                      </h3>
                      <p className="font-body-sm text-[#6E665F] mt-1 line-clamp-2 text-xs">
                        {perfume.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2.5 border-t border-[#E6DED1]/60">
                      {/* Dual: Capacidad tan importante como el Precio */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-label-sm uppercase tracking-wider text-[#775a00] text-[9px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px]">vital_signs</span>
                            <span>Capacidad</span>
                          </span>
                          <span className="font-serif font-bold text-[#1A1817] text-base leading-tight mt-0.5">
                            {perfume.format.split('•')[0].trim()}
                          </span>
                        </div>

                        <div className="flex flex-col text-right">
                          <span className="font-label-sm uppercase tracking-wider text-[#6E665F] text-[9px]">
                            {perfume.stock > 0 ? 'Precio Especial' : 'Agotado'}
                          </span>
                          <span className="font-headline-sm text-[#1A1817] font-bold font-mono text-lg leading-tight mt-0.5">
                            ${perfume.price.toFixed(2)}{' '}
                            <span className="font-body-sm font-normal text-[#6E665F] text-xs">USD</span>
                          </span>
                        </div>
                      </div>

                      {/* Sub-tag de propuesta de valor */}
                      <div className="flex items-center gap-1.5 text-[10px] text-[#775a00] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E6DED1]/60">
                        <span className="material-symbols-outlined text-[13px] text-[#B8860B]">verified</span>
                        <span className="font-medium">Inspiración 1:1 • Alta Fijación</span>
                      </div>

                      {perfume.stock > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(perfume);
                          }}
                          className="w-full bg-[#775a00] text-white hover:bg-[#B8860B] font-label-md uppercase tracking-wider py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                          <span>Añadir a Bolsa</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = encodeURIComponent(`Hola Alura Parfums, quisiera solicitar bajo encargo el perfume ${perfume.name} (${perfume.house}).`);
                            window.open(`https://wa.me/?text=${msg}`, '_blank');
                          }}
                          className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#775a00] font-label-md uppercase tracking-wider py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#c59b27]/40 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          <span>Pedir por Encargo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E6DED1] flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="text-xs text-[#6E665F]">
                  Página <span className="font-bold text-[#1A1817]">{currentPage}</span> de{' '}
                  <span className="font-bold text-[#1A1817]">{totalPages}</span> • Mostrando{' '}
                  <span className="font-mono font-bold text-[#775a00]">
                    {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPerfumes.length)}
                  </span>{' '}
                  de {filteredPerfumes.length} productos
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      currentPage === 1
                        ? 'bg-[#F5F2EB] text-[#A8A096] cursor-not-allowed'
                        : 'bg-[#F5F2EB] text-[#1A1817] hover:bg-[#775a00] hover:text-white cursor-pointer'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#775a00] text-white shadow-sm font-bold'
                            : 'bg-[#F5F2EB] text-[#4e4635] hover:bg-[#eae1d4]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      currentPage === totalPages
                        ? 'bg-[#F5F2EB] text-[#A8A096] cursor-not-allowed'
                        : 'bg-[#F5F2EB] text-[#1A1817] hover:bg-[#775a00] hover:text-white cursor-pointer'
                    }`}
                  >
                    <span>Siguiente</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};
