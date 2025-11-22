alter table monitor_profiles enable row level security;
alter table point_transactions enable row level security;
alter table referral_statuses enable row level security;
alter table announcements enable row level security;
alter table faq_items enable row level security;
alter table surveys enable row level security;
alter table survey_questions enable row level security;
alter table survey_question_options enable row level security;
alter table survey_responses enable row level security;
alter table survey_answers enable row level security;

create policy "users can view own profile" on monitor_profiles
  for select using (auth.uid() = user_id);

create policy "users can update own preferences" on monitor_profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can view own transactions" on point_transactions
  for select using (auth.uid() = user_id);

create policy "public announcements" on announcements
  for select using (true);

create policy "public faq" on faq_items
  for select using (true);

-- アンケート関連のRLSポリシー
-- 全ユーザーは公開済みアンケートを参照可能
create policy "anyone can view published surveys" on surveys
  for select using (status = 'open' and deadline > now());

-- 質問と選択肢は公開済みアンケートに関連するものは全ユーザーが参照可能
create policy "anyone can view questions for published surveys" on survey_questions
  for select using (
    survey_id in (
      select id from surveys where status = 'open' and deadline > now()
    )
  );

create policy "anyone can view options for published surveys" on survey_question_options
  for select using (
    question_id in (
      select id from survey_questions
      where survey_id in (
        select id from surveys where status = 'open' and deadline > now()
      )
    )
  );

-- ユーザーは自分の回答のみ挿入可能
create policy "users can insert own responses" on survey_responses
  for insert with check (auth.uid() = user_id);

-- ユーザーは自分の回答のみ参照可能
create policy "users can view own responses" on survey_responses
  for select using (auth.uid() = user_id);

-- ユーザーは自分の回答に関連する個別回答を参照可能
create policy "users can view own answers" on survey_answers
  for select using (
    response_id in (
      select id from survey_responses where user_id = auth.uid()
    )
  );

-- ユーザーは自分の回答に関連する個別回答を挿入可能
create policy "users can insert own answers" on survey_answers
  for insert with check (
    response_id in (
      select id from survey_responses where user_id = auth.uid()
    )
  );

-- サービスロールは全テーブルにフルアクセス可能
create policy "service role full access" on monitor_profiles
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access surveys" on surveys
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access survey_questions" on survey_questions
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access survey_question_options" on survey_question_options
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access survey_responses" on survey_responses
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access survey_answers" on survey_answers
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
