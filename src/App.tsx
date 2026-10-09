import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Perfume } from './types/perfume';
import { CartItem } from './types/sale';
import { NavigationBar } from './components/common/NavigationBar';
import { Sidebar } from './components/common/Sidebar';
import { TopHeader } from './components/common/TopHeader';
import { Footer } from './components/common/Footer';

// Repositories for live Supabase synchronization
import { PerfumeRepository } from './repositories/perfumeRepository';
import { SalesRepository } from './repositories/salesRepository';
import { SupplierRepository } from './repositories/supplierRepository';
import { AuditRepository } from './repositories/auditRepository';

// Views
import { StorefrontView } from './components/views/StorefrontView';
import { CatalogVaultView } from './components/views/CatalogVaultView';
import { ProductDetailView } from './components/views/ProductDetailView';
import { PosTerminalView } from './components/views/PosTerminalView';
import { SupplierInvoicesView } from './components/views/SupplierInvoicesView';
import { AuditBalanceView } from './components/views/AuditBalanceView';
import { PendingCreditView } from './components/views/PendingCreditView';
import { InventoryManagementView } from './components/views/InventoryManagementView';

const routeMap: Record<string, string> = {
  // Storefront main
  storefront: '/',
  store: '/',
  tienda: '/',

  // Collection
  vault: '/collection',
  collection: '/collection',
  coleccion: '/collection',
  catalogo: '/collection',

  // Admin / Audit
  audit: '/admin/audit',
  admin: '/admin/audit',
  auditoria: '/admin/audit',

  // Inventory
  inventory: '/admin/inventory',
  inventario: '/admin/inventory',

  // POS / Sales
  pos: '/admin/pos',
  sales: '/admin/pos',
  venta: '/admin/pos',

  // Credits / Pending
  credits: '/admin/credits',
  pending: '/admin/credits',
  pendientes: '/admin/credits',
  creditos: '/admin/credits',

  // Suppliers / Payments
  suppliers: '/admin/suppliers',
  payments: '/admin/suppliers',
  pagos: '/admin/suppliers',
  proveedores: '/admin/suppliers',
};

import { purgeMockData } from './db/supabaseClient';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Shopping cart state (clean initial state, no dummy items)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Persistent sidebar collapse state saved in localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alura_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('alura_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Initial silent synchronization with live Supabase Database
  useEffect(() => {
    purgeMockData();
    PerfumeRepository.fetchFromSupabase();
    SalesRepository.fetchSalesFromSupabase();
    SalesRepository.fetchClientsFromSupabase();
    SalesRepository.fetchAbonosFromSupabase();
    SupplierRepository.fetchInvoicesFromSupabase();
    SupplierRepository.fetchPaymentsFromSupabase();
    AuditRepository.fetchWeeklyRecordsFromSupabase();
    AuditRepository.fetchDrawerFromSupabase();
  }, []);

  const handleNavigate = (targetViewOrPath: string) => {
    const destination = routeMap[targetViewOrPath] || targetViewOrPath;
    navigate(destination);
  };

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
    navigate('/admin/pos');
  };

  // Check if current route is part of storefront boutique or admin management dashboard
  const isBoutiqueRoute =
    location.pathname === '/' ||
    location.pathname === '/collection' ||
    location.pathname.startsWith('/product') ||
    location.pathname === '/vault' ||
    location.pathname === '/store' ||
    location.pathname === '/tienda';

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-sans text-[#1b1c1a] antialiased selection:bg-[#eae1d4] selection:text-[#1b1c1a]">
      {/* 1. STOREFRONT BOUTIQUE MODE */}
      {isBoutiqueRoute && (
        <div className="flex flex-col min-h-screen">
          <NavigationBar
            activeView={location.pathname}
            onNavigate={handleNavigate}
            cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <main className="w-full pt-32 bg-[#fbf9f5] flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <StorefrontView
                    onNavigate={handleNavigate}
                    onAddToCart={(perfume) => handleAddToCart(perfume)}
                  />
                }
              />
              <Route
                path="/collection"
                element={
                  <CatalogVaultView
                    cartItems={cartItems}
                    onAddToCart={(perfume) => handleAddToCart(perfume)}
                    onRemoveFromCart={handleRemoveFromCart}
                    isCartOpen={isCartOpen}
                    onCloseCart={() => setIsCartOpen(false)}
                    onOpenCart={() => setIsCartOpen(true)}
                    onProceedCheckout={handleProceedCheckout}
                  />
                }
              />
              <Route
                path="/product/:id"
                element={
                  <ProductDetailView
                    onAddToCart={(perfume) => handleAddToCart(perfume)}
                  />
                }
              />
              <Route
                path="/vault"
                element={<Navigate to="/collection" replace />}
              />
              <Route
                path="/store"
                element={<Navigate to="/" replace />}
              />
              <Route
                path="/tienda"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </main>

          <Footer />
        </div>
      )}

      {/* 2. ATELIER DASHBOARD MANAGEMENT MODE */}
      {!isBoutiqueRoute && (
        <div className="flex min-h-screen">
          <Sidebar
            currentView={location.pathname}
            onNavigate={handleNavigate}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />

          <div className={`${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} transition-all duration-300 ease-in-out flex flex-col flex-1 min-h-screen w-full`}>
            <TopHeader
              onNavigate={handleNavigate}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              searchQuery={globalSearch}
              onSearchChange={setGlobalSearch}
              isSidebarCollapsed={isSidebarCollapsed}
            />

            <main className="relative pt-20 sm:pt-24 w-full px-3.5 sm:px-6 md:px-8 pb-12 bg-[#fbf9f5] flex-1">
              <Routes>
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/audit" replace />}
                />
                <Route
                  path="/admin/audit"
                  element={<AuditBalanceView />}
                />
                <Route
                  path="/admin/inventory"
                  element={<InventoryManagementView />}
                />
                <Route
                  path="/admin/pos"
                  element={<PosTerminalView onNavigate={handleNavigate} />}
                />
                <Route
                  path="/admin/sales"
                  element={<Navigate to="/admin/pos" replace />}
                />
                <Route
                  path="/admin/credits"
                  element={<PendingCreditView />}
                />
                <Route
                  path="/admin/pending"
                  element={<Navigate to="/admin/credits" replace />}
                />
                <Route
                  path="/admin/suppliers"
                  element={<SupplierInvoicesView />}
                />
                <Route
                  path="/admin/payments"
                  element={<Navigate to="/admin/suppliers" replace />}
                />

                {/* Direct aliases outside /admin */}
                <Route
                  path="/inventory"
                  element={<Navigate to="/admin/inventory" replace />}
                />
                <Route
                  path="/pos"
                  element={<Navigate to="/admin/pos" replace />}
                />
                <Route
                  path="/sales"
                  element={<Navigate to="/admin/pos" replace />}
                />
                <Route
                  path="/credits"
                  element={<Navigate to="/admin/credits" replace />}
                />
                <Route
                  path="/pending"
                  element={<Navigate to="/admin/credits" replace />}
                />
                <Route
                  path="/suppliers"
                  element={<Navigate to="/admin/suppliers" replace />}
                />
                <Route
                  path="/payments"
                  element={<Navigate to="/admin/suppliers" replace />}
                />
                <Route
                  path="/audit"
                  element={<Navigate to="/admin/audit" replace />}
                />

                {/* Catch-all fallback */}
                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
