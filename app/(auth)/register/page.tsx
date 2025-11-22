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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    const name = formData.get('name')?.toString() || '';
    const age = formData.get('age')?.toString() || '';
    const gender = formData.get('gender')?.toString() || '';
    const occupation = formData.get('occupation')?.toString() || '';
    const location = formData.get('location')?.toString() || '';

    // バリデーション
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!password || password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    if (!name) {
      setError('お名前を入力してください');
      return;
    }

    if (!occupation) {
      setError('職業を入力してください');
      return;
    }

    startTransition(async () => {
      try {
        const result = await registerAction(formData);
        
        if (result.success) {
          setSuccess(result.message || '登録が完了しました。');
          // リダイレクトURLがあれば使用、なければダッシュボードにリダイレクト
          const redirectUrl = result.redirectUrl || '/dashboard';
          // 2秒後にリダイレクト
          setTimeout(() => {
            window.location.replace(redirectUrl);
          }, 2000);
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
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdf2e9 0%, #fce8d4 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      {/* Background dots */}
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        top: '-50%',
        left: '-50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.5
      }}></div>

      <div className="container" style={{ maxWidth: '500px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div className="card" style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          {/* Back button */}
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            戻る
          </Link>

          <h1 style={{ 
            marginTop: 0, 
            marginBottom: '0.5rem',
            fontSize: '1.875rem',
            color: '#ff7043',
            fontWeight: 'bold'
          }}>
            新規登録
          </h1>
          <p style={{ 
            marginTop: 0, 
            marginBottom: '1.5rem',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            アカウントを作成してください
          </p>
          
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
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
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                メールアドレス
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="your@email.com"
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                パスワード
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  minLength={8}
                  placeholder="パスワードを入力"
                  disabled={isPending}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <>
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    ) : (
                      <>
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" x2="22" y1="2" y2="22"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                お名前
              </label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required 
                placeholder="お名前を入力"
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="age" style={{ marginBottom: '0.5rem' }}>
                年齢
              </label>
              <input 
                id="age" 
                name="age" 
                type="number" 
                min="1"
                max="150"
                placeholder="年齢"
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender" style={{ marginBottom: '0.5rem' }}>
                性別
              </label>
              <select
                id="gender"
                name="gender"
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  background: '#fff',
                  cursor: isPending ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">選択</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="occupation" style={{ marginBottom: '0.5rem' }}>
                職業
              </label>
              <input 
                id="occupation" 
                name="occupation" 
                type="text" 
                required 
                placeholder="職業を入力"
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                居住地
              </label>
              <input 
                id="location" 
                name="location" 
                type="text" 
                placeholder="居住地を入力"
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button 
              className="button primary" 
              type="submit" 
              disabled={isPending}
              style={{
                width: '100%',
                padding: '0.875rem',
                marginTop: '1rem',
                background: '#ff7043',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.6 : 1,
                transition: 'background 0.3s ease'
              }}
            >
              {isPending ? '登録中...' : '登録'}
            </button>
          </form>
          
          <p style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            すでにアカウントをお持ちの方は<Link href="/login" style={{ color: '#3b82f6', textDecoration: 'underline' }}>こちら</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
