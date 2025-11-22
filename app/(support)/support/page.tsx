import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Section } from '@/components/Section';
import { MetricCard } from '@/components/MetricCard';
import { StatusPill } from '@/components/StatusPill';
import { fetchSupportDashboardData } from '@/lib/services/dataSources';
import { clientForServerComponent } from '@/lib/services/supabaseAuth';

const formatDate = (value: string) => format(new Date(value), 'M/d HH:mm', { locale: ja });

export default async function SupportPage() {
  let userId: string | undefined;
  
  try {
    const supabase = clientForServerComponent();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  } catch (authError) {
    console.warn('認証エラー（フォールバック）:', authError);
  }
  
  const data = await fetchSupportDashboardData();

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
        <Section
          title="サポートダッシュボード"
          subtitle="モニター対応・チャット管理"
          action={<span className="badge warning">サポート担当者</span>}
        >
          <div className="two-column">
            <MetricCard label="対応中チャット" value={`${data.activeChats}件`} />
            <MetricCard label="未対応チケット" value={`${data.pendingTickets}件`} accent="warning" />
            <MetricCard label="総チケット数" value={`${data.supportTickets.length}件`} />
            <MetricCard label="解決率" value="85%" trend="目標達成" accent="success" />
          </div>
        </Section>

        <Section title="サポートチケット一覧" subtitle="対応状況・優先度管理">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>チケット一覧</h4>
              <button className="button primary" type="button">
                新しいチャット開始
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>件名</th>
                    <th>チャネル</th>
                    <th>優先度</th>
                    <th>ステータス</th>
                    <th>作成日時</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.supportTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.subject}</td>
                      <td>{ticket.channel === 'chat' ? 'チャット' : 'メール'}</td>
                      <td>
                        <StatusPill
                          text={ticket.priority === 'high' ? '高' : ticket.priority === 'medium' ? '中' : '低'}
                          variant={ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'pending' : 'success'}
                        />
                      </td>
                      <td>
                        <StatusPill
                          text={ticket.status === 'waiting' ? '待機中' : ticket.status === 'responding' ? '対応中' : '解決済み'}
                          variant={ticket.status === 'waiting' ? 'pending' : ticket.status === 'responding' ? 'info' : 'success'}
                        />
                      </td>
                      <td>{formatDate(ticket.createdAt)}</td>
                      <td>
                        <button className="button ghost" type="button" style={{ fontSize: '0.875rem' }}>
                          対応開始
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section title="モニター一覧" subtitle="モニター管理・チャット開始">
          <div className="card">
            <h4>モニター検索</h4>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <input type="text" placeholder="モニター名またはメールアドレスで検索..." style={{ width: '100%' }} />
            </div>
            <button className="button secondary" type="button" style={{ marginTop: '0.5rem' }}>
              検索
            </button>
          </div>
        </Section>

        <Section title="キャリア相談管理" subtitle="予約管理・対応状況">
          <div className="card">
            <h4>予約一覧</h4>
            <p style={{ color: '#64748b' }}>キャリア相談の予約状況を管理できます。</p>
            <div style={{ marginTop: '1rem' }}>
              <button className="button secondary" type="button">
                予約一覧を表示
              </button>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}

