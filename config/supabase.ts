// MonitorDashboard.tsxとの互換性のためのエクスポート
import { getBrowserSupabase } from '@/lib/supabaseClient';

export const supabase = getBrowserSupabase();

