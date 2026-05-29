create table recipe_comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade not null,
  creation_id uuid references creations(id) on delete cascade not null,
  author_profile_id uuid references profiles(id) on delete set null,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz default now()
);

create index idx_recipe_comments_recipe on recipe_comments(recipe_id, created_at);
create index idx_recipe_comments_creation on recipe_comments(creation_id);

alter table recipe_comments enable row level security;

-- Same access model as recipes: book owner + claimed co-authors.
create policy "Comments access for creator" on recipe_comments
  for all using (creation_id in (select id from creations where creator_id = auth.uid()));
create policy "Comments access for co-authors" on recipe_comments
  for all using (creation_id in (select creation_id from recipe_collaborators where profile_id = auth.uid()));

-- Don't repeat the 42501 mistake — grant service_role explicitly.
grant all on public.recipe_comments to service_role;
