import { Section } from '@/components/Section';
import { MetricCard } from '@/components/MetricCard';
import { StatusPill } from '@/components/StatusPill';
import { createAnnouncement, createFaq, scheduleNotification } from '@/lib/actions/platformActions';
import { fetchAdminDashboardData } from '@/lib/services/dataSources';

async function handleAnnouncement(formData: FormData) {
  'use server';
  const payload = {
    title: formData.get('title'),
    body: formData.get('body'),
    category: formData.get('category')?.toString(),
    audience: formData.getAll('audience') as ('monitor' | 'client' | 'admin' | 'support')[]
  };
  return createAnnouncement(payload);
}

async function handleFaq(formData: FormData) {
  'use server';
  const payload = {
    question: formData.get('question'),
    answer: formData.get('answer'),
    category: formData.get('category') as 'account' | 'survey' | 'points' | 'technical' | 'referral'
  };
  return createFaq(payload);
}

async function handleNotification(formData: FormData) {
  'use server';
  const payload = {
    channel: formData.get('channel') as 'line' | 'push' | 'email',
    title: formData.get('title'),
    body: formData.get('body'),
    cta: formData.get('cta')?.toString() || undefined
  };
  return scheduleNotification(payload);
}

export default async function AdminPage() {
  let userId: string | undefined;
  
  try {
    const supabase = clientForServerComponent();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  } catch (authError) {
    console.warn('認証エラー（フォールバック）:', authError);
  }
  
  const data = await fetchAdminDashboardData();
  return (
    <main style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.5rem' }}>
        <Section title="運用KPI" subtitle="運用設計書 2章 監視項目に基づく">
          <div className="two-column">
            <MetricCard label="外部API連携" value="OK / 3系統" trend="PeX・LINE・FCM" accent="success" />
            <MetricCard label="FAQ更新" value={`${data.faqItems.length}件`} trend="Markdown一括取込済み" />
            <MetricCard label="お知らせ配信" value={`${data.announcements.length}件/週`} />
            <MetricCard label="データインポート" value={`${data.dataImportJobs.length}ジョブ`} trend="CSV/Markdown" />
          </div>
        </Section>

        <Section title="お知らせ作成" subtitle="モニター/クライアントへリアルタイム配信">
          <form action={handleAnnouncement} style={{ display: 'grid', gap: '0.75rem' }}>
            <div className="form-group">
              <label htmlFor="title">タイトル</label>
              <input id="title" name="title" required />
            </div>
            <div className="form-group">
              <label htmlFor="body">本文</label>
              <textarea id="body" name="body" rows={3} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">カテゴリ</label>
              <select id="category" name="category" defaultValue="campaign">
                <option value="survey">アンケート</option>
                <option value="campaign">キャンペーン</option>
                <option value="system">システム</option>
                <option value="maintenance">メンテナンス</option>
              </select>
            </div>
            <div className="form-group">
              <label>配信対象</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {['monitor', 'client', 'admin', 'support'].map((role) => (
                  <label key={role} style={{ display: 'flex', gap: '0.35rem' }}>
                    <input type="checkbox" name="audience" value={role} defaultChecked={role === 'monitor'} />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <button className="button primary" type="submit">
              お知らせを登録
            </button>
          </form>
        </Section>

        <Section title="FAQ管理" subtitle="Markdown/CSV一括インポート後の追記用">
          <form action={handleFaq} style={{ display: 'grid', gap: '0.75rem' }}>
            <div className="form-group">
              <label htmlFor="question">質問</label>
              <input id="question" name="question" required />
            </div>
            <div className="form-group">
              <label htmlFor="answer">回答</label>
              <textarea id="answer" name="answer" rows={3} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">カテゴリ</label>
              <select id="category" name="category" defaultValue="account">
                <option value="account">アカウント</option>
                <option value="survey">アンケート</option>
                <option value="points">ポイント</option>
                <option value="technical">技術</option>
                <option value="referral">友達紹介</option>
              </select>
            </div>
            <button className="button primary" type="submit">
              FAQを追加
            </button>
          </form>
          <div className="card" style={{ marginTop: '1rem' }}>
            <ul className="list-reset">
              {data.faqItems.map((item) => (
                <li key={item.id} style={{ marginBottom: '0.75rem' }}>
                  <strong>{item.question}</strong>
                  <p style={{ margin: '0.25rem 0' }}>{item.answer}</p>
                  <span className="badge info">{item.category}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section title="通知運用" subtitle="LINE / Push / Email をワンクリック配信">
          <form action={handleNotification} style={{ display: 'grid', gap: '0.75rem' }}>
            <div className="form-group">
              <label htmlFor="channel">チャネル</label>
              <select id="channel" name="channel" defaultValue="line">
                <option value="line">LINE</option>
                <option value="push">Push</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notify-title">タイトル</label>
              <input id="notify-title" name="title" required />
            </div>
            <div className="form-group">
              <label htmlFor="notify-body">本文</label>
              <textarea id="notify-body" name="body" rows={3} required />
            </div>
            <div className="form-group">
              <label htmlFor="cta">CTAリンク（任意）</label>
              <input id="cta" name="cta" placeholder="https://example.com" />
            </div>
            <button className="button secondary" type="submit">
              通知を送信 / 予約
            </button>
          </form>
          <div className="two-column" style={{ marginTop: '1rem' }}>
            {data.notificationTemplates.map((template) => (
              <div key={template.id} className="card">
                <p className="badge info">{template.channel}</p>
                <strong>{template.title}</strong>
                <p>{template.body}</p>
                {template.cta && <p className="section-subtitle">CTA: {template.cta}</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section title="データ移行 / インポート状況" subtitle="構築書 2章の初期データ計画を可視化">
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>種別</th>
                  <th>対象</th>
                  <th>状態</th>
                  <th>申請者</th>
                  <th>受付</th>
                </tr>
              </thead>
              <tbody>
                {data.dataImportJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.type}</td>
                    <td>{job.entity}</td>
                    <td>
                      <StatusPill
                        text={job.status}
                        variant={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'danger' : 'pending'}
                      />
                    </td>
                    <td>{job.submittedBy}</td>
                    <td>{job.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="ポイント交換APIモニタ" subtitle="PeX/ドットマネー/銀行連携">
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ユーザー</th>
                  <th>交換先</th>
                  <th>ポイント</th>
                  <th>プロバイダ</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {data.exchangeRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.userName}</td>
                    <td>{request.rewardName}</td>
                    <td>{request.pointsUsed}pt</td>
                    <td>{request.provider}</td>
                    <td>
                      <StatusPill
                        text={request.status}
                        variant={request.status === 'fulfilled' ? 'success' : request.status === 'error' ? 'danger' : 'pending'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="利用規約 / プライバシーポリシー" subtitle="バージョン管理・LINE通知連携">
          <div className="two-column">
            {data.policyDocuments.map((doc) => (
              <div key={doc.id} className="card">
                <p className="badge info">{doc.version}</p>
                <h4 style={{ margin: '0 0 0.25rem' }}>{doc.title}</h4>
                <p className="section-subtitle">更新日: {doc.updatedAt}</p>
                <a className="button ghost" href={doc.url}>
                  PDFを確認
                </a>
              </div>
            ))}
          </div>
          <p className="section-subtitle" style={{ marginTop: '1rem' }}>
            ドキュメントを差し替える場合は data/docs ディレクトリに新ファイルを配置し、LINE/プッシュで更新を通知します。
          </p>
        </Section>
      </div>
    </main>
  );
}
