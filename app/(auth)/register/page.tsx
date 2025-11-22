'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '@/lib/actions/platformActions';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!password || password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    startTransition(async () => {
      try {
        const result = await registerAction(formData);
        
        if (result.success) {
          setSuccess(result.message || '仮登録完了。メールをご確認ください。');
          // 3秒後にログインページにリダイレクト
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setError(result.message || '登録に失敗しました');
        }
      } catch (err) {
        console.error('登録エラー:', err);
        setError('登録処理中にエラーが発生しました');
      }
    });
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card">
          <p className="badge success">メール認証 + 友達紹介</p>
          <h1 style={{ marginTop: 0 }}>新規登録</h1>
          
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

          {success && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="student@example.com" 
                disabled={isPending}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                minLength={8} 
                placeholder="8文字以上" 
                disabled={isPending}
              />
            </div>
            <div className="form-group">
              <label htmlFor="referralCode">紹介コード（任意）</label>
              <input 
                id="referralCode" 
                name="referralCode" 
                placeholder="KOECAN-XXXXXXX" 
                disabled={isPending}
              />
            </div>
            <button 
              className="button primary" 
              type="submit" 
              disabled={isPending}
              style={{ opacity: isPending ? 0.6 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? '登録中...' : '仮登録メールを受け取る'}
            </button>
          </form>
          
          <p style={{ marginTop: '1rem' }}>
            すでに登録済みですか？<Link href="/login">ログインはこちら</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
