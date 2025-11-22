import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database';

export function getBrowserSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。');
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
