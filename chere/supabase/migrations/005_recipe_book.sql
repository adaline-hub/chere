-- Chère: Interactive Recipe Book
-- Migration: 005_recipe_book

create table recipe_collaborators (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'co_author' check (role in ('co_author')),
  claimed_at timestamptz default now(),
  unique (creation_id, profile_id)
);

alter table recipe_collaborators enable row level security;

create policy "Collaborators viewable by creation owner" on recipe_collaborators
  for select using (creation_id in (select id from creations where creator_id = auth.uid()));
create policy "Self-view collaborator row" on recipe_collaborators
  for select using (profile_id = auth.uid());
create policy "Self-insert when claiming" on recipe_collaborators
  for insert with check (profile_id = auth.uid());

create index idx_recipe_collaborators_creation on recipe_collaborators(creation_id);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  author_profile_id uuid references profiles(id),
  title text not null,
  ingredients jsonb not null default '[]'::jsonb,
  instructions text not null default '',
  notes text,
  photo_path text,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table recipes enable row level security;

-- Owner (creator) always has full access.
create policy "Recipe access for creator" on recipes
  for all using (creation_id in (select id from creations where creator_id = auth.uid()));

-- Co-authors (claimed recipients) also have full access.
create policy "Recipe access for co-authors" on recipes
  for all using (creation_id in (select creation_id from recipe_collaborators where profile_id = auth.uid()));

create index idx_recipes_creation on recipes(creation_id, sort_order);

create trigger set_updated_at before update on recipes
  for each row execute procedure update_updated_at();
