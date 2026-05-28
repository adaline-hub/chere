-- Fix: service_role couldn't read/write recipe tables (42501)
grant all on public.recipes to service_role;
grant all on public.recipe_collaborators to service_role;

-- Recipe Book metadata: cover photo + intro paragraph per book.
alter table creations
  add column if not exists recipe_book_cover_path text,
  add column if not exists recipe_book_intro text;
