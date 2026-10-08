export type OlfactoryFamily =
  | 'Floral'
  | 'Amaderado'
  | 'Gourmand'
  | 'Cuero'
  | 'Cítrico'
  | 'Especiado';

export type GenderStyle = 'fem' | 'masc' | 'unisex';

export interface Perfume {
  id: string;
  name: string;
  house: string;
  subtitle: string;
  gender: GenderStyle;
  price: number;
  stock: number;
  hasSample: boolean;
  samplePrice?: number;
  format: string; // e.g. "100ml • EDP", "50ml • Elixir", "Decant 10ml"
  categoryTag?: string; // e.g. "Icono del Atelier", "Alta Demanda", "Pre-orden"
  description: string;
  family: OlfactoryFamily;
  imageUrl: string;
  imageAlt: string;
  notes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
  sampleStatusText?: string; // e.g. "Muestra Activa", "Solo Muestra", "1 en vitrina"
  isBestseller?: boolean;
}

export interface OlfactoryFamilyCategory {
  id: string;
  name: string;
  creationsCount: number;
  description: string;
  keyNotes: string;
  imageUrl: string;
}
