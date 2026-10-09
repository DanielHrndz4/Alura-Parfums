import React, { useState, useEffect } from 'react';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(true);

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
        <div className="max-w-[1440px] mx-auto h-7 sm:h-8 flex items-center justify-between text-[#4e4635] font-label-sm uppercase tracking-widest text-[9px] sm:text-[10px]">
          <span className="truncate max-w-[200px] sm:max-w-none">Édition Limitée • Expédition de Prestige Offerte</span>
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <span className="hidden md:inline">Place Vendôme • Mayfair</span>
            <button
              onClick={() => onNavigate('pos')}
              className="text-[#775a00] hover:text-[#B8860B] font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]">admin_panel_settings</span>
              <span>Atelier Privé / POS</span>
            </button>
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
      <div className="h-16 sm:h-20 max-w-[1440px] mx-auto px-3 sm:px-6 md:px-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden sm:flex relative items-center w-36 sm:w-48 md:w-64">
            <input
              className="w-full bg-white text-[#1b1c1a] placeholder:text-[#6E665F] font-body-sm text-xs pl-8 pr-2 py-1.5 rounded-lg border border-[#E6DED1]/60 outline-none focus:border-[#c59b27] transition-all"
              placeholder="Buscar fragancia..."
              type="search"
            />
            <span className="material-symbols-outlined absolute left-2 text-[16px] text-[#6E665F] pointer-events-none">
              search
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1 font-label-md text-label-md uppercase text-[#4e4635] cursor-pointer hover:text-[#1b1c1a] transition-colors">
            <span>$ USD</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </div>
        </div>

        {/* Center Logo */}
        <div className="flex flex-col items-center justify-center text-center px-1 shrink-0">
          <button onClick={() => onNavigate('storefront')} className="group block text-center cursor-pointer">
            <span className="font-headline-lg tracking-wider text-[#1A1817] group-hover:text-[#775a00] transition-colors block leading-none font-serif text-lg sm:text-2xl md:text-3xl">
              ALURA PARFUMS
            </span>
            <span className="font-label-sm tracking-[0.2em] sm:tracking-[0.25em] text-[#B8860B] uppercase mt-0.5 sm:mt-1 block text-[8px] sm:text-[10px]">
              Haute Parfumerie &amp; Atelier
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 md:gap-6 flex-1 shrink-0">
          <button
            onClick={() => onNavigate('pos')}
            className="hidden lg:flex items-center gap-1 text-[#4e4635] hover:text-[#1b1c1a] transition-colors font-label-md text-label-md uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Mi Cuenta</span>
          </button>
          <button
            onClick={() => onNavigate('vault')}
            className="hidden sm:flex relative text-[#4e4635] hover:text-[#1b1c1a] transition-colors items-center"
            title="Lista de Deseos"
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
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
          <button
            onClick={() => onNavigate('audit')}
            className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-[#775a00] hover:bg-[#B8860B] flex items-center justify-center transition-colors text-white cursor-pointer shadow-xs"
            title="Ir a Gestión de Atelier"
          >
            <span className="material-symbols-outlined text-white text-[16px] sm:text-[18px]">tune</span>
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
        <nav className="max-w-[1440px] mx-auto h-12 px-4 md:px-10 flex items-center justify-center gap-4 sm:gap-8 overflow-x-auto">
          <button
            onClick={() => onNavigate('/collection')}
            className={`font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-colors whitespace-nowrap ${
              activeView === 'vault' || activeView === '/collection' ? 'text-[#775a00] font-bold border-b border-[#775a00]' : 'text-[#4e4635] hover:text-[#1b1c1a]'
            }`}
          >
            Colección
          </button>
          <button
            onClick={() => onNavigate('vault')}
            className="text-[#4e4635] hover:text-[#1b1c1a] font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-colors whitespace-nowrap"
          >
            Fragancias Femeninas
          </button>
          <button
            onClick={() => onNavigate('vault')}
            className="text-[#4e4635] hover:text-[#1b1c1a] font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-colors whitespace-nowrap"
          >
            Fragancias Masculinas
          </button>
          <button
            onClick={() => onNavigate('storefront')}
            className="text-[#4e4635] hover:text-[#1b1c1a] font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-colors whitespace-nowrap"
          >
            Atelier &amp; Muestras
          </button>
          <button
            onClick={() => onNavigate('storefront')}
            className="text-[#4e4635] hover:text-[#1b1c1a] font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-colors whitespace-nowrap"
          >
            Descubrir
          </button>
          <span className="text-[#E6DED1]">|</span>
          <button
            onClick={() => onNavigate('pos')}
            className="text-[#B8860B] hover:text-[#775a00] font-label-md text-label-md uppercase tracking-[0.14em] py-1.5 px-2 transition-colors whitespace-nowrap font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">point_of_sale</span>
            <span>Panel Operativo</span>
          </button>
        </nav>
      </div>
    </header>
  </>
  );
};
