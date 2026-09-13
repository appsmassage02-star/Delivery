import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_URL = 'talabat_albayt_supabase_url';
const STORAGE_KEY_SUPABASE_ANON_KEY = 'talabat_albayt_supabase_anon_key';

export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL as string) || '';
  const envAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '';
  const localAnonKey = localStorage.getItem(STORAGE_KEY_SUPABASE_ANON_KEY) || '';

  return {
    url: localUrl || envUrl,
    anonKey: localAnonKey || envAnonKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_SUPABASE_ANON_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_ANON_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}
