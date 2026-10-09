import { createClient } from '@supabase/supabase-js';

// Supabase Configuration from Environment
const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zctdslmtqjqcadbsykez.supabase.co';

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Tq8n2CzxfFwN_MnfG3nPXg_Vriy35OR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


/**
 * Deprecated: Kept as safe no-op to preserve user-created items and database records across browser reloads.
 */
export function purgeMockData(): void {
  // No-op: Never delete user data on page load
}

/**
 * Robust LocalStorage Repository helper that works in conjunction with Supabase
 * for guaranteed responsiveness and data persistence in this environment.
 */
export class LocalStorageAdapter {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`alura_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`alura_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  }
}

