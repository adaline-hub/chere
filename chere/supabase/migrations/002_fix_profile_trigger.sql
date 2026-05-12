-- Recreate handle_new_user with explicit security definer
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

-- Recreate trigger cleanly
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Safety net: allow service role to insert profiles (trigger already bypasses RLS
-- via security definer, but this guards against future policy changes)
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'Service role can insert profiles'
  ) then
    create policy "Service role can insert profiles" on profiles
      for insert with check (true);
  end if;
end
$$;
