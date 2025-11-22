import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database';

let cached: SupabaseClient<Database> | null = null;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
}

export function getSupabaseServiceRole(): SupabaseClient<Database> {
  if (cached) {
    return cached;
  }
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  cached = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
  return cached;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
