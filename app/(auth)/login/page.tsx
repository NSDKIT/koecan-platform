'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/platformActions';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    startTransition(async () => {
      try {
        // クライアント側でログインを試行（セッションを確立）
        console.log('クライアント側でログインを試行します:', { email });
        const { getBrowserSupabase } = await import('@/lib/supabaseClient');
        const supabase = getBrowserSupabase();
        
        const { data: clientLoginData, error: clientLoginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (clientLoginError) {
          console.error('クライアント側ログインエラー:', clientLoginError);
          setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
          return;
        }
        
        if (!clientLoginData?.session) {
          console.error('クライアント側ログインが成功したが、セッションが取得できませんでした');
          setError('ログインに失敗しました。セッションを確立できませんでした。');
          return;
        }
        
        console.log('クライアント側ログイン成功:', {
          userId: clientLoginData.session.user.id,
          email: clientLoginData.session.user.email
        });
        
        // サーバー側でもログイン処理を実行（ロール取得とリダイレクトURL決定のため）
        const result = await loginAction(formData);
        
        if (result && !result.success) {
          // サーバー側でエラーが発生した場合でも、クライアント側でログインは成功している
          console.warn('サーバー側ログインでエラー:', result.message);
          // リダイレクトは続行
        }
        
        // リダイレクトURLを取得（サーバー側の結果から、またはデフォルト）
        const redirectUrl = result?.redirectUrl || '/dashboard';
        
        console.log('ログイン成功。リダイレクト先:', redirectUrl);
        
        // セッションが確立されたことを確認
        const { data: sessionCheck } = await supabase.auth.getSession();
        console.log('リダイレクト前のセッション確認:', {
          hasSession: !!sessionCheck?.session,
          userId: sessionCheck?.session?.user?.id || 'なし'
        });
        
        // セッションが確立されるまで少し待ってからリダイレクト
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ページ全体をリロードしてセッションを確実に反映
        // router.push()ではセッションが反映されない場合があるため、window.location.hrefを使用
        window.location.href = redirectUrl;
      } catch (err) {
        console.error('ログインエラー:', err);
        setError('ログイン処理中にエラーが発生しました');
      }
    });
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card">
          <p className="badge info">Supabase Auth</p>
          <h1 style={{ marginTop: '0.5rem' }}>ログイン</h1>
          <p className="section-subtitle">メール認証＋パスワード方式 / LINE連携はダッシュボードで設定</p>
          
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                disabled={isPending}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="パスワード（テスト用: 空欄可）" 
                disabled={isPending}
              />
            </div>
            <button 
              className="button primary" 
              type="submit" 
              disabled={isPending}
              style={{ opacity: isPending ? 0.6 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <strong>テスト用アカウント:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: '#475569' }}>
              <li>モニター: monitor@test.com（パスワード不要）</li>
              <li>クライアント: client@test.com（パスワード不要）</li>
              <li>管理者: admin@test.com（パスワード不要）</li>
              <li>サポート: support@test.com（パスワード不要）</li>
            </ul>
          </div>
          
          <p style={{ marginTop: '1rem' }}>
            アカウントをお持ちでない場合は <Link href="/register">新規登録</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
