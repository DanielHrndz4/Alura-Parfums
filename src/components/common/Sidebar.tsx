import React from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: '/admin/inventory',
      aliasKey: 'inventory',
      label: 'Inventario & Catálogo',
      icon: 'inventory_2',
    },
    {
      id: '/admin/pos',
      aliasKey: 'pos',
      label: 'Punto de Venta & Movimientos',
      icon: 'point_of_sale',
    },
    {
      id: '/admin/credits',
      aliasKey: 'credits',
      label: 'Pendiente de Cobro & Créditos',
      icon: 'receipt_long',
    },
    {
      id: '/admin/suppliers',
      aliasKey: 'suppliers',
      label: 'Pago a Proveedores & Lotes',
      icon: 'local_shipping',
    },
    {
      id: '/admin/audit',
      aliasKey: 'audit',
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
        className={`fixed left-0 top-0 h-full bg-[#f5f3ef] shadow-2xl lg:shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-6 border-r border-[#E6DED1] transition-all duration-300 ease-in-out w-72 max-w-[85vw] ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Expand / Collapse Floating Toggle Button (Desktop) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            className="hidden lg:flex absolute -right-3.5 top-7 w-7 h-7 bg-white border border-[#E6DED1] rounded-full items-center justify-center text-[#775a00] hover:bg-[#F5F2EB] shadow-xs cursor-pointer z-50 transition-all hover:scale-110"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        )}

        <div className="flex flex-col">
          {/* Logo Header */}
          <div
            className={`mb-8 flex items-center transition-all px-5 sm:px-6 justify-between ${
              isCollapsed ? 'lg:px-0 lg:justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-[#F5F2EB] flex items-center justify-center text-[#775a00] shadow-xs shrink-0 cursor-pointer"
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Expandir menú lateral' : 'Alura parfums'}
              >
                <img src="/images/logo.png" alt="Alura parfums" />
              </div>
              <div className={`overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                <h1 className="tracking-tight text-[#1A1817] leading-none font-serif text-xl font-bold">
                  Alura Parfums
                </h1>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-[#6E665F] hover:text-[#1A1817] p-1.5 rounded-md hover:bg-[#E6DED1]/50 cursor-pointer"
                title="Cerrar menú"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className={`space-y-1.5 flex flex-col px-3 ${isCollapsed ? 'lg:px-2' : ''}`}>
            {navItems.map((item) => {
              const isActive = currentView === item.id || currentView === item.aliasKey;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl transition-all group cursor-pointer gap-3 px-3.5 py-3 text-left w-full ${
                    isCollapsed
                      ? 'lg:justify-center lg:w-12 lg:h-12 lg:mx-auto lg:p-0'
                      : ''
                  } ${
                    isActive
                      ? 'bg-[#F5F2EB] text-[#775a00] font-semibold shadow-xs border border-[#c59b27]/40'
                      : 'text-[#4e4635] hover:bg-[#F5F2EB] hover:text-[#1b1c1a]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
                      isActive ? 'text-[#775a00]' : 'text-[#635e54] group-hover:text-[#775a00]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-xs font-medium tracking-wide truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
