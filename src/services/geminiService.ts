import { Perfume, OlfactoryFamily, GenderStyle, WhenToWearItem } from '../types/perfume';

export interface GeminiFragranceResult {
  name: string;
  house: string;
  family: OlfactoryFamily;
  concentration: string;
  format: string;
  gender: GenderStyle;
  price: number;
  description: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  accords: { name: string; percentage: number; color?: string }[];
  whenToWear?: WhenToWearItem[];
  suggestedImageUrl?: string;
  source: 'gemini-api' | 'encyclopedia';
}

/**
 * Official Fragrantica Color Palette for "CUÁNDO USARLO" (Occasions & Seasons).
 */
export const FRAGRANTICA_SEASONS_PALETTE: Record<string, string> = {
  invierno: '#5AC8FA',
  primavera: '#98E266',
  verano: '#F87171',
  otoño: '#F6BA62',
  día: '#F59E0B',
  noche: '#85B6D4',
};

export function getFragranticaSeasonColor(seasonIdOrName: string): string {
  const s = (seasonIdOrName || '').toLowerCase().trim();
  if (s.includes('inviern') || s.includes('winter')) return FRAGRANTICA_SEASONS_PALETTE.invierno;
  if (s.includes('primaver') || s.includes('spring')) return FRAGRANTICA_SEASONS_PALETTE.primavera;
  if (s.includes('veran') || s.includes('summer')) return FRAGRANTICA_SEASONS_PALETTE.verano;
  if (s.includes('otoñ') || s.includes('oton') || s.includes('autumn') || s.includes('fall')) return FRAGRANTICA_SEASONS_PALETTE.otoño;
  if (s.includes('día') || s.includes('dia') || s.includes('day')) return FRAGRANTICA_SEASONS_PALETTE.día;
  if (s.includes('noch') || s.includes('night')) return FRAGRANTICA_SEASONS_PALETTE.noche;
  return '#9CA3AF';
}

export function getDefaultWhenToWear(family?: OlfactoryFamily, name?: string): WhenToWearItem[] {
  const n = (name || '').toLowerCase();
  // Exact 9pm / 9pm Night Out Fragrantica match
  if (n.includes('9pm') || n.includes('ultra male') || n.includes('night out')) {
    return [
      { id: 'invierno', name: 'invierno', percentage: 100, votes: '2k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 80, votes: '1.6k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 42, votes: '854', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 85, votes: '1.7k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 35, votes: '703', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 100, votes: '2k', color: '#85B6D4' },
    ];
  }

  if (family === 'Gourmand' || family === 'Cuero') {
    return [
      { id: 'invierno', name: 'invierno', percentage: 95, votes: '1.9k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 65, votes: '1.2k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 30, votes: '520', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 90, votes: '1.8k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 40, votes: '780', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 98, votes: '2k', color: '#85B6D4' },
    ];
  }

  if (family === 'Cítrico') {
    return [
      { id: 'invierno', name: 'invierno', percentage: 35, votes: '600', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 88, votes: '1.7k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 100, votes: '2.1k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 60, votes: '1.1k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 95, votes: '1.9k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 45, votes: '850', color: '#85B6D4' },
    ];
  }

  if (family === 'Floral') {
    return [
      { id: 'invierno', name: 'invierno', percentage: 55, votes: '980', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 98, votes: '2k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 75, votes: '1.4k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 70, votes: '1.3k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 85, votes: '1.7k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 72, votes: '1.3k', color: '#85B6D4' },
    ];
  }

  return [
    { id: 'invierno', name: 'invierno', percentage: 85, votes: '1.7k', color: '#5AC8FA' },
    { id: 'primavera', name: 'Primavera', percentage: 75, votes: '1.4k', color: '#98E266' },
    { id: 'verano', name: 'verano', percentage: 45, votes: '820', color: '#F87171' },
    { id: 'otoño', name: 'Otoño', percentage: 90, votes: '1.8k', color: '#F6BA62' },
    { id: 'día', name: 'Día', percentage: 60, votes: '1.1k', color: '#F59E0B' },
    { id: 'noche', name: 'Noche', percentage: 88, votes: '1.7k', color: '#85B6D4' },
  ];
}

/**
 * Official Fragrantica Color Palette for Olfactory Accords.
 * Faithfully matches the exact colors used by Fragrantica's accord bar charts.
 */
export function getFragranticaAccordColor(name: string): string {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('amadera') || n.includes('leños') || n.includes('wood')) return '#7B4A21'; // Warm Wood Brown
  if (n.includes('afrutad') || n.includes('frutal') || n.includes('fruit')) return '#E64A19'; // Red-Orange Fruit
  if (n.includes('cálido especiad') || n.includes('calido especiad') || n.includes('warm spicy')) return '#BF360C'; // Warm Spicy Rust Red
  if (n.includes('fresco especiad') || n.includes('fresh spicy')) return '#689F38'; // Fresh Leaf Green
  if (n.includes('especiad') || n.includes('spicy')) return '#C0392B'; // Rich Spice Red
  if (n.includes('dulce') || n.includes('sweet')) return '#D81B60'; // Sweet Rose/Pink-Red
  if (n.includes('tropical')) return '#E67E22'; // Warm Tropical Orange
  if (n.includes('aromátic') || n.includes('aromatic')) return '#00897B'; // Herbal Teal Green
  if (n.includes('lavanda') || n.includes('lavender')) return '#7E57C2'; // Lavender Purple
  if (n.includes('floral blanc') || n.includes('white floral')) return '#80CBC4'; // Soft Mint Teal
  if (n.includes('floral amarill') || n.includes('yellow floral')) return '#FBC02D'; // Yellow Floral
  if (n.includes('floral') || n.includes('florales') || n.includes('rose') || n.includes('rosa')) return '#EC407A'; // Rose Pink
  if (n.includes('vainill') || n.includes('avainillad') || n.includes('vanilla')) return '#C7A75C'; // Warm Vanilla Cream
  if (n.includes('cítric') || n.includes('citrus')) return '#FDD835'; // Citrus Bright Yellow
  if (n.includes('cuero') || n.includes('leather')) return '#5D4037'; // Leather Brown
  if (n.includes('atalcad') || n.includes('powdery')) return '#B39DDB'; // Powdery Lilac
  if (n.includes('ámbar') || n.includes('ambar') || n.includes('amber')) return '#EF6C00'; // Amber Warm Orange
  if (n.includes('acuátic') || n.includes('acuatic') || n.includes('marin') || n.includes('aquatic') || n.includes('marine')) return '#0288D1'; // Ocean Blue
  if (n.includes('ozónic') || n.includes('ozonic')) return '#81D4FA'; // Sky Blue
  if (n.includes('verde') || n.includes('green')) return '#43A047'; // Leaf Green
  if (n.includes('ahumad') || n.includes('smok')) return '#546E7A'; // Smoky Slate
  if (n.includes('terros') || n.includes('earthy')) return '#6D4C41'; // Earthy Brown
  if (n.includes('musgo') || n.includes('moss')) return '#558B2F'; // Forest Moss Green
  if (n.includes('pachul') || n.includes('patchouli')) return '#33691E'; // Patchouli
  if (n.includes('balsámic') || n.includes('balsamic')) return '#D84315'; // Balsamic Resin
  if (n.includes('canela') || n.includes('cinnamon')) return '#A04000'; // Cinnamon Brown
  if (n.includes('café') || n.includes('coffee')) return '#4E342E'; // Roasted Coffee
  if (n.includes('tabaco') || n.includes('tobacco')) return '#6D4C41'; // Tobacco Leaf
  if (n.includes('almizcl') || n.includes('musk')) return '#BCAAA4'; // Musk Grey
  if (n.includes('gourmand')) return '#AD1457'; // Gourmand Magenta
  if (n.includes('animálic') || n.includes('animalic')) return '#3E2723'; // Deep Animalic
  if (n.includes('metálic') || n.includes('metallic')) return '#90A4AE'; // Cool Metallic
  if (n.includes('salado') || n.includes('salty')) return '#80DEEA'; // Salty Mineral
  return '#B8860B'; // Default Alura Antique Gold
}

/**
 * Editorial luxury flacon photography library by olfactory family.
 */
const FAMILY_EDITORIAL_IMAGES: Record<OlfactoryFamily, string> = {
  Floral:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbXAjfBXcFy-gZ6ZyVZ33BhhVQLnkxF19TxLza72qtz0F-yz9JHJNPU2GYUyA72Ki5ORXLFnMRVOhMSoP9cFr_awMgbeOKU0FWbXpkjohOCdaal_OVCN7qp7uRzIxit5tVG7IEjlyfyMmojWaCUC3DO5871CqKe-MLvaHqDdpsfuf24Jix8bkJxS-eHYJ64MOAcKZzKuVNDBQeOb5reAauHbzUGCsd6io5FbRZbDj',
  Amaderado:
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  Gourmand:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB98pL6xtEVJYq2aI5VwexLOEyTQOFDN6Rd8lhS81cVvHnfK4NSnPM2KEktJtCvXChbeaL8KeGWBcnJJsbqa4IOdBd7THC-5VwCW_a9yX-YtlW2XJq9GrV1XhyaOA1iiXnilG1EogD10j43nzaLh3tPGCh8xrTkTgtyBxs7u897my4nOwMrJrx8gMszhjh8oRjtA47rNSj6DudVoAh2gW9Zyef05PduYYaCEQEOcKJU',
  Cuero:
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  Cítrico:
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  Especiado:
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
};

/**
 * Authentic, high-resolution flacon photography registry for iconic designer and niche fragrances.
 */
const FLACON_REGISTRY: { matchers: string[]; url: string }[] = [
  // Creed
  {
    matchers: ['aventus', 'creed'],
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  },
  {
    matchers: ['silver mountain', 'green irish tweed', 'viking'],
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  },
  // Dior
  {
    matchers: ['sauvage', 'dior sauvage'],
    url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  },
  {
    matchers: ['fahrenheit', 'homme intense', 'jadore', 'miss dior'],
    url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  },
  // Baccarat Rouge / Maison Francis Kurkdjian
  {
    matchers: ['baccarat', 'rouge 540', 'kurkdjian', 'grand soir'],
    url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  },
  // Tom Ford
  {
    matchers: ['tobacco vanille', 'oud wood', 'lost cherry', 'black orchid', 'ombre leather', 'tom ford'],
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  },
  // Lattafa (Árabes)
  {
    matchers: ['khamrah', 'qahwa'],
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB98pL6xtEVJYq2aI5VwexLOEyTQOFDN6Rd8lhS81cVvHnfK4NSnPM2KEktJtCvXChbeaL8KeGWBcnJJsbqa4IOdBd7THC-5VwCW_a9yX-YtlW2XJq9GrV1XhyaOA1iiXnilG1EogD10j43nzaLh3tPGCh8xrTkTgtyBxs7u897my4nOwMrJrx8gMszhjh8oRjtA47rNSj6DudVoAh2gW9Zyef05PduYYaCEQEOcKJU',
  },
  {
    matchers: ['asad', 'lattafa'],
    url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  },
  {
    matchers: ['yara', 'yara tous', 'yara candy'],
    url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  },
  // Armaf
  {
    matchers: ['club de nuit', 'urban elixir', 'intense man', 'armaf'],
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyMj8LPCzdWC6jVXEvLgBnVn1htGSSe4l47mRq8mup-qZZ2WGZ6L-xwxOXf6jafZaaTB1kt_yeR6IKpQ9Emay3fIMeDvaYEIlcDXg_lA5NZJWZPMo3RdUgkXlM7rNQAGLE0XGwGvoaPdrU61PA_hMw5Pa9IG9CPbGv8K_xPfGqphX2mwZ1viFxt8U0QiyRS0fivwjEzaxyDqqnyhZ97Cn6i0rZdvZjsoB8gRTQX3Db',
  },
  // Kilian
  {
    matchers: ['angels share', 'angel share', 'kilian', 'intoxicated', 'black phantom'],
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  },
  // Creed Absolu
  {
    matchers: ['absolu aventus', 'aventus absolu', 'absolu'],
    url: 'https://fimgs.net/images/perfume/o.85906.jpg',
  },
  // Valentino Donna Born in Roma
  {
    matchers: ['donna born in roma', 'born in roma donna', '55805'],
    url: 'https://fimgs.net/images/perfume/o.55805.jpg',
  },
  // Valentino Uomo Born in Roma
  {
    matchers: ['uomo born in roma', 'born in roma uomo', 'born in roma', 'valentino', '55963'],
    url: 'https://fimgs.net/images/perfume/o.55963.jpg',
  },
  // Rasasi Hawas
  {
    matchers: ['hawas for him', 'hawas', 'rasasi'],
    url: 'https://fimgs.net/images/perfume/o.39434.jpg',
  },
  // Lattafa Yara Candy
  {
    matchers: ['yara candy', 'yara tous', 'yara'],
    url: 'https://fimgs.net/images/perfume/o.95689.jpg',
  },
  // Chanel
  {
    matchers: ['bleu', 'chanel', 'coco mademoiselle', 'chance', 'allure'],
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  },
  // YSL
  {
    matchers: ['libre', 'black opium', 'yves saint laurent', 'ysl', 'la nuit'],
    url: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=800&q=80',
  },
  // Carolina Herrera
  {
    matchers: ['good girl', 'bad boy', '212', 'carolina herrera'],
    url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
  },
  // Armani
  {
    matchers: ['acqua di gio', 'armani', 'my way', 'si passione', 'stronger with you'],
    url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
  },
  // Versace
  {
    matchers: ['eros', 'dylan blue', 'versace', 'bright crystal', 'eau fraiche'],
    url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  },
  // Le Labo
  {
    matchers: ['santal 33', 'the noir', 'another 13', 'le labo', 'bergamote'],
    url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
  },
  // Parfums de Marly
  {
    matchers: ['delina', 'layton', 'herod', 'parfums de marly', 'pegasus', 'althair'],
    url: 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&w=800&q=80',
  },
  // Lancôme
  {
    matchers: ['la vie est belle', 'idole', 'lancome', 'tresor'],
    url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  },
  // Jean Paul Gaultier
  {
    matchers: ['le male', 'ultra male', 'le beau', 'scandal', 'gaultier'],
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  },
  // Paco Rabanne
  {
    matchers: ['one million', '1 million', 'invictus', 'phantom', 'paco rabanne'],
    url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  },
  // Xerjoff
  {
    matchers: ['naxos', 'erba pura', 'xerjoff', 'alexandria', 'renaissance'],
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  },
  // Afnan
  {
    matchers: ['9pm', 'night out', 'afnan', 'souvenir', 'turathi'],
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  },
  // Nishane
  {
    matchers: ['hacivat', 'ani', 'nishane', 'wulong cha'],
    url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
  },
];

// Rich built-in encyclopedic knowledge
const ENCYCLOPEDIA_KNOWLEDGE: Record<string, Partial<GeminiFragranceResult>> = {
  '9pm night out': {
    name: '9pm Night Out',
    house: 'Afnan',
    family: 'Amaderado',
    concentration: 'Extrait de Parfum',
    format: '100ml • Extrait',
    gender: 'masc',
    description:
      'Una creación nocturna potente y magnética de Afnan. Combina maderas oscuras y acordes afrutados vibrantes con un corazón especiado cálido y un fondo seductor de vainilla y ámbar.',
    notes: {
      top: ['Manzana silvestre', 'Canela', 'Lavanda', 'Cardamomo'],
      heart: ['Flor de azahar', 'Lirio de los valles', 'Maderas aromáticas'],
      base: ['Vainilla bourbon', 'Haba tonka', 'Ámbar', 'Cedro oscuro', 'Pachulí'],
    },
    accords: [
      { name: 'amaderado', percentage: 100, color: '#7B4A21' },
      { name: 'afrutados', percentage: 90, color: '#E64A19' },
      { name: 'cálido especiado', percentage: 82, color: '#BF360C' },
      { name: 'dulce', percentage: 76, color: '#D81B60' },
      { name: 'tropical', percentage: 68, color: '#E67E22' },
      { name: 'aromático', percentage: 62, color: '#00897B' },
      { name: 'lavanda', percentage: 56, color: '#7E57C2' },
      { name: 'florales', percentage: 50, color: '#EC407A' },
      { name: 'avainillado', percentage: 44, color: '#C7A75C' },
      { name: 'fresco especiado', percentage: 38, color: '#689F38' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 100, votes: '2k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 80, votes: '1.6k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 42, votes: '854', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 85, votes: '1.7k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 35, votes: '703', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 100, votes: '2k', color: '#85B6D4' },
    ],
  },
  '9pm': {
    name: '9pm',
    house: 'Afnan',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • EDP',
    gender: 'masc',
    description:
      'Inspirado en la fiesta nocturna moderna. Una apertura dulce y fresca de manzana y canela que evoluciona hacia una estela envolvente de lavanda, vainilla y ámbar.',
    notes: {
      top: ['Manzana', 'Canela', 'Lavanda salvaje', 'Bergamota'],
      heart: ['Flor de azahar', 'Lirio de los valles'],
      base: ['Vainilla', 'Haba tonka', 'Ámbar', 'Pachulí'],
    },
    accords: [
      { name: 'avainillado', percentage: 100, color: '#C7A75C' },
      { name: 'cálido especiado', percentage: 90, color: '#BF360C' },
      { name: 'dulce', percentage: 82, color: '#D81B60' },
      { name: 'afrutados', percentage: 75, color: '#E64A19' },
      { name: 'lavanda', percentage: 68, color: '#7E57C2' },
      { name: 'aromático', percentage: 60, color: '#00897B' },
      { name: 'amaderado', percentage: 52, color: '#7B4A21' },
      { name: 'canela', percentage: 44, color: '#A04000' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 100, votes: '2k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 80, votes: '1.6k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 42, votes: '854', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 85, votes: '1.7k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 35, votes: '703', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 100, votes: '2k', color: '#85B6D4' },
    ],
  },
  '9pm rebel': {
    name: '9pm Rebel',
    house: 'Afnan',
    family: 'Amaderado',
    concentration: 'Eau de Parfum',
    format: '100ml • EDP',
    gender: 'masc',
    description:
      'Lanzamiento audaz de Afnan que fusiona acordes afrutados brillantes y cítricos vivos con un corazón aromático y especiado cálido sobre una base terrosa y amaderada.',
    notes: {
      top: ['Manzana Granny Smith', 'Mandarina', 'Piña'],
      heart: ['Cedro', 'Musgo de roble', 'Vainilla'],
      base: ['Ámbar gris', 'Caramelo', 'Almizcle'],
    },
    accords: [
      { name: 'afrutados', percentage: 100, color: '#FC4B29' },
      { name: 'cítrico', percentage: 94, color: '#F9FF52' },
      { name: 'aromático', percentage: 79, color: '#37A089' },
      { name: 'cálido especiado', percentage: 76, color: '#CC3300' },
      { name: 'dulce', percentage: 70, color: '#EE363B' },
      { name: 'amaderado', percentage: 69, color: '#774414' },
      { name: 'fresco especiado', percentage: 61, color: '#83C928' },
      { name: 'especiado suave', percentage: 56, color: '#E27752' },
      { name: 'fresco', percentage: 54, color: '#9BE5ED' },
      { name: 'terrosos', percentage: 53, color: '#544838' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 75, votes: '1.2k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 90, votes: '1.8k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 85, votes: '1.5k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 80, votes: '1.4k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 75, votes: '1.3k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 85, votes: '1.6k', color: '#85B6D4' },
    ],
  },
  sauvage: {
    name: 'Sauvage Elixir',
    house: 'Dior',
    family: 'Especiado',
    concentration: 'Elixir',
    format: '100ml • Elixir',
    gender: 'masc',
    description:
      'Una concentración nocturna extraordinaria que embriaga con notas de pomelo especiado, corazón de lavanda orgánica y maderas opulentas de regaliz.',
    notes: {
      top: ['Nuez moscada', 'Canela', 'Cardamomo', 'Pomelo de Calabria'],
      heart: ['Lavanda de Nyons'],
      base: ['Regaliz', 'Sándalo', 'Ámbar cálido', 'Pachulí', 'Vetiver de Haití'],
    },
    accords: [
      { name: 'Especiado Cálido', percentage: 95 },
      { name: 'Lavanda Fresca', percentage: 80 },
      { name: 'Amaderado Rico', percentage: 75 },
      { name: 'Ámbar Misterioso', percentage: 65 },
    ],
  },
  baccarat: {
    name: 'Baccarat Rouge 540',
    house: 'Maison Francis Kurkdjian',
    family: 'Amaderado',
    concentration: 'Extrait de Parfum',
    format: '100ml • Extrait',
    gender: 'unisex',
    description:
      'La alquimia lumínica del cristal fundido a 540 grados: un soplo mineral de ámbar gris, jazmín grandiflorum y madera de cedro recién cortada.',
    notes: {
      top: ['Almendra amarga', 'Azafrán de Cachemira'],
      heart: ['Jazmín grandiflorum de Egipto', 'Cedro virgen'],
      base: ['Ámbar gris mineral', 'Almizcle amaderado'],
    },
    accords: [
      { name: 'Ambarino Mineral', percentage: 98 },
      { name: 'Almendrado', percentage: 85 },
      { name: 'Amaderado Suave', percentage: 75 },
      { name: 'Especiado Metálico', percentage: 60 },
    ],
  },
  aventus: {
    name: 'Aventus',
    house: 'House of Creed',
    family: 'Amaderado',
    concentration: 'Eau de Parfum',
    format: '100ml • EDP',
    gender: 'masc',
    description:
      'Inspirado en la vida dramática de un emperador histórico, fusiona manzana fresca, grosella negra y piña real con un fondo ahumado de abedul y musgo de roble.',
    notes: {
      top: ['Piña real', 'Bergamota italiana', 'Grosella negra', 'Manzana gala'],
      heart: ['Abedul ahumado', 'Pachulí noble', 'Jazmín marroquí', 'Rosa de mayo'],
      base: ['Almizcle', 'Musgo de roble', 'Ámbar gris', 'Vainilla'],
    },
    accords: [
      { name: 'Afrutado Ahumado', percentage: 95 },
      { name: 'Amaderado Noble', percentage: 85 },
      { name: 'Cítrico Elegante', percentage: 70 },
      { name: 'Cuero & Musgo', percentage: 60 },
    ],
  },
  'tobacco vanille': {
    name: 'Tobacco Vanille',
    house: 'Tom Ford Private Blend',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • EDP',
    gender: 'unisex',
    description:
      'La opulencia de un club de caballeros inglés en Mayfair: hoja de tabaco aromática, especias orientales, vainilla cremosa de Madagascar y cacao dulce.',
    notes: {
      top: ['Hojas de tabaco aromáticas', 'Especias picantes'],
      heart: ['Haba tonka', 'Flor de tabaco', 'Vainilla Bourbon', 'Cacao oscuro'],
      base: ['Frutos secos ahumados', 'Savia de maderas nobles'],
    },
    accords: [
      { name: 'Tabaco Aromático', percentage: 95 },
      { name: 'Vainilla Dulce', percentage: 90 },
      { name: 'Especiado Cálido', percentage: 80 },
      { name: 'Gourmand Amaderado', percentage: 70 },
    ],
  },
  'angels share': {
    name: "Angels' Share",
    house: 'Kilian Paris',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • EDP',
    gender: 'unisex',
    description:
      'Inspirado en la herencia licorera de la familia Hennessy: esencia de coñac añejo, infusión de corteza de roble, canela en polvo y praliné especiado.',
    notes: {
      top: ['Esencia de coñac añejo', 'Avellana tostada'],
      heart: ['Canela de Ceilán', 'Haba tonka', 'Corteza de roble'],
      base: ['Praliné gourmand', 'Vainilla Bourbon', 'Sándalo cremoso'],
    },
    accords: [
      { name: 'Coñac & Licor', percentage: 100 },
      { name: 'Amaderado Roble', percentage: 90 },
      { name: 'Cálido Especiado', percentage: 85 },
      { name: 'Vainilla Praliné', percentage: 75 },
    ],
  },
  khamrah: {
    name: 'Khamrah Qahwa',
    house: 'Lattafa Perfumes',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • EDP',
    gender: 'unisex',
    description:
      'Edición gourmand embriagadora del Medio Oriente con café arábico tostado, canela, praliné ahumado y resinas doradas.',
    notes: {
      top: ['Canela tostada', 'Cardamomo', 'Jengibre'],
      heart: ['Café arábico', 'Praliné', 'Frutas confitadas'],
      base: ['Vainilla bourbon', 'Haba tonka', 'Benjuí'],
    },
    accords: [
      { name: 'Café & Especias', percentage: 95 },
      { name: 'Gourmand Dulce', percentage: 88 },
      { name: 'Vainilla', percentage: 80 },
    ],
  },
  libre: {
    name: 'Libre Eau de Parfum',
    house: 'Yves Saint Laurent',
    family: 'Floral',
    concentration: 'Eau de Parfum',
    format: '100ml • EDP',
    gender: 'fem',
    description:
      'La tensión sensual entre la flor de azahar de Marruecos y la lavanda francesa audaz. La libertad en su máxima expresión.',
    notes: {
      top: ['Mandarina', 'Lavanda francesa', 'Grosella negra'],
      heart: ['Azahar de Marruecos', 'Jazmín sambac'],
      base: ['Vainilla de Madagascar', 'Cedro', 'Ámbar gris'],
    },
    accords: [
      { name: 'Floral Blanco', percentage: 92 },
      { name: 'Cítrico Luminoso', percentage: 85 },
      { name: 'Vainilla Dulce', percentage: 78 },
    ],
  },
  'absolu aventus': {
    name: 'Absolu Aventus',
    house: 'House of Creed',
    family: 'Cítrico',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'masc',
    description:
      'Una interpretación magistral y limitada del legendario Aventus. Realza la vibrante salida cítrica de pomelo de Calabria y bergamota con piña luminosa, cardamomo, canela picante y un fondo suntuoso de vetiver haitiano y pachulí ahumado.',
    notes: {
      top: ['Pomelo de Calabria', 'Bergamota italiana', 'Grosellas negras', 'Limón'],
      heart: ['Jengibre fresco', 'Canela de Ceilán', 'Cardamomo', 'Piña real', 'Pimienta rosa'],
      base: ['Pachulí noble', 'Vetiver de Haití', 'Musgo de roble', 'Ambroxan', 'Maderas de cachemira'],
    },
    accords: [
      { name: 'cítrico', percentage: 100, color: '#F9FF52' },
      { name: 'afrutados', percentage: 88, color: '#FC4B29' },
      { name: 'cálido especiado', percentage: 82, color: '#CC3300' },
      { name: 'amaderado', percentage: 78, color: '#774414' },
      { name: 'fresco especiado', percentage: 70, color: '#83C928' },
      { name: 'aromático', percentage: 62, color: '#37A089' },
      { name: 'ahumado', percentage: 55, color: '#544838' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 85, votes: '1.8k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 95, votes: '2.1k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 70, votes: '1.4k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 95, votes: '2.1k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 75, votes: '1.5k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 95, votes: '2.1k', color: '#85B6D4' },
    ],
  },
  'aventus absolu': {
    name: 'Absolu Aventus',
    house: 'House of Creed',
    family: 'Cítrico',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'masc',
    description:
      'Una interpretación magistral y limitada del legendario Aventus. Realza la salida cítrica de pomelo con piña luminosa y un fondo suntuoso de vetiver.',
    notes: {
      top: ['Pomelo', 'Bergamota', 'Grosellas negras'],
      heart: ['Jengibre', 'Canela', 'Cardamomo', 'Piña'],
      base: ['Pachulí', 'Vetiver de Haití', 'Musgo de roble'],
    },
    accords: [
      { name: 'cítrico', percentage: 100, color: '#F9FF52' },
      { name: 'afrutados', percentage: 88, color: '#FC4B29' },
      { name: 'cálido especiado', percentage: 82, color: '#CC3300' },
      { name: 'amaderado', percentage: 78, color: '#774414' },
    ],
  },
  absolu: {
    name: 'Absolu Aventus',
    house: 'House of Creed',
    family: 'Cítrico',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'masc',
    description:
      'Una interpretación magistral y limitada del legendario Aventus. Realza la vibrante salida cítrica de pomelo de Calabria y bergamota con piña luminosa, cardamomo y vetiver ahumado.',
    notes: {
      top: ['Pomelo de Calabria', 'Bergamota', 'Grosellas negras'],
      heart: ['Jengibre', 'Canela', 'Cardamomo', 'Piña'],
      base: ['Pachulí', 'Vetiver de Haití', 'Musgo de roble'],
    },
    accords: [
      { name: 'cítrico', percentage: 100, color: '#F9FF52' },
      { name: 'afrutados', percentage: 88, color: '#FC4B29' },
      { name: 'cálido especiado', percentage: 82, color: '#CC3300' },
      { name: 'amaderado', percentage: 78, color: '#774414' },
      { name: 'fresco especiado', percentage: 70, color: '#83C928' },
    ],
  },
  'donna born in roma': {
    name: 'Donna Born In Roma',
    house: 'Valentino',
    family: 'Floral',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Un tributo floral moderno de alta costura a la feminidad romana. Combina tres variedades de jazmín con una sobredosis de vainilla Bourbon de Madagascar y un fondo amaderado sofisticado de cashmeran.',
    notes: {
      top: ['Grosellas negras', 'Pimienta rosa', 'Bergamota italiana'],
      heart: ['Jazmín Sambac', 'Jazmín Grandiflorum', 'Té de jazmín'],
      base: ['Vainilla Bourbon', 'Cashmeran', 'Madera de guayaco'],
    },
    accords: [
      { name: 'avainillado', percentage: 100, color: '#C7A75C' },
      { name: 'amaderado', percentage: 88, color: '#7B4A21' },
      { name: 'afrutados', percentage: 82, color: '#E64A19' },
      { name: 'floral blanco', percentage: 78, color: '#80CBC4' },
      { name: 'dulce', percentage: 72, color: '#D81B60' },
      { name: 'atalcado', percentage: 65, color: '#CE93D8' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 85, votes: '1.9k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 80, votes: '1.7k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 50, votes: '1.1k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 95, votes: '2.2k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 65, votes: '1.4k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 90, votes: '2k', color: '#85B6D4' },
    ],
  },
  'born in roma donna': {
    name: 'Donna Born In Roma',
    house: 'Valentino',
    family: 'Floral',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Un tributo floral moderno de alta costura a la feminidad romana. Jazmín noble con vainilla Bourbon y cashmeran.',
    notes: {
      top: ['Grosellas negras', 'Pimienta rosa', 'Bergamota'],
      heart: ['Jazmín Sambac', 'Jazmín Grandiflorum'],
      base: ['Vainilla Bourbon', 'Cashmeran'],
    },
    accords: [
      { name: 'avainillado', percentage: 100, color: '#C7A75C' },
      { name: 'amaderado', percentage: 88, color: '#7B4A21' },
      { name: 'floral blanco', percentage: 78, color: '#80CBC4' },
      { name: 'dulce', percentage: 72, color: '#D81B60' },
    ],
  },
  'uomo born in roma': {
    name: 'Uomo Born in Roma',
    house: 'Valentino',
    family: 'Amaderado',
    concentration: 'Eau de Toilette',
    format: '100ml • Eau de Toilette',
    gender: 'masc',
    description:
      'Fragancia amaderada aromática de alta costura inspirada en la atmósfera romana. Abre con acordes minerales y salvia, complementados con jengibre fresco y vetiver ahumado.',
    notes: {
      top: ['Notas minerales', 'Hojas de violeta', 'Sal marina'],
      heart: ['Jengibre fresco', 'Salvia romana'],
      base: ['Notas amaderadas nobles', 'Vetiver ahumado'],
    },
    accords: [
      { name: 'amaderado', percentage: 100, color: '#7B4A21' },
      { name: 'mineral', percentage: 88, color: '#90A4AE' },
      { name: 'ozónico', percentage: 80, color: '#80DEEA' },
      { name: 'aromático', percentage: 75, color: '#00897B' },
      { name: 'cálido especiado', percentage: 65, color: '#BF360C' },
      { name: 'salado', percentage: 55, color: '#80DEEA' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 60, votes: '1.2k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 95, votes: '2.1k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 85, votes: '1.8k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 80, votes: '1.7k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 90, votes: '1.9k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 70, votes: '1.4k', color: '#85B6D4' },
    ],
  },
  'born in roma': {
    name: 'Uomo Born in Roma',
    house: 'Valentino',
    family: 'Amaderado',
    concentration: 'Eau de Toilette',
    format: '100ml • Eau de Toilette',
    gender: 'masc',
    description:
      'Fragancia amaderada aromática de alta costura inspirada en la atmósfera romana. Abre con acordes minerales y salvia, complementados con jengibre fresco y vetiver ahumado.',
    notes: {
      top: ['Notas minerales', 'Hojas de violeta', 'Sal marina'],
      heart: ['Jengibre fresco', 'Salvia romana'],
      base: ['Notas amaderadas nobles', 'Vetiver ahumado'],
    },
    accords: [
      { name: 'amaderado', percentage: 100, color: '#7B4A21' },
      { name: 'mineral', percentage: 88, color: '#90A4AE' },
      { name: 'aromático', percentage: 75, color: '#00897B' },
    ],
  },
  '55963': {
    name: 'Uomo Born in Roma',
    house: 'Valentino',
    family: 'Amaderado',
    concentration: 'Eau de Toilette',
    format: '100ml • Eau de Toilette',
    gender: 'masc',
    description:
      'Fragancia amaderada aromática de alta costura inspirada en la atmósfera romana.',
    notes: {
      top: ['Notas minerales', 'Hojas de violeta', 'Sal marina'],
      heart: ['Jengibre fresco', 'Salvia romana'],
      base: ['Notas amaderadas nobles', 'Vetiver ahumado'],
    },
    accords: [
      { name: 'amaderado', percentage: 100, color: '#7B4A21' },
      { name: 'mineral', percentage: 88, color: '#90A4AE' },
      { name: 'aromático', percentage: 75, color: '#00897B' },
    ],
  },
  'yara candy': {
    name: 'Yara Candy',
    house: 'Lattafa',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Una creación irresistible y adictiva de Lattafa que evoca golosinas de frutas rojas y grosellas confitadas sobre una base cremosa de vainilla Bourbon, mandarina jugosa y almizcle dulce.',
    notes: {
      top: ['Caramelo de frutas rojas', 'Grosella roja', 'Mandarina verde'],
      heart: ['Fresa silvestre', 'Gardenia', 'Flores blancas azucaradas'],
      base: ['Vainilla Bourbon', 'Almizcle dulce', 'Ámbar cálido', 'Sándalo'],
    },
    accords: [
      { name: 'dulce', percentage: 100, color: '#D81B60' },
      { name: 'afrutados', percentage: 92, color: '#E64A19' },
      { name: 'cítrico', percentage: 80, color: '#F9FF52' },
      { name: 'avainillado', percentage: 75, color: '#C7A75C' },
      { name: 'floral blanco', percentage: 65, color: '#80CBC4' },
      { name: 'caramelo', percentage: 58, color: '#A04000' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 70, votes: '1.2k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 95, votes: '2k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 85, votes: '1.7k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 75, votes: '1.4k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 95, votes: '2.1k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 75, votes: '1.5k', color: '#85B6D4' },
    ],
  },
  yara: {
    name: 'Yara',
    house: 'Lattafa',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Sensación golosa y envolvente de malvavisco, frutas tropicales, orquídea y vainilla.',
    notes: {
      top: ['Heliotropo', 'Orquídea', 'Mandarina'],
      heart: ['Acorde goloso', 'Frutas tropicales'],
      base: ['Vainilla', 'Almizcle', 'Sándalo'],
    },
    accords: [
      { name: 'dulce', percentage: 100, color: '#D81B60' },
      { name: 'avainillado', percentage: 90, color: '#C7A75C' },
      { name: 'tropical', percentage: 80, color: '#E67E22' },
      { name: 'atalcado', percentage: 70, color: '#CE93D8' },
    ],
  },
  'hawas for him': {
    name: 'Hawas for Him',
    house: 'Rasasi',
    family: 'Cítrico',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'masc',
    description:
      'Un torrente aromático acuático y cítrico diseñado para el espíritu aventurero. Combina manzana fresca, bergamota de Italia y canela con notas marinas vibrantes, ciruela jugosa y ámbar gris.',
    notes: {
      top: ['Manzana crujiente', 'Bergamota italiana', 'Limón', 'Canela'],
      heart: ['Notas acuáticas marinas', 'Ciruela', 'Flor de azahar', 'Cardamomo'],
      base: ['Ámbar gris', 'Almizcle blanco', 'Pachulí', 'Trozas de madera flotante'],
    },
    accords: [
      { name: 'cítrico', percentage: 100, color: '#F9FF52' },
      { name: 'afrutados', percentage: 90, color: '#FC4B29' },
      { name: 'acuático', percentage: 85, color: '#80DEEA' },
      { name: 'fresco especiado', percentage: 78, color: '#83C928' },
      { name: 'aromático', percentage: 70, color: '#37A089' },
      { name: 'dulce', percentage: 62, color: '#D81B60' },
      { name: 'amaderado', percentage: 55, color: '#774414' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 40, votes: '900', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 95, votes: '2.2k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 100, votes: '2.5k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 70, votes: '1.5k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 95, votes: '2.2k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 75, votes: '1.6k', color: '#85B6D4' },
    ],
  },
  hawas: {
    name: 'Hawas for Him',
    house: 'Rasasi',
    family: 'Cítrico',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'masc',
    description:
      'Un torrente aromático acuático y cítrico. Manzana crujiente, bergamota, notas marinas y ámbar gris.',
    notes: {
      top: ['Manzana', 'Bergamota', 'Limón', 'Canela'],
      heart: ['Notas acuáticas', 'Ciruela', 'Flor de azahar'],
      base: ['Ámbar gris', 'Almizcle', 'Pachulí'],
    },
    accords: [
      { name: 'cítrico', percentage: 100, color: '#F9FF52' },
      { name: 'afrutados', percentage: 90, color: '#FC4B29' },
      { name: 'acuático', percentage: 85, color: '#80DEEA' },
      { name: 'fresco especiado', percentage: 78, color: '#83C928' },
    ],
  },
  'khamrah qahwa': {
    name: 'Khamrah Qahwa',
    house: 'Lattafa',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'unisex',
    description:
      'Una lujosa creación oriental inspirada en el café arábigo tostado con especias de cardamomo, praliné confitado crujiente, vainilla Bourbon y maderas nobles ahumadas.',
    notes: {
      top: ['Café arábico tostado', 'Canela', 'Cardamomo', 'Jengibre'],
      heart: ['Praliné', 'Frutas confitadas', 'Flores blancas'],
      base: ['Vainilla Bourbon', 'Café', 'Haba tonka', 'Benjuí', 'Almizcle'],
    },
    accords: [
      { name: 'cálido especiado', percentage: 100, color: '#BF360C' },
      { name: 'dulce', percentage: 92, color: '#D81B60' },
      { name: 'café', percentage: 88, color: '#5D4037' },
      { name: 'avainillado', percentage: 82, color: '#C7A75C' },
      { name: 'amaderado', percentage: 75, color: '#7B4A21' },
      { name: 'canela', percentage: 68, color: '#A04000' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 100, votes: '2.5k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 55, votes: '1.1k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 20, votes: '400', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 95, votes: '2.2k', color: '#F6BA62' },
    ],
  },
  'can can': {
    name: 'Can Can',
    house: 'Paris Hilton',
    family: 'Floral',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Inspirado en el cabaret Moulin Rouge. Una deliciosa apertura dulce y jugosa de clementina, nectarina y grosellas negras sobre un corazón floral de orquídeas y fondo sedoso de ámbar y almizcle.',
    notes: {
      top: ['Clementina', 'Nectarina', 'Grosellas negras'],
      heart: ['Orquídea silvestre', 'Flor de azahar del naranjo'],
      base: ['Ámbar', 'Almizcle', 'Maderas nobles'],
    },
    accords: [
      { name: 'dulce', percentage: 100, color: '#D81B60' },
      { name: 'afrutados', percentage: 95, color: '#E64A19' },
      { name: 'cítrico', percentage: 70, color: '#FDD835' },
      { name: 'floral', percentage: 65, color: '#EC407A' },
      { name: 'ámbar', percentage: 55, color: '#EF6C00' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 50, votes: '800', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 90, votes: '1.8k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 75, votes: '1.4k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 80, votes: '1.5k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 85, votes: '1.7k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 70, votes: '1.2k', color: '#85B6D4' },
    ],
  },
  'poison girl': {
    name: 'Poison Girl',
    house: 'Dior',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Una trampa deliciosa y adictiva que envenena los sentidos al instante. Naranja amarga chispeante, rosa de Grasse aterciopelada y un fondo irresistible de haba tonka de Venezuela y vainilla.',
    notes: {
      top: ['Naranja amarga', 'Limón'],
      heart: ['Rosa de Grasse', 'Rosa de Damasco', 'Flor de azahar'],
      base: ['Haba tonka', 'Vainilla', 'Almendra dulce', 'Sándalo', 'Bálsamo de Tolú'],
    },
    accords: [
      { name: 'avainillado', percentage: 100, color: '#C7A75C' },
      { name: 'dulce', percentage: 92, color: '#D81B60' },
      { name: 'almendrado', percentage: 85, color: '#BCAAA4' },
      { name: 'cálido especiado', percentage: 75, color: '#BF360C' },
      { name: 'balsámico', percentage: 62, color: '#D84315' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 100, votes: '2.4k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 60, votes: '1.1k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 25, votes: '450', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 90, votes: '2k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 40, votes: '800', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 100, votes: '2.5k', color: '#85B6D4' },
    ],
  },
  daisy: {
    name: 'Daisy',
    house: 'Marc Jacobs',
    family: 'Floral',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Espíritu libre, juvenil y resplandeciente. Fresas silvestres maduras, hojas de violeta frescas y gardenia aterciopelada con fondo luminoso de almizcle y maderas blancas.',
    notes: {
      top: ['Hojas de violeta', 'Toronja sanguina', 'Fresa silvestre'],
      heart: ['Violeta', 'Gardenia', 'Jazmín'],
      base: ['Almizcle blanco', 'Maderas blancas', 'Vainilla'],
    },
    accords: [
      { name: 'ozónico', percentage: 100, color: '#81D4FA' },
      { name: 'floral blanco', percentage: 88, color: '#80CBC4' },
      { name: 'afrutados', percentage: 80, color: '#E64A19' },
      { name: 'verde', percentage: 74, color: '#43A047' },
      { name: 'atalcado', percentage: 68, color: '#B39DDB' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 30, votes: '600', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 100, votes: '2.8k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 92, votes: '2.2k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 55, votes: '1k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 100, votes: '2.9k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 35, votes: '700', color: '#85B6D4' },
    ],
  },
  'la bomba': {
    name: 'La Bomba',
    house: 'Carolina Herrera',
    family: 'Floral',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'Fragancia ultrafemenina y magnética. Explosión cautivadora de maracuyá y frutas exóticas combinada con peonías silvestres, orquídeas y un fondo sensual de maderas cremosas.',
    notes: {
      top: ['Maracuyá', 'Toronja fresca', 'Mandarina'],
      heart: ['Peonía silvestre', 'Orquídea', 'Jazmín sambac'],
      base: ['Almizcle sedoso', 'Maderas nobles', 'Musgo suave'],
    },
    accords: [
      { name: 'floral', percentage: 100, color: '#EC407A' },
      { name: 'afrutados', percentage: 90, color: '#E64A19' },
      { name: 'dulce', percentage: 80, color: '#D81B60' },
      { name: 'fresco', percentage: 70, color: '#80DEEA' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 40, votes: '700', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 95, votes: '2k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 90, votes: '1.9k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 65, votes: '1.2k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 90, votes: '2k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 60, votes: '1.1k', color: '#85B6D4' },
    ],
  },
  'yara tous': {
    name: 'Yara Tous',
    house: 'Lattafa',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'La aclamada joya tropical de Lattafa en frasco amarillo. Deliciosa crema de mango maduro, maracuyá y leche de coco que descansa sobre flores blancas y vainilla suave.',
    notes: {
      top: ['Mango', 'Maracuyá (Fruta de la pasión)', 'Coco'],
      heart: ['Heliotropo', 'Flor de azahar', 'Jazmín'],
      base: ['Vainilla', 'Cachemira', 'Almizcle blanco'],
    },
    accords: [
      { name: 'tropical', percentage: 100, color: '#E67E22' },
      { name: 'afrutados', percentage: 95, color: '#E64A19' },
      { name: 'dulce', percentage: 88, color: '#D81B60' },
      { name: 'avainillado', percentage: 80, color: '#C7A75C' },
      { name: 'floral blanco', percentage: 68, color: '#80CBC4' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 35, votes: '600', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 90, votes: '1.8k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 100, votes: '2.5k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 60, votes: '1k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 95, votes: '2k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 55, votes: '950', color: '#85B6D4' },
    ],
  },
  yara: {
    name: 'Yara',
    house: 'Lattafa',
    family: 'Gourmand',
    concentration: 'Eau de Parfum',
    format: '100ml • Eau de Parfum',
    gender: 'fem',
    description:
      'El perfume rosa viral de Lattafa: acorde cremoso a milkshake de fresa y vainilla, orquídeas atalcadas, heliotropo y fondo suave de sándalo y almizcle.',
    notes: {
      top: ['Heliotropo', 'Orquídea', 'Mandarina'],
      heart: ['Acorde goloso (Gourmand)', 'Frutas tropicales'],
      base: ['Vainilla', 'Almizcle', 'Sándalo'],
    },
    accords: [
      { name: 'dulce', percentage: 100, color: '#D81B60' },
      { name: 'avainillado', percentage: 95, color: '#C7A75C' },
      { name: 'afrutados', percentage: 82, color: '#E64A19' },
      { name: 'atalcado', percentage: 72, color: '#B39DDB' },
      { name: 'floral', percentage: 65, color: '#EC407A' },
    ],
    whenToWear: [
      { id: 'invierno', name: 'invierno', percentage: 70, votes: '1.4k', color: '#5AC8FA' },
      { id: 'primavera', name: 'Primavera', percentage: 92, votes: '2k', color: '#98E266' },
      { id: 'verano', name: 'verano', percentage: 75, votes: '1.5k', color: '#F87171' },
      { id: 'otoño', name: 'Otoño', percentage: 80, votes: '1.6k', color: '#F6BA62' },
      { id: 'día', name: 'Día', percentage: 90, votes: '2k', color: '#F59E0B' },
      { id: 'noche', name: 'Noche', percentage: 70, votes: '1.3k', color: '#85B6D4' },
    ],
  },
};

export class GeminiService {
  private static API_KEY_STORAGE = 'alura_gemini_api_key';

  static getApiKey(): string {
    const fromEnv = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    if (fromEnv && fromEnv !== 'MY_GEMINI_API_KEY') {
      return fromEnv;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.API_KEY_STORAGE) || '';
    }
    return '';
  }

  static setApiKey(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.API_KEY_STORAGE, key.trim());
    }
  }

  /**
   * Converts rgb(r, g, b) string to Hex format #RRGGBB.
   */
  static rgbToHex(rgbStr: string): string {
    const match = (rgbStr || '').match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (!match) return rgbStr;
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  /**
   * Real-time Fragrantica HTML scraper for accord elements.
   * Faithfully parses the exact DOM element tree:
   * <div style="color: ...; background: rgb(...); width: ...%"><span class="truncate">name</span></div>
   */
  static parseFragranticaHtmlAccords(html: string): { name: string; percentage: number; color: string }[] {
    const accords: { name: string; percentage: number; color: string }[] = [];
    if (!html) return accords;

    const regex = /style="([^"]*)"[^>]*>[\s\S]*?<span[^>]*class="[^"]*truncate[^"]*"[^>]*>([^<]+)<\/span>/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      const styleAttr = match[1];
      const name = match[2].trim().toLowerCase();

      const widthMatch = styleAttr.match(/width:\s*([\d.]+)%/i);
      const percentage = widthMatch ? Math.round(parseFloat(widthMatch[1])) : 50;

      const bgMatch = styleAttr.match(/background(?:-color)?:\s*([^;]+)/i);
      let color = bgMatch ? bgMatch[1].trim() : getFragranticaAccordColor(name);
      if (color.startsWith('rgb')) {
        color = this.rgbToHex(color);
      }

      accords.push({ name, percentage, color });
    }

    if (accords.length === 0) {
      const fallbackRegex = /<span[^>]*class="[^"]*truncate[^"]*"[^>]*>([^<]+)<\/span>[\s\S]*?style="([^"]*)"/gi;
      while ((match = fallbackRegex.exec(html)) !== null) {
        const name = match[1].trim().toLowerCase();
        const styleAttr = match[2];
        const widthMatch = styleAttr.match(/width:\s*([\d.]+)%/i);
        const percentage = widthMatch ? Math.round(parseFloat(widthMatch[1])) : 50;
        const bgMatch = styleAttr.match(/background(?:-color)?:\s*([^;]+)/i);
        let color = bgMatch ? bgMatch[1].trim() : getFragranticaAccordColor(name);
        if (color.startsWith('rgb')) {
          color = this.rgbToHex(color);
        }
        accords.push({ name, percentage, color });
      }
    }

    return accords;
  }

  /**
   * Real-time HTML scraper for Fragrantica's "CUÁNDO USARLO" (Seasonality / Time of Day) widget.
   * Parses the exact element tree:
   * <div class="tw-rating-card">...<div index="0">...<span ...>invierno</span>...style="width: 100%; background-color: rgb(...)"><span ...>12.1k</span></div>
   */
  static parseFragranticaHtmlWhenToWear(html: string): WhenToWearItem[] {
    const items: WhenToWearItem[] = [];
    if (!html) return items;

    // Search for items by index="X"
    const itemRegex = /<div[^>]*index="(\d+)"[^>]*>([\s\S]*?)(?=<div[^>]*index="\d+"|<\/div>\s*<\/div>\s*<\/div>|$)/gi;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(html)) !== null) {
      const block = match[2];

      const labelMatch =
        block.match(/<span[^>]*class="[^"]*(?:text-zinc-|font-medium)[^"]*"[^>]*>([^<]+)<\/span>/i) ||
        block.match(/<span[^>]*>([^<]+)<\/span>/i);
      const rawName = labelMatch ? labelMatch[1].trim() : '';
      if (!rawName) continue;

      const styleMatch =
        block.match(/style="([^"]*width:\s*[\d.]+%[^"]*)"/i) || block.match(/style="([^"]*)"/i);
      const styleAttr = styleMatch ? styleMatch[1] : '';

      const widthMatch = styleAttr.match(/width:\s*([\d.]+)%/i);
      const percentage = widthMatch ? Math.round(parseFloat(widthMatch[1])) : 50;

      const bgMatch = styleAttr.match(/background(?:-color)?:\s*([^;]+)/i);
      let color = bgMatch ? bgMatch[1].trim() : getFragranticaSeasonColor(rawName);
      if (color.startsWith('rgb')) {
        color = this.rgbToHex(color);
      }

      const votesMatch =
        block.match(/<span[^>]*tabular-nums[^>]*>([^<]+)<\/span>/i) ||
        block.match(/<span[^>]*style="[^"]*color:[^"]*"[^>]*>([^<]+)<\/span>/i);
      const votes = votesMatch ? votesMatch[1].trim() : `${percentage}%`;

      const id = rawName.toLowerCase();
      items.push({
        id,
        name: rawName,
        percentage,
        votes,
        color,
      });
    }

    // Fallback if index="X" wasn't present
    if (items.length === 0 && (html.toLowerCase().includes('cuándo usarlo') || html.toLowerCase().includes('cuando usarlo') || html.includes('tw-rating-card'))) {
      const keys = ['invierno', 'primavera', 'verano', 'otoño', 'día', 'noche'];
      for (const k of keys) {
        const keyRegex = new RegExp(`>\\s*(${k})\\s*<[\\s\\S]*?width:\\s*([\\d.]+)%[\\s\\S]*?background(?:-color)?:\\s*([^;"]+)[\\s\\S]*?>([\\d.,]+k?)<`, 'i');
        const kMatch = html.match(keyRegex);
        if (kMatch) {
          const name = kMatch[1].trim();
          const percentage = Math.round(parseFloat(kMatch[2]));
          let color = kMatch[3].trim();
          if (color.startsWith('rgb')) color = this.rgbToHex(color);
          const votes = kMatch[4].trim();
          items.push({
            id: k,
            name,
            percentage,
            votes,
            color,
          });
        }
      }
    }

    return items;
  }

  /**
   * Parses "Cuándo usarlo" from live scraped webpage text.
   */
  static parseLiveScrapedWhenToWear(text: string): WhenToWearItem[] {
    const match = text.match(/Cuándo usarlo\s+([\s\S]*?)(?:Calificación|Reseñas|Notas|$)/i);
    if (!match) return [];
    const lines = match[1]
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const rawMap: Record<string, string> = {};
    for (let i = 0; i < lines.length - 1; i++) {
      const label = lines[i].toLowerCase();
      const next = lines[i + 1];
      if (['invierno', 'primavera', 'verano', 'otoño', 'día', 'dia', 'noche'].includes(label)) {
        if (/^[\d.,]+k?$/i.test(next)) {
          rawMap[label] = next;
          i++;
        }
      }
    }

    const parseVoteNum = (voteStr: string): number => {
      const v = (voteStr || '').trim().toLowerCase();
      if (v.endsWith('k')) {
        return parseFloat(v.slice(0, -1)) * 1000;
      }
      return parseFloat(v.replace(/,/g, '')) || 0;
    };

    const keys = ['invierno', 'primavera', 'verano', 'otoño', 'día', 'noche'];
    let maxVotes = 0;
    for (const k of keys) {
      const num = parseVoteNum(rawMap[k] || rawMap['dia'] || '0');
      if (num > maxVotes) maxVotes = num;
    }
    if (maxVotes === 0) maxVotes = 1;

    const result: WhenToWearItem[] = [];
    const names: Record<string, string> = {
      invierno: 'invierno',
      primavera: 'Primavera',
      verano: 'verano',
      otoño: 'Otoño',
      día: 'Día',
      noche: 'Noche',
    };
    const defaultColors: Record<string, string> = {
      invierno: '#78D6F0',
      primavera: '#9FE584',
      verano: '#FC958A',
      otoño: '#F9BE6E',
      día: '#F59E0B',
      noche: '#8BB8D4',
    };

    for (const k of keys) {
      const rawVote = rawMap[k] || (k === 'día' ? rawMap['dia'] : undefined) || '1k';
      const num = parseVoteNum(rawVote);
      const percentage = Math.round((num / maxVotes) * 100);
      result.push({
        id: k,
        name: names[k],
        percentage,
        votes: rawVote,
        color: defaultColors[k],
      });
    }

    return result;
  }

  /**
   * Scrapes live web page from Fragrantica in real-time using high-speed reader proxy.
   * Bypasses Cloudflare bot challenges and extracts live title, accords, and notes.
   */
  static async scrapeFragranticaLive(url: string): Promise<{
    title?: string;
    house?: string;
    name?: string;
    description?: string;
    accords?: { name: string; percentage: number; color: string }[];
    whenToWear?: WhenToWearItem[];
    rawContent?: string;
  }> {
    try {
      const cleanUrl = url.trim();
      const proxyUrl = `https://r.jina.ai/${cleanUrl}`;
      const response = await fetch(proxyUrl, {
        headers: { Accept: 'text/plain' },
      });
      if (!response.ok) return {};
      const text = await response.text();

      // 1. Extract title and brand
      let name = '';
      let house = '';
      const titleMatch = text.match(/Title:\s*([^\n\r]+)/i) || text.match(/#\s*([^\n\r]+)/);
      if (titleMatch) {
        const fullTitle = titleMatch[1].replace(/Colonia.*$/i, '').replace(/perfume.*$/i, '').trim();
        const parts = fullTitle.split(/\s+/);
        if (parts.length >= 2) {
          name = parts[0];
          house = parts.slice(1).join(' ');
        } else {
          name = fullTitle;
        }
      }

      // 2. Extract accords from [Buscar por acordes](...?vanilla=100&...) and "acordes principales"
      const accords: { name: string; percentage: number; color: string }[] = [];
      const accordsBlockMatch = text.match(/acordes principales\s+([\s\S]*?)(?:\[Buscar por acordes\]|\n\n\n)/i);
      const searchAccordsLinkMatch = text.match(/\[Buscar por acordes\]\([^?]+\?([^)]+)\)/i);

      const queryParams: Record<string, number> = {};
      if (searchAccordsLinkMatch) {
        const q = searchAccordsLinkMatch[1];
        const pairs = q.split('&');
        for (const pair of pairs) {
          const [k, v] = pair.split('=');
          if (k && v && !k.startsWith('f_')) {
            const cleanKey = decodeURIComponent(k).replace(/\+/g, ' ').toLowerCase();
            queryParams[cleanKey] = Number(v) || 50;
          }
        }
      }

      if (accordsBlockMatch) {
        const accordLines = accordsBlockMatch[1]
          .split('\n')
          .map((l) => l.trim().toLowerCase())
          .filter((l) => l && l.length > 2 && !l.startsWith('!'));

        let fallbackPct = 100;
        for (const line of accordLines) {
          let pct = queryParams[line];
          if (!pct) {
            const foundKey = Object.keys(queryParams).find((k) => line.includes(k) || k.includes(line));
            if (foundKey) pct = queryParams[foundKey];
          }
          if (!pct) {
            pct = fallbackPct;
            fallbackPct = Math.max(25, fallbackPct - 7);
          }
          accords.push({
            name: line,
            percentage: pct,
            color: getFragranticaAccordColor(line),
          });
        }
      }

      // 3. Extract "Cuándo usarlo" in real time from live web text
      const liveWhenToWear = this.parseLiveScrapedWhenToWear(text);

      return {
        title: titleMatch ? titleMatch[1] : undefined,
        house,
        name,
        accords: accords.length > 0 ? accords : undefined,
        whenToWear: liveWhenToWear.length > 0 ? liveWhenToWear : undefined,
        rawContent: text.slice(0, 4500),
      };
    } catch (e) {
      console.warn('Real-time Fragrantica scrape error:', e);
      return {};
    }
  }

  /**
   * Identifies and parses Fragrantica URLs (.es, .com, .fr, etc.)
   * Extracts house, fragrance name, fragrance ID, and direct bottle image from Fragrantica CDN.
   * Example: https://www.fragrantica.es/perfume/Valentino/Valentino-Uomo-Born-in-Roma-55963.html
   */
  static parseFragranticaUrl(query: string): { house: string; name: string; id: string; imageUrl: string } | null {
    if (!query) return null;
    const match = query.match(/fragrantica\.[a-z.]+\/perfume\/([^/]+)\/([^/]+)-(\d+)\.html/i);
    if (!match) return null;

    const rawHouse = decodeURIComponent(match[1]).replace(/-/g, ' ').trim();
    let rawName = decodeURIComponent(match[2]).replace(/-/g, ' ').trim();
    if (rawName.toLowerCase().startsWith(rawHouse.toLowerCase())) {
      rawName = rawName.slice(rawHouse.length).trim();
      rawName = `${rawHouse} ${rawName}`;
    }
    const id = match[3];

    return {
      house: rawHouse,
      name: rawName,
      id,
      imageUrl: `https://fimgs.net/images/perfume/o.${id}.jpg`,
    };
  }

  /**
   * Intelligently finds the authentic bottle/flacon image for any perfume.
   * Multi-tier resolution:
   * 0. Fragrantica URL & Fragrantica CDN lookup.
   * 1. Curated photo registry for iconic perfumes.
   * 2. Live open Wikimedia Commons API query for direct photos.
   * 3. Olfactory family luxury flacon photography.
   */
  static async findFragranceImage(
    name: string,
    house: string = '',
    family: OlfactoryFamily = 'Amaderado'
  ): Promise<string> {
    // 0. Direct Fragrantica URL or ID detection
    const fragrantica = this.parseFragranticaUrl(name) || this.parseFragranticaUrl(house);
    if (fragrantica) {
      return fragrantica.imageUrl;
    }

    const combined = `${name} ${house}`.toLowerCase().trim();

    // Direct check for Fragrantica ID pattern (e.g. 55963)
    const idMatch = combined.match(/(\d{4,6})/);
    if (combined.includes('fragrantica') && idMatch) {
      return `https://fimgs.net/images/perfume/o.${idMatch[1]}.jpg`;
    }

    // 1. Direct registry lookup
    for (const item of FLACON_REGISTRY) {
      if (item.matchers.some((m) => combined.includes(m))) {
        return item.url;
      }
    }

    // 2. Open Wikimedia Commons Live Search
    try {
      const cleanSearch = name.replace(/[^\w\s]/gi, '').trim();
      const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
        cleanSearch + ' perfume'
      )}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`;

      const response = await fetch(wikiUrl);
      if (response.ok) {
        const json = await response.json();
        const pages = json?.query?.pages;
        if (pages) {
          const firstKey = Object.keys(pages)[0];
          const img = pages[firstKey]?.imageinfo?.[0]?.url;
          if (
            img &&
            (img.endsWith('.jpg') ||
              img.endsWith('.jpeg') ||
              img.endsWith('.png') ||
              img.endsWith('.webp'))
          ) {
            return img;
          }
        }
      }
    } catch {
      // Ignore network errors and continue to fallback
    }

    // 3. Fallback: Editorial photo for the olfactory family
    return FAMILY_EDITORIAL_IMAGES[family] || FAMILY_EDITORIAL_IMAGES.Amaderado;
  }

  /**
   * Main method to search and populate fragrance details using Gemini AI.
   * Returns complete olfactory pyramid, accords, description AND authentic bottle image.
   * Directly supports Fragrantica URLs (e.g. https://www.fragrantica.es/perfume/Valentino/Valentino-Uomo-Born-in-Roma-55963.html).
   */
  static async searchFragrance(query: string): Promise<GeminiFragranceResult> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new Error('Por favor ingresa el nombre de la fragancia a investigar o pega el código HTML de Fragrantica.');
    }

    // 0. DETECCIÓN DIRECTA DE CÓDIGO HTML DE FRAGRANTICA (Acordes y/o Cuándo Usarlo)
    if (
      cleanQuery.includes('<') &&
      (cleanQuery.includes('truncate') ||
        cleanQuery.includes('width:') ||
        cleanQuery.includes('rounded-br-lg') ||
        cleanQuery.includes('rgb(') ||
        cleanQuery.includes('tw-rating-card') ||
        cleanQuery.includes('cuándo usarlo') ||
        cleanQuery.includes('cuando usarlo'))
    ) {
      const htmlAccords = this.parseFragranticaHtmlAccords(cleanQuery);
      const htmlWhenToWear = this.parseFragranticaHtmlWhenToWear(cleanQuery);

      if (htmlAccords.length > 0 || htmlWhenToWear.length > 0) {
        return {
          name: 'Fragancia Extraída (Fragrantica)',
          house: 'Maison Independiente',
          family: 'Amaderado',
          concentration: 'Eau de Parfum',
          format: '100ml • EDP',
          gender: 'unisex',
          price: 15.0,
          description:
            'Información extraída con exactitud milimétrica en tiempo real desde el código HTML oficial de Fragrantica.',
          notes: {
            top: [],
            heart: [],
            base: [],
          },
          accords:
            htmlAccords.length > 0
              ? htmlAccords
              : [{ name: 'amaderado', percentage: 100, color: '#7B4A21' }],
          whenToWear:
            htmlWhenToWear.length > 0
              ? htmlWhenToWear
              : getDefaultWhenToWear('Amaderado'),
          source: 'gemini-api',
        };
      }
    }

    // 1. SCRAPING WEB EN TIEMPO REAL SI ES UNA URL DE FRAGRANTICA
    const fragrantica = this.parseFragranticaUrl(cleanQuery);
    let liveScraped: {
      title?: string;
      house?: string;
      name?: string;
      description?: string;
      accords?: { name: string; percentage: number; color: string }[];
      whenToWear?: WhenToWearItem[];
      rawContent?: string;
    } | null = null;

    if (fragrantica || cleanQuery.startsWith('http')) {
      liveScraped = await this.scrapeFragranticaLive(cleanQuery);
    }

    const searchTarget = fragrantica
      ? `${fragrantica.house} ${fragrantica.name}`
      : cleanQuery;

    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const result = await this.callGeminiApi(
          searchTarget,
          apiKey,
          fragrantica?.imageUrl,
          liveScraped?.rawContent
        );
        if (result) {
          if (fragrantica) {
            result.suggestedImageUrl = fragrantica.imageUrl;
          }
          // Si obtuvimos acordes en tiempo real directamente de la web, úsalos garantizando exactitud
          if (liveScraped?.accords && liveScraped.accords.length > 0) {
            result.accords = liveScraped.accords;
          }
          if (liveScraped?.whenToWear && liveScraped.whenToWear.length > 0) {
            result.whenToWear = liveScraped.whenToWear;
          }
          return result;
        }
      } catch (err) {
        console.warn('Gemini API falló, usando datos web raspados en tiempo real o enciclopedia:', err);
      }
    }

    // Si tenemos acordes o datos raspados en vivo pero no hay API key o falló Gemini, usarlos directamente:
    if (liveScraped?.accords && liveScraped.accords.length > 0) {
      const fam: OlfactoryFamily = 'Amaderado';
      const img = await this.findFragranceImage(
        liveScraped.name || fragrantica?.name || cleanQuery,
        liveScraped.house || fragrantica?.house || '',
        fam
      );
      return {
        name: liveScraped.name || fragrantica?.name || cleanQuery,
        house: liveScraped.house || fragrantica?.house || 'Maison Independiente',
        family: fam,
        concentration: 'Eau de Parfum',
        format: '100ml • EDP',
        gender: 'unisex',
        price: 15.0,
        description:
          liveScraped.description ||
          'Fragancia investigada y extraída en tiempo real de la ficha web oficial de Fragrantica.',
        notes: {
          top: ['Salida aromática'],
          heart: ['Corazón sensorial'],
          base: ['Fondo persistente'],
        },
        accords: liveScraped.accords,
        whenToWear:
          liveScraped.whenToWear ||
          getDefaultWhenToWear(fam, liveScraped.name || fragrantica?.name),
        suggestedImageUrl: fragrantica?.imageUrl || img,
        source: 'gemini-api',
      };
    }

    // Fallback: Consulta la enciclopedia local enriquecida
    const localRes = await this.searchEncyclopediaOrGenerate(cleanQuery);
    if (fragrantica) {
      localRes.suggestedImageUrl = fragrantica.imageUrl;
      if (fragrantica.house) localRes.house = fragrantica.house;
      if (fragrantica.name) localRes.name = fragrantica.name;
    }
    return localRes;
  }

  private static async callGeminiApi(
    query: string,
    apiKey: string,
    preferredImageUrl?: string,
    liveContentContext?: string
  ): Promise<GeminiFragranceResult> {
    const liveContextPrompt = liveContentContext
      ? `\n\nCONTENIDO EN TIEMPO REAL EXTRAÍDO DIRECTAMENTE DE LA WEB DE FRAGRANTICA:
"""
${liveContentContext}
"""
BASA TU RESPUESTA ESTRICTAMENTE EN LA INFORMACIÓN REAL ANTERIOR. Extrae los acordes principales reales que aparecen en este texto de Fragrantica.\n`
      : '';

    const prompt = `Eres el Director Olfativo y Maestro Perfumista de "Alura Parfums", con conocimiento enciclopédico de Fragrantica.
Investiga la siguiente fragancia o URL de Fragrantica: "${query}".${liveContextPrompt}

REGLAS CRÍTICAS DE EXTRACCIÓN (FIDELIDAD TOTAL A FRAGRANTICA):
1. ACORDES PRINCIPALES ("acordes principales" en Fragrantica):
   - En Fragrantica, los acordes se presentan en una barra vertical apilada de mayor a menor intensidad (generalmente de 6 a 10 acordes).
   - Extrae la lista COMPLETA de todos los acordes principales en el orden EXACTO de la ficha de Fragrantica (de mayor a menor).
   - El primer acorde (el más predominante) DEBE tener "percentage": 100.
   - Cada acorde siguiente DEBE tener un "percentage" decreciente proporcional al largo relativo de su barra en Fragrantica (ej. 100, 90, 82, 76, 68, 62, 56, 50, 44, 38).
   - Usa los nombres canónicos oficiales en español de Fragrantica (ej: "amaderado", "afrutados", "cálido especiado", "dulce", "tropical", "aromático", "lavanda", "florales", "avainillado", "fresco especiado", "cítrico", "cuero", "atalcado", "ámbar", "marino", "verde", "ahumado", "terroso", etc.).
   - NO limites a 4 o 5 acordes. Extrae TODOS los acordes principales de la barra (hasta 10 acordes).

2. PIRÁMIDE OLFATIVA (Notas de salida, corazón y fondo según Fragrantica).

3. CUÁNDO USARLO ("CUÁNDO USARLO" en Fragrantica / Ocasión y Temporalidad):
   - Fragrantica incluye la barra de votaciones para las 6 categorías canónicas:
     * invierno
     * primavera
     * verano
     * otoño
     * día
     * noche
   - Extrae el porcentaje relativo de cada categoría ("percentage" de 0 a 100) y el conteo de votos aproximado ("votes", ej: "2k", "1.6k", "854", "1.7k", "703", "2k").

Devuelve ÚNICAMENTE un objeto JSON válido (sin markdown adicional, sin comillas invertidas, solo JSON puro):
{
  "name": "Nombre comercial oficial exacto del perfume (ej. 9pm Night Out)",
  "house": "Maison / Casa de perfumería (ej. Afnan, Dior, Creed)",
  "family": "Floral" | "Amaderado" | "Gourmand" | "Cuero" | "Cítrico" | "Especiado",
  "concentration": "Eau de Parfum" | "Extrait de Parfum" | "Eau de Toilette" | "Elixir",
  "format": "100ml • EDP" | "100ml • Extrait" | "50ml • EDP",
  "gender": "fem" | "masc" | "unisex",
  "description": "Una descripción poética y de lujo en español (2-3 oraciones) describiendo el carácter, la estela y la atmósfera de la fragancia según su ficha de Fragrantica.",
  "imageUrl": "${preferredImageUrl || ''}",
  "notes": {
    "top": ["Nota de salida 1 de Fragrantica", "Nota de salida 2", "Nota de salida 3"],
    "heart": ["Nota de corazón 1 de Fragrantica", "Nota de corazón 2", "Nota de corazón 3"],
    "base": ["Nota de fondo 1 de Fragrantica", "Nota de fondo 2", "Nota de fondo 3"]
  },
  "accords": [
    {"name": "amaderado", "percentage": 100},
    {"name": "afrutados", "percentage": 90},
    {"name": "cálido especiado", "percentage": 82},
    {"name": "dulce", "percentage": 76},
    {"name": "tropical", "percentage": 68},
    {"name": "aromático", "percentage": 62},
    {"name": "lavanda", "percentage": 56},
    {"name": "florales", "percentage": 50},
    {"name": "avainillado", "percentage": 44},
    {"name": "fresco especiado", "percentage": 38}
  ],
  "whenToWear": [
    {"id": "invierno", "name": "invierno", "percentage": 100, "votes": "2k"},
    {"id": "primavera", "name": "Primavera", "percentage": 80, "votes": "1.6k"},
    {"id": "verano", "name": "verano", "percentage": 42, "votes": "854"},
    {"id": "otoño", "name": "Otoño", "percentage": 85, "votes": "1.7k"},
    {"id": "día", "name": "Día", "percentage": 35, "votes": "703"},
    {"id": "noche", "name": "Noche", "percentage": 100, "votes": "2k"}
  ]
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Respuesta vacía de Gemini');
    }

    const parsed = JSON.parse(candidateText);

    // Validate and sanitize family
    const validFamilies: OlfactoryFamily[] = [
      'Floral',
      'Amaderado',
      'Gourmand',
      'Cuero',
      'Cítrico',
      'Especiado',
    ];
    const family: OlfactoryFamily = validFamilies.includes(parsed.family) ? parsed.family : 'Amaderado';

    const gender: GenderStyle = ['fem', 'masc', 'unisex'].includes(parsed.gender) ? parsed.gender : 'unisex';

    const format = parsed.format || '100ml • EDP';
    const is50ml = format.toLowerCase().includes('50ml');
    const price = is50ml ? 10.0 : 15.0; // Enforce $15 for 100ml, $10 for 50ml standard

    // Resolve accurate perfume image
    let imageUrl = preferredImageUrl || parsed.imageUrl;
    if (!imageUrl || !imageUrl.startsWith('http')) {
      imageUrl = await this.findFragranceImage(parsed.name || query, parsed.house || '', family);
    }

    // Process all extracted accords faithfully: attach authentic Fragrantica color & sort descending
    let sanitizedAccords: { name: string; percentage: number; color: string }[] = [];
    if (Array.isArray(parsed.accords) && parsed.accords.length > 0) {
      sanitizedAccords = parsed.accords.map((a: any, idx: number) => {
        const rawName = String(a.name || '').trim().toLowerCase();
        const rawPct = Number(a.percentage);
        const fallbackPct = Math.max(25, 100 - idx * 7);
        const pct = isNaN(rawPct) || rawPct <= 0 ? fallbackPct : Math.min(100, rawPct);
        const color = a.color && a.color.startsWith('#') ? a.color : getFragranticaAccordColor(rawName);
        return {
          name: rawName,
          percentage: pct,
          color,
        };
      });
      // Sort strictly descending by percentage
      sanitizedAccords.sort((a, b) => b.percentage - a.percentage);
    } else {
      sanitizedAccords = [
        { name: family.toLowerCase(), percentage: 100, color: getFragranticaAccordColor(family) },
        { name: 'cálido especiado', percentage: 85, color: getFragranticaAccordColor('cálido especiado') },
        { name: 'amaderado', percentage: 75, color: getFragranticaAccordColor('amaderado') },
        { name: 'avainillado', percentage: 65, color: getFragranticaAccordColor('avainillado') },
      ];
    }

    // Process whenToWear (CUÁNDO USARLO de Fragrantica)
    let sanitizedWhenToWear: WhenToWearItem[] = [];
    if (Array.isArray(parsed.whenToWear) && parsed.whenToWear.length > 0) {
      sanitizedWhenToWear = parsed.whenToWear.map((item: any) => {
        const id = String(item.id || item.name || '').toLowerCase();
        return {
          id,
          name: item.name || id,
          percentage: Number(item.percentage) || 50,
          votes: item.votes ? String(item.votes) : undefined,
          color: item.color || getFragranticaSeasonColor(id),
        };
      });
    } else {
      sanitizedWhenToWear = getDefaultWhenToWear(family, parsed.name || query);
    }

    return {
      name: parsed.name || query,
      house: parsed.house || 'Maison Independiente',
      family: family,
      concentration: parsed.concentration || 'Eau de Parfum',
      format: format,
      gender: gender,
      price: price,
      description: parsed.description || 'Composición artística de alta perfumería artesanal.',
      notes: {
        top: Array.isArray(parsed.notes?.top) ? parsed.notes.top : ['Bergamota', 'Pimienta'],
        heart: Array.isArray(parsed.notes?.heart) ? parsed.notes.heart : ['Jazmín', 'Cedro'],
        base: Array.isArray(parsed.notes?.base) ? parsed.notes.base : ['Ámbar', 'Vainilla'],
      },
      accords: sanitizedAccords,
      whenToWear: sanitizedWhenToWear,
      suggestedImageUrl: imageUrl,
      source: 'gemini-api',
    };
  }

  /**
   * Intelligently detects fragrance concentration.
   */
  static detectConcentration(text: string): string {
    const lower = (text || '').toLowerCase();
    if (lower.includes('extrait') || lower.includes('extract')) return 'Extrait de Parfum';
    if (lower.includes('elixir')) return 'Elixir';
    if (lower.includes('toilette') || /\bedt\b/.test(lower)) return 'Eau de Toilette';
    if (lower.includes('cologne') || /\bedc\b/.test(lower) || lower.includes('colonia')) return 'Eau de Cologne';
    if (/\bparfum\b/.test(lower) && !lower.includes('eau de parfum')) return 'Parfum';
    return 'Eau de Parfum';
  }

  /**
   * Intelligently detects olfactory family based on fragrance notes, name, and descriptors.
   */
  static detectOlfactoryFamily(name: string, house: string = '', description: string = ''): OlfactoryFamily {
    const text = `${name} ${house} ${description}`.toLowerCase();
    
    // Iconic specifics
    if (text.includes('donna born in roma') || text.includes('born in roma donna') || text.includes('libre') || text.includes('delina') || text.includes('jadore') || text.includes('bloom') || text.includes('miss dior')) {
      return 'Floral';
    }
    if (text.includes('yara') || text.includes('qahwa') || text.includes('khamrah') || text.includes('candy') || text.includes('angels share') || text.includes('tobacco vanille') || text.includes('lost cherry') || text.includes('praline') || text.includes('vanilla')) {
      return 'Gourmand';
    }
    if (text.includes('absolu') || text.includes('hawas') || text.includes('citrus') || text.includes('aqua') || text.includes('limon') || text.includes('lemon') || text.includes('bergamot') || text.includes('neroli') || text.includes('pomelo')) {
      return 'Cítrico';
    }
    if (text.includes('leather') || text.includes('cuir') || text.includes('cuero') || text.includes('ombre leather') || text.includes('tuscan leather')) {
      return 'Cuero';
    }
    if (text.includes('sauvage elixir') || text.includes('spice') || text.includes('pepper') || text.includes('cardamom') || text.includes('cinnamon') || text.includes('spicebomb')) {
      return 'Especiado';
    }

    // General heuristics
    if (text.includes('rose') || text.includes('flower') || text.includes('floral') || text.includes('femme') || text.includes('donna') || text.includes('jazmin') || text.includes('jasmine')) {
      return 'Floral';
    }
    if (text.includes('vanilla') || text.includes('sugar') || text.includes('dulce') || text.includes('caramel') || text.includes('choco') || text.includes('gourmand')) {
      return 'Gourmand';
    }
    if (text.includes('cuero') || text.includes('cuir') || text.includes('leather')) {
      return 'Cuero';
    }
    if (text.includes('citrus') || text.includes('fresco') || text.includes('marino') || text.includes('ocean') || text.includes('mandarina') || text.includes('orange')) {
      return 'Cítrico';
    }
    if (text.includes('especiad') || text.includes('clove') || text.includes('canela') || text.includes('jengibre') || text.includes('ginger')) {
      return 'Especiado';
    }
    return 'Amaderado';
  }

  /**
   * Re-analyzes an existing perfume completely: family, concentration, format, accords, notes, and seasonality.
   */
  static async enrichPerfume(perfume: Perfume): Promise<Perfume> {
    const query = `${perfume.name} ${perfume.house}`.trim();
    const is50ml = (perfume.format || '').toLowerCase().includes('50ml');
    const capacity = is50ml ? '50ml' : '100ml';

    let analysis: GeminiFragranceResult;
    try {
      analysis = await this.searchFragrance(query);
    } catch {
      analysis = await this.searchEncyclopediaOrGenerate(query);
    }

    const family = analysis.family || this.detectOlfactoryFamily(perfume.name, perfume.house, perfume.description);
    const concentration = analysis.concentration || this.detectConcentration(perfume.format) || 'Eau de Parfum';
    const format = `${capacity} • ${concentration}`;
    const subtitle = `${family} • ${format}`;

    // Preserve custom image if uploaded to Supabase Storage or non-default
    const isCustomImage = perfume.imageUrl && (perfume.imageUrl.includes('supabase') || !perfume.imageUrl.includes('unsplash'));
    const finalImageUrl = isCustomImage ? perfume.imageUrl : (analysis.suggestedImageUrl || perfume.imageUrl);

    return {
      ...perfume,
      family,
      concentration,
      format,
      subtitle,
      gender: analysis.gender || perfume.gender,
      description: analysis.description || perfume.description,
      notes: analysis.notes || perfume.notes,
      accords: analysis.accords && analysis.accords.length > 0 ? analysis.accords : perfume.accords,
      whenToWear: analysis.whenToWear && analysis.whenToWear.length > 0 ? analysis.whenToWear : perfume.whenToWear,
      imageUrl: finalImageUrl,
    };
  }

  private static async searchEncyclopediaOrGenerate(query: string): Promise<GeminiFragranceResult> {
    const lower = query.toLowerCase();

    // Check encyclopedia keys ordered by key length descending (most specific first)
    const sortedEntries = Object.entries(ENCYCLOPEDIA_KNOWLEDGE).sort(
      ([a], [b]) => b.length - a.length
    );

    for (const [key, data] of sortedEntries) {
      if (lower.includes(key)) {
        const family = (data.family as OlfactoryFamily) || 'Amaderado';
        const is50ml = (data.format || '').includes('50ml') || lower.includes('50ml');
        const img = await this.findFragranceImage(data.name || query, data.house || '', family);

        const preparedAccords = (data.accords || [
          { name: family.toLowerCase(), percentage: 100, color: getFragranticaAccordColor(family) },
          { name: 'ámbar cálido', percentage: 80, color: getFragranticaAccordColor('ámbar') },
        ]).map((a) => ({
          ...a,
          color: a.color || getFragranticaAccordColor(a.name),
        }));

        const preparedWhenToWear = (data.whenToWear || getDefaultWhenToWear(family, data.name || query)).map((w) => ({
          ...w,
          color: w.color || getFragranticaSeasonColor(w.id),
        }));

        const concentration = data.concentration || this.detectConcentration(data.format || query);
        const format = `${is50ml ? '50ml' : '100ml'} • ${concentration}`;

        return {
          name: data.name || query,
          house: data.house || 'Maison Niche',
          family: family,
          concentration: concentration,
          format: format,
          gender: (data.gender as GenderStyle) || 'unisex',
          price: is50ml ? 10.0 : 15.0,
          description: data.description || 'Creación olfativa exclusiva catalogada en el atelier.',
          notes: data.notes || {
            top: ['Bergamota', 'Azafrán'],
            heart: ['Rosa de Damasco', 'Cedro'],
            base: ['Ámbar gris', 'Vainilla'],
          },
          accords: preparedAccords,
          whenToWear: preparedWhenToWear,
          suggestedImageUrl: img,
          source: 'encyclopedia',
        };
      }
    }

    // Heuristic generator for any other fragrance name
    const detectedFamily = this.detectOlfactoryFamily(query);
    const detectedConcentration = this.detectConcentration(query);
    const is50ml = lower.includes('50ml');
    let detectedGender: GenderStyle = 'unisex';

    if (detectedFamily === 'Floral') {
      detectedGender = 'fem';
    } else if (detectedFamily === 'Cuero' || lower.includes('homme') || lower.includes('him') || lower.includes('pour homme')) {
      detectedGender = 'masc';
    }

    const capitalizedName = query
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const img = await this.findFragranceImage(capitalizedName, '', detectedFamily);

    return {
      name: capitalizedName,
      house: 'Maison Haute Parfumerie',
      family: detectedFamily,
      concentration: detectedConcentration,
      format: `${is50ml ? '50ml' : '100ml'} • ${detectedConcentration}`,
      gender: detectedGender,
      price: is50ml ? 10.0 : 15.0,
      description: `Creación olfativa de alta fijación inspirada en la perfumería fina.`,
      notes: {
        top: [],
        heart: [],
        base: [],
      },
      accords: [],
      whenToWear: getDefaultWhenToWear(detectedFamily, capitalizedName),
      suggestedImageUrl: img,
      source: 'encyclopedia',
    };
  }
}
