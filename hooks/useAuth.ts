'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let mounted = true;
    
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('セッション取得エラー:', error);
        setLoading(false);
        return;
      }
      console.log('セッション取得完了:', session?.user?.id || '未ログイン');
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('セッション取得エラー（例外）:', error);
      if (mounted) {
        setLoading(false);
      }
    });

    // 認証状態の変更を監視
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        console.log('認証状態変更:', _event, session?.user?.id || '未ログイン');
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = authSubscription;
    } catch (error) {
      console.error('認証状態監視の設定エラー:', error);
    }

    // タイムアウトを設定（5秒後に強制的にローディングを解除）
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('認証チェックがタイムアウトしました');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return { user, loading, signOut };
}

