# テーブル参照一覧

このドキュメントでは、ログイン処理とダッシュボードで参照しているSupabaseテーブルを説明します。

## 1. ログイン処理 (`lib/actions/platformActions.ts`)

### 参照テーブル

| 処理 | テーブル | 用途 |
|------|----------|------|
| 認証 | `auth.users` (内部的) | メールアドレスとパスワードで認証 |
| ロール取得 | `auth.users.user_metadata` | ユーザーのロール（monitor/client/admin/support）を取得 |
| テストアカウント作成 | `auth.users` (Service Role経由) | テスト用アカウントの自動作成 |

### 処理フロー

1. `supabase.auth.signInWithPassword()` で `auth.users` テーブルで認証
2. ログイン成功後、`data.user.user_metadata.role` からロールを取得
3. ロールに応じたダッシュボードURLにリダイレクト

### 注意事項

- `auth.users` テーブルはSupabaseの内部テーブルで、直接SQLで参照する必要はありません
- `signInWithPassword()` が内部的に処理します
- ロール情報は `auth.users.user_metadata` (JSONB型) に保存されます

---

## 2. モニターダッシュボード (`app/(dashboard)/dashboard/page.tsx`)

### 統合作業後の参照テーブル（MonitorDashboard.tsx統合後）

| 機能 | テーブル | カラム | 用途 |
|------|----------|--------|------|
| プロフィール取得 | `monitor_profiles` | `user_id`, `name`, `email`, `age`, `occupation`, `points`, `referral_code`, `referral_count`, `referral_points`, `is_line_linked`, `push_opt_in`, `tags`, `updated_at` | ユーザーのプロフィール情報を表示 |
| アンケート一覧 | `surveys` | `id`, `title`, `description`, `category`, `reward_points`, `questions`, `status`, `deadline`, `delivery_channels`, `target_tags`, `ai_matching_score`, `created_at` | 公開中のアンケート一覧を表示 |
| 回答履歴 | `survey_responses` | `survey_id`, `user_id` | ユーザーが回答済みのアンケートIDを取得 |
| 広告表示 | `advertisements` | 全カラム | アクティブな広告を表示 |

### 統合作業前の参照テーブル（`lib/services/dataSources.ts` の `fetchMonitorDashboardData`）

| 機能 | テーブル | カラム | 用途 |
|------|----------|--------|------|
| プロフィール取得 | `monitor_profiles` | 全カラム | ユーザーのプロフィール情報 |
| AIマッチングアンケート | `surveys` | 全カラム | AIマッチングスコア順にアンケートを取得 |
| ポイント履歴 | `point_history` (VIEW) | `user_id`, `happened_at` | ポイント獲得履歴 |
| 報酬アイテム | `reward_items` | 全カラム | ポイント交換可能な報酬アイテム |
| お知らせ | `announcements` | 全カラム | お知らせ一覧 |
| FAQ | `faqs` (VIEW) | 全カラム | よくある質問 |
| キャリア相談 | `career_slots` | 全カラム | キャリア相談の空き枠 |
| チャットメッセージ | `chat_messages` | 全カラム | サポートチャットのメッセージ |
| 紹介コード | `referral_codes` (VIEW) | `user_id` | ユーザーの紹介コード |
| ポリシードキュメント | `policy_documents` | 全カラム | 利用規約やプライバシーポリシー |

### 統合作業前後の主な違い

#### 統合作業前
- **複数のテーブルを一度に取得**: `Promise.all()` で並行取得
- **フォールバック機能**: テーブルが存在しない場合はモックデータを使用
- **データソースは `lib/services/dataSources.ts`**: サーバーコンポーネントから呼び出し

#### 統合作業後
- **3つのテーブルのみ**: `monitor_profiles`, `surveys`, `survey_responses`, `advertisements`
- **クライアント側で直接取得**: `app/(dashboard)/dashboard/page.tsx` 内で `getBrowserSupabase()` を使用
- **エラーハンドリング**: テーブルが存在しない場合は空配列または最小限のプロフィールを設定

---

## 3. アンケート詳細ページ (`app/(dashboard)/dashboard/surveys/[id]/page.tsx`)

### 参照テーブル

| 機能 | テーブル | カラム | 用途 |
|------|----------|--------|------|
| アンケート詳細 | `surveys` | 全カラム | アンケートの基本情報 |
| 質問一覧 | `survey_questions` | `id`, `question_text`, `question_type`, `required`, `order_index`, `is_multiple_select`, `max_selections`, `display_order` | アンケートの質問 |
| 選択肢 | `survey_question_options` | `id`, `option_text`, `order_index` | 選択式質問の選択肢 |
| 回答済みチェック | `survey_responses` | `id`, `survey_id`, `user_id` | ユーザーが既に回答済みか確認 |

---

## 4. アンケート回答データ取得 (`lib/services/dataSources.ts` の `fetchSurveyResponses`)

### 参照テーブル

| 機能 | テーブル | カラム | 用途 |
|------|----------|--------|------|
| 回答一覧 | `survey_responses` | 全カラム | 特定アンケートへの全回答 |
| 回答内容 | `survey_answers` | `id`, `response_id`, `question_id`, `answer` | 各回答の詳細内容 |
| 質問マスター | `survey_questions` | `id`, `question_text` | 質問テキストを取得 |

---

## 5. 統合作業前後の主な違いまとめ

### 統合作業前のアーキテクチャ

```
ログイン → サーバー側で認証 → ダッシュボード（サーバーコンポーネント）
                              ↓
                    lib/services/dataSources.ts
                    - fetchMonitorDashboardData()
                    - 複数テーブルを並行取得
                    - モックデータにフォールバック
```

### 統合作業後のアーキテクチャ

```
ログイン → サーバー側で認証 → ダッシュボード（クライアントコンポーネント）
                              ↓
                    app/(dashboard)/dashboard/page.tsx
                    - fetchProfile()
                    - fetchSurveysAndResponses()
                    - fetchAdvertisements()
                    - クライアント側で直接取得
                    - エラー時は空配列/最小限データにフォールバック
```

### 参照テーブルの違い

| テーブル | 統合作業前 | 統合作業後 | 備考 |
|----------|-----------|-----------|------|
| `monitor_profiles` | ✓ | ✓ | 両方で使用 |
| `surveys` | ✓ | ✓ | 両方で使用 |
| `survey_responses` | ✓ | ✓ | 両方で使用 |
| `advertisements` | - | ✓ | 統合後のみ |
| `point_history` | ✓ | - | 統合前のみ（VIEW） |
| `reward_items` | ✓ | - | 統合前のみ |
| `announcements` | ✓ | - | 統合前のみ |
| `faqs` | ✓ | - | 統合前のみ（VIEW） |
| `career_slots` | ✓ | - | 統合前のみ |
| `chat_messages` | ✓ | - | 統合前のみ |
| `referral_codes` | ✓ | - | 統合前のみ（VIEW） |
| `policy_documents` | ✓ | - | 統合前のみ |

---

## 6. 注意事項

1. **`auth.users` テーブルは直接参照しない**
   - Supabaseの`signInWithPassword()`が内部的に処理
   - 直接SQLで参照する必要はない

2. **RLS (Row Level Security) ポリシー**
   - すべてのテーブルにRLSが有効になっている必要があります
   - ユーザーは自分のデータのみアクセス可能なポリシーが設定されている必要があります

3. **テーブルの存在チェック**
   - 統合作業後は、テーブルが存在しない場合は空配列や最小限のデータでフォールバック
   - エラーコード `PGRST116` (No rows found) や `42P01` (Table does not exist) を適切に処理

4. **セッション管理**
   - クライアント側のSupabaseクライアントはクッキーからセッションを読み取る
   - サーバー側のSupabaseクライアントもクッキーからセッションを読み取る
   - 両方が同じクッキーを参照することで、セッションが同期される

---

## 7. トラブルシューティング

### 問題: ログイン後、ダッシュボードでデータが表示されない

1. **テーブルが存在するか確認**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **RLSポリシーが正しく設定されているか確認**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'monitor_profiles';
   ```

3. **セッションが正しく確立されているか確認**
   - ブラウザの開発者ツールでクッキーを確認
   - `sb-<project-id>-auth-token` という名前のクッキーが存在するか

### 問題: 特定のテーブルにアクセスできない

1. **RLSポリシーを確認**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = '<テーブル名>';
   ```

2. **ユーザーIDが正しいか確認**
   - ダッシュボードのコンソールログで `user.id` を確認
   - `auth.users` テーブルにユーザーが存在するか確認

3. **外部キー制約を確認**
   - `monitor_profiles.user_id` が `auth.users.id` を参照しているか確認

