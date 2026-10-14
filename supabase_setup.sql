
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

-- ==========================================
-- PROFILES EXTENSIONS
-- ==========================================
alter table public.profiles
  add column if not exists user_id uuid references auth.users,
  add column if not exists email text,
  add column if not exists country text,
  add column if not exists trading_style text,
  add column if not exists tier text default 'free',
  add column if not exists referral_code text unique,
  add column if not exists referred_by text,
  add column if not exists xp integer default 0,
  add column if not exists level integer default 1,
  add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- ==========================================
-- TRADE JOURNAL
-- ==========================================
create table if not exists public.trade_journal (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pair text not null,
  direction text not null check (direction in ('buy', 'sell')),
  entry_price numeric,
  exit_price numeric,
  sl numeric,
  tp numeric,
  pips numeric,
  result numeric,
  notes text,
  mood text,
  screenshot_url text,
  trade_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.trade_journal enable row level security;
drop policy if exists "Users can view own trades" on public.trade_journal;
create policy "Users can view own trades" on public.trade_journal for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own trades" on public.trade_journal;
create policy "Users can insert own trades" on public.trade_journal for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own trades" on public.trade_journal;
create policy "Users can update own trades" on public.trade_journal for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own trades" on public.trade_journal;
create policy "Users can delete own trades" on public.trade_journal for delete using (auth.uid() = user_id);

-- ==========================================
-- EA / SIGNAL REVIEWS
-- ==========================================
create table if not exists public.ea_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  ea_id text not null,
  ea_type text not null default 'ea',
  rating integer not null check (rating between 1 and 5),
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, ea_id)
);
alter table public.ea_reviews enable row level security;
drop policy if exists "Reviews are viewable by everyone" on public.ea_reviews;
create policy "Reviews are viewable by everyone" on public.ea_reviews for select using (true);
drop policy if exists "Users can insert own reviews" on public.ea_reviews;
create policy "Users can insert own reviews" on public.ea_reviews for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own reviews" on public.ea_reviews;
create policy "Users can update own reviews" on public.ea_reviews for update using (auth.uid() = user_id);

-- ==========================================
-- WATCHLIST
-- ==========================================
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_id text not null,
  item_type text not null,
  item_name text,
  item_meta jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_id, item_type)
);
alter table public.watchlist enable row level security;
drop policy if exists "Users can view own watchlist" on public.watchlist;
create policy "Users can view own watchlist" on public.watchlist for select using (auth.uid() = user_id);
drop policy if exists "Users can manage own watchlist" on public.watchlist;
create policy "Users can manage own watchlist" on public.watchlist for all using (auth.uid() = user_id);

-- ==========================================
-- READING PROGRESS
-- ==========================================
create table if not exists public.reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  book_id text not null,
  book_title text,
  scroll_percent numeric default 0,
  last_page integer default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, book_id)
);
alter table public.reading_progress enable row level security;
drop policy if exists "Users can view own reading progress" on public.reading_progress;
create policy "Users can view own reading progress" on public.reading_progress for select using (auth.uid() = user_id);
drop policy if exists "Users can manage own reading progress" on public.reading_progress;
create policy "Users can manage own reading progress" on public.reading_progress for all using (auth.uid() = user_id);

-- ==========================================
-- BOOK NOTES / HIGHLIGHTS
-- ==========================================
create table if not exists public.book_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  book_id text not null,
  note_text text not null,
  page_number integer,
  highlight_color text default 'yellow',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.book_notes enable row level security;
drop policy if exists "Users can manage own book notes" on public.book_notes;
create policy "Users can manage own book notes" on public.book_notes for all using (auth.uid() = user_id);

-- ==========================================
-- USER STREAKS / GAMIFICATION
-- ==========================================
create table if not exists public.user_streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  reading_streak integer default 0,
  last_read_at date,
  total_xp integer default 0,
  level integer default 1,
  badges jsonb default '[]',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.user_streaks enable row level security;
drop policy if exists "Users can view own streaks" on public.user_streaks;
create policy "Users can view own streaks" on public.user_streaks for select using (auth.uid() = user_id);
drop policy if exists "Users can manage own streaks" on public.user_streaks;
create policy "Users can manage own streaks" on public.user_streaks for all using (auth.uid() = user_id);

