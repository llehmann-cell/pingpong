create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  rating integer not null default 1842,
  rating_deviation numeric not null default 350,
  volatility numeric not null default 0.06,
  created_at timestamptz not null default now()
);

alter table users add column if not exists rating_deviation numeric not null default 350;
alter table users add column if not exists volatility numeric not null default 0.06;

create table if not exists table_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  area text not null,
  address text,
  legend text,
  visits integer not null default 0,
  format text,
  crowd text,
  pin_x text,
  pin_y text,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  opponent_user_id uuid references users(id) on delete set null,
  opponent_name text not null,
  opponent_rating integer,
  result text not null check (result in ('win', 'loss', 'draw')),
  score_p1 numeric not null default 1,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'contested', 'rejected', 'logged')),
  winner_id uuid references users(id) on delete set null,
  rating_delta integer not null default 0,
  rating_update_status text not null default 'not_applicable',
  sets jsonb not null default '{}'::jsonb,
  score jsonb not null default '{}'::jsonb,
  feeling text,
  feedback text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  resolved_at timestamptz
);

alter table matches add column if not exists opponent_user_id uuid references users(id) on delete set null;
alter table matches add column if not exists opponent_rating integer;
alter table matches add column if not exists score_p1 numeric not null default 1;
alter table matches add column if not exists status text not null default 'logged';
alter table matches alter column status set default 'pending';
alter table matches add column if not exists winner_id uuid references users(id) on delete set null;
alter table matches add column if not exists rating_update_status text not null default 'not_applicable';
alter table matches add column if not exists accepted_at timestamptz;
alter table matches add column if not exists resolved_at timestamptz;

do $$
begin
  alter table matches drop constraint if exists matches_result_check;
  alter table matches add constraint matches_result_check check (result in ('win', 'loss', 'draw'));
  alter table matches drop constraint if exists matches_status_check;
  alter table matches add constraint matches_status_check check (status in ('pending', 'accepted', 'contested', 'rejected', 'logged'));
end $$;

create index if not exists matches_pending_opponent_idx on matches (opponent_user_id, status);
create index if not exists matches_pair_day_idx on matches (user_id, opponent_user_id, created_at);


create table if not exists opponent_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  opponent_name text not null,
  feeling text,
  feedback text,
  note text,
  updated_at timestamptz not null default now(),
  unique (user_id, opponent_name)
);

insert into table_spots (name, area, address, legend, visits, format, crowd, pin_x, pin_y)
values
  ('Table 04', 'Canal Saint-Martin', 'Quai de Valmy, Paris', 'Noah', 14, 'Outdoor concrete', 'Busy after 18:30', '34%', '38%'),
  ('Spin Lab', 'Belleville Club', 'Rue de Belleville, Paris', 'Maya', 11, 'Indoor club tables', 'Ranked ladder tonight', '66%', '28%'),
  ('Riverside Pair', 'Quai training zone', 'Bassin de la Villette, Paris', 'Ari', 8, 'Two public tables', 'Open challenge queue', '48%', '68%')
on conflict (name) do nothing;
