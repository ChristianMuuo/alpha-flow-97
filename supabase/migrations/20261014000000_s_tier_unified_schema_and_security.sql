-- ==============================================================================
-- AlphaFlow 97 - S-Tier Unified Schema, Security & Observability Migration
-- Version: 2.0.0
-- Security: Strict RLS enforcement, Orders exploit mitigation, pgvector memory
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. PROFILES TABLE & RECONCILIATION
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  website TEXT,
  country TEXT,
  trading_style TEXT DEFAULT 'SMC / Orderflow',
  tier TEXT DEFAULT 'free',
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist if table was partially created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trading_style TEXT DEFAULT 'SMC / Orderflow';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
      AND p.tier = 'admin'
  )
);

-- Profile trigger on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. ORDERS TABLE & FINANCIAL SECURITY FIX
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  paystack_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- CRITICAL SECURITY FIX:
-- Drop any existing client INSERT policies. Normal authenticated clients must NOT insert completed orders directly.
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Users can only view their own verified orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Admins can view and update all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE (public.profiles.id = auth.uid() OR public.profiles.user_id = auth.uid())
      AND public.profiles.tier = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE (public.profiles.id = auth.uid() OR public.profiles.user_id = auth.uid())
      AND public.profiles.tier = 'admin'
  )
);

-- 4. TRADE JOURNAL TABLE
CREATE TABLE IF NOT EXISTS public.trade_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
  entry_price NUMERIC,
  exit_price NUMERIC,
  sl NUMERIC,
  tp NUMERIC,
  pips NUMERIC,
  result NUMERIC,
  notes TEXT,
  mood TEXT,
  screenshot_url TEXT,
  trade_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.trade_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trades" ON public.trade_journal;
CREATE POLICY "Users can view own trades" ON public.trade_journal FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trades" ON public.trade_journal;
CREATE POLICY "Users can insert own trades" ON public.trade_journal FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trades" ON public.trade_journal;
CREATE POLICY "Users can update own trades" ON public.trade_journal FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trades" ON public.trade_journal;
CREATE POLICY "Users can delete own trades" ON public.trade_journal FOR DELETE USING (auth.uid() = user_id);

-- 5. BOOKS & LIBRARY
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own books" ON public.books;
CREATE POLICY "Users can insert their own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. READING PROGRESS & NOTES
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  book_title TEXT,
  scroll_percent NUMERIC DEFAULT 0,
  last_page INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own reading progress" ON public.reading_progress;
CREATE POLICY "Users can manage own reading progress" ON public.reading_progress FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.book_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  note_text TEXT NOT NULL,
  page_number INTEGER,
  highlight_color TEXT DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own book notes" ON public.book_notes;
CREATE POLICY "Users can manage own book notes" ON public.book_notes FOR ALL USING (auth.uid() = user_id);

-- 7. WATCHLIST & REVIEWS
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_name TEXT,
  item_meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, item_id, item_type)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
CREATE POLICY "Users can manage own watchlist" ON public.watchlist FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ea_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ea_id TEXT NOT NULL,
  ea_type TEXT NOT NULL DEFAULT 'ea',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, ea_id)
);

ALTER TABLE public.ea_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.ea_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.ea_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.ea_reviews;
CREATE POLICY "Users can insert own reviews" ON public.ea_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. USER STREAKS / GAMIFICATION
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  reading_streak INTEGER DEFAULT 0,
  last_read_at DATE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own streaks" ON public.user_streaks;
CREATE POLICY "Users can manage own streaks" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);

-- 9. AGENT OBSERVABILITY & AUDIT TRACE LAYER (PHASE 1 FOUNDATION)
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_preview TEXT,
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'blocked_by_guardrail')),
  latency_ms INTEGER,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_estimate NUMERIC(8,6) DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own agent runs" ON public.agent_runs;
CREATE POLICY "Users can view their own agent runs" ON public.agent_runs FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.agent_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_input JSONB NOT NULL DEFAULT '{}'::jsonb,
  tool_output JSONB,
  duration_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_traces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view traces for their own runs" ON public.agent_traces;
CREATE POLICY "Users can view traces for their own runs" ON public.agent_traces FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.agent_runs
    WHERE public.agent_runs.id = public.agent_traces.run_id
      AND public.agent_runs.user_id = auth.uid()
  )
);

-- 10. AGENT MEMORY ENGINE (PGVECTOR)
CREATE TABLE IF NOT EXISTS public.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'trade_pattern', 'coaching_insight', 'risk_rule', 'knowledge_chunk')),
  content TEXT NOT NULL,
  embedding vector(768), -- Dimensions for Gemini text-embedding-004
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own memories" ON public.agent_memories;
CREATE POLICY "Users can manage their own memories" ON public.agent_memories FOR ALL USING (auth.uid() = user_id);

-- 11. AGENT USER FEEDBACK
CREATE TABLE IF NOT EXISTS public.agent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'wrong', 'unclear', 'hallucination')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own agent feedback" ON public.agent_feedback;
CREATE POLICY "Users can manage their own agent feedback" ON public.agent_feedback FOR ALL USING (auth.uid() = user_id);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_journal_user_id ON public.trade_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON public.agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON public.agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_traces_run_id ON public.agent_traces(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_user_id ON public.agent_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_type ON public.agent_memories(memory_type);
