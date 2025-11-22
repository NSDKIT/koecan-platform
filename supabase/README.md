# Supabase データベーススキーマ適用手順

このディレクトリには、Supabaseデータベースのスキーマ定義とRLSポリシーが含まれています。

## 適用手順

### 1. Supabase Dashboardにアクセス

1. https://supabase.com にアクセス
2. プロジェクトを選択
3. 「SQL Editor」を開く

### 2. スキーマの適用

#### 2.1 テーブル作成

`sql/schema.sql` の内容をコピーして、SQL Editorで実行してください。

```bash
# または、Supabase CLIを使用する場合
supabase db push
```

#### 2.2 RLSポリシーの適用

`policies/rls.sql` の内容をコピーして、SQL Editorで実行してください。

### 3. 適用順序

1. `sql/schema.sql` を実行（テーブル作成）
2. `policies/rls.sql` を実行（RLSポリシー設定）

### 4. 確認

以下のクエリでテーブルが作成されているか確認してください：

```sql
-- テーブル一覧確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 各テーブルの構造確認
\d survey_questions
\d survey_question_options
\d survey_responses
\d survey_answers
```

## 新規追加テーブル

以下のテーブルが新規に追加されました：

1. **survey_questions** - アンケート質問
2. **survey_question_options** - 質問選択肢
3. **survey_responses** - アンケート回答
4. **survey_answers** - 個別回答

これらのテーブルにより、アンケートの質問・選択肢の管理と、ユーザーの回答データの保存が可能になります。

## RLSポリシー

以下のRLSポリシーが設定されています：

- **surveys**: 公開済みアンケートは全ユーザーが参照可能
- **survey_questions**: 公開済みアンケートの質問は全ユーザーが参照可能
- **survey_question_options**: 公開済みアンケートの選択肢は全ユーザーが参照可能
- **survey_responses**: ユーザーは自分の回答のみ挿入・参照可能
- **survey_answers**: ユーザーは自分の回答に関連する個別回答のみ挿入・参照可能
- **service_role**: すべてのテーブルに対してフルアクセス可能（サーバーサイド処理用）

## トラブルシューティング

### エラー: "relation does not exist"

テーブルがまだ作成されていない可能性があります。`sql/schema.sql` を先に実行してください。

### エラー: "permission denied"

RLSポリシーが正しく設定されていない可能性があります。`policies/rls.sql` を再実行してください。

### 外部キー制約エラー

依存関係のあるテーブル（`surveys`）が先に作成されている必要があります。スキーマファイルの順序を確認してください。

