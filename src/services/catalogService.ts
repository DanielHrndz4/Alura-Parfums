import { Perfume, OlfactoryFamily } from '../types/perfume';
import { PerfumeRepository } from '../repositories/perfumeRepository';

export interface FilterCriteria {
  gender: 'all' | 'fem' | 'masc';
  inStockOnly: boolean;
  preorderOnly: boolean;
  withSamplesOnly: boolean;
  maxPrice: number;
  brands: string[];
  families: OlfactoryFamily[];
  capacity?: string;
  searchQuery: string;
}

export class CatalogService {
  static getFilteredPerfumes(filters: FilterCriteria): Perfume[] {
    const all = PerfumeRepository.getAll();

    return all.filter((item) => {
      // Search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesHouse = item.house.toLowerCase().includes(query);
        const matchesFamily = item.family.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesHouse && !matchesFamily && !matchesDesc) {
          return false;
        }
      }

      // Price
      if (item.price > filters.maxPrice) {
        return false;
      }

      // Gender
      if (filters.gender !== 'all' && item.gender !== filters.gender) {
        return false;
      }

      // Brands
      if (filters.brands.length > 0 && !filters.brands.includes(item.house)) {
        return false;
      }

      // Stock
      if (filters.inStockOnly && !filters.preorderOnly && item.stock <= 0) {
        return false;
      }
      if (!filters.inStockOnly && filters.preorderOnly && item.stock > 0) {
        return false;
      }

      // Samples
      if (filters.withSamplesOnly && !item.hasSample) {
        return false;
      }

      // Olfactory families
      if (filters.families.length > 0 && !filters.families.includes(item.family)) {
        return false;
      }

      return true;
    });
  }

  static getBrandCounts(): Record<string, number> {
    const all = PerfumeRepository.getAll();
    const counts: Record<string, number> = {};
    all.forEach((p) => {
      counts[p.house] = (counts[p.house] || 0) + 1;
    });
    return counts;
  }
}
