-- Fix RLS for creations inserts/updates from authenticated browser clients.
-- Previous policy used FOR ALL ... USING only, which does not authorize INSERT.

grant select, insert, update, delete on public.creations to authenticated;

drop policy if exists "Creators see own creations" on creations;

create policy "Creators can select own creations"
  on creations
  for select
  using (creator_id = auth.uid());

create policy "Creators can insert own creations"
  on creations
  for insert
  with check (creator_id = auth.uid());

create policy "Creators can update own creations"
  on creations
  for update
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

create policy "Creators can delete own creations"
  on creations
  for delete
  using (creator_id = auth.uid());
