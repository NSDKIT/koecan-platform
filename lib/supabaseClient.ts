import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database';

export function getBrowserSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。');
  }
  // デフォルトのlocalStorageを使用（@supabase/ssrの標準的な使用方法）
  // サーバー側でクッキーにセッションが保存されても、クライアント側では
  // localStorageを使用することで、セッションの競合を避ける
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
