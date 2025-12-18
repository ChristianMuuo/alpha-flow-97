
-- Create the books bucket (Check if exists first)
insert into storage.buckets (id, name, public)
values ('books', 'books', true)
on conflict (id) do nothing;

-- Create the books table
create table if not exists public.books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  category text not null,
  description text,
  file_url text not null,
  cover_url text,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  downloads integer default 0
);

-- RLS for Books
alter table public.books enable row level security;

-- Drop existing policies to allow re-running script
drop policy if exists "Books are viewable by everyone" on public.books;
create policy "Books are viewable by everyone"
  on public.books for select
  using (true);

drop policy if exists "Users can insert their own books" on public.books;
create policy "Users can insert their own books"
  on public.books for insert
  with check (auth.uid() = user_id);

-- Storage Policies
drop policy if exists "Books are publicly accessible" on storage.objects;
create policy "Books are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'books' );

drop policy if exists "Users can upload book files" on storage.objects;
create policy "Users can upload book files"
  on storage.objects for insert
  with check ( bucket_id = 'books' AND auth.role() = 'authenticated' );

-- ==========================================
-- USER MANAGEMENT (PROFILES)
-- ==========================================

-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- RLS for Profiles
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
