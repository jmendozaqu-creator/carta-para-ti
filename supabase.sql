create table if not exists public.letter_state (
  id text primary key,
  started_at timestamptz null,
  progress integer not null default 0,
  status text not null default 'sealed',
  wants_second boolean not null default false,
  decision_at timestamptz null
);
insert into public.letter_state(id) values ('main') on conflict (id) do nothing;
alter table public.letter_state enable row level security;
