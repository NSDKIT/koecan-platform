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
  try {
    const { id } = await params;
    
    let userId: string | undefined;
    try {
      const supabase = clientForServerComponent();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || process.env.DEMO_MONITOR_ID;
    } catch (authError) {
      console.warn('認証エラー（フォールバック）:', authError);
      userId = process.env.DEMO_MONITOR_ID;
    }

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
          subtitle={`${formatDate(survey.deadline)} まで / ${survey.rewardPoints}pt / ${survey.questions?.length || 0}問`}
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
              <span className="badge">{survey.questions?.length || 0}問</span>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>回答フォーム</h4>
              {survey.questions && survey.questions.length > 0 ? (
                <SurveyAnswerForm survey={survey} userId={userId || ''} />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p>このアンケートには質問が設定されていません。</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    質問データはデータベースに保存されていない可能性があります。
                  </p>
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </main>
    );
  } catch (error) {
    console.error('アンケート詳細ページエラー:', error);
    // エラー時はダッシュボードにリダイレクト
    redirect('/dashboard?error=survey_load_failed');
  }
}

