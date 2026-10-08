import React from 'react';

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
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fbf9f5]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Topmost Luxury Ticker */}
      <div className="bg-[#F5F2EB]/80 px-4 md:px-10">
        <div className="max-w-[1440px] mx-auto h-8 flex items-center justify-between text-[#4e4635] font-label-sm text-label-sm uppercase tracking-widest text-[10px]">
          <span>Édition Limitée • Expédition de Prestige Offerte dans le Monde</span>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Place Vendôme • Mayfair</span>
            <button
              onClick={() => onNavigate('pos')}
              className="text-[#775a00] hover:text-[#B8860B] font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
              <span>Atelier Privé / POS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="h-20 max-w-[1440px] mx-auto px-4 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative flex items-center w-48 sm:w-64">
            <input
              className="w-full bg-white text-[#1b1c1a] placeholder:text-[#6E665F] font-body-sm text-body-sm pl-8 pr-2 py-1.5 rounded-lg border border-[#E6DED1]/60 outline-none focus:border-[#c59b27] transition-all"
              placeholder="Buscar esencia, nota o maison..."
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
        <div className="flex flex-col items-center justify-center text-center px-4">
          <button onClick={() => onNavigate('storefront')} className="group block text-center">
            <span className="font-headline-lg text-headline-lg tracking-wider text-[#1A1817] group-hover:text-[#775a00] transition-colors block leading-none font-serif text-2xl sm:text-3xl">
              ALURA PARFUMS
            </span>
            <span className="font-label-sm text-label-sm tracking-[0.25em] text-[#B8860B] uppercase mt-1 block text-[10px]">
              Haute Parfumerie &amp; Atelier
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-3 sm:gap-6 flex-1">
          <button
            onClick={() => onNavigate('pos')}
            className="hidden md:flex items-center gap-1 text-[#4e4635] hover:text-[#1b1c1a] transition-colors font-label-md text-label-md uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Mi Cuenta</span>
          </button>
          <button
            onClick={() => onNavigate('vault')}
            className="relative text-[#4e4635] hover:text-[#1b1c1a] transition-colors flex items-center"
            title="Lista de Deseos"
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
          </button>
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 bg-[#f5f3ef] hover:bg-[#eae1d4] hover:text-[#1b1c1a] text-[#4e4635] px-3 sm:px-4 py-2 rounded-lg transition-all shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#775a00]">shopping_bag</span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-[#2C2826] font-semibold">
              Bolsa ({cartCount})
            </span>
          </button>
          <button
            onClick={() => onNavigate('audit')}
            className="w-8 h-8 rounded-full bg-[#775a00] hover:bg-[#B8860B] flex items-center justify-center transition-colors text-white"
            title="Ir a Gestión de Atelier"
          >
            <span className="material-symbols-outlined text-white text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* Navigation Links Strip */}
      <div className="bg-[#fbf9f5]/95 shadow-[0_1px_8px_rgba(0,0,0,0.02)] border-t border-[#E6DED1]/40">
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
  );
};
