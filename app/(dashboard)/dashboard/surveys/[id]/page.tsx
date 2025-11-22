import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { StatusPill } from '@/components/StatusPill';
import { fetchSurveyDetail } from '@/lib/services/dataSources';
import { clientForServerComponent } from '@/lib/services/supabaseAuth';
import { SurveyAnswerForm } from '@/components/SurveyAnswerForm';

const formatDate = (value: string) => format(new Date(value), 'yyyy年M月d日 HH:mm', { locale: ja });

interface SurveyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyDetailPage({ params }: SurveyDetailPageProps) {
  const { id } = await params;
  const supabase = clientForServerComponent();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || process.env.DEMO_MONITOR_ID;

  const survey = await fetchSurveyDetail(id, userId);

  if (!survey) {
    notFound();
  }

  // 回答済みの場合は一覧にリダイレクト
  if (survey.hasAnswered) {
    redirect('/dashboard?message=already_answered');
  }

  // 期限切れの場合は一覧にリダイレクト
  const now = new Date();
  const deadline = new Date(survey.deadline);
  if (deadline < now) {
    redirect('/dashboard?message=deadline_passed');
  }

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
        <Section
          title={survey.title}
          subtitle={`${formatDate(survey.deadline)} まで / ${survey.rewardPoints}pt / ${survey.questions.length}問`}
          action={
            <Link href="/dashboard" className="button ghost" style={{ textDecoration: 'none' }}>
              ← 一覧に戻る
            </Link>
          }
        >
          <div className="card">
            {survey.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>アンケート説明</h4>
                <p style={{ color: '#64748b', whiteSpace: 'pre-wrap' }}>{survey.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <StatusPill text={survey.status === 'open' ? '公開中' : survey.status === 'closed' ? '終了' : '予約'} variant={survey.status === 'open' ? 'success' : survey.status === 'closed' ? 'danger' : 'pending'} />
              <span className="badge info">{survey.category}</span>
              <span className="badge warning">{survey.rewardPoints}pt</span>
              <span className="badge">{survey.questions.length}問</span>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>回答フォーム</h4>
              <SurveyAnswerForm survey={survey} userId={userId || ''} />
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}

