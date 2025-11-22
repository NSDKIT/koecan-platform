# データベーススキーマの説明

## auth.usersテーブルとmonitor_profilesテーブルの関係

### 1. auth.usersテーブル（Supabaseが自動管理）

**これは何？**
- Supabase Authが自動的に作成・管理する**認証用のテーブル**です
- ユーザーの認証情報（メールアドレス、パスワードハッシュなど）を格納します
- スキーマ: `auth` スキーマ内に存在

**存在確認：**
```sql
-- auth.usersテーブルが存在するか確認
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'auth'
  AND table_name = 'users';
```

**テーブル構造：**
```sql
-- auth.usersテーブルのカラムを確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;
```

**主なカラム：**
- `id` (UUID) - プライマリキー、ユーザーを一意に識別
- `email` (TEXT) - メールアドレス
- `encrypted_password` (TEXT) - パスワードのハッシュ
- `email_confirmed_at` (TIMESTAMPTZ) - メール確認日時
- `created_at` (TIMESTAMPTZ) - 作成日時
- `updated_at` (TIMESTAMPTZ) - 更新日時
- `user_metadata` (JSONB) - ユーザーメタデータ（カスタム情報）

### 2. monitor_profilesテーブル（アプリケーション固有）

**これは何？**
- アプリケーション固有の**モニタープロフィール情報**を格納するテーブルです
- 名前、年齢、職業、ポイントなどの詳細情報を格納します
- スキーマ: `public` スキーマ内に存在

**存在確認：**
```sql
-- monitor_profilesテーブルが存在するか確認
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'monitor_profiles';
```

**テーブル構造：**
```sql
-- monitor_profilesテーブルのカラムを確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'monitor_profiles'
ORDER BY ordinal_position;
```

**主なカラム：**
- `user_id` (UUID) - **auth.users.idへの外部キー**
- `name` (TEXT) - 名前
- `email` (TEXT) - メールアドレス（重複保存）
- `occupation` (TEXT) - 職業
- `age` (INTEGER) - 年齢
- `gender` (TEXT) - 性別
- `location` (TEXT) - 居住地
- `points` (INTEGER) - ポイント
- `referral_code` (TEXT) - 紹介コード
- など

### 3. 2つのテーブルの関係

```
┌─────────────────┐         ┌──────────────────────┐
│   auth.users    │         │  monitor_profiles    │
├─────────────────┤         ├──────────────────────┤
│ id (PK)         │◄────────│ user_id (FK)         │
│ email           │         │ name                 │
│ password_hash   │         │ email                │
│ created_at      │         │ occupation           │
│ user_metadata   │         │ age                  │
│ ...             │         │ points               │
└─────────────────┘         │ ...                  │
                            └──────────────────────┘
```

**重要なポイント：**
1. **1対1の関係**: 1人のユーザー（auth.users）に対して、1つのプロフィール（monitor_profiles）
2. **外部キー制約**: `monitor_profiles.user_id` が `auth.users.id` を参照
3. **CASCADE削除**: `auth.users`のユーザーが削除されると、`monitor_profiles`のプロフィールも自動削除

### 4. ユーザー登録の流れ

1. **auth.usersテーブルにユーザーを作成**
   ```typescript
   await supabase.auth.admin.createUser({
     email: 'user@example.com',
     password: 'password123',
     email_confirm: true
   });
   ```
   → `auth.users`テーブルに新しい行が作成される

2. **monitor_profilesテーブルにプロフィールを作成**
   ```typescript
   await supabase
     .from('monitor_profiles')
     .insert({
       user_id: user.id, // auth.users.idを参照
       name: '山田太郎',
       email: 'user@example.com',
       occupation: '学生',
       // ...
     });
   ```
   → `monitor_profiles`テーブルに新しい行が作成される

3. **外部キー制約のチェック**
   - `monitor_profiles.user_id`が`auth.users.id`を参照しているため
   - `auth.users`にユーザーが存在しないと、`monitor_profiles`への挿入は失敗する

### 5. 確認方法

#### auth.usersテーブルが存在するか確認
```sql
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'auth' 
    AND table_name = 'users'
);
```

#### auth.usersテーブルにユーザーが存在するか確認
```sql
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'あなたのメールアドレス';
```

#### monitor_profilesテーブルが存在するか確認
```sql
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'monitor_profiles'
);
```

#### 外部キー制約が正しく設定されているか確認
```sql
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'monitor_profiles'
  AND kcu.column_name = 'user_id';
```

### 6. よくある問題

#### 問題1: auth.usersテーブルが存在しない
**症状**: 外部キー制約エラー
**原因**: Supabase Authが有効になっていない、またはデータベースが正しくセットアップされていない
**解決**: Supabase DashboardでAuthentication機能が有効になっているか確認

#### 問題2: 外部キー制約が設定されていない
**症状**: `monitor_profiles`に任意の`user_id`を挿入できてしまう
**原因**: テーブル作成時に外部キー制約が設定されなかった
**解決**: `ALTER TABLE`で外部キー制約を追加

#### 問題3: auth.usersにユーザーが作成されていない
**症状**: プロフィール作成時に外部キー制約エラー
**原因**: `createUser()`が失敗しているか、非同期で反映されていない
**解決**: ユーザー作成後に`getUserById()`で確認してからプロフィールを作成

