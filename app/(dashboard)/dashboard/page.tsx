import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { MetricCard } from '@/components/MetricCard';
import { ReferralCodeCard } from '@/components/ReferralCodeCard';
import { NotificationPreferenceCard } from '@/components/NotificationPreferenceCard';
import { fetchMonitorDashboardData } from '@/lib/services/dataSources';
import { submitExchangeRequest } from '@/lib/actions/platformActions';
import { clientForServerComponent } from '@/lib/services/supabaseAuth';

const formatDate = (value: string) => format(new Date(value), 'M/d HH:mm', { locale: ja });

export default async function DashboardPage() {
  let userId: string | undefined = process.env.DEMO_MONITOR_ID;
  
  try {
    const supabase = clientForServerComponent();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('ダッシュボード認証チェック:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      authError: authError?.message
    });
    
    if (user?.id) {
      userId = user.id;
    } else {
      console.warn('認証ユーザーが見つかりません。userId:', userId);
      if (authError) {
        console.error('認証エラー:', authError.message);
      }
    }
  } catch (authError) {
    console.error('認証エラー（例外）:', authError);
    userId = process.env.DEMO_MONITOR_ID;
  }
  
  console.log('fetchMonitorDashboardData呼び出し前:', {
    userId,
    hasDemoId: !!process.env.DEMO_MONITOR_ID
  });
  
  const data = await fetchMonitorDashboardData(userId);
  const profile = data.profile;

  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
        <Section
          title={`こんにちは、${profile.name}さん`}
          subtitle={`最終更新: ${formatDate(profile.updatedAt)}`}
          action={<span className="badge success">モニター / {profile.isLineLinked ? 'LINE連携済み' : 'LINE未連携'}</span>}
        >
          <div className="two-column">
            <MetricCard label="現在のポイント" value={`${profile.points.toLocaleString()} pt`} trend="週次トラッキング" />
            <MetricCard label="AIマッチングタグ" value={profile.tags.join(', ') || '未設定'} />
            <MetricCard label="紹介成功" value={`${data.referralStatus.successfulReferrals}人`} trend={`審査中 ${data.referralStatus.pendingReferrals}件`} />
            <MetricCard label="キャンペーン" value="友達紹介2倍" accent="warning" />
          </div>
        </Section>

        <Section title="公開中のアンケート" subtitle="AIスコア順 / LINE・プッシュ配信状況">
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>カテゴリ</th>
                  <th>ポイント</th>
                  <th>質問数</th>
                  <th>締切</th>
                  <th>AIマッチ度</th>
                  <th>配信</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.surveys.map((survey) => (
                  <tr key={survey.id}>
                    <td>
                      <Link href={`/dashboard/surveys/${survey.id}`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                        {survey.title}
                      </Link>
                    </td>
                    <td>{survey.category}</td>
                    <td>{survey.rewardPoints} pt</td>
                    <td>{survey.questions}</td>
                    <td>{formatDate(survey.deadline)}</td>
                    <td>{Math.round(survey.aiMatchingScore * 100)}%</td>
                    <td>{survey.deliveryChannels.join(', ')}</td>
                    <td>
                      <Link href={`/dashboard/surveys/${survey.id}`} className="button primary" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>
                        回答する
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="ポイント履歴" subtitle="アンケート / 友達紹介 / 外部API交換">
          <div className="two-column">
            <div className="card">
              <h4>直近トランザクション</h4>
              <ul className="list-reset">
                {data.pointTransactions.map((tx) => (
                  <li key={tx.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{tx.description}</strong>
                      <p className="section-subtitle">{formatDate(tx.happenedAt)}</p>
                    </div>
                    <span style={{ color: tx.amount > 0 ? '#16a34a' : '#b91c1c', fontWeight: 700 }}>
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount}pt
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h4>PeX / ギフト交換申請</h4>
              <form action={submitExchangeRequest} style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="hidden" name="userId" value={profile.id} />
                <input type="hidden" name="userName" value={profile.name} />
                <div className="form-group">
                  <label htmlFor="reward">交換先</label>
                  <select id="reward" name="rewardId">
                    {data.rewardItems.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.name}（{reward.pointsRequired}pt）
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="amount">交換ポイント</label>
                  <input id="amount" name="amount" type="number" defaultValue={data.rewardItems[0]?.pointsRequired ?? 500} min={500} step={100} />
                </div>
                <button className="button primary" type="submit">
                  外部APIに交換リクエスト
                </button>
              </form>
            </div>
          </div>
        </Section>

        <Section title="友達紹介" subtitle="紹介コード / 実績 / 不正防止アラート">
          <ReferralCodeCard
            code={data.referralStatus.code}
            successful={data.referralStatus.successfulReferrals}
            pending={data.referralStatus.pendingReferrals}
            points={data.referralStatus.rewardPoints}
            userId={profile.id}
          />
        </Section>

        <Section title="お知らせ" subtitle="キャンペーン・メンテナンス・LINE配信連動">
          <div className="two-column">
            {data.announcements.map((item) => (
              <div key={item.id} className="card">
                <p className="badge info">{item.category}</p>
                <h4 style={{ margin: '0.25rem 0' }}>{item.title}</h4>
                <p style={{ margin: 0 }}>{item.body}</p>
                <p className="section-subtitle">対象: {item.audience.join(', ')} / {formatDate(item.publishedAt)}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="FAQ" subtitle="Markdown/CSVインポート済み 50件から抜粋">
          <div className="two-column">
            {data.faqItems.map((faq) => (
              <div key={faq.id} className="card">
                <p className="badge success">{faq.category}</p>
                <strong>{faq.question}</strong>
                <p style={{ marginBottom: 0 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="キャリア相談スロット" subtitle="OB訪問/専門家チャット">
          <div className="two-column">
            {data.careerSlots.map((slot) => (
              <div key={slot.id} className="card">
                <h4 style={{ margin: '0 0 0.25rem' }}>{slot.topic}</h4>
                <p className="section-subtitle">{slot.mentor}</p>
                <p className="section-subtitle">{formatDate(slot.startsAt)} / {slot.mode}</p>
                <p>残り{slot.availableSeats}枠</p>
                <button className="button secondary" type="button">
                  予約リクエスト
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="サポートチャット" subtitle="24時間チャットボット + 平日有人対応">
          <div className="card">
            <ul className="list-reset">
              {data.supportTickets.map((ticket) => (
                <li key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <p className="section-subtitle">{formatDate(ticket.createdAt)} / {ticket.channel}</p>
                  </div>
                  <span className={`status-pill ${ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'pending' : 'success'}`}>
                    {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
            <button className="button primary" type="button" style={{ marginTop: '1rem' }}>
              新しい問い合わせを作成
            </button>
          </div>
        </Section>

        <Section title="利用規約・プライバシー" subtitle="最新版 v2.0 / PWA からも参照可能">
          <div className="two-column">
            {data.policyDocuments.map((doc) => (
              <div key={doc.id} className="card">
                <p className="badge info">{doc.version}</p>
                <strong>{doc.title}</strong>
                <p className="section-subtitle">更新日: {doc.updatedAt}</p>
                <a className="button ghost" href={doc.url}>
                  ドキュメントを開く
                </a>
              </div>
            ))}
          </div>
        </Section>

        <NotificationPreferenceCard userId={profile.id} isLineLinked={profile.isLineLinked} pushOptIn={profile.pushOptIn} />
      </div>
    </main>
  );
}
