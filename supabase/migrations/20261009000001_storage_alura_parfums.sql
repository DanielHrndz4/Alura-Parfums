-- ==============================================================================
-- ALURA PARFUMS • HAUTE PARFUMERIE & ATELIER
-- Migration: 20261009000001_storage_alura_parfums.sql
-- CONFIGURACIÓN DE STORAGE BUCKET: 'Alura Parfums' (1000x1000 Imágenes)
-- ==============================================================================

-- 1. Asegurar la existencia y visibilidad pública del bucket 'Alura Parfums'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'Alura Parfums',
    'Alura Parfums',
    true,
    10485760, -- 10MB
    ARRAY['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

-- 2. Limpiar políticas previas si existían
DROP POLICY IF EXISTS "Public Access Alura Parfums" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Alura Parfums" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Alura Parfums" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Alura Parfums" ON storage.objects;

-- 3. POLÍTICA DE LECTURA PÚBLICA (Cualquier visitante puede ver las fotos de la vitrina)
CREATE POLICY "Public Access Alura Parfums"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'Alura Parfums');

-- 4. POLÍTICA DE SUBIDA (Permite guardar imágenes 1000x1000 de la IA y del usuario)
CREATE POLICY "Public Upload Alura Parfums"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'Alura Parfums');

-- 5. POLÍTICA DE ACTUALIZACIÓN / UPSERT
CREATE POLICY "Public Update Alura Parfums"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'Alura Parfums')
WITH CHECK (bucket_id = 'Alura Parfums');

-- 6. POLÍTICA DE ELIMINACIÓN
CREATE POLICY "Public Delete Alura Parfums"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'Alura Parfums');
