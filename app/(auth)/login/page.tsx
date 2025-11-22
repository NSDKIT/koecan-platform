import Link from 'next/link';
import { loginAction } from '@/lib/actions/platformActions';

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card">
          <p className="badge info">Supabase Auth</p>
          <h1 style={{ marginTop: '0.5rem' }}>ログイン</h1>
          <p className="section-subtitle">メール認証＋パスワード方式 / LINE連携はダッシュボードで設定</p>
          <form action={loginAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input id="password" name="password" type="password" placeholder="パスワード（テスト用: 空欄可）" />
            </div>
            <button className="button primary" type="submit">ログイン</button>
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
