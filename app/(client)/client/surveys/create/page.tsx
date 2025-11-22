import Link from 'next/link';
import { Section } from '@/components/Section';
import { SurveyCreateForm } from '@/components/SurveyCreateForm';
import { clientForServerComponent } from '@/lib/services/supabaseAuth';

export default async function CreateSurveyPage() {
  const supabase = clientForServerComponent();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || process.env.DEMO_CLIENT_ID;

  if (!userId) {
    return (
      <main style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="card">
            <p>ログインが必要です。</p>
            <Link href="/login" className="button primary">
              ログイン
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
        <Section
          title="新規アンケート作成"
          subtitle="質問を追加してアンケートを作成します"
          action={
            <Link href="/client" className="button ghost" style={{ textDecoration: 'none' }}>
              ← ダッシュボードに戻る
            </Link>
          }
        >
          <SurveyCreateForm userId={userId} />
        </Section>
      </div>
    </main>
  );
}

