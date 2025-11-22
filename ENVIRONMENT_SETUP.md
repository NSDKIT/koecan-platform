# 環境変数設定ガイド

## 必須環境変数

本番環境で動作させるために、以下の環境変数を設定する必要があります。

### 1. Supabase基本設定

```bash
# .env.local または 本番環境の環境変数設定

# SupabaseプロジェクトのURL（必須）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key（フロントエンド用、必須）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key（サーバーサイド用、必須）
# ⚠️ このキーは機密情報です。クライアント側に公開しないでください。
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 取得方法

1. **Supabase Dashboardにアクセス**
   - https://supabase.com/dashboard
   - プロジェクトを選択

2. **Settings → API に移動**
   - Project URL: `NEXT_PUBLIC_SUPABASE_URL` にコピー
   - anon public: `NEXT_PUBLIC_SUPABASE_ANON_KEY` にコピー
   - service_role secret: `SUPABASE_SERVICE_ROLE_KEY` にコピー

### 3. 環境変数の設定方法

#### ローカル開発環境

`.env.local` ファイルを作成：

```bash
cp .env.example .env.local
# .env.local を編集して値を設定
```

#### Vercel（本番環境）

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. 以下の変数を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### その他のプラットフォーム

各プラットフォームの環境変数設定方法に従って、上記の3つの変数を設定してください。

## なぜSUPABASE_SERVICE_ROLE_KEYが必要か？

`SUPABASE_SERVICE_ROLE_KEY`は、以下の用途で必要です：

1. **登録時のプロフィール作成**: 登録直後はユーザーがログイン状態でないため、RLSポリシーをバイパスしてプロフィールを作成する必要があります。

2. **テストアカウントの作成**: 開発・テスト用のアカウントを自動作成するために使用します。

3. **管理者操作**: サーバーサイドで全データにアクセスする必要がある操作（データ集計、管理者ダッシュボードなど）で使用します。

## セキュリティ注意事項

- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`は**絶対に**クライアント側（ブラウザ）に公開しないでください
- ⚠️ GitHubなどの公開リポジトリにコミットしないでください
- ✅ `.env.local`は`.gitignore`に追加されていることを確認してください
- ✅ 本番環境では環境変数として安全に管理してください

## トラブルシューティング

### エラー: "Environment variable SUPABASE_SERVICE_ROLE_KEY is not set"

- `.env.local`ファイルに`SUPABASE_SERVICE_ROLE_KEY`が設定されているか確認
- Vercelの場合は、環境変数が正しく設定されているか確認
- 設定後、アプリケーションを再起動

### エラー: "new row violates row-level security policy"

- `SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか確認
- Supabase DashboardでService Role Keyが正しいか確認
- データベーススキーマとRLSポリシーが正しく適用されているか確認（`supabase/sql/production_setup.sql`を実行）

## 確認方法

以下のコマンドで環境変数が設定されているか確認できます（開発環境）：

```bash
# 環境変数の存在確認（値は表示されません）
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

環境変数が設定されている場合、何らかの値が表示されます（設定されていない場合は空です）。

