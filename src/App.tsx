import React, { useState } from 'react';
import { Perfume } from './types/perfume';
import { CartItem } from './types/sale';
import { NavigationBar } from './components/common/NavigationBar';
import { Sidebar } from './components/common/Sidebar';
import { TopHeader } from './components/common/TopHeader';
import { Footer } from './components/common/Footer';

// Views
import { StorefrontView } from './components/views/StorefrontView';
import { CatalogVaultView } from './components/views/CatalogVaultView';
import { PosTerminalView } from './components/views/PosTerminalView';
import { SupplierInvoicesView } from './components/views/SupplierInvoicesView';
import { AuditBalanceView } from './components/views/AuditBalanceView';
import { PendingCreditView } from './components/views/PendingCreditView';
import { InventoryManagementView } from './components/views/InventoryManagementView';

export default function App() {
  // Current view route
  const [currentView, setCurrentView] = useState<string>('storefront');

  // Shopping cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-init-1',
      perfumeId: 'p-1',
      name: 'Valentino Donna Born in Roma',
      house: 'Valentino',
      format: '100ml EDP',
      price: 60.0,
      quantity: 1,
    },
    {
      id: 'cart-init-2',
      perfumeId: 'p-5',
      name: 'Creed Absolute Aventus',
      house: 'House of Creed',
      format: '50ml Parfum',
      price: 10.0,
      quantity: 1,
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Cart actions
  const handleAddToCart = (perfume: Perfume, formatOverride?: string) => {
    const existingIndex = cartItems.findIndex((i) => i.perfumeId === perfume.id);

    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        perfumeId: perfume.id,
        name: perfume.name,
        house: perfume.house,
        format: formatOverride || perfume.format,
        price: perfume.price,
        quantity: 1,
      };
      setCartItems((prev) => [...prev, newItem]);
    }

    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('pos');
  };

  // Determine if we are in boutique storefront mode or atelier management dashboard mode
  const isBoutiqueMode = currentView === 'storefront' || currentView === 'vault';

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-sans text-[#1b1c1a] antialiased selection:bg-[#eae1d4] selection:text-[#1b1c1a]">
      {/* 1. STOREFRONT MODE (Screen 1 & Screen 2) */}
      {isBoutiqueMode && (
        <div className="flex flex-col min-h-screen">
          <NavigationBar
            activeView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <main className="w-full pt-32 bg-[#fbf9f5] flex-1">
            {currentView === 'storefront' && (
              <StorefrontView
                onNavigate={(view) => setCurrentView(view)}
                onAddToCart={(perfume) => handleAddToCart(perfume)}
              />
            )}

            {currentView === 'vault' && (
              <CatalogVaultView
                cartItems={cartItems}
                onAddToCart={(perfume) => handleAddToCart(perfume)}
                onRemoveFromCart={handleRemoveFromCart}
                isCartOpen={isCartOpen}
                onCloseCart={() => setIsCartOpen(false)}
                onOpenCart={() => setIsCartOpen(true)}
                onProceedCheckout={handleProceedCheckout}
              />
            )}
          </main>

          <Footer />
        </div>
      )}

      {/* 2. ATELIER DASHBOARD MANAGEMENT MODE (Screen 3, 4, 5 & Inventory/Credits) */}
      {!isBoutiqueMode && (
        <div className="flex min-h-screen">
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          <div className="lg:pl-72 flex flex-col flex-1 min-h-screen w-full">
            <TopHeader
              onNavigate={(view) => setCurrentView(view)}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              searchQuery={globalSearch}
              onSearchChange={setGlobalSearch}
            />

            <main className="relative pt-24 w-full px-4 sm:px-6 md:px-8 pb-12 bg-[#fbf9f5] flex-1">
              {currentView === 'pos' && (
                <PosTerminalView onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'suppliers' && <SupplierInvoicesView />}

              {currentView === 'audit' && <AuditBalanceView />}

              {currentView === 'credits' && <PendingCreditView />}

              {currentView === 'inventory' && <InventoryManagementView />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
