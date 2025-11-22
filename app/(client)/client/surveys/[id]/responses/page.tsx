import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { MetricCard } from '@/components/MetricCard';
import { StatusPill } from '@/components/StatusPill';
import { SurveyResponseViewer } from '@/components/SurveyResponseViewer';
import { fetchSurveyDetail, fetchSurveyResponses } from '@/lib/services/dataSources';
import { clientForServerComponent } from '@/lib/services/supabaseAuth';
import type { SurveyDetail } from '@/lib/types';

const formatDate = (value: string) => format(new Date(value), 'yyyy年M月d日 HH:mm', { locale: ja });

interface SurveyResponsesPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyResponsesPage({ params }: SurveyResponsesPageProps) {
  const { id } = await params;
  const supabase = clientForServerComponent();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || process.env.DEMO_CLIENT_ID;

  const survey = await fetchSurveyDetail(id, userId);

  if (!survey) {
    notFound();
  }

  const responses = await fetchSurveyResponses(id);

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
        <Section
          title={`${survey.title} - 回答データ`}
          subtitle={`総回答数: ${responses.totalResponses}件 / 回答率: ${responses.responseRate}%`}
          action={
            <Link href="/client" className="button ghost" style={{ textDecoration: 'none' }}>
              ← ダッシュボードに戻る
            </Link>
          }
        >
          <div className="two-column">
            <MetricCard label="総回答数" value={`${responses.totalResponses}件`} />
            <MetricCard label="回答率" value={`${responses.responseRate}%`} accent="success" />
            <MetricCard label="最終回答日時" value={responses.lastResponseAt ? formatDate(responses.lastResponseAt) : '-'} />
            <MetricCard label="平均回答時間" value={responses.averageResponseTime || '-'} />
          </div>
        </Section>

        <Section title="回答データ一覧" subtitle="集計・エクスポート">
          <SurveyResponseViewer survey={survey} responses={responses} />
        </Section>
      </div>
    </main>
  );
}

