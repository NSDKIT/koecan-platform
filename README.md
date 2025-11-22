# 声キャン！プラットフォーム（Next.js + Supabase）

要件定義書・運用設計書・データ移行/連携構築書 v2.0 をもとに、Next.js 14 + TypeScript + Supabaseを想定したフロントエンド/PWAスケルトンを用意しました。

## セットアップ

```bash
npm install
cp .env.example .env.local # Supabase / LINE / Push などの鍵を設定
npm run dev               # デフォルトは http://localhost:3000
# 例: 2525番ポートで起動したい場合
# PORT=2525 npm run dev
```

- `NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Auth/DB に接続
- `SUPABASE_SERVICE_ROLE_KEY`: サーバーアクション等で使用（開発環境のみ）
- `DEMO_MONITOR_ID` / `ADMIN_USER_ID`: `/dashboard` / `/admin` で表示するデモユーザーのUUID
- `LINE_CHANNEL_ACCESS_TOKEN` `LINE_CHANNEL_SECRET`: LINE Messaging API 送信用
- `PEX_API_BASE` `PEX_API_KEY` `PEX_CALLBACK_URL`: PeX等の外部ポイント交換API
- `PUSH_PUBLIC_VAPID_KEY` + `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`: Web Push + FCM HTTP v1 (サービスアカウント鍵). `FCM_SERVER_KEY` はレガシーAPI向けフォールバック。
- `APP_PORT`（任意）: Playwright の `npm run test:e2e` やローカルWebサーバーを別ポートで動かす際に指定（例: `APP_PORT=2525 npm run test:e2e`）。`PORT` と合わせて指定すると Next.js も同じポートで起動します。
- `public/sw.js`/`public/manifest.json`: PWA・ブラウザプッシュのエントリ

## 実装済みビュー

| 画面 | 目的 | 主な要件反映 |
|------|------|--------------|
| `/` | ランディング | v2.0拡張概要 / KPI / ロードマップ表示 |
| `/login`, `/register` | 認証導線 | Supabase Auth（メール+パスワード）と紹介コード連携 |
| `/dashboard` | モニター機能 | Supabase CRUDからのリアルデータ取得、外部ポイント交換API連携呼び出し、友達紹介再発行、FAQ/お知らせ/通知設定 |
| `/admin` | 運用・CMS | お知らせ/FAQ/通知をSupabaseに登録、データ移行監視、ポイント交換APIモニタ、規約バージョン管理 |

## データレイヤー

- `lib/types.ts`: 仕様書の主要エンティティ（モニター、アンケート、ポイント、FAQ、通知、データ移行ジョブ等）
- `lib/data/mock.ts`: Supabase非接続時に使うフェールオーバーデータ
- `lib/services/dataSources.ts`: Supabaseサーバークライアント経由でCRUDし、失敗時はモックへフォールバック
- `lib/actions/platformActions.ts`: Supabase Auth / PeX / LINE / FCM / ポイント交換等のサーバーアクション
- `lib/supabaseClient.ts`, `lib/services/supabaseServer.ts`, `lib/services/supabaseAuth.ts`: ブラウザ・サービスロール・Server Action用クライアント

## PWA / 通知

- `public/manifest.json` と `public/sw.js` でPWA + Pushイベントハンドラを定義
- モニターダッシュボードの `NotificationPreferenceCard` は Supabase RLS配下の `monitor_profiles` を更新
- 管理画面から `scheduleNotification` を実行すると LINE Messaging API / FCM クライアントを経由して通知を予約

## データ移行・連携に関連する要素

- `public/docs/` 配下に利用規約・プライバシーポリシーの差し替え先を用意
- `dataImportJobs`（Markdown/CSV取込）や `exchangeRequests`（外部ポイント交換API）など、構築書で指定された運用監視対象をモニタリングUI化
- 友達紹介、FAQ、ポイント交換、LINE/Push通知、キャリア相談など v2.0 で追加された機能を全て可視化

## 今後の拡張（例）

1. Supabase Edge Functions（`supabase/edge-functions/pex-exchange`）をデプロイし、PeX本番API・Webhookを接続
2. Supabase RLSポリシー（`supabase/policies/rls.sql`）をApplyし、本番ユーザー単位でのアクセス制御を強化
3. `/api` ルートにPeX webhook / LINE webhookを追加し、監視アラートと連携
4. CIで `npm run test:e2e` も回すように調整し、Vercel Preview + Playwright を自動実行

## ディレクトリ構成

```
app/
  page.tsx                     # ランディング
  (auth)/login/page.tsx        # ログインフォーム
  (auth)/register/page.tsx     # 紹介コード対応の仮登録
  (dashboard)/dashboard/...    # モニター用PWAダッシュボード
  (admin)/admin/...            # 運用・CMS・連携監視
components/                    # Section, MetricCard, Referral/通知カード
lib/
  actions/platformActions.ts    # Supabaseと外部APIを叩くサーバーアクション
  data/mock.ts                 # 初期データ群
  integrations/               # LINE / FCM / PeX クライアント
  services/                   # Supabaseクライアント + データ取得
  supabaseClient.ts            # Supabaseクライアント生成
  types.ts                     # ドメイン型定義
public/
  manifest.json / sw.js        # PWA/Pushエントリ
  docs/                        # 利用規約/プライバシーPDF配置想定
supabase/
  sql/schema.sql               # テーブル作成クエリ
  policies/rls.sql             # RLSポリシー
  edge-functions/pex-exchange  # PeX連携Edge Function
tests/
  unit/                        # Vitest
  e2e/                         # Playwright シナリオ
```

## テスト

```
npm run lint        # Next.js ESLint
npm run test:unit   # Vitest（Supabase未設定時のフェールオーバー確認）
npm run test:e2e    # Playwright（npm run devが必要）
```

CI（`.github/workflows/ci.yml`）では lint + unit test を自動実行します。
