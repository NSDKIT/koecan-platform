# SUPABASE_SERVICE_ROLE_KEY の用途

## 概要

`SUPABASE_SERVICE_ROLE_KEY` は、Supabaseの**管理者権限**を持つキーです。通常のユーザー向けキー（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）では実行できない操作を行うために使用します。

## 主な用途

### 1. **管理者APIの使用**

通常のキーでは使えない、Supabaseの管理APIを使用できます：

- **ユーザーの作成・削除**: `auth.admin.createUser()`, `auth.admin.deleteUser()`
- **ユーザーの一覧取得**: `auth.admin.listUsers()`
- **ユーザー情報の更新**: `auth.admin.updateUserById()`

**使用例**: テストアカウントの自動作成（`lib/actions/platformActions.ts`）

```typescript
const serviceRoleSupabase = getSupabaseServiceRole();
// 管理者権限でユーザーを作成（メール確認不要）
const { data: newUser } = await serviceRoleSupabase.auth.admin.createUser({
  email: 'test@example.com',
  password: 'password',
  email_confirm: true, // メール確認をスキップ
  user_metadata: { role: 'monitor' }
});
```

### 2. **RLS（Row Level Security）ポリシーのバイパス**

RLSポリシーが有効な場合でも、すべてのデータにアクセスできます。これは以下の場合に必要です：

- **サーバーサイドでのデータ集計**: 全ユーザーのデータを集計する場合
- **管理者ダッシュボード**: 全データを表示する必要がある場合
- **バックエンド処理**: ユーザー認証なしでデータを操作する場合

**使用例**: ダッシュボードデータの取得（`lib/services/dataSources.ts`）

```typescript
const supabase = getSupabaseServiceRole();
// RLSポリシーをバイパスして全データを取得
const { data } = await supabase
  .from('surveys')
  .select('*');
```

### 3. **サーバーアクションでの操作**

サーバーサイドで実行される処理で、管理者権限が必要な操作を行う場合に使用します：

- アンケートの作成・削除
- ポイント付与・更新
- アンケート回答の集計・エクスポート

## セキュリティ上の注意

⚠️ **重要**: `SUPABASE_SERVICE_ROLE_KEY` は**機密情報**です。

- ❌ **絶対にクライアント側（ブラウザ）に公開してはいけません**
- ❌ GitHubなどの公開リポジトリにコミットしてはいけません
- ✅ **サーバーサイド（Server Actions, API Routes）でのみ使用**
- ✅ 環境変数（`.env.local`）として安全に管理
- ✅ Vercelなどの環境変数設定で管理

## いつ必要か？

### 必須な場合
- ✅ テストアカウントを自動作成する場合
- ✅ 管理者ダッシュボードで全データを表示する場合
- ✅ サーバーサイドでRLSをバイパスしてデータを操作する場合

### 不要な場合
- ❌ 通常のユーザー登録（`auth.signUp()` は `ANON_KEY` でOK）
- ❌ 通常のログイン（`auth.signInWithPassword()` は `ANON_KEY` でOK）
- ❌ クライアント側でのデータ取得（RLSポリシー内で許可されている操作）

## 現在のコードベースでの使用箇所

1. **テストアカウントの作成**: `lib/actions/platformActions.ts` の `handleTestAccountLogin()`
2. **ダッシュボードデータの取得**: `lib/services/dataSources.ts` の各関数
3. **サーバーアクション**: `lib/actions/platformActions.ts` の各種アクション

## 設定方法

`.env.local` ファイルに追加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Supabase Dashboard の「Settings」→「API」から取得できます。

## まとめ

- **用途**: 管理者権限が必要な操作、RLSポリシーのバイパス
- **使用場所**: サーバーサイドのみ
- **セキュリティ**: 機密情報として扱う
- **通常のユーザー登録**: 不要（`ANON_KEY`で十分）

