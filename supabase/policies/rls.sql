alter table monitor_profiles enable row level security;
alter table point_transactions enable row level security;
alter table referral_statuses enable row level security;
alter table announcements enable row level security;
alter table faq_items enable row level security;

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

create policy "service role full access" on monitor_profiles
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
