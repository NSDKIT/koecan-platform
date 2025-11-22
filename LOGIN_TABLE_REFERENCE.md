# ログイン処理で参照されるテーブル

## 概要

ログイン処理（`loginAction`）で参照されるテーブルとデータの流れを説明します。

## 1. 認証テーブル（Supabase Authが自動管理）

### `auth.users`テーブル

**スキーマ**: `auth`（Supabaseが自動管理）  
**直接参照**: ❌ （Supabaseの`signInWithPassword()`が内部的に参照）

**役割**:
- ユーザーの認証情報（メールアドレス、パスワードハッシュ）を格納
- ログイン処理では、`supabase.auth.signInWithPassword()`がこのテーブルを内部的に参照して認証を行う

**主なカラム**:
```sql
- id (UUID) - プライマリキー、ユーザーを一意に識別
- email (TEXT) - メールアドレス（ログイン時に使用）
- encrypted_password (TEXT) - パスワードのハッシュ（認証時に使用）
- email_confirmed_at (TIMESTAMPTZ) - メール確認日時
- user_metadata (JSONB) - ユーザーメタデータ（ロール情報など）
  └─ role (string) - ユーザーのロール（'monitor', 'client', 'admin', 'support'）
```

**ログイン処理での使用箇所**:
```typescript
// lib/actions/platformActions.ts
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});

// data.userには、auth.usersテーブルの情報が含まれる
// data.user.user_metadata.role からロールを取得
const role = (data.user.user_metadata?.role || 'monitor') as 'monitor' | 'client' | 'admin' | 'support';
```

## 2. ログイン処理の流れ

### ステップ1: 認証（`auth.users`テーブルを内部的に参照）

1. ユーザーがメールアドレスとパスワードを入力
2. `supabase.auth.signInWithPassword()`が呼ばれる
3. Supabaseが`auth.users`テーブルを内部的に参照して認証
4. 認証成功時、セッションが作成され、ユーザー情報が返される

### ステップ2: ロール取得（`auth.users.user_metadata`から取得）

1. 認証成功後、`data.user.user_metadata.role`からロールを取得
2. ロールが設定されていない場合は、デフォルトで`'monitor'`を使用
3. ロールに応じてリダイレクト先を決定

```typescript
// lib/actions/platformActions.ts (204行目)
const role = (data.user.user_metadata?.role || 'monitor') as 'monitor' | 'client' | 'admin' | 'support';
const redirectUrl = getRoleDashboardUrl(role);
```

### ステップ3: リダイレクト

ロールに応じて以下のダッシュボードにリダイレクト：
- `monitor` → `/dashboard`
- `client` → `/client`
- `admin` → `/admin`
- `support` → `/support`

## 3. ログイン後に参照されるテーブル

ログイン処理自体では直接参照しませんが、ログイン後にダッシュボードで参照されるテーブル：

### モニターダッシュボード（`/dashboard`）

- **`monitor_profiles`テーブル**
  - プロフィール情報（名前、年齢、職業、ポイントなど）を取得
  - `user_id`が`auth.users.id`と紐づく
  - `fetchProfile()`関数で取得

- **`surveys`テーブル**
  - アンケート一覧を取得
  - `fetchSurveysAndResponses()`関数で取得

- **`survey_responses`テーブル**
  - ユーザーが回答済みのアンケートを特定
  - `fetchSurveysAndResponses()`関数で取得

- **`advertisements`テーブル**
  - 広告情報を取得
  - `fetchAdvertisements()`関数で取得

### クライアントダッシュボード（`/client`）

- **`client_profiles`テーブル**
  - 企業プロフィール情報を取得
  - `user_id`が`auth.users.id`と紐づく

### 管理者ダッシュボード（`/admin`）

- 各種管理テーブルを参照（詳細はダッシュボード実装による）

## 4. まとめ

| 処理段階 | 参照テーブル | 用途 |
|---------|------------|------|
| **ログイン認証** | `auth.users`（内部的） | メールアドレスとパスワードで認証 |
| **ロール取得** | `auth.users.user_metadata` | ユーザーのロールを取得 |
| **リダイレクト後** | `monitor_profiles`, `client_profiles`, `surveys`, `survey_responses`, `advertisements` など | ダッシュボードで表示するデータを取得 |

## 5. 関連するコードファイル

- **ログイン処理**: `lib/actions/platformActions.ts` - `loginAction()`関数
- **ミドルウェア**: `middleware.ts` - 認証チェックとロールベースのアクセス制御
- **ダッシュボード**: `app/(dashboard)/dashboard/page.tsx` - モニターダッシュボード
- **データ取得**: `lib/services/dataSources.ts` - `fetchMonitorDashboardData()`関数

## 6. 注意事項

1. **`auth.users`テーブルは直接参照しない**
   - Supabaseの`signInWithPassword()`が内部的に処理するため、直接SQLで参照する必要はない

2. **ロール情報の保存場所**
   - ロール情報は`auth.users.user_metadata`（JSONB型）に保存される
   - ユーザー作成時や更新時に`user_metadata: { role: 'monitor' }`として設定

3. **プロフィール情報は別テーブル**
   - 認証情報（`auth.users`）とプロフィール情報（`monitor_profiles`, `client_profiles`）は別テーブル
   - `user_id`で紐づいている

