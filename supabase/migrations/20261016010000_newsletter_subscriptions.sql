create table if not exists public.newsletter_subscriptions (
  id bigint generated always as identity primary key,
  email text not null unique check (char_length(email) <= 254),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscriptions enable row level security;
revoke all on table public.newsletter_subscriptions from anon, authenticated;
grant select, insert, delete on table public.newsletter_subscriptions to service_role;
