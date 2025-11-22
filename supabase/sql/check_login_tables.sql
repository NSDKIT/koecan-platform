-- ============================================
-- ログイン処理で参照するテーブルとカラムの存在チェックSQL
-- ============================================
-- 
-- このSQLは、ログイン処理とダッシュボードで参照するテーブルとカラムが
-- 正しく存在するかを確認するためのものです。
-- 
-- 使用方法:
-- 1. Supabase DashboardのSQL Editorで実行
-- 2. または、psqlなどで直接実行
-- 
-- ============================================

-- ============================================
-- 1. 認証テーブル（auth.users）の確認
-- ============================================

-- auth.usersテーブルの存在確認と主要カラムの確認
SELECT 
    'auth.users' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'auth' 
            AND table_name = 'users'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as table_exists,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'id'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as id_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'email'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as email_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'user_metadata'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as user_metadata_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'users' 
            AND column_name = 'email_confirmed_at'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as email_confirmed_at_column;

-- ============================================
-- 2. ダッシュボードで参照するテーブルの確認
-- ============================================

-- monitor_profilesテーブルの確認
SELECT 
    'monitor_profiles' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'monitor_profiles'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as table_exists,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'monitor_profiles'
GROUP BY table_name
UNION ALL
SELECT 
    'monitor_profiles' as table_name,
    'テーブルが存在しません' as table_exists,
    '' as columns
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'monitor_profiles'
);

-- monitor_profilesテーブルの主要カラム確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'monitor_profiles'
AND column_name IN (
    'user_id',
    'name',
    'email',
    'age',
    'occupation',
    'points',
    'referral_code',
    'referral_count',
    'referral_points',
    'is_line_linked',
    'push_opt_in',
    'tags',
    'updated_at'
)
ORDER BY 
    CASE column_name
        WHEN 'user_id' THEN 1
        WHEN 'name' THEN 2
        WHEN 'email' THEN 3
        ELSE 100
    END;

-- surveysテーブルの確認
SELECT 
    'surveys' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'surveys'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as table_exists,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'surveys'
GROUP BY table_name
UNION ALL
SELECT 
    'surveys' as table_name,
    'テーブルが存在しません' as table_exists,
    '' as columns
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'surveys'
);

-- surveysテーブルの主要カラム確認
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'surveys'
AND column_name IN (
    'id',
    'title',
    'description',
    'category',
    'reward_points',
    'questions',
    'status',
    'deadline',
    'delivery_channels',
    'target_tags',
    'ai_matching_score',
    'created_at'
)
ORDER BY 
    CASE column_name
        WHEN 'id' THEN 1
        WHEN 'title' THEN 2
        WHEN 'status' THEN 3
        ELSE 100
    END;

-- survey_responsesテーブルの確認
SELECT 
    'survey_responses' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'survey_responses'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as table_exists,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'survey_responses'
GROUP BY table_name
UNION ALL
SELECT 
    'survey_responses' as table_name,
    'テーブルが存在しません' as table_exists,
    '' as columns
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'survey_responses'
);

-- survey_responsesテーブルの主要カラム確認
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'survey_responses'
AND column_name IN (
    'id',
    'survey_id',
    'user_id',
    'submitted_at'
)
ORDER BY 
    CASE column_name
        WHEN 'id' THEN 1
        WHEN 'survey_id' THEN 2
        WHEN 'user_id' THEN 3
        ELSE 100
    END;

-- advertisementsテーブルの確認
SELECT 
    'advertisements' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'advertisements'
        ) THEN '✓ 存在する'
        ELSE '✗ 存在しない'
    END as table_exists,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'advertisements'
GROUP BY table_name
UNION ALL
SELECT 
    'advertisements' as table_name,
    'テーブルが存在しません' as table_exists,
    '' as columns
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'advertisements'
);

-- ============================================
-- 3. 外部キー制約の確認
-- ============================================

-- monitor_profiles.user_id が auth.users.id を参照しているか確認
SELECT 
    'monitor_profiles.user_id' as constraint_check,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu 
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = 'monitor_profiles'
            AND kcu.column_name = 'user_id'
            AND ccu.table_schema = 'auth'
            AND ccu.table_name = 'users'
            AND ccu.column_name = 'id'
        ) THEN '✓ 外部キー制約が存在する'
        ELSE '✗ 外部キー制約が存在しない'
    END as status;

-- survey_responses.user_id が auth.users.id を参照しているか確認
SELECT 
    'survey_responses.user_id' as constraint_check,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu 
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = 'survey_responses'
            AND kcu.column_name = 'user_id'
            AND ccu.table_schema = 'auth'
            AND ccu.table_name = 'users'
            AND ccu.column_name = 'id'
        ) THEN '✓ 外部キー制約が存在する'
        ELSE '✗ 外部キー制約が存在しない'
    END as status;

-- survey_responses.survey_id が surveys.id を参照しているか確認
SELECT 
    'survey_responses.survey_id' as constraint_check,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu 
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = 'survey_responses'
            AND kcu.column_name = 'survey_id'
            AND ccu.table_schema = 'public'
            AND ccu.table_name = 'surveys'
            AND ccu.column_name = 'id'
        ) THEN '✓ 外部キー制約が存在する'
        ELSE '✗ 外部キー制約が存在しない'
    END as status;

-- ============================================
-- 4. RLS (Row Level Security) ポリシーの確認
-- ============================================

-- monitor_profilesテーブルのRLS有効化確認
SELECT 
    'monitor_profiles' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'monitor_profiles'
        ) THEN 
            CASE 
                WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'monitor_profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
                THEN '✓ RLS有効'
                ELSE '✗ RLS無効'
            END
        ELSE '✗ テーブルが存在しません'
    END as rls_status;

-- surveysテーブルのRLS有効化確認
SELECT 
    'surveys' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'surveys'
        ) THEN 
            CASE 
                WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'surveys' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
                THEN '✓ RLS有効'
                ELSE '✗ RLS無効'
            END
        ELSE '✗ テーブルが存在しません'
    END as rls_status;

-- survey_responsesテーブルのRLS有効化確認
SELECT 
    'survey_responses' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'survey_responses'
        ) THEN 
            CASE 
                WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'survey_responses' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
                THEN '✓ RLS有効'
                ELSE '✗ RLS無効'
            END
        ELSE '✗ テーブルが存在しません'
    END as rls_status;

-- advertisementsテーブルのRLS有効化確認
SELECT 
    'advertisements' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'advertisements'
        ) THEN 
            CASE 
                WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'advertisements' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
                THEN '✓ RLS有効'
                ELSE '✗ RLS無効'
            END
        ELSE '✗ テーブルが存在しません'
    END as rls_status;

-- ============================================
-- 5. インデックスの確認（パフォーマンス向上のため）
-- ============================================

-- monitor_profiles.user_id のインデックス確認
SELECT 
    'monitor_profiles.user_id' as index_check,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'monitor_profiles'
            AND indexdef LIKE '%user_id%'
        ) THEN '✓ インデックスが存在する'
        ELSE '✗ インデックスが存在しない（パフォーマンスに影響する可能性があります）'
    END as status;

-- survey_responses.user_id のインデックス確認
SELECT 
    'survey_responses.user_id' as index_check,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'survey_responses'
            AND indexdef LIKE '%user_id%'
        ) THEN '✓ インデックスが存在する'
        ELSE '✗ インデックスが存在しない（パフォーマンスに影響する可能性があります）'
    END as status;

-- survey_responses.survey_id のインデックス確認
SELECT 
    'survey_responses.survey_id' as index_check,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'survey_responses'
            AND indexdef LIKE '%survey_id%'
        ) THEN '✓ インデックスが存在する'
        ELSE '✗ インデックスが存在しない（パフォーマンスに影響する可能性があります）'
    END as status;

-- surveys.status のインデックス確認
SELECT 
    'surveys.status' as index_check,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'surveys'
            AND indexdef LIKE '%status%'
        ) THEN '✓ インデックスが存在する'
        ELSE '✗ インデックスが存在しない（パフォーマンスに影響する可能性があります）'
    END as status;

-- ============================================
-- 6. サマリー（すべてのチェック結果を一覧表示）
-- ============================================

SELECT 
    '=== ログイン処理テーブル存在確認サマリー ===' as summary;

-- テーブル存在確認サマリー
SELECT 
    table_name,
    CASE 
        WHEN table_schema = 'auth' THEN 'auth'
        ELSE 'public'
    END as schema_name,
    '✓ 存在する' as status
FROM information_schema.tables
WHERE (table_schema = 'auth' AND table_name = 'users')
OR (table_schema = 'public' AND table_name IN (
    'monitor_profiles',
    'surveys',
    'survey_responses',
    'advertisements'
))
ORDER BY 
    CASE table_schema
        WHEN 'auth' THEN 1
        ELSE 2
    END,
    table_name;

-- 不足しているテーブルのリスト
SELECT 
    '不足しているテーブル' as check_type,
    missing_table as table_name,
    '✗ テーブルが存在しません' as status
FROM (
    SELECT 'monitor_profiles' as missing_table
    UNION ALL SELECT 'surveys'
    UNION ALL SELECT 'survey_responses'
    UNION ALL SELECT 'advertisements'
) t
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.missing_table
);

-- ============================================
-- 7. 実際のデータ確認（オプション）
-- ============================================

-- 注意: このセクションは実際のデータを表示します
-- 本番環境では実行しないでください

-- auth.usersテーブルのユーザー数（存在確認のみ）
-- SELECT COUNT(*) as user_count FROM auth.users;

-- monitor_profilesテーブルのレコード数
-- SELECT COUNT(*) as profile_count FROM public.monitor_profiles;

-- surveysテーブルの公開中アンケート数
-- SELECT COUNT(*) as open_survey_count FROM public.surveys WHERE status = 'open';

-- ============================================
-- 実行結果の見方
-- ============================================
-- 
-- 1. すべてのチェックで「✓」が表示されていれば、正常です
-- 2. 「✗」が表示されている場合は、以下の対応が必要です：
--    - テーブルが存在しない: production_setup.sqlを実行
--    - カラムが存在しない: テーブル定義を確認
--    - 外部キー制約が存在しない: テーブル作成SQLを再実行
--    - RLSが無効: RLSポリシーを有効化
--    - インデックスが存在しない: 必要に応じてインデックスを作成
-- 
-- ============================================

