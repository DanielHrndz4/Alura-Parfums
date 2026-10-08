import { createClient } from '@supabase/supabase-js';

// Fallback values or environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mock-place-vendome.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'mock-anon-key-alura-parfums';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
