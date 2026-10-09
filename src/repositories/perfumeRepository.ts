import { Perfume } from '../types/perfume';
import { LocalStorageAdapter, supabase } from '../db/supabaseClient';

export class PerfumeRepository {
  private static STORAGE_KEY = 'perfumes_vault';

  static getAll(): Perfume[] {
    const stored = LocalStorageAdapter.get<Perfume[]>(this.STORAGE_KEY, []);
    return stored.map((item) => {
      const formatStr = (item.format || '').toLowerCase();
      const standardPrice = formatStr.includes('50ml') ? 10.0 : 15.0;
      return {
        ...item,
        price: item.price || standardPrice,
      };
    });
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

      const mapped: Perfume[] = data.map((d: any) => ({
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
        accords: d.accords,
        isBestseller: d.is_bestseller,
      }));

      if (mapped.length > 0) {
        LocalStorageAdapter.set(this.STORAGE_KEY, mapped);
        return mapped;
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
        notes: perfume.notes,
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

  static save(perfumes: Perfume[]): void {
    LocalStorageAdapter.set(this.STORAGE_KEY, perfumes);
    perfumes.forEach((p) => this.saveToSupabase(p));
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

