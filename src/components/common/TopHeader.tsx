import React from 'react';

interface TopHeaderProps {
  onNavigate: (view: string) => void;
  onOpenMobileMenu?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  isSidebarCollapsed?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onNavigate,
  onOpenMobileMenu,
  isSidebarCollapsed = false,
}) => {
  return (
    <header className={`fixed top-0 left-0 ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-72'} right-0 h-16 sm:h-20 bg-[#fbf9f5] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#E6DED1] z-40 px-3.5 sm:px-6 md:px-8 flex items-center justify-between gap-2.5 sm:gap-4 transition-all duration-300 ease-in-out`}>
      {/* Left: Mobile Menu & Atelier Indicator */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-none bg-[#f5f3ef] text-[#1A1817] shrink-0 border border-[#E6DED1] cursor-pointer hover:bg-[#FAF8F5]"
          title="Abrir menú"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-serif font-bold text-[#1A1817] tracking-wider uppercase text-[11px] sm:text-xs">
            Alura Parfums
          </span>
          <span className="text-[#c59b27] hidden sm:inline">•</span>
          <span className="text-[#6E665F] font-mono text-[9px] sm:text-[10px] uppercase tracking-widest hidden sm:inline">
            Atelier Privé Place Vendôme
          </span>
        </div>
      </div>

      {/* Right: Quick actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => onNavigate('vault')}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-none bg-white text-[#2C2826] border border-[#E6DED1] hover:bg-[#F5F2EB] hover:text-[#1b1c1a] transition-all text-xs font-semibold shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-[#775a00]">storefront</span>
          <span className="hidden sm:inline">Boutique Online</span>
        </button>

        <button
          className="w-8 sm:w-9 h-8 sm:h-9 rounded-none bg-white border border-[#E6DED1] flex items-center justify-center text-[#635e54] hover:bg-[#F5F2EB] hover:text-[#1b1c1a] transition-all shadow-xs relative cursor-pointer"
          type="button"
          title="Notificaciones"
        >
          <span className="material-symbols-outlined text-[17px] sm:text-[18px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 rounded-full bg-[#c59b27]"></span>
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-[#E6DED1]">
          <div className="text-right hidden md:block">
            <p className="font-serif text-[#1A1817] leading-none text-xs font-bold">
              Éléonore Vance
            </p>
            <p className="font-mono text-[#6E665F] mt-1 text-[9px] uppercase tracking-wider">
              Directora Atelier
            </p>
          </div>
          <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-none bg-[#c59b27] flex items-center justify-center text-[#1A1817] font-bold text-xs shadow-xs">
            ÉV
          </div>
        </div>
      </div>
    </header>
  );
};


