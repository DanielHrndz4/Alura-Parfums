-- ==============================================================================
-- ALURA PARFUMS • HAUTE PARFUMERIE & ATELIER
-- Migration: 20261009000000_alura_parfums_schema.sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: perfumes (Inventario & Catálogo Maestro de Frascos)
CREATE TABLE IF NOT EXISTS public.perfumes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    house TEXT NOT NULL,
    subtitle TEXT,
    gender TEXT CHECK (gender IN ('fem', 'masc', 'unisex')) DEFAULT 'unisex',
    price NUMERIC(10,2) NOT NULL DEFAULT 15.00,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    has_sample BOOLEAN DEFAULT true,
    sample_price NUMERIC(10,2) DEFAULT 10.00,
    format TEXT NOT NULL DEFAULT '100ml • EDP',
    category_tag TEXT,
    description TEXT,
    family TEXT NOT NULL,
    image_url TEXT,
    image_alt TEXT,
    notes JSONB DEFAULT '{"top": [], "heart": [], "base": []}'::jsonb,
    accords JSONB DEFAULT '[]'::jsonb,
    is_bestseller BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: clients (Cartera de Clientes & Líneas de Crédito)
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'Cliente',
    pending_balance NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
    last_purchase TEXT,
    favorite_house TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: sales_transactions (Punto de Venta & Movimientos de Caja)
CREATE TABLE IF NOT EXISTS public.sales_transactions (
    id TEXT PRIMARY KEY,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_type TEXT DEFAULT 'Cliente',
    fragrance_name TEXT NOT NULL,
    house TEXT,
    format TEXT,
    payment_method TEXT NOT NULL,
    payment_method_label TEXT NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Completado',
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: abonos_transactions (Historial de Abonos & Conciliación de Créditos)
CREATE TABLE IF NOT EXISTS public.abonos_transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_code TEXT,
    client_tier TEXT DEFAULT 'Cliente',
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    remaining_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL,
    payment_method_label TEXT NOT NULL,
    reference TEXT,
    status TEXT NOT NULL DEFAULT 'Completado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: supplier_invoices (Compras de Frascos & Gastos de Proveedores)
CREATE TABLE IF NOT EXISTS public.supplier_invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT,
    supplier_name TEXT NOT NULL,
    supplier_code TEXT,
    supplier_location TEXT,
    concept TEXT NOT NULL,
    concept_details TEXT,
    quantity INTEGER,
    issue_date TEXT NOT NULL,
    due_date TEXT,
    due_date_highlight TEXT,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    pending_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (pending_amount >= 0),
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    status_type TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: supplier_payments (Historial de Pagos & Desembolsos a Proveedores)
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id TEXT PRIMARY KEY,
    expense_id TEXT REFERENCES public.supplier_invoices(id) ON DELETE SET NULL,
    date TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'pos', 'transfer')),
    reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: cash_drawer_summary (Arqueo Diario de Caja del Salón)
CREATE TABLE IF NOT EXISTS public.cash_drawer_summary (
    id TEXT PRIMARY KEY DEFAULT 'current',
    expected_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    cash_physical NUMERIC(10,2) NOT NULL DEFAULT 0,
    zelle_transfer NUMERIC(10,2) NOT NULL DEFAULT 0,
    pos_cards NUMERIC(10,2) NOT NULL DEFAULT 0,
    counted_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    difference NUMERIC(10,2) NOT NULL DEFAULT 0,
    auditor_name TEXT DEFAULT 'Directora Atelier',
    closure_folio TEXT,
    closing_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: weekly_audit_records (Historial de Cierres de Caja)
CREATE TABLE IF NOT EXISTS public.weekly_audit_records (
    id TEXT PRIMARY KEY,
    date_str TEXT NOT NULL,
    shift TEXT,
    auditor TEXT NOT NULL,
    expected_amount NUMERIC(10,2) NOT NULL,
    counted_amount NUMERIC(10,2) NOT NULL,
    difference NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Aprobado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) & GRANTS
ALTER TABLE public.perfumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_drawer_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_audit_records ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.perfumes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.clients TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sales_transactions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.abonos_transactions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.supplier_invoices TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.supplier_payments TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cash_drawer_summary TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.weekly_audit_records TO anon, authenticated, service_role;

CREATE POLICY "Allow full access to perfumes" ON public.perfumes
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to clients" ON public.clients
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to sales_transactions" ON public.sales_transactions
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to abonos_transactions" ON public.abonos_transactions
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to supplier_invoices" ON public.supplier_invoices
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to supplier_payments" ON public.supplier_payments
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to cash_drawer_summary" ON public.cash_drawer_summary
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to weekly_audit_records" ON public.weekly_audit_records
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
