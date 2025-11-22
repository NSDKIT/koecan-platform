import Link from 'next/link';
import { registerAction } from '@/lib/actions/platformActions';

export default function RegisterPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card">
          <p className="badge success">メール認証 + 友達紹介</p>
          <h1 style={{ marginTop: 0 }}>新規登録</h1>
          <form action={registerAction} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input id="email" name="email" type="email" required placeholder="student@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input id="password" name="password" type="password" required minLength={8} placeholder="8文字以上" />
            </div>
            <div className="form-group">
              <label htmlFor="referralCode">紹介コード（任意）</label>
              <input id="referralCode" name="referralCode" placeholder="KOECAN-XXXXXXX" />
            </div>
            <button className="button primary" type="submit">仮登録メールを受け取る</button>
          </form>
          <p style={{ marginTop: '1rem' }}>
            すでに登録済みですか？<Link href="/login">ログインはこちら</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
