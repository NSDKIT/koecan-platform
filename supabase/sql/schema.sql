create extension if not exists "uuid-ossp";

create table if not exists monitor_profiles (
  user_id uuid primary key,
  name text not null,
  email text not null,
  university text,
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

create table if not exists surveys (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  reward_points int not null,
  questions int not null,
  status text not null,
  deadline timestamptz not null,
  delivery_channels text[] default '{web}',
  target_tags text[] default '{}',
  ai_matching_score numeric default 0
);

create table if not exists point_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references monitor_profiles(user_id) on delete cascade,
  happened_at timestamptz not null default now(),
  amount int not null,
  reason text not null,
  description text not null
);

create table if not exists reward_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  provider text not null,
  points_required int not null,
  delivery text not null
);

create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  category text not null,
  published_at timestamptz not null default now(),
  audience text[] not null default '{monitor}'
);

create table if not exists faq_items (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text not null,
  updated_at timestamptz not null default now()
);

create table if not exists referral_statuses (
  user_id uuid references monitor_profiles(user_id) on delete cascade,
  code text primary key,
  total_referrals int default 0,
  successful_referrals int default 0,
  pending_referrals int default 0,
  reward_points int default 0,
  last_updated timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  channel text not null,
  priority text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists career_slots (
  id uuid primary key default uuid_generate_v4(),
  mentor text not null,
  topic text not null,
  starts_at timestamptz not null,
  mode text not null,
  available_seats int not null
);

create table if not exists policy_documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  version text not null,
  updated_at date not null,
  url text not null
);

create table if not exists notification_templates (
  id uuid primary key default uuid_generate_v4(),
  channel text not null,
  title text not null,
  body text not null,
  cta text
);

create table if not exists data_import_jobs (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  entity text not null,
  status text not null,
  submitted_by text not null,
  submitted_at timestamptz not null default now()
);

create table if not exists exchange_requests (
  id uuid primary key default uuid_generate_v4(),
  user_name text not null,
  reward_name text not null,
  points_used int not null,
  provider text not null,
  status text not null,
  requested_at timestamptz not null default now()
);

-- アンケート質問テーブル
create table if not exists survey_questions (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid not null references surveys(id) on delete cascade,
  question_text text not null,
  question_type varchar(50) not null, -- 'single_choice', 'multiple_choice', 'text', 'number', 'rating'
  is_required boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- 質問選択肢テーブル
create table if not exists survey_question_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references survey_questions(id) on delete cascade,
  option_text text not null,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- アンケート回答テーブル
create table if not exists survey_responses (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid not null references surveys(id) on delete cascade,
  user_id uuid not null, -- references auth.users(id) on delete cascade (手動でリンク)
  submitted_at timestamptz default now(),
  unique(survey_id, user_id) -- 1ユーザー1回答
);

-- 個別回答テーブル
create table if not exists survey_answers (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid not null references survey_responses(id) on delete cascade,
  question_id uuid not null references survey_questions(id) on delete cascade,
  answer_text text,
  answer_number integer,
  created_at timestamptz default now()
);

-- インデックス作成
create index if not exists idx_survey_questions_survey_id on survey_questions(survey_id);
create index if not exists idx_survey_question_options_question_id on survey_question_options(question_id);
create index if not exists idx_survey_responses_survey_id on survey_responses(survey_id);
create index if not exists idx_survey_responses_user_id on survey_responses(user_id);
create index if not exists idx_survey_answers_response_id on survey_answers(response_id);
create index if not exists idx_survey_answers_question_id on survey_answers(question_id);
