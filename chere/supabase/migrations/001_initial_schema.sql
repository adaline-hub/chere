-- Chère Database Schema
-- Migration: 001_initial_schema

-- ─── Profiles ────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (id = auth.uid());
create policy "Users can update own profile" on profiles for update using (id = auth.uid());

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Prompt Questions ────────────────────────────────────
create table prompt_questions (
  id text primary key,
  relationship_type text not null,
  question_text text not null,
  placeholder_example text,
  sort_order integer not null,
  is_active boolean default true,
  skip_rate float default 0,
  avg_answer_length integer default 0,
  emotional_impact_score float default 0
);

-- ─── Music Library ───────────────────────────────────────
create table music_tracks (
  id text primary key,
  name text not null,
  mood text not null,
  category text not null,
  file_url text not null,
  duration_seconds integer not null,
  attribution text
);

-- ─── Creations ───────────────────────────────────────────
create table creations (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id) not null,
  type text not null check (type in ('tribute', 'gift_reveal', 'combined')),
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'sent', 'opened', 'expired')),
  recipient_name text not null default '',
  recipient_email text,
  recipient_phone text,
  relationship_type text not null default 'custom',
  interview_answers jsonb default '{}',
  generated_text text,
  generated_text_edited text,
  dedication_message text,
  output_format text not null default 'scrollytelling',
  template_id text not null default 'warm-linen',
  music_track_id text references music_tracks(id),
  share_token text unique not null,
  delivery_method text,
  scheduled_reveal_at timestamptz,
  delivered_at timestamptz,
  first_opened_at timestamptz,
  tier text not null default 'free' check (tier in ('free', 'standard', 'premium', 'deluxe')),
  stripe_payment_id text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table creations enable row level security;
create policy "Creators see own creations" on creations for all using (creator_id = auth.uid());

create index idx_creations_share_token on creations(share_token);
create index idx_creations_creator on creations(creator_id, created_at desc);
create index idx_creations_expires on creations(expires_at) where expires_at is not null and status != 'expired';

-- ─── Photos ──────────────────────────────────────────────
create table photos (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  storage_path text not null,
  thumbnail_path text,
  original_filename text,
  caption text,
  sort_order integer not null default 0,
  exif_date timestamptz,
  watercolor_path text,
  illustration_path text,
  ai_description text,
  created_at timestamptz default now()
);

alter table photos enable row level security;
create policy "Photos follow creation access" on photos
  for all using (creation_id in (select id from creations where creator_id = auth.uid()));

-- ─── Gift Moments ────────────────────────────────────────
create table gift_moments (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  gift_type text not null,
  description text not null,
  details jsonb default '{}',
  message text,
  illustration_url text,
  reveal_style text default 'card',
  sort_order integer not null default 0,
  position text default 'end',
  created_at timestamptz default now()
);

alter table gift_moments enable row level security;
create policy "Gift moments follow creation access" on gift_moments
  for all using (creation_id in (select id from creations where creator_id = auth.uid()));

-- ─── Drip Clues ──────────────────────────────────────────
create table drip_clues (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  clue_number integer not null,
  clue_type text not null,
  content text not null,
  scheduled_at timestamptz not null,
  delivered_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz default now()
);

alter table drip_clues enable row level security;
create policy "Clues follow creation access" on drip_clues
  for all using (creation_id in (select id from creations where creator_id = auth.uid()));

create index idx_drip_clues_scheduled on drip_clues(scheduled_at) where delivered_at is null;

-- ─── Collaborators ───────────────────────────────────────
create table collaborators (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  invite_token text unique not null,
  name text,
  email text,
  profile_id uuid references profiles(id),
  interview_answers jsonb default '{}',
  status text default 'invited' check (status in ('invited', 'contributing', 'submitted')),
  created_at timestamptz default now()
);

alter table collaborators enable row level security;
create policy "Collaborators follow creation access" on collaborators
  for all using (creation_id in (select id from creations where creator_id = auth.uid()));

create index idx_collaborators_token on collaborators(invite_token);

-- ─── Recipient Interactions ──────────────────────────────
create table recipient_interactions (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  interaction_type text not null,
  content text,
  recipient_profile_id uuid references profiles(id),
  created_at timestamptz default now()
);

alter table recipient_interactions enable row level security;
create policy "Interactions visible to creator" on recipient_interactions
  for select using (creation_id in (select id from creations where creator_id = auth.uid()));
create policy "Anyone can insert interactions" on recipient_interactions
  for insert with check (true);

-- ─── Occasion Reminders ──────────────────────────────────
create table occasion_reminders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  recipient_name text not null,
  occasion_type text not null,
  occasion_date date not null,
  remind_days_before integer default 7,
  last_reminded_at timestamptz,
  created_at timestamptz default now()
);

alter table occasion_reminders enable row level security;
create policy "Users see own reminders" on occasion_reminders
  for all using (profile_id = auth.uid());

-- ─── Updated At Trigger ─────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles
  for each row execute procedure update_updated_at();
create trigger set_updated_at before update on creations
  for each row execute procedure update_updated_at();
