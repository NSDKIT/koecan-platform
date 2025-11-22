# Supabase データベーススキーマ設定手順

## エラーについて

`monitor_profiles`テーブルが見つからないというエラーが発生している場合、Supabaseデータベースにスキーマが適用されていません。

## スキーマ適用方法

### 方法1: Supabase Dashboardで実行（推奨）

1. **Supabase Dashboardにアクセス**
   - https://supabase.com/dashboard にアクセス
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左サイドバーから「SQL Editor」をクリック

3. **スキーマファイルをコピー**
   - `supabase/sql/schema.sql` ファイルを開く
   - すべての内容をコピー

4. **SQLを実行**
   - SQL Editorのテキストエリアに貼り付け
   - 「Run」ボタンをクリック（または Cmd+Enter / Ctrl+Enter）
   - 実行が成功したことを確認

5. **RLSポリシーを適用**
   - `supabase/policies/rls.sql` ファイルを開く
   - すべての内容をコピー
   - SQL Editorで実行

### 方法2: Supabase CLIを使用

```bash
# Supabase CLIをインストール（まだの場合）
npm install -g supabase

# Supabaseプロジェクトにリンク
supabase link --project-ref <your-project-ref>

# スキーマをプッシュ
supabase db push
```

## 適用後の確認

以下のSQLでテーブルが作成されているか確認できます：

```sql
-- テーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- monitor_profilesテーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'monitor_profiles'
ORDER BY ordinal_position;
```

## 必要なテーブル

以下のテーブルが作成される必要があります：

1. `monitor_profiles` - モニタープロフィール（必須）
2. `surveys` - アンケート
3. `survey_questions` - アンケート質問
4. `survey_question_options` - 質問選択肢
5. `survey_responses` - アンケート回答
6. `survey_answers` - 個別回答
7. `point_history` / `point_transactions` - ポイント履歴
8. `reward_items` - 報酬アイテム
9. `announcements` - お知らせ
10. `faqs` / `faq_items` - FAQ
11. その他（`supabase/sql/schema.sql`を参照）

## トラブルシューティング

### エラー: "relation does not exist"

テーブルがまだ作成されていない可能性があります。`supabase/sql/schema.sql` を実行してください。

### エラー: "permission denied"

RLSポリシーが設定されている可能性があります。`supabase/policies/rls.sql` を実行してください。

### エラー: "duplicate key value violates unique constraint"

テーブルは既に存在している可能性があります。`CREATE TABLE IF NOT EXISTS`を使用しているため、エラーは無視しても問題ありません。

### エラー: "Could not find the table 'public.monitor_profiles' in the schema cache"

1. Supabase DashboardでSQL Editorを開く
2. 以下のクエリでテーブルの存在を確認：
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'monitor_profiles'
   );
   ```
3. テーブルが存在しない場合、`supabase/sql/schema.sql` を実行

## クイックスタート

すぐにテストするには、以下の最小限のスキーマを実行：

```sql
-- UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- monitor_profilesテーブルを作成（最小限）
CREATE TABLE IF NOT EXISTS monitor_profiles (
  user_id uuid primary key,
  name text not null,
  email text not null,
  occupation text not null,
  age int,
  gender text,
  location text,
  points int default 0,
  referral_code text not null,
  referral_count int default 0,
  referral_points int default 0,
  is_line_linked boolean default false,
  push_opt_in boolean default false,
  tags text[] default '{}',
  updated_at timestamptz default now()
);
```

このスキーマを実行後、再度登録を試してください。

