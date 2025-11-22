import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database';

export function getBrowserSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。');
  }
  // クッキーを使用してセッションを管理（サーバー側と一致させるため）
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return document.cookie.split('; ').map(cookie => {
          const [name, ...rest] = cookie.split('=');
          return { name, value: rest.join('=') };
        });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = `${name}=${value}; path=/; ${
            options?.maxAge ? `max-age=${options.maxAge};` : ''
          } ${options?.domain ? `domain=${options.domain};` : ''} ${
            options?.sameSite ? `sameSite=${options.sameSite};` : 'sameSite=lax;'
          } ${options?.secure ? 'secure;' : ''}`;
        });
      }
    }
  });
}
