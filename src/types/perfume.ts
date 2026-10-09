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
  accords?: { name: string; percentage: number; color?: string }[];
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

export const OLFACTORY_FAMILIES_DATA: OlfactoryFamilyCategory[] = [
  {
    id: 'fam-floral',
    name: 'Floral & Blanco',
    creationsCount: 6,
    description: 'Jazmín sambac, rosas de mayo y flor de azahar recolectados al amanecer.',
    keyNotes: 'Jazmín, Rosa Damascena, Nardo',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAMfsvHoKnB7JQ803rlLOU1A9CfFjGYiprcUzYeKkdXhdCaYS8PSgviJG2BCAZwQsdFVCVi2e1sXmTNjsLIBIBd7uUt79M5SeKgIU6nXG1TRvCMt_OQ0ZwKSCWYMclDVebTNhJvX1MBFZ5MnpACI4PS9wL9SehCMeKZlb_TLfI3q4InpU8L7JjO9FDb-YNXiaDIgRWPLxFDfSQE_hxNUsX7ZZIT794P8tAFGeJlX55s',
  },
  {
    id: 'fam-amaderado',
    name: 'Amaderado Noble',
    creationsCount: 5,
    description: 'Cedro del Atlas, sándalo australiano y vetiver ahumado de alta permanencia.',
    keyNotes: 'Sándalo, Vetiver, Cedro',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCyMj8LPCzdWC6jVXEvLgBnVn1htGSSe4l47mRq8mup-qZZ2WGZ6L-xwxOXf6jafZaaTB1kt_yeR6IKpQ9Emay3fIMeDvaYEIlcDXg_lA5NZJWZPMo3RdUgkXlM7rNQAGLE0XGwGvoaPdrU61PA_hMw5Pa9IG9CPbGv8K_xPfGqphX2mwZ1viFxt8U0QiyRS0fivwjEzaxyDqqnyhZ97Cn6i0rZdvZjsoB8gRTQX3Db',
  },
  {
    id: 'fam-gourmand',
    name: 'Gourmand & Resinas',
    creationsCount: 4,
    description: 'Vainilla Bourbon, café arábico tostado, canela y praliné especiado.',
    keyNotes: 'Vainilla Bourbon, Café, Tonka',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB98pL6xtEVJYq2aI5VwexLOEyTQOFDN6Rd8lhS81cVvHnfK4NSnPM2KEktJtCvXChbeaL8KeGWBcnJJsbqa4IOdBd7THC-5VwCW_a9yX-YtlW2XJq9GrV1XhyaOA1iiXnilG1EogD10j43nzaLh3tPGCh8xrTkTgtyBxs7u897my4nOwMrJrx8gMszhjh8oRjtA47rNSj6DudVoAh2gW9Zyef05PduYYaCEQEOcKJU',
  },
  {
    id: 'fam-cuero',
    name: 'Cuero & Ámbar',
    creationsCount: 3,
    description: 'Cuero toscano pulido, benjuí de Siam y humo sagrado de incienso.',
    keyNotes: 'Cuero, Incienso, Ámbar gris',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvZ-jpmMmA1g_UPZ9hViJTqJmABkJ1SVUYm74VLPtLdygF0pd3uTTTp6nJjO-BoZaOnWZRTH49_1pMXUvih63V8rd8PstaqYTAumcrzMnQ_jVaX17zpitzHcSirGCPz1QtC9Mi0oMCNdmAjUjxKP9ZqCEXAVltzHpgrx7cT_lQvKcbWGzogcmQTMZwqu4RkISrNdU8eupgUXWoBR3DsQb9Ei8BVWqfdVqrGUcuYu5O',
  },
];

