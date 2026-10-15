import { Perfume, WhenToWearItem } from '../types/perfume';
import { LocalStorageAdapter, supabase } from '../db/supabaseClient';
import { GeminiService, getFragranticaAccordColor, getDefaultWhenToWear, getFragranticaSeasonColor } from '../services/geminiService';

const VERIFIED_AUTHENTIC_PROFILES: Record<string, { family: any; gender?: any; notes: { top: string[]; heart: string[]; base: string[] } }> = {
  'can can': {
    family: 'Floral',
    gender: 'fem',
    notes: {
      top: ['Clementina', 'Nectarina', 'Grosellas negras'],
      heart: ['Orquídea silvestre', 'Flor de azahar del naranjo'],
      base: ['Ámbar', 'Almizcle', 'Maderas nobles'],
    },
  },
  'poison girl': {
    family: 'Gourmand',
    gender: 'fem',
    notes: {
      top: ['Naranja amarga', 'Limón'],
      heart: ['Rosa de Grasse', 'Rosa de Damasco', 'Flor de azahar'],
      base: ['Haba tonka', 'Vainilla', 'Almendra dulce', 'Sándalo', 'Bálsamo de Tolú'],
    },
  },
  'daisy': {
    family: 'Floral',
    gender: 'fem',
    notes: {
      top: ['Hojas de violeta', 'Toronja sanguina', 'Fresa silvestre'],
      heart: ['Violeta', 'Gardenia', 'Jazmín'],
      base: ['Almizcle blanco', 'Maderas blancas', 'Vainilla'],
    },
  },
  'la bomba': {
    family: 'Floral',
    gender: 'fem',
    notes: {
      top: ['Maracuyá', 'Toronja fresca', 'Mandarina'],
      heart: ['Peonía silvestre', 'Orquídea', 'Jazmín sambac'],
      base: ['Almizcle sedoso', 'Maderas nobles', 'Musgo suave'],
    },
  },
  'yara tous': {
    family: 'Gourmand',
    gender: 'fem',
    notes: {
      top: ['Mango', 'Maracuyá (Fruta de la pasión)', 'Coco'],
      heart: ['Heliotropo', 'Flor de azahar', 'Jazmín'],
      base: ['Vainilla', 'Cachemira', 'Almizcle blanco'],
    },
  },
  'yara': {
    family: 'Gourmand',
    gender: 'fem',
    notes: {
      top: ['Heliotropo', 'Orquídea', 'Mandarina'],
      heart: ['Acorde goloso (Gourmand)', 'Frutas tropicales'],
      base: ['Vainilla', 'Almizcle', 'Sándalo'],
    },
  },
};

export class PerfumeRepository {
  private static STORAGE_KEY = 'perfumes_vault';

  private static sanitizePerfume(item: Perfume): Perfume {
    const key = (item.name || '').toLowerCase().trim();
    const verified = VERIFIED_AUTHENTIC_PROFILES[key];

    let family = item.family;
    let notes = item.notes ? { ...item.notes } : { top: [], heart: [], base: [] };
    let gender = item.gender;

    if (verified) {
      family = verified.family;
      notes = { ...verified.notes };
      if (verified.gender) gender = verified.gender;
    } else {
      // Remove hallucinated dummy notes
      const isDummyNotes =
        notes.top &&
        notes.top.length === 3 &&
        notes.top.includes('Bergamota de Calabria') &&
        notes.top.includes('Cardamomo');

      if (isDummyNotes) {
        notes = { top: [], heart: [], base: [] };
      }
    }

    const formatStr = (item.format || '').toLowerCase();
    const standardPrice = formatStr.includes('50ml') ? 10.0 : 15.0;
    const enrichedAccords = (item.accords || []).map((a) => ({
      ...a,
      color: a.color || getFragranticaAccordColor(a.name),
    }));
    const rawWhenToWear = item.whenToWear || item.notes?.whenToWear || getDefaultWhenToWear(family, item.name);
    const enrichedWhenToWear = (rawWhenToWear || []).map((w) => ({
      ...w,
      color: w.color || getFragranticaSeasonColor(w.id),
    }));

    return {
      ...item,
      family,
      notes,
      gender,
      price: item.price || standardPrice,
      accords: enrichedAccords.length > 0 ? enrichedAccords : item.accords,
      whenToWear: enrichedWhenToWear,
    };
  }

  static getAll(): Perfume[] {
    const stored = LocalStorageAdapter.get<Perfume[]>(this.STORAGE_KEY, []);
    return stored.map((item) => this.sanitizePerfume(item));
  }

  static getById(id: string): Perfume | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  static async fetchFromSupabase(): Promise<Perfume[]> {
    try {
      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return this.getAll();
      }

      const mapped: Perfume[] = data.map((d: any) => {
        const rawWhenToWear = (d.when_to_wear || d.notes?.whenToWear || d.whenToWear || getDefaultWhenToWear(d.family, d.name)) as WhenToWearItem[];
        const enrichedWhenToWear = (rawWhenToWear || []).map((w: any) => ({
          ...w,
          color: w.color || getFragranticaSeasonColor(w.id),
        }));

        return {
          id: d.id,
          name: d.name,
          house: d.house,
          subtitle: d.subtitle,
          gender: d.gender,
          price: Number(d.price),
          stock: d.stock,
          hasSample: d.has_sample,
          samplePrice: d.sample_price ? Number(d.sample_price) : undefined,
          format: d.format,
          categoryTag: d.category_tag,
          description: d.description,
          family: d.family,
          imageUrl: d.image_url,
          imageAlt: d.image_alt,
          notes: d.notes,
          accords: Array.isArray(d.accords)
            ? d.accords.map((a: any) => ({
                ...a,
                color: a.color || getFragranticaAccordColor(a.name),
              }))
            : undefined,
          whenToWear: enrichedWhenToWear,
          isBestseller: d.is_bestseller,
          concentration: d.format?.includes('•') ? d.format.split('•')[1].trim() : GeminiService.detectConcentration(d.format || ''),
        };
      });

      if (mapped.length > 0) {
        const sanitizedList = mapped.map((item) => this.sanitizePerfume(item));
        LocalStorageAdapter.set(this.STORAGE_KEY, sanitizedList);
        return sanitizedList;
      }

      const local = this.getAll();
      if (local.length > 0) {
        local.forEach((p) => this.saveToSupabase(p));
      }
      return local;
    } catch {
      return this.getAll();
    }
  }

  static async saveToSupabase(perfume: Perfume): Promise<void> {
    try {
      const notesPayload = {
        ...(perfume.notes || { top: [], heart: [], base: [] }),
        whenToWear: perfume.whenToWear,
      };

      await supabase.from('perfumes').upsert({
        id: perfume.id,
        name: perfume.name,
        house: perfume.house,
        subtitle: perfume.subtitle,
        gender: perfume.gender,
        price: perfume.price,
        stock: perfume.stock,
        has_sample: perfume.hasSample,
        sample_price: perfume.samplePrice,
        format: perfume.format,
        category_tag: perfume.categoryTag,
        description: perfume.description,
        family: perfume.family,
        image_url: perfume.imageUrl,
        image_alt: perfume.imageAlt,
        notes: notesPayload,
        accords: perfume.accords,
        is_bestseller: perfume.isBestseller,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase perfume sync error:', e);
    }
  }

  static updateStock(id: string, delta: number): void {
    const list = this.getAll();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.stock = Math.max(0, item.stock + delta);
      LocalStorageAdapter.set(this.STORAGE_KEY, list);
      this.saveToSupabase(item);
    }
  }

  static toggleBestseller(id: string): Perfume | undefined {
    const list = this.getAll();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.isBestseller = !item.isBestseller;
      LocalStorageAdapter.set(this.STORAGE_KEY, list);
      this.saveToSupabase(item);
      return item;
    }
    return undefined;
  }

  static update(perfume: Perfume): void {
    const list = this.getAll();
    const idx = list.findIndex((p) => p.id === perfume.id);
    if (idx !== -1) {
      list[idx] = perfume;
      LocalStorageAdapter.set(this.STORAGE_KEY, list);
      this.saveToSupabase(perfume);
    }
  }

  static save(perfumes: Perfume[]): void {
    LocalStorageAdapter.set(this.STORAGE_KEY, perfumes);
    perfumes.forEach((p) => this.saveToSupabase(p));
  }

  static async enrichAllPerfumes(
    onProgress?: (info: { current: number; total: number; name: string; percentage: number }) => void,
    signal?: AbortSignal
  ): Promise<Perfume[]> {
    let list = await this.fetchFromSupabase();
    if (!list || list.length === 0) {
      list = this.getAll();
    }
    if (list.length === 0) return [];

    const enrichedList: Perfume[] = [];
    for (let i = 0; i < list.length; i++) {
      if (signal?.aborted) {
        console.warn('Análisis del catálogo detenido a petición del usuario.');
        break;
      }
      const item = list[i];
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: list.length,
          name: item.name,
          percentage: Math.round(((i + 1) / list.length) * 100),
        });
      }

      try {
        const enriched = await GeminiService.enrichPerfume(item, item.imageUrl);
        enrichedList.push(enriched);

        // Guardar progresivamente para no perder datos si el usuario recarga o detiene
        const currentBatch = [
          ...enrichedList,
          ...list.slice(enrichedList.length),
        ];
        LocalStorageAdapter.set(this.STORAGE_KEY, currentBatch);
        this.saveToSupabase(enriched);
      } catch (err) {
        console.warn('Error enriqueciendo perfume:', item.name, err);
        enrichedList.push(item);
      }
    }

    const finalResult = [
      ...enrichedList,
      ...list.slice(enrichedList.length),
    ];
    this.save(finalResult);
    return finalResult;
  }

  static delete(id: string): void {
    const list = this.getAll().filter((p) => p.id !== id);
    LocalStorageAdapter.set(this.STORAGE_KEY, list);
    try {
      supabase
        .from('perfumes')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase perfume delete error:', error);
        });
    } catch (e) {
      console.warn('Supabase perfume delete error:', e);
    }
  }
}

export { OLFACTORY_FAMILIES_DATA } from '../types/perfume';

