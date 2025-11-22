import Link from 'next/link';
import { MetricCard } from '@/components/MetricCard';
import { Section } from '@/components/Section';

const highlights = [
  'AIマッチングで最適なアンケートをレコメンド',
  'LINE/プッシュ通知で即時に案件を配信',
  '友達紹介 × FAQ × お知らせ機能を統合',
  'Supabase + Next.jsでセキュアにスケール'
];

const roadmap = [
  { label: 'Week 1', detail: '友達紹介・通知基盤', status: '完了' },
  { label: 'Week 2', detail: 'FAQ/お知らせCMS + CSV/Markdownインポート', status: '完了' },
  { label: 'Week 3', detail: '外部ポイント交換API自動化', status: '進行中' },
  { label: 'Week 4', detail: 'PWA最適化 + ブラウザプッシュ', status: '予定' }
];

export default function LandingPage() {
  return (
    <main style={{ padding: '3rem 0' }}>
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <p className="badge info" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            v2.0 要件対応 / Supabase + Next.js 14 + PWA
          </p>
          <h1 style={{ fontSize: '2.8rem', margin: '0 0 1rem' }}>声キャン！プラットフォーム</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#475569' }}>
            モニター・企業・管理者が1つにつながるアンケート＆キャリア支援PWA。
            友達紹介/FAQ/お知らせ/LINE/プッシュ通知を統合した最新基盤です。
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="button primary" href="/dashboard">
              モニターダッシュボード
            </Link>
            <Link className="button secondary" href="/client">
              企業ダッシュボード
            </Link>
            <Link className="button secondary" href="/support">
              サポートダッシュボード
            </Link>
            <Link className="button ghost" href="/admin">
              管理者ダッシュボード
            </Link>
          </div>
        </div>

        <Section title="v2.0 ハイライト" subtitle="要件定義書・運用設計書・構築書の反映状況">
          <div className="two-column">
            {highlights.map((text) => (
              <div key={text} className="card" style={{ minHeight: '120px' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="プロジェクトKPI" subtitle="初年度500ユーザー / 月間5,000回答を想定">
          <div className="two-column">
            <MetricCard label="登録モニター" value="512名" trend="+38% vs. 先月" accent="success" />
            <MetricCard label="月間アンケート回答" value="5,180件" trend="目標達成" accent="success" />
            <MetricCard label="ポイント交換API稼働" value="99.95%" trend="外部監視" />
            <MetricCard label="友達紹介経由登録" value="38%" trend="キャンペーン中" accent="warning" />
          </div>
        </Section>

        <Section title="開発ロードマップ" subtitle="要件定義書8章・運用設計書13章をドライブ">
          <div className="card">
            <ul className="list-reset">
              {roadmap.map((item) => (
                <li key={item.label} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong>{item.label}</strong>
                    <p style={{ margin: 0 }}>{item.detail}</p>
                  </div>
                  <span className="badge success">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>
    </main>
  );
}
