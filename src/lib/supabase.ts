import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('placeholder.supabase.co');
const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey === 'placeholder';

export const isSupabaseConfigured = !isPlaceholderUrl && !isPlaceholderKey;
export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
