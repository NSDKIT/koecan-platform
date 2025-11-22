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
    
    // セッション取得関数（リトライ機能付き）
    const fetchSession = async (retryCount = 0) => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('セッション取得エラー:', error);
          // リトライ（最大5回、1000ms間隔で段階的に増やす）
          if (retryCount < 5) {
            const delay = Math.min(1000 * (retryCount + 1), 3000); // 最大3秒
            console.log(`セッション取得をリトライします (${retryCount + 1}/5, ${delay}ms後)`);
            setTimeout(() => fetchSession(retryCount + 1), delay);
            return;
          }
          console.warn('セッション取得を最大回数リトライしましたが失敗しました');
          setLoading(false);
          return;
        }
        
        console.log('セッション取得完了:', {
          hasSession: !!session,
          userId: session?.user?.id || '未ログイン',
          email: session?.user?.email || 'なし',
          retryCount
        });
        
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('セッション取得エラー（例外）:', error);
        if (mounted) {
          // リトライ（最大5回、1000ms間隔で段階的に増やす）
          if (retryCount < 5) {
            const delay = Math.min(1000 * (retryCount + 1), 3000); // 最大3秒
            console.log(`セッション取得をリトライします (${retryCount + 1}/5, ${delay}ms後)`);
            setTimeout(() => fetchSession(retryCount + 1), delay);
            return;
          }
          console.warn('セッション取得を最大回数リトライしましたが失敗しました');
          setLoading(false);
        }
      }
    };
    
    // 現在のセッションを取得（リトライ機能付き）
    // 初回は少し待ってから取得（ページロード直後はクッキーが反映されていない可能性がある）
    setTimeout(() => fetchSession(), 100);

    // 認証状態の変更を監視
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        console.log('認証状態変更:', {
          event: _event,
          hasSession: !!session,
          userId: session?.user?.id || '未ログイン',
          email: session?.user?.email || 'なし'
        });
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

