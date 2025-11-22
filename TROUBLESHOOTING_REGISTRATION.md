# 登録機能のトラブルシューティング

## 問題: 外部キー制約エラーが発生する

### 確認手順

#### 1. monitor_profilesテーブルの存在確認

```sql
-- monitor_profilesテーブルが存在するか確認
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name = 'monitor_profiles';
```

#### 2. monitor_profilesテーブルの構造確認

```sql
-- monitor_profilesテーブルのカラムを確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'monitor_profiles'
ORDER BY ordinal_position;
```

#### 3. 外部キー制約の確認

```sql
-- 外部キー制約を確認（より詳細）
SELECT 
  tc.constraint_name,
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'monitor_profiles';
```

#### 4. auth.usersテーブルの確認

```sql
-- auth.usersテーブルが存在するか確認
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'auth'
  AND table_name = 'users';
```

#### 5. auth.usersテーブルの構造確認

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

### 解決方法

#### 方法1: 外部キー制約を追加（制約が存在しない場合）

```sql
-- monitor_profilesテーブルに外部キー制約を追加
ALTER TABLE monitor_profiles
ADD CONSTRAINT monitor_profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
```

#### 方法2: monitor_profilesテーブルを再作成（制約が正しくない場合）

```sql
-- 既存のテーブルを削除（注意: データも削除されます）
DROP TABLE IF EXISTS monitor_profiles CASCADE;

-- テーブルを再作成
CREATE TABLE monitor_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  university TEXT,
  occupation TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  location TEXT,
  points INTEGER DEFAULT 0,
  referral_code TEXT NOT NULL,
  referral_count INTEGER DEFAULT 0,
  referral_points INTEGER DEFAULT 0,
  is_line_linked BOOLEAN DEFAULT FALSE,
  push_opt_in BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSポリシーを有効化
ALTER TABLE monitor_profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシーを設定
CREATE POLICY "モニターは自分のプロフィールを閲覧可能"
ON monitor_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "モニターは自分のプロフィールを更新可能"
ON monitor_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service Roleは全権限を持つ"
ON monitor_profiles
FOR ALL
USING (auth.role() = 'service_role');
```

#### 方法3: 外部キー制約を一時的に削除してテスト

```sql
-- 外部キー制約を削除（テスト用）
ALTER TABLE monitor_profiles
DROP CONSTRAINT IF EXISTS monitor_profiles_user_id_fkey;
```

注意: この方法は一時的な解決策です。データ整合性のため、後で制約を再追加してください。

