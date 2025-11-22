-- ============================================
-- 声キャン！プラットフォーム - 本番環境セットアップSQL
-- ============================================
-- 
-- このファイルは本番環境のSupabaseデータベースをセットアップします。
-- Supabase DashboardのSQL Editorで実行してください。
--
-- 実行順序:
-- 1. このファイル全体を実行（テーブル作成 + RLSポリシー）
-- 2. 実行後にエラーがないことを確認
--
-- ============================================

-- ============================================
-- 1. 拡張機能の有効化
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. テーブル作成（依存関係を考慮した順序）
-- ============================================

-- 2.1 モニタープロフィール
CREATE TABLE IF NOT EXISTS monitor_profiles (
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

-- 2.2 クライアントプロフィール
CREATE TABLE IF NOT EXISTS client_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 アンケート
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  reward_points INTEGER NOT NULL,
  questions INTEGER NOT NULL,
  status TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  delivery_channels TEXT[] DEFAULT '{web}',
  target_tags TEXT[] DEFAULT '{}',
  ai_matching_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 ポイント履歴（point_transactionsとpoint_historyの両方に対応）
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES monitor_profiles(user_id) ON DELETE CASCADE,
  happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 別名としてpoint_historyビューを作成（互換性のため）
CREATE OR REPLACE VIEW point_history AS SELECT * FROM point_transactions;

-- 2.5 報酬アイテム
CREATE TABLE IF NOT EXISTS reward_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  delivery TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 お知らせ
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audience TEXT[] NOT NULL DEFAULT '{monitor}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 FAQ
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 別名としてfaqsビューを作成（互換性のため）
CREATE OR REPLACE VIEW faqs AS SELECT * FROM faq_items;

-- 2.8 紹介ステータス
CREATE TABLE IF NOT EXISTS referral_statuses (
  user_id UUID REFERENCES monitor_profiles(user_id) ON DELETE CASCADE,
  code TEXT PRIMARY KEY,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 別名としてreferral_codesビューを作成（互換性のため）
CREATE OR REPLACE VIEW referral_codes AS 
SELECT 
  user_id,
  code,
  total_referrals,
  successful_referrals,
  pending_referrals,
  reward_points,
  last_updated
FROM referral_statuses;

-- 2.9 サポートチケット
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  channel TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 キャリア相談スロット
CREATE TABLE IF NOT EXISTS career_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor TEXT NOT NULL,
  topic TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  mode TEXT NOT NULL,
  available_seats INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 規約・プライバシーポリシー
CREATE TABLE IF NOT EXISTS policy_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  updated_at DATE NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 通知テンプレート
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 データインポートジョブ
CREATE TABLE IF NOT EXISTS data_import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  entity TEXT NOT NULL,
  status TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- 2.14 交換リクエスト
CREATE TABLE IF NOT EXISTS exchange_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES monitor_profiles(user_id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  reward_id UUID REFERENCES reward_items(id) ON DELETE SET NULL,
  reward_name TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 2.15 アンケート質問
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.16 質問選択肢
CREATE TABLE IF NOT EXISTS survey_question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.17 アンケート回答
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, user_id)
);

-- 2.18 個別回答
CREATE TABLE IF NOT EXISTS survey_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[],
  answer_text TEXT,
  answer_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.19 LINE連携
CREATE TABLE IF NOT EXISTS line_connections (
  user_id UUID PRIMARY KEY REFERENCES monitor_profiles(user_id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.20 プッシュ通知登録
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES monitor_profiles(user_id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.21 チャットメッセージ
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  support_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. インデックス作成
-- ============================================

-- モニタープロフィール
CREATE INDEX IF NOT EXISTS idx_monitor_profiles_referral_code ON monitor_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_monitor_profiles_email ON monitor_profiles(email);

-- アンケート
CREATE INDEX IF NOT EXISTS idx_surveys_client_id ON surveys(client_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_deadline ON surveys(deadline);
CREATE INDEX IF NOT EXISTS idx_surveys_ai_matching_score ON surveys(ai_matching_score DESC);

-- ポイント履歴
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_happened_at ON point_transactions(happened_at DESC);

-- アンケート関連
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_question_options_question_id ON survey_question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response_id ON survey_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_question_id ON survey_answers(question_id);

-- LINE連携
CREATE INDEX IF NOT EXISTS idx_line_connections_line_user_id ON line_connections(line_user_id);

-- プッシュ通知
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- チャットメッセージ
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- 4. 更新時刻の自動更新トリガー
-- ============================================

-- updated_atカラムを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_monitor_profiles_updated_at BEFORE UPDATE ON monitor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Row Level Security (RLS) の有効化
-- ============================================

ALTER TABLE monitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLSポリシーの作成
-- ============================================

-- 6.1 モニタープロフィール
CREATE POLICY "users can view own profile" ON monitor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can update own profile" ON monitor_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can insert own profile" ON monitor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6.2 クライアントプロフィール
CREATE POLICY "users can view own client profile" ON client_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can update own client profile" ON client_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can insert own client profile" ON client_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6.3 ポイント履歴
CREATE POLICY "users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 6.4 お知らせ（公開）
CREATE POLICY "public announcements" ON announcements
  FOR SELECT USING (true);

-- 6.5 FAQ（公開）
CREATE POLICY "public faq" ON faq_items
  FOR SELECT USING (true);

-- 6.6 アンケート
-- 公開済みアンケートは全ユーザーが参照可能
CREATE POLICY "anyone can view published surveys" ON surveys
  FOR SELECT USING (status = 'open' AND deadline > NOW());

-- クライアントは自分のアンケートを管理可能
CREATE POLICY "clients can manage own surveys" ON surveys
  FOR ALL USING (
    client_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    client_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid())
  );

-- 6.7 アンケート質問
CREATE POLICY "anyone can view questions for published surveys" ON survey_questions
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM surveys WHERE status = 'open' AND deadline > NOW()
    )
  );

-- 6.8 アンケート選択肢
CREATE POLICY "anyone can view options for published surveys" ON survey_question_options
  FOR SELECT USING (
    question_id IN (
      SELECT id FROM survey_questions
      WHERE survey_id IN (
        SELECT id FROM surveys WHERE status = 'open' AND deadline > NOW()
      )
    )
  );

-- 6.9 アンケート回答
CREATE POLICY "users can insert own responses" ON survey_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can view own responses" ON survey_responses
  FOR SELECT USING (auth.uid() = user_id);

-- クライアントは自分のアンケートの回答を参照可能
CREATE POLICY "clients can view responses for own surveys" ON survey_responses
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM surveys 
      WHERE client_id = auth.uid() 
      AND EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid())
    )
  );

-- 6.10 個別回答
CREATE POLICY "users can view own answers" ON survey_answers
  FOR SELECT USING (
    response_id IN (
      SELECT id FROM survey_responses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users can insert own answers" ON survey_answers
  FOR INSERT WITH CHECK (
    response_id IN (
      SELECT id FROM survey_responses WHERE user_id = auth.uid()
    )
  );

-- クライアントは自分のアンケートの回答詳細を参照可能
CREATE POLICY "clients can view answers for own surveys" ON survey_answers
  FOR SELECT USING (
    response_id IN (
      SELECT id FROM survey_responses
      WHERE survey_id IN (
        SELECT id FROM surveys 
        WHERE client_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid())
      )
    )
  );

-- 6.11 紹介ステータス
CREATE POLICY "users can view own referral status" ON referral_statuses
  FOR SELECT USING (auth.uid() = user_id);

-- 6.12 サポートチケット
CREATE POLICY "users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can create own tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- サポートユーザーは全てのチケットを参照可能
CREATE POLICY "support can view all tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'support'
    )
  );

-- 6.13 チャットメッセージ
CREATE POLICY "users can view own messages" ON chat_messages
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = support_user_id
  );

CREATE POLICY "users can create own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- サポートユーザーは全てのメッセージを参照可能
CREATE POLICY "support can view all messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'support'
    )
  );

-- 6.14 LINE連携
CREATE POLICY "users can manage own line connection" ON line_connections
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6.15 プッシュ通知登録
CREATE POLICY "users can manage own push subscription" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. Service Role ポリシー（サーバーサイド処理用）
-- ============================================

-- Service Roleは全テーブルにフルアクセス可能
CREATE POLICY "service role full access monitor_profiles" ON monitor_profiles
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access client_profiles" ON client_profiles
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access surveys" ON surveys
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access survey_questions" ON survey_questions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access survey_question_options" ON survey_question_options
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access survey_responses" ON survey_responses
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access survey_answers" ON survey_answers
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access point_transactions" ON point_transactions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access reward_items" ON reward_items
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access announcements" ON announcements
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access faq_items" ON faq_items
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access referral_statuses" ON referral_statuses
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access support_tickets" ON support_tickets
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access chat_messages" ON chat_messages
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access line_connections" ON line_connections
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service role full access push_subscriptions" ON push_subscriptions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 8. 完了メッセージ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '本番環境セットアップが完了しました！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '作成されたテーブル:';
  RAISE NOTICE '- monitor_profiles';
  RAISE NOTICE '- client_profiles';
  RAISE NOTICE '- surveys, survey_questions, survey_question_options';
  RAISE NOTICE '- survey_responses, survey_answers';
  RAISE NOTICE '- point_transactions';
  RAISE NOTICE '- reward_items, announcements, faq_items';
  RAISE NOTICE '- referral_statuses, support_tickets';
  RAISE NOTICE '- line_connections, push_subscriptions';
  RAISE NOTICE '- chat_messages';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLSポリシーが全てのテーブルに適用されました。';
  RAISE NOTICE '========================================';
END $$;

