-- ==============================================================================
-- ALURA PARFUMS • HAUTE PARFUMERIE & ATELIER
-- Optional Catalog Seed for Supabase (18 Authentic Artisanal Fragrances)
-- ==============================================================================

INSERT INTO public.perfumes (
    id, name, house, subtitle, gender, price, stock, has_sample, sample_price,
    format, category_tag, description, family, image_url, image_alt, notes, accords, is_bestseller
) VALUES
(
    'p-1',
    'Donna Born in Roma',
    'Valentino',
    'Extracto Floral Ambarino • 100ml',
    'fem',
    15.00,
    3,
    true,
    10.00,
    '100ml • EDP',
    'Icono del Atelier',
    'Trilogía de jazmín blanco, grosella negra y una infusión suntuosa de vainilla Bourbon con maderas nobles.',
    'Floral',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbXAjfBXcFy-gZ6ZyVZ33BhhVQLnkxF19TxLza72qtz0F-yz9JHJNPU2GYUyA72Ki5ORXLFnMRVOhMSoP9cFr_awMgbeOKU0FWbXpkjohOCdaal_OVCN7qp7uRzIxit5tVG7IEjlyfyMmojWaCUC3DO5871CqKe-MLvaHqDdpsfuf24Jix8bkJxS-eHYJ64MOAcKZzKuVNDBQeOb5reAauHbzUGCsd6io5FbRZbDj',
    'Valentino Donna Born in Roma flacon',
    '{"top": ["Grosella negra", "Pimienta rosa", "Bergamota de Calabria"], "heart": ["Jazmín grandiflorum", "Té de jazmín", "Azahar"], "base": ["Vainilla Bourbon", "Cachemira", "Madera de guayaco"]}'::jsonb,
    '[{"name": "Floral Blanco", "percentage": 95}, {"name": "Vainilla Bourbon", "percentage": 85}, {"name": "Amaderado", "percentage": 70}, {"name": "Dulce Ambarino", "percentage": 60}]'::jsonb,
    true
),
(
    'p-2',
    'Khamrah QAHWA',
    'Lattafa Perfumes',
    'Edición gourmand embriagadora • 100ml',
    'masc',
    15.00,
    2,
    true,
    10.00,
    '100ml • EDP',
    'Pre-orden / Vitrina',
    'Edición gourmand embriagadora: canela tostada, café arábico, praliné ahumado y resinas doradas.',
    'Gourmand',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB98pL6xtEVJYq2aI5VwexLOEyTQOFDN6Rd8lhS81cVvHnfK4NSnPM2KEktJtCvXChbeaL8KeGWBcnJJsbqa4IOdBd7THC-5VwCW_a9yX-YtlW2XJq9GrV1XhyaOA1iiXnilG1EogD10j43nzaLh3tPGCh8xrTkTgtyBxs7u897my4nOwMrJrx8gMszhjh8oRjtA47rNSj6DudVoAh2gW9Zyef05PduYYaCEQEOcKJU',
    'Lattafa Khamrah Qahwa bottle',
    '{"top": ["Canela tostada", "Cardamomo", "Nuez moscada"], "heart": ["Café arábico", "Praliné", "Frutas confitadas"], "base": ["Vainilla de Madagascar", "Haba tonka", "Resina de benjuí"]}'::jsonb,
    '[{"name": "Cálido Especiado", "percentage": 100}, {"name": "Café Arábico", "percentage": 90}, {"name": "Gourmand / Vainilla", "percentage": 80}, {"name": "Amaderado Resinoso", "percentage": 65}]'::jsonb,
    true
),
(
    'p-3',
    'Club de Nuit Urban Elixir',
    'Armaf',
    'Acorde magnético de bergamota y ámbar • 50ml',
    'masc',
    10.00,
    4,
    true,
    10.00,
    '50ml • Elixir',
    'Disponibilidad Inmediata',
    'Acorde magnético de bergamota, pimienta rosa, ámbar gris y pachulí mineral de alta proyección.',
    'Amaderado',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCyMj8LPCzdWC6jVXEvLgBnVn1htGSSe4l47mRq8mup-qZZ2WGZ6L-xwxOXf6jafZaaTB1kt_yeR6IKpQ9Emay3fIMeDvaYEIlcDXg_lA5NZJWZPMo3RdUgkXlM7rNQAGLE0XGwGvoaPdrU61PA_hMw5Pa9IG9CPbGv8K_xPfGqphX2mwZ1viFxt8U0QiyRS0fivwjEzaxyDqqnyhZ97Cn6i0rZdvZjsoB8gRTQX3Db',
    'Armaf Club de Nuit Urban Elixir flacon',
    '{"top": ["Bergamota de Calabria", "Pimienta rosa", "Jazmín silvestre"], "heart": ["Pachulí mineral", "Lavanda de Provenza", "Geranio"], "base": ["Ámbar gris", "Ambroxan", "Cedro del Atlas"]}'::jsonb,
    '[{"name": "Cítrico Radiante", "percentage": 95}, {"name": "Ámbar Gris", "percentage": 85}, {"name": "Fresco Especiado", "percentage": 75}, {"name": "Amaderado Mineral", "percentage": 60}]'::jsonb,
    false
),
(
    'p-4',
    'Angels Share Icon',
    'Kilian Paris',
    'Herencia coñac con roble francés • 100ml',
    'unisex',
    15.00,
    2,
    true,
    10.00,
    '100ml • EDP',
    'Pieza Maestra',
    'Inspirado en la destilación de coñac con infusión de corteza de roble francés, canela y absoluto de tonka.',
    'Gourmand',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBE9vV7oX1z0K8bX0Nq9F4J2mZ3yX1a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8',
    'Kilian Angels Share crystal bottle',
    '{"top": ["Coñac añejo de barrica", "Avellana tostada"], "heart": ["Canela de Ceilán", "Haba tonka", "Roble"], "base": ["Vainilla Bourbon", "Praliné", "Sándalo cremoso"]}'::jsonb,
    '[{"name": "Coñac / Licor", "percentage": 100}, {"name": "Amaderado Roble", "percentage": 90}, {"name": "Cálido Especiado", "percentage": 85}, {"name": "Vainilla Gourmand", "percentage": 75}]'::jsonb,
    true
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    updated_at = NOW();
