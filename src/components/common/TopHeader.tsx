import React from 'react';

interface TopHeaderProps {
  onNavigate: (view: string) => void;
  onOpenMobileMenu?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onNavigate,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#fbf9f5]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#E6DED1]/60 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-[#f5f3ef] text-[#1A1817]"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="hidden xl:flex flex-col">
          <span className="font-headline-sm text-headline-sm text-[#1A1817] leading-tight font-serif text-lg font-semibold">
            Alura Parfums
          </span>
          <span className="font-label-sm text-label-sm text-[#6E665F] tracking-wide text-[10px]">
            Haute Parfumerie &amp; Atelier • Gestión
          </span>
        </div>

        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6E665F]">
            search
          </span>
          <input
            value={searchQuery || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-white font-body-sm text-body-sm text-[#1A1817] placeholder:text-[#6E665F] pl-9 pr-4 py-2 rounded-lg outline-none border border-[#E6DED1]/60 shadow-[0_1px_8px_rgba(0,0,0,0.02)] focus:border-[#c59b27] transition-all"
            placeholder="Buscar perfume, SKU, cliente o factura..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        {/* Quick KPI Badges */}
        <div className="hidden md:flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F2EB] shadow-[0_1px_8px_rgba(0,0,0,0.02)] border border-[#E6DED1]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#946E19]"></span>
            <span className="font-numeric-metric text-numeric-metric text-[#2C2826] text-xs font-semibold">
              14
            </span>
            <span className="font-label-sm text-label-sm text-[#6E665F] text-[10px]">
              botellas en stock
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F5EE] shadow-[0_1px_8px_rgba(0,0,0,0.02)] border border-[#2D5A27]/20">
            <span className="font-numeric-metric text-numeric-metric text-[#2D5A27] text-xs font-semibold">
              $195.00
            </span>
            <span className="font-label-sm text-label-sm text-[#2D5A27] text-[10px]">
              facturación hoy
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('vault')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[#2C2826] border border-[#E6DED1] hover:bg-[#F5F2EB] hover:text-[#1b1c1a] transition-all font-body-sm text-body-sm shadow-[0_1px_8px_rgba(0,0,0,0.02)] text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[16px] text-[#775a00]">storefront</span>
            <span className="hidden sm:inline">Boutique Online</span>
          </button>

          <button
            className="w-9 h-9 rounded-lg bg-white border border-[#E6DED1] flex items-center justify-center text-[#635e54] hover:bg-[#F5F2EB] hover:text-[#1b1c1a] transition-all shadow-[0_1px_8px_rgba(0,0,0,0.02)] relative"
            type="button"
            title="Notificaciones de Bóveda"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#775a00]"></span>
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-[#E6DED1]">
            <div className="text-right hidden sm:block">
              <p className="font-title-md text-title-md text-[#1A1817] leading-none text-xs font-semibold">
                Éléonore Vance
              </p>
              <p className="font-label-sm text-label-sm text-[#6E665F] mt-0.5 text-[9px]">
                Directora Atelier
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#775a00] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
