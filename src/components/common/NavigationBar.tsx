import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

interface NavigationBarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  onOpenCart?: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeView,
  onNavigate,
  cartCount,
  onOpenCart,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/collection?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/collection');
    }
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Header top position (slides up past ticker when scrolled down)
      setIsScrolled(currentScrollY > 5);

      // Category links bar visibility:
      // Show when at the top or when scrolling up; hide when scrolling down
      if (currentScrollY <= 20) {
        setShowCategories(true);
      } else if (currentScrollY > lastScrollY + 6) {
        // Scrolling down -> hide categories bar
        setShowCategories(false);
      } else if (currentScrollY < lastScrollY - 6) {
        // Scrolling up -> show categories bar
        setShowCategories(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Topmost Luxury Ticker */}
      <div className="w-full bg-[#F5F2EB]/80 px-3 sm:px-6 md:px-10 border-b border-[#E6DED1]/40 relative z-30">
        <div className="max-w-[1760px] mx-auto h-7 sm:h-8 flex items-center justify-between text-[#4e4635] font-label-sm uppercase tracking-widest text-[9px] sm:text-[10px]">
          <span className="truncate max-w-[280px] sm:max-w-none">Contratipos de Alta Gama • Misma Esencia • Frascos de 50ml ($10) y 100ml ($15 USD)</span>
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <a
              href="https://www.instagram.com/alurasparfums"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#775a00] transition-colors flex items-center gap-1 font-medium lowercase"
              title="Instagram @alurasparfums"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="hidden sm:inline">Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/alurasparfums"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#775a00] transition-colors flex items-center gap-1 font-medium"
              title="Facebook Alura Parfums"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="hidden sm:inline">Facebook</span>
            </a>
            <span className="text-[#775a00] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]">verified</span>
              <span>Fijación +12h</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        className={`fixed left-0 w-full z-50 bg-[#fbf9f5]/95 backdrop-blur-xl border-b border-[#E6DED1]/40 transition-all duration-300 ease-out ${
          isScrolled
            ? 'top-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
            : 'top-7 sm:top-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
        }`}
      >

      {/* Main Bar */}
      <div className="h-16 sm:h-20 max-w-[1760px] mx-auto px-3 sm:px-6 md:px-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-1">
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center w-36 sm:w-48 md:w-64">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-[#1b1c1a] placeholder:text-[#6E665F] font-body-sm text-xs pl-8 pr-6 py-1.5 rounded-lg border border-[#E6DED1]/60 outline-none focus:border-[#c59b27] transition-all"
              placeholder="Buscar fragancia..."
              type="search"
            />
            <span className="material-symbols-outlined absolute left-2 text-[16px] text-[#6E665F] pointer-events-none">
              search
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  if (searchParams.get('q')) {
                    navigate('/collection');
                  }
                }}
                className="absolute right-2 text-[#6E665F] hover:text-[#1A1817] text-xs font-bold cursor-pointer"
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </form>
          <div className="hidden lg:flex items-center gap-1 font-label-md text-label-md uppercase text-[#4e4635] cursor-pointer hover:text-[#1b1c1a] transition-colors">
            <span>$ USD</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </div>
        </div>

        {/* Center Logo */}
        <div className="flex flex-col items-center justify-center text-center px-1 shrink-0">
          <button onClick={() => navigate('/')} className="group block text-center cursor-pointer">
            <span className="font-headline-lg tracking-wider text-[#1A1817] group-hover:text-[#775a00] transition-colors block leading-none font-serif text-lg sm:text-2xl md:text-3xl">
              ALURA PARFUMS
            </span>
            <span className="font-label-sm tracking-[0.2em] sm:tracking-[0.25em] text-[#B8860B] uppercase mt-0.5 sm:mt-1 block text-[8px] sm:text-[10px]">
              Haute Parfumerie &amp; Atelier
            </span>
          </button>
        </div>

        {/* Right Actions (Bolsa y Favoritos para clientes) */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 md:gap-6 flex-1 shrink-0">
          <button
            onClick={() => navigate('/collection')}
            className="hidden sm:flex relative text-[#4e4635] hover:text-[#1b1c1a] transition-colors items-center"
            title="Catálogo"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </button>
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#f5f3ef] hover:bg-[#eae1d4] hover:text-[#1b1c1a] text-[#4e4635] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px] text-[#775a00]">shopping_bag</span>
            <span className="font-label-md uppercase tracking-wider text-[#2C2826] font-semibold text-xs">
              <span className="hidden sm:inline">Bolsa </span>({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Links Strip (Solo se muestra al hacer scroll hacia arriba o al inicio) */}
      <div
        className={`bg-[#fbf9f5]/95 shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out overflow-hidden ${
          showCategories
            ? 'max-h-16 opacity-100 border-t border-[#E6DED1]/40'
            : 'max-h-0 opacity-0 border-t-0 pointer-events-none'
        }`}
      >
        <nav className="max-w-[1760px] mx-auto h-12 px-4 md:px-10 flex items-center justify-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto">
          {/* 1. Inicio */}
          <button
            onClick={() => navigate('/')}
            className={`font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-all whitespace-nowrap cursor-pointer text-xs ${
              location.pathname === '/'
                ? 'text-[#775a00] font-bold border-b-2 border-[#775a00]'
                : 'text-[#4e4635] hover:text-[#1b1c1a]'
            }`}
          >
            Inicio
          </button>

          {/* 2. Colección Completa */}
          <button
            onClick={() => navigate('/collection')}
            className={`font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-all whitespace-nowrap cursor-pointer text-xs ${
              location.pathname === '/collection' &&
              !searchParams.get('gender') &&
              !searchParams.get('format') &&
              !searchParams.get('bestsellers') &&
              !searchParams.get('q')
                ? 'text-[#775a00] font-bold border-b-2 border-[#775a00]'
                : 'text-[#4e4635] hover:text-[#1b1c1a]'
            }`}
          >
            Colección Completa
          </button>

          {/* 3. Fragancias Femeninas (Damas) */}
          <button
            onClick={() => navigate('/collection?gender=fem')}
            className={`font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-all whitespace-nowrap cursor-pointer text-xs ${
              location.pathname === '/collection' && searchParams.get('gender') === 'fem'
                ? 'text-[#775a00] font-bold border-b-2 border-[#775a00]'
                : 'text-[#4e4635] hover:text-[#1b1c1a]'
            }`}
          >
            Damas
          </button>

          {/* 4. Fragancias Masculinas (Caballeros) */}
          <button
            onClick={() => navigate('/collection?gender=masc')}
            className={`font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-all whitespace-nowrap cursor-pointer text-xs ${
              location.pathname === '/collection' && searchParams.get('gender') === 'masc'
                ? 'text-[#775a00] font-bold border-b-2 border-[#775a00]'
                : 'text-[#4e4635] hover:text-[#1b1c1a]'
            }`}
          >
            Caballeros
          </button>

          {/* 5. Fragancias Unisex */}
          <button
            onClick={() => navigate('/collection?gender=unisex')}
            className={`font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-all whitespace-nowrap cursor-pointer text-xs ${
              location.pathname === '/collection' && searchParams.get('gender') === 'unisex'
                ? 'text-[#775a00] font-bold border-b-2 border-[#775a00]'
                : 'text-[#4e4635] hover:text-[#1b1c1a]'
            }`}
          >
            Unisex
          </button>

          {/* 6. Más Vendidos */}
          <button
            onClick={() => navigate('/collection?bestsellers=true')}
            className={`font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-all whitespace-nowrap cursor-pointer text-xs ${
              location.pathname === '/collection' && searchParams.get('bestsellers') === 'true'
                ? 'text-[#775a00] font-bold border-b-2 border-[#775a00]'
                : 'text-[#4e4635] hover:text-[#1b1c1a]'
            }`}
          >
            ★ Más Vendidos
          </button>

          {/* 6. Garantía de Fidelidad */}
          <button
            onClick={() => {
              if (location.pathname === '/') {
                const el = document.getElementById('calidad-garantia');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/#calidad-garantia');
                setTimeout(() => {
                  const el = document.getElementById('calidad-garantia');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }
            }}
            className="font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-all whitespace-nowrap cursor-pointer text-xs text-[#4e4635] hover:text-[#1b1c1a]"
          >
            Garantía de Fidelidad
          </button>
        </nav>
      </div>
    </header>
  </>
  );
};
