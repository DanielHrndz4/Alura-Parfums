import React from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'inventory',
      label: 'Inventario & Catálogo',
      icon: 'inventory_2',
    },
    {
      id: 'pos',
      label: 'Punto de Venta & Movimientos',
      icon: 'point_of_sale',
    },
    {
      id: 'credits',
      label: 'Pendiente de Cobro & Créditos',
      icon: 'receipt_long',
    },
    {
      id: 'suppliers',
      label: 'Pago a Proveedores & Lotes',
      icon: 'local_shipping',
    },
    {
      id: 'audit',
      label: 'Estadísticas & Cuadres de Saldo',
      icon: 'account_balance',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#f5f3ef] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-6 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo */}
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F5F2EB] border border-[#E6DED1]/60 flex items-center justify-center text-[#775a00] shadow-sm">
                <span className="material-symbols-outlined text-[20px]">spa</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md tracking-tight text-[#1A1817] leading-none font-serif text-xl font-semibold">
                  Alura
                </h1>
                <p className="font-label-sm text-label-sm uppercase tracking-widest text-[#6E665F] mt-1 text-[10px]">
                  Haute Parfumerie
                </p>
              </div>
            </div>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-[#6E665F] hover:text-[#1A1817]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1.5 flex flex-col">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all group ${
                    isActive
                      ? 'bg-[#F5F2EB] text-[#775a00] font-title-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[#c59b27]/30'
                      : 'text-[#4e4635] hover:bg-[#F5F2EB] hover:text-[#1b1c1a]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors ${
                      isActive ? 'text-[#775a00]' : 'text-[#635e54] group-hover:text-[#775a00]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-body-sm text-body-sm tracking-wide text-[13px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="px-6 pt-6 border-t border-[#E6DED1]/50">
          <button
            onClick={() => onNavigate('storefront')}
            className="w-full mb-3 py-2 px-3 rounded-lg bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Ver Tienda Online</span>
          </button>

          <div className="p-3.5 rounded-lg bg-[#F5F2EB]/80 backdrop-blur-xl mb-4 border border-[#E6DED1]/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#6E665F] text-[10px]">
                Atelier State
              </span>
              <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
            </div>
            <p className="font-body-sm text-body-sm text-[#2C2826] font-medium text-xs">
              Place Vendôme N° 12
            </p>
            <p className="font-label-sm text-label-sm text-[#6E665F] mt-0.5 text-[10px]">
              Salón Privé Operativo
            </p>
          </div>

          <div className="text-center">
            <p className="font-label-sm text-label-sm tracking-widest uppercase text-[#6E665F] opacity-80 text-[9px]">
              Maison Alura • Place Vendôme • Édit. 2024
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
