import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Section } from '@/components/Section';
import { MetricCard } from '@/components/MetricCard';
import { StatusPill } from '@/components/StatusPill';
import { fetchClientDashboardData } from '@/lib/services/dataSources';
import { clientForServerComponent } from '@/lib/services/supabaseAuth';

const formatDate = (value: string) => format(new Date(value), 'M/d HH:mm', { locale: ja });

export default async function ClientPage() {
  const supabase = clientForServerComponent();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || process.env.DEMO_CLIENT_ID;
  
  const data = await fetchClientDashboardData(userId);

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
        <Section
          title="企業ダッシュボード"
          subtitle="アンケート管理・回答データ閲覧"
          action={<span className="badge info">企業アカウント</span>}
        >
          <div className="two-column">
            <MetricCard label="総アンケート数" value={`${data.totalSurveys}件`} />
            <MetricCard label="公開中アンケート" value={`${data.activeSurveys}件`} />
            <MetricCard label="総回答数" value={`${data.totalResponses}件`} />
            <MetricCard label="平均回答率" value="65%" trend="目標達成" accent="success" />
          </div>
        </Section>

        <Section title="作成したアンケート一覧" subtitle="作成・編集・公開管理">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>アンケート一覧</h4>
              <button className="button primary" type="button">
                新規アンケート作成
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>タイトル</th>
                    <th>カテゴリ</th>
                    <th>ポイント</th>
                    <th>質問数</th>
                    <th>ステータス</th>
                    <th>締切</th>
                    <th>回答数</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.surveys.map((survey) => (
                    <tr key={survey.id}>
                      <td>{survey.title}</td>
                      <td>{survey.category}</td>
                      <td>{survey.rewardPoints} pt</td>
                      <td>{survey.questions}問</td>
                      <td>
                        <StatusPill
                          text={survey.status === 'open' ? '公開中' : survey.status === 'closed' ? '終了' : '予約'}
                          variant={survey.status === 'open' ? 'success' : survey.status === 'closed' ? 'danger' : 'pending'}
                        />
                      </td>
                      <td>{formatDate(survey.deadline)}</td>
                      <td>0件</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="button ghost" type="button" style={{ fontSize: '0.875rem' }}>
                            編集
                          </button>
                          <button className="button ghost" type="button" style={{ fontSize: '0.875rem' }}>
                            回答データ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section title="アンケート作成" subtitle="手動作成 / Markdownインポート / CSVインポート">
          <div className="two-column">
            <div className="card">
              <h4>手動作成</h4>
              <p>質問を1つずつ追加してアンケートを作成します。</p>
              <button className="button primary" type="button" style={{ width: '100%', marginTop: '1rem' }}>
                手動で作成する
              </button>
            </div>
            <div className="card">
              <h4>一括インポート</h4>
              <p>MarkdownまたはCSVファイルから一括でアンケートを作成します。</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="button secondary" type="button" style={{ flex: 1 }}>
                  Markdown
                </button>
                <button className="button secondary" type="button" style={{ flex: 1 }}>
                  CSV
                </button>
              </div>
            </div>
          </div>
        </Section>

        <Section title="回答データ管理" subtitle="集計・エクスポート">
          <div className="card">
            <h4>回答データサマリー</h4>
            <p style={{ color: '#64748b' }}>アンケートごとの回答データを閲覧・ダウンロードできます。</p>
            <div style={{ marginTop: '1rem' }}>
              <button className="button secondary" type="button">
                CSV形式でダウンロード
              </button>
              <button className="button secondary" type="button" style={{ marginLeft: '0.5rem' }}>
                Excel形式でダウンロード
              </button>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}

