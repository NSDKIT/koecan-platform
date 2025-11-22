import { cookies } from 'next/headers';
import { createServerActionClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/types/database';

export function clientForServerComponent() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

export function clientForServerAction() {
  const cookieStore = cookies();
  return createServerActionClient<Database>({ cookies: () => cookieStore });
}
