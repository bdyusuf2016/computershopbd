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
  supabaseUrl || 'https://rdedvriudbmkbntzixil.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZWR2cml1ZGJta2JudHppeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NDQ1NzksImV4cCI6MjA4ODUyMDU3OX0.wcSLVWG-zjl7yvmRJc22SVPOLOxP4Z3A-9Vutam10LI'
);
