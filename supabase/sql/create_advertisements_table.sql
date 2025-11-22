-- ============================================
-- advertisementsテーブル作成SQL
-- ============================================
-- 
-- このSQLは、モニターダッシュボードで表示される広告（企業紹介・求人情報）を
-- 格納するadvertisementsテーブルを作成します。
-- 
-- 使用方法:
-- 1. Supabase DashboardのSQL Editorで実行
-- 2. 実行後にRLSポリシーも設定（後続のSQLで提供）
-- 
-- ============================================

-- ============================================
-- 1. advertisementsテーブルの作成
-- ============================================

CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 基本情報
  company_name TEXT,
  title TEXT,
  description TEXT,
  company_vision TEXT,
  image_url TEXT,
  representative_name TEXT,
  establishment_year TEXT,
  
  -- 所在地
  headquarters_location TEXT,
  branch_office_location TEXT,
  
  -- 従業員情報
  employee_count TEXT,
  employee_gender_ratio TEXT,
  employee_avg_age TEXT,
  industries TEXT,
  
  -- ハイライトポイント
  highlight_point_1 TEXT,
  highlight_point_2 TEXT,
  highlight_point_3 TEXT,
  
  -- 給与・収入
  starting_salary TEXT,
  three_year_retention_rate TEXT,
  avg_annual_income_20s TEXT,
  avg_annual_income_30s TEXT,
  promotion_model_case TEXT,
  
  -- 募集情報
  recruitment_roles_count TEXT,
  selection_flow_steps TEXT[],
  required_qualifications TEXT,
  
  -- 労働条件
  working_hours TEXT,
  holidays TEXT,
  annual_holidays TEXT,
  remote_work_available BOOLEAN DEFAULT FALSE,
  side_job_allowed BOOLEAN DEFAULT FALSE,
  housing_allowance_available BOOLEAN DEFAULT FALSE,
  
  -- 福利厚生・制度
  female_parental_leave_rate TEXT,
  male_parental_leave_rate TEXT,
  transfer_existence BOOLEAN DEFAULT FALSE,
  transfer_frequency TEXT,
  internal_event_frequency TEXT,
  health_management_practices TEXT,
  must_tell_welfare TEXT,
  
  -- 募集担当情報
  recruitment_department TEXT,
  recruitment_contact TEXT,
  recruitment_info_page_url TEXT,
  
  -- インターンシップ情報
  internship_scheduled BOOLEAN DEFAULT FALSE,
  internship_schedule TEXT,
  internship_capacity TEXT,
  internship_target_students TEXT,
  internship_locations TEXT,
  internship_content_types TEXT,
  internship_paid_unpaid TEXT,
  transport_lodging_stipend BOOLEAN DEFAULT FALSE,
  internship_application_url TEXT,
  
  -- SNS・リンク
  official_website_url TEXT,
  official_line_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  other_sns_sites TEXT,
  
  -- 表示制御
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. インデックスの作成（パフォーマンス向上のため）
-- ============================================

-- is_activeとpriority、display_orderでフィルタリング・ソートするため
CREATE INDEX IF NOT EXISTS idx_advertisements_is_active_priority 
ON advertisements(is_active, priority DESC, display_order ASC);

-- created_atでソートするため
CREATE INDEX IF NOT EXISTS idx_advertisements_created_at 
ON advertisements(created_at DESC);

-- ============================================
-- 3. updated_atの自動更新トリガー
-- ============================================

-- updated_atを自動更新する関数（既に存在する場合はスキップ）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atを自動更新するトリガー
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. RLS (Row Level Security) の有効化
-- ============================================

ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLSポリシーの作成
-- ============================================

-- すべてのユーザー（認証済み）がアクティブな広告を読み取れる
CREATE POLICY "Anyone can view active advertisements"
ON advertisements
FOR SELECT
USING (is_active = TRUE);

-- サービスロールはすべての操作が可能（バックエンドからの管理用）
-- 注意: これは既にサービスロールには全権限があるため、実際には不要ですが、
-- 明示的にポリシーを作成することも可能です

-- ============================================
-- 6. サンプルデータの挿入（オプション）
-- ============================================

-- テスト用のサンプル広告（本番環境では削除してください）
-- INSERT INTO advertisements (
--   company_name,
--   title,
--   description,
--   is_active,
--   priority,
--   display_order
-- ) VALUES (
--   'サンプル企業',
--   '一緒に未来を創りませんか？',
--   '当社では、新しい価値を創造する仲間を募集しています。',
--   TRUE,
--   100,
--   1
-- );

-- ============================================
-- 7. 確認クエリ
-- ============================================

-- テーブルが正しく作成されたか確認
SELECT 
    'advertisements' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'advertisements'
        ) THEN '✓ テーブルが作成されました'
        ELSE '✗ テーブルの作成に失敗しました'
    END as status;

-- 主要カラムの存在確認
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'advertisements'
AND column_name IN (
    'id',
    'company_name',
    'title',
    'description',
    'is_active',
    'priority',
    'display_order',
    'created_at',
    'updated_at'
)
ORDER BY ordinal_position;

-- RLSが有効になっているか確認
SELECT 
    'advertisements' as table_name,
    CASE 
        WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'advertisements' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        THEN '✓ RLS有効'
        ELSE '✗ RLS無効'
    END as rls_status;

-- ============================================
-- 完了
-- ============================================
-- 
-- このSQLを実行すると、以下のものが作成されます:
-- 1. advertisementsテーブル（全カラム）
-- 2. パフォーマンス向上のためのインデックス
-- 3. updated_at自動更新トリガー
-- 4. RLSポリシー（アクティブな広告はすべての認証済みユーザーが閲覧可能）
-- 
-- 次のステップ:
-- - 必要に応じてサンプルデータを挿入
-- - 管理画面から広告を追加
-- 
-- ============================================

