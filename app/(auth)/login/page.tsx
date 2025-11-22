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
        const result = await loginAction(formData);
        
        console.log('ログイン結果:', result);
        
        if (result) {
          console.log('ログイン結果:', result);
          
          if (!result.success) {
            const errorMessage = result.message || 'ログインに失敗しました';
            console.error('ログイン失敗:', errorMessage);
            setError(errorMessage);
            return;
          }
          
          // リダイレクトURLを取得（デフォルトは/dashboard）
          const redirectUrl = result.redirectUrl || '/dashboard';
          
          console.log('ログイン成功。リダイレクト先:', redirectUrl);
          
          // サーバー側でログインが成功したが、クライアント側でセッションを確立する必要がある
          // フォームデータからメールアドレスとパスワードを取得して、クライアント側でログイン
          const formData = new FormData(e.currentTarget);
          const email = formData.get('email')?.toString() || '';
          const password = formData.get('password')?.toString() || '';
          
          if (email && password) {
            console.log('クライアント側でログインを試行します:', { email });
            const { getBrowserSupabase } = await import('@/lib/supabaseClient');
            const supabase = getBrowserSupabase();
            
            try {
              // クライアント側でログインしてセッションを確立
              const { data: clientLoginData, error: clientLoginError } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              
              if (clientLoginError) {
                console.error('クライアント側ログインエラー:', clientLoginError);
                // エラーが発生しても、サーバー側でログインは成功しているのでリダイレクト
              } else if (clientLoginData?.session) {
                console.log('クライアント側ログイン成功:', {
                  userId: clientLoginData.session.user.id,
                  email: clientLoginData.session.user.email
                });
              }
            } catch (clientLoginException) {
              console.error('クライアント側ログインで例外が発生:', clientLoginException);
              // 例外が発生しても、サーバー側でログインは成功しているのでリダイレクト
            }
          } else {
            console.warn('メールアドレスまたはパスワードが取得できませんでした。サーバー側のセッションに依存します。');
          }
          
          // セッションが確立されるまで少し待ってからリダイレクト
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // ページ全体をリロードしてセッションを確実に反映
          window.location.href = redirectUrl;
        } else {
          // resultがundefinedの場合もダッシュボードにリダイレクト
          console.warn('ログイン結果がundefinedのため、デフォルトでダッシュボードにリダイレクト');
          await new Promise(resolve => setTimeout(resolve, 1000));
          window.location.href = '/dashboard';
        }
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
