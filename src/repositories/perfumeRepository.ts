import { Perfume, OlfactoryFamilyCategory } from '../types/perfume';
import { LocalStorageAdapter, supabase } from '../db/supabaseClient';

const INITIAL_PERFUMES: Perfume[] = [
  {
    id: 'p-1',
    name: 'Donna Born in Roma',
    house: 'Valentino',
    subtitle: 'Extracto Floral Ambarino • 100ml',
    gender: 'fem',
    price: 60.0,
    stock: 1,
    hasSample: true,
    samplePrice: 10.0,
    format: '100ml • EDP',
    categoryTag: 'Icono del Atelier',
    sampleStatusText: 'Muestra Activa',
    description:
      'Trilogía de jazmín blanco, grosella negra y una infusión suntuosa de vainilla Bourbon con maderas nobles.',
    family: 'Floral',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbXAjfBXcFy-gZ6ZyVZ33BhhVQLnkxF19TxLza72qtz0F-yz9JHJNPU2GYUyA72Ki5ORXLFnMRVOhMSoP9cFr_awMgbeOKU0FWbXpkjohOCdaal_OVCN7qp7uRzIxit5tVG7IEjlyfyMmojWaCUC3DO5871CqKe-MLvaHqDdpsfuf24Jix8bkJxS-eHYJ64MOAcKZzKuVNDBQeOb5reAauHbzUGCsd6io5FbRZbDj',
    imageAlt:
      'Exquisite flacon of Valentino Donna Born in Roma studded with signature rockstuds on pale cream travertine marble lit by gentle Place Vendome morning daylight',
    isBestseller: true,
    notes: {
      top: ['Grosella negra', 'Pimienta rosa', 'Bergamota'],
      heart: ['Jazmín grandiflorum', 'Té de jazmín', 'Azahar'],
      base: ['Vainilla bourbon', 'Cachemira', 'Madera de guayaco'],
    },
  },
  {
    id: 'p-2',
    name: 'Khamrah QAHWA',
    house: 'Lattafa Perfumes',
    subtitle: 'Edición gourmand embriagadora • 100ml',
    gender: 'masc',
    price: 35.0,
    stock: 0,
    hasSample: true,
    samplePrice: 10.0,
    format: '100ml • EDP',
    categoryTag: 'Pre-orden / Apartar',
    sampleStatusText: 'Agotado en Vitrina',
    description:
      'Edición gourmand embriagadora: canela tostada, café arábico, praliné ahumado y resinas doradas.',
    family: 'Gourmand',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB98pL6xtEVJYq2aI5VwexLOEyTQOFDN6Rd8lhS81cVvHnfK4NSnPM2KEktJtCvXChbeaL8KeGWBcnJJsbqa4IOdBd7THC-5VwCW_a9yX-YtlW2XJq9GrV1XhyaOA1iiXnilG1EogD10j43nzaLh3tPGCh8xrTkTgtyBxs7u897my4nOwMrJrx8gMszhjh8oRjtA47rNSj6DudVoAh2gW9Zyef05PduYYaCEQEOcKJU',
    imageAlt:
      'Cut crystal flacon of Lattafa Khamrah Qahwa with rich deep amber perfume surrounded by roasted coffee beans',
    isBestseller: true,
  },
  {
    id: 'p-3',
    name: 'Club de Nuit Urban Elixir',
    house: 'Armaf',
    subtitle: 'Acorde magnético de bergamota y ámbar • 50ml',
    gender: 'masc',
    price: 10.0,
    stock: 0,
    hasSample: false,
    format: '50ml • Elixir',
    categoryTag: 'Lote Finalizado',
    sampleStatusText: 'Agotado',
    description:
      'Acorde magnético de bergamota, pimienta rosa, ámbar gris y pachulí mineral de alta proyección.',
    family: 'Amaderado',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCyMj8LPCzdWC6jVXEvLgBnVn1htGSSe4l47mRq8mup-qZZ2WGZ6L-xwxOXf6jafZaaTB1kt_yeR6IKpQ9Emay3fIMeDvaYEIlcDXg_lA5NZJWZPMo3RdUgkXlM7rNQAGLE0XGwGvoaPdrU61PA_hMw5Pa9IG9CPbGv8K_xPfGqphX2mwZ1viFxt8U0QiyRS0fivwjEzaxyDqqnyhZ97Cn6i0rZdvZjsoB8gRTQX3Db',
    imageAlt:
      'Monolithic black lacquer bottle of Armaf Club de Nuit Urban Elixir resting on brushed champagne brass surface',
  },
  {
    id: 'p-4',
    name: 'Santal 33',
    house: 'Le Labo',
    subtitle: 'Decant Atelier 10ml • Atomizador Dorado',
    gender: 'masc',
    price: 10.0,
    stock: 1,
    hasSample: true,
    samplePrice: 10.0,
    format: '50ml • Formato Especial',
    categoryTag: 'Decant Atelier',
    sampleStatusText: '1 disponible',
    description:
      'Cardamomo, iris, violeta y sándalo australiano con acordes ahumados de cuero artesanal.',
    family: 'Amaderado',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvPngHsj9BKYKVtZJzR1hyR1wks53UJxqtsECJioKaz3j0rbckJrRfzMRPLJdIC6useUVfei0VhCE1O5YQ5KHjpRi6v-xlpBCpXtgfU5CDngLnuBhQRn-3yU7bRxNYUSbuDQso2lLm3o-CDigplH3VR5K3MTNY-2qtv-5NH_UCoXM3B8L8Uj-Zua4dyfwW3l907uHQvv6OCWpmRHE2PcMF9Lc7-mLSbWwVe7L8nJ6p',
    imageAlt:
      'Apothecary style minimalist glass bottle of Le Labo Santal 33 with typewriter printed cream paper label',
    isBestseller: true,
  },
  {
    id: 'p-5',
    name: 'Absolute Aventus',
    house: 'House of Creed',
    subtitle: '50ml Decant Privé • Reserva Oficial',
    gender: 'masc',
    price: 10.0,
    stock: 2,
    hasSample: true,
    samplePrice: 10.0,
    format: '50ml • Parfum',
    categoryTag: 'Alta Demanda',
    sampleStatusText: '2 disponibles',
    description:
      'La cumbre del legado Creed: grosellas negras silvestres, piña ahumada, jengibre y vetiver de Haití.',
    family: 'Amaderado',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBPdNw3mkCtNFlJAnbatz706p6QWTlaMuHD1s_-etq-yBB4fEtk4N2bPq6bDEI2GJa7HhfcDbuRt6JsHrvq9MQEa0vLX3f-mTrh_1KegJ10f87LhaiVC2NUv9GdjVoZ-YS5HpQ3VdVa-O5zFjVNDIBEAEDQJCVjnQ8sFd7kpevjpfQKbrQ8Vb017VgIDGbA10UN4MvPFPANvydFLUob1HuieEO3AFpG7z6X5hxlM64G',
    imageAlt:
      'Regal glossy black flacon of Creed Absolu Aventus with embossed silver crest',
    isBestseller: true,
  },
  {
    id: 'p-6',
    name: 'Poison Girl',
    house: 'Christian DIOR',
    subtitle: '100ml Promo • EDP',
    gender: 'fem',
    price: 10.0,
    stock: 0,
    hasSample: false,
    format: '100ml Promo • EDP',
    categoryTag: 'Promo Especial',
    sampleStatusText: 'Agotado',
    description:
      'Naranja amarga siciliana, rosa de Grasse, flor de azahar y haba tonka de Venezuela ultra sensual.',
    family: 'Floral',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNiVl1dAVICyRBtguBQC751dyf8zTfEVwWJq4YV0clSy8hDe1eJSx0kH5v5sFgc0wfhhABYig_FmLQM1XhKc85qA1-RMH2jLmPQdyrBMqQp0_Grhne1lORYlwrY3tIOEJAlH0ELPcWzHalaIWTpPO4z2OvJJEisBMz9w70XPpqAqB6WPqXq8Ga9MluYvzpNURGqjWLmNj2yvMbB7KX4YQvcIOfYoi1X4JyNcfBRzZo',
    imageAlt:
      'Curved radiant blush glass bottle of Dior Poison Girl reflecting soft golden sunlight',
  },
  {
    id: 'p-7',
    name: 'Daisy',
    house: 'Marc Jacobs',
    subtitle: '100ml • EDT',
    gender: 'fem',
    price: 15.0,
    stock: 1,
    hasSample: false,
    format: '100ml • EDT',
    sampleStatusText: '1 disponible',
    description:
      'Fresas silvestres, hojas de violeta, pétalos de jazmín blanco y almizcle algodonoso y luminoso.',
    family: 'Floral',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBU0eKPz5ZDZW6fV6Hm93HFCm9AKxIijjaBwXTHvaQRYphnV5SaXGZXPgwbJ-7IeNTBouYeDBsWMFM9Y0tYdXSOwiYNphf1fp1DDnsKVCKWAr8eR4eazYst5IXiOm25j9GyAAjqNe621CvQ-m7ldTMc2a6nfwUfo0DghqcwRl1N0w4BE4Vlrjdcb80gC_lxchYKUEF3yLX3lguoC71Phnvr3_I6V0HUJnY77SKTPRJg',
    imageAlt: 'Charming glass perfume flacon with signature blooming daisy cap',
  },
  {
    id: 'p-8',
    name: 'Your Tous',
    house: 'Lattafa Perfumes',
    subtitle: '100ml • EDP',
    gender: 'fem',
    price: 15.0,
    stock: 0,
    hasSample: false,
    format: '100ml • EDP',
    categoryTag: 'Próximo Reabastecimiento',
    sampleStatusText: 'Agotado',
    description:
      'Acorde floral radiante infusionado con toques de frutas dulces confitadas y maderas cremosas.',
    family: 'Floral',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKxoHWDQI0mwVl8iR1gIZBDB6CoFNyt1EEmVBF4BqYyJF41PT0hTRRg3pO3twfLjuvmsRhQVw3iGWHhKb8vSdrsGziMaF61q50UbeUZniqGfoUo_f3kfGAr8yMIvJiu9kO4cB5nODoGozk-3m5t3iWHZZGuNgPWHugkun38dHZEUTs7dDCCw0k7CYndWJ-K2ix89NmPrfatmc6SFDmtcMwYpIySKxfU1g_Uk2tSn7f',
    imageAlt: 'Sculptural perfume bottle of Lattafa Your Tous with refined metallic accents',
  },
  {
    id: 'p-9',
    name: 'La Bomba',
    house: 'Carolina Herrera',
    subtitle: '100ml • EDP',
    gender: 'fem',
    price: 15.0,
    stock: 1,
    hasSample: false,
    format: '100ml • EDP',
    sampleStatusText: '1 disponible',
    description:
      'Explosión floral oriental de jazmín sambac, cacao tostado y almendras garrapiñadas ultra audaces.',
    family: 'Gourmand',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTwkb1B9kiV8W2KdzqU2fMSrciH61abvO6K7pCkYu8ZaEm6AOBuzJgpvH4iPWJlI18lNmRVmnEsGes2bzUDlk3rysPDvPTrtUIawsIZFiYH-YF_gk5q5iUiBK4LmFXbzPaZitp5sCDbk7dERbtjBPTgOO8cFQBhJCzjRDUHprbOXkTdKDEQirQ7g_CfORV3yTpGeB0vp4a8J_g-5fBzQBLDFGwslLhKhNRKLZV2mR',
    imageAlt: 'Luxury high-fashion Carolina Herrera perfume bottle standing tall on marble',
  },
  {
    id: 'p-10',
    name: 'Can Can',
    house: 'Paris Hilton',
    subtitle: '100ml • EDP',
    gender: 'fem',
    price: 15.0,
    stock: 0,
    hasSample: false,
    format: '100ml • EDP',
    categoryTag: 'Sin Vitrina',
    sampleStatusText: 'Agotado',
    description:
      'Flores de clementina, orquídeas silvestres y flor de azahar secando sobre un lecho de ámbar dulce.',
    family: 'Floral',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtcLFOr7XWxIrprQ7ME0o22mkBAIAUrs2b7Ln6fGy7C7wgPya10UOZD93pGcz_gpHv5OLfkMKRzFUsXNgZpEg0w1UNIGnDxClo4S4JnUHCKNRhGQ7IUk9RoOyFiCKqRhyvOvKclTZF3wEg8Gd8w2conXwypIo-G0hPR7YiVo-5RbjwQ4xlW_fFET37Qb4eDByi0wTqnAqTmuYjS7S2PNkbdRSibbrO-_acmyhVuQvt',
    imageAlt: 'Elegant tall tapered glass bottle of Can Can perfume with soft pink champagne hue',
  },
  {
    id: 'p-11',
    name: 'Stronger With You Intensely',
    house: 'Emporio Armani',
    subtitle: '50ml • EDP',
    gender: 'masc',
    price: 10.0,
    stock: 0,
    hasSample: false,
    format: '50ml • EDP',
    categoryTag: 'Agotado',
    sampleStatusText: 'Agotado',
    description:
      'Acorde adictivo de castaña glaseada, pimienta rosa, canela cálida y vainilla Bourbon de Madagascar.',
    family: 'Gourmand',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRDqNTuOqX7o5onTSVNWOmiXPHarQAUcZHwtVLuqoIyyUpOz7cpsUwaTcFQfZpiknbXNiU6pQLFiCUS0ZKFnzC1SdZqR9psMrM1zbhth46t-bE0Eybw2sb5NlPZ-cpysZBpKK34e3NLgzwG6GF6tm7lUmsDHHsmL4SniYCf8WYTP-qUc2-XB4RwHRwaJsA-hSp1UvLFGd0HUvgI4vcVfGBw7bKb5KUTvaVJPVxmm6Y',
    imageAlt: 'Rich cognac-colored glass bottle of Emporio Armani Stronger With You Intensely',
  },
  {
    id: 'p-12',
    name: 'La Vie Est Belle',
    house: 'Lancôme Paris',
    subtitle: '100ml • L\'Eau de Parfum',
    gender: 'fem',
    price: 15.0,
    stock: 1,
    hasSample: true,
    samplePrice: 5.0,
    format: '100ml • EDP',
    sampleStatusText: '1 disponible',
    description:
      'Iris pallida noble de Florencia, flor de naranjo de Túnez y una caricia cálida de pachulí y praliné.',
    family: 'Floral',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEkobljHnmKe4Gha3GwYdhfJy0tsP7wkiCRirndfJypolr8868LKTlCdNMZ6GWdzZSbM4xk-vdaoEtJ7RJbT4j64UreYIHKkLfTcTXJjeRUkzQ1gv5ZjMwJv01pEwmDp4Uz6cYXCSJAJcbd__HpdQrExs1alSmkU_sLlUBlMoZX3va5mPbILPwM7X1rlYkshKSLUi6DbrjYU2VcWJ_djuUC0GGcMwRQfLhIuCEp0Ex',
    imageAlt: 'Classic smiling crystal bottle of Lancome La Vie Est Belle with silver iridescent ribbon',
  },
  {
    id: 'p-13',
    name: 'Yara Candy',
    house: 'Lattafa Perfumes',
    subtitle: '100ml • EDP',
    gender: 'fem',
    price: 15.0,
    stock: 1,
    hasSample: true,
    samplePrice: 5.0,
    format: '100ml • EDP',
    sampleStatusText: '1 disponible',
    description:
      'Notas de frambuesa caramelizada, mandarina jugosa, malvavisco esponjoso y vainilla sedosa.',
    family: 'Gourmand',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU682nn20rGLInjKj7KGuHvBbbY8c5GVLgOZ9OuUGCdoxCW75gnuuiBJf0zXuSgABeHf1R1VoZR7If5WeBsp4ZFL7MVY5lo6VsaTclz_sJ7QTPGgb8cL6xjY7tJnEKrkvXzshlH8z8tMZYN78Tf-WIxdd7mnqU3UAUJLTZTfXTZNZRAoMontvadIn2caZ64dBVSQ-KHWLMmOVj7EVrKbdXqe8aST1ImNEckFSy0BCh',
    imageAlt: 'Candy-pink and gold embellished flacon of Lattafa Yara Candy',
  },
  {
    id: 'p-14',
    name: 'Yara Tous',
    house: 'Lattafa Perfumes',
    subtitle: '100ml • EDP',
    gender: 'fem',
    price: 15.0,
    stock: 1,
    hasSample: true,
    samplePrice: 5.0,
    format: '100ml • EDP',
    sampleStatusText: '1 disponible',
    description:
      'Mango jugoso exótico, coco cremoso, maracuyá maduro envuelto en jazmín de verano y vainilla dorada.',
    family: 'Floral',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAu7jazXFWu3sYidtA7kBj4RTDehmh6aFj2aZgPORWFCHgJSm-Rh-z9Kf_MDsDSFPyYP8fXgm2Kov8zUnr-vK7SF62aHkl8if9o21Rj7_ApdorLwEaaJn7CZzYgkGA2mX0UQ-N_YQlyb8dQf7gO9oP9JKfMNpu65FlV2mJ163vPXQrpPW9v7qSPhfUbA-jxZzt-law38HVeT-xaobx8PzUE5Zco2aphx11EksLLHvW6',
    imageAlt: 'Tropical sunshine-yellow flacon of Lattafa Yara Tous with gilded filigree',
  },
  {
    id: 'p-15',
    name: 'ASAD Bourbon',
    house: 'Lattafa Perfumes',
    subtitle: '50ml • Special Edition',
    gender: 'masc',
    price: 10.0,
    stock: 1,
    hasSample: false,
    format: '50ml • Special Edition',
    sampleStatusText: '1 disponible',
    description:
      'Pimienta negra picante, piña ahumada, tabaco rubio, café tostado e iris empolvado con benjuí.',
    family: 'Amaderado',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBYF396SrWvFJrRD58C_9T7YwOkZEmxoyR8s0hUBGKfM7U6Ucn_hwUOTYJTnoqOSCwL8ozY-OmpFbVcg1y0fIfvynqcmW_dH9Ys5-ZIWpBGFQLniVhQD6vhHJBBQRKqJLuYIsMMZQnh-hKfb8uW8faCxlNaR8GRpqTk8bOa-0L2acvTVgequ3_ZxIRiceqwv6J-nZ0KuFIRYIK65tGaW0ZPBrNRtun2sSPGDMQrrdla',
    imageAlt: 'Dark heavy masculine bottle of Lattafa Asad with ornate gold bands',
  },
];

export const OLFACTORY_FAMILIES_DATA: OlfactoryFamilyCategory[] = [
  {
    id: 'oriental-gourmand',
    name: 'Orientales & Gourmand',
    creationsCount: 34,
    description: 'Canela noble, vainilla bourbon, resinas de benjuí y café tostado de Arabia.',
    keyNotes: 'Vainilla Bourbon, Café, Canela, Benjuí',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgJxnIFrLiCnlHMPQOUzx0LBWxK7nqLKEPyRAkhUG-4RoItFLD9NaIlTRRE-izUFtdZhps3_nwRksnO-uf2ZLbT-Ye78rZNMe6-RbB3dJSIfjoF60Ftc-qIkb8Q-JCKNa7qRKDrKdyvodpl0KGFP4imWybFIPW4-fzIXpX0enOL1np4xc3y09KtLIoyth1WO4Xn8mfTrBtIRqKGXBPxgLrodhupFIZsnMzqldaO9Iv',
  },
  {
    id: 'florales-nobles',
    name: 'Florales Nobles',
    creationsCount: 42,
    description: 'Rosa de Grasse, jazmín Sambac, iris florentino y azahar de Sevilla.',
    keyNotes: 'Rosa Centifolia, Jazmín Sambac, Iris Pallida',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuApQbu42aB7bs7i1p01mAtn-jZggvNMlyjR1xYoazaRhGpzq6EeOT4wEHidKooM3W0w1_ci8_OB_YCfldj-LtwmjUoPGoxY9UEsSrVOQr6oR_vjjQxuHgMIin_oSOEWVX_5xGtPnhGKzyrAkEdDgjHMMlCqk2oZ8cOgBHyVOVZM13gCAuK-Wd6vb4MibbWAI56f3VXJG1T9tDLrT9uHE4gvK9cjngV4abn8Let9Dr4C',
  },
  {
    id: 'amaderados-aristo',
    name: 'Amaderados Aristocráticos',
    creationsCount: 28,
    description: 'Sándalo de Mysore, oud de Camboya, cedro del Atlas y vetiver de Haití.',
    keyNotes: 'Sándalo Mysore, Cedro Atlas, Oud Real',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBW6lbJt7aN2c3wgb-10jFCvjgsEjPbIq_5lfkGd30FK3JgRHnd5XgXOJlgeL3AA-C791x2idlXQOAfSDJV-hRXCYriTawYeBL8JK91GdbJcm902XUlSBSrDaU84uWQ0Uhgq15tPiu7XkUoRyT-pJoHZ0xClkfrBmNzx5zbZ-k_GJRmTAG3TO52097VwF7N3FU-xN3xl_58_N8RHc0mDI9dAX-69SSnTzoe9-3Om5vk',
  },
  {
    id: 'citricos-frescos',
    name: 'Cítricos Frescos',
    creationsCount: 19,
    description: 'Bergamota de Calabria, mandarina verde, neroli cristalino y yuzu silvestre.',
    keyNotes: 'Bergamota Calabria, Neroli, Mandarina',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvZ-jpmMmA1g_UPZ9hViJTqJmABkJ1SVUYm74VLPtLdygF0pd3uTTTp6nJjO-BoZaOnWZRTH49_1pMXUvih63V8rd8PstaqYTAumcrzMnQ_jVaX17zpitzHcSirGCPz1QtC9Mi0oMCNdmAjUjxKP9ZqCEXAVltzHpgrx7cT_lQvKcbWGzogcmQTMZwqu4RkISrNdU8eupgUXWoBR3DsQb9Ei8BVWqfdVqrGUcuYu5O',
  },
];

export class PerfumeRepository {
  private static STORAGE_KEY = 'perfumes_vault';

  static getAll(): Perfume[] {
    return LocalStorageAdapter.get<Perfume[]>(this.STORAGE_KEY, INITIAL_PERFUMES);
  }

  static getById(id: string): Perfume | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  static updateStock(id: string, delta: number): void {
    const list = this.getAll();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.stock = Math.max(0, item.stock + delta);
      LocalStorageAdapter.set(this.STORAGE_KEY, list);
    }
  }

  static save(perfumes: Perfume[]): void {
    LocalStorageAdapter.set(this.STORAGE_KEY, perfumes);
  }
}
