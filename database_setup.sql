-- UangSakti Application Database Setup Script
-- Version 3.0
-- This script is idempotent and can be run safely.

-- SECTION 1: TYPES and TABLES
-------------------------------------------------

-- Create ENUM for transaction types if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense');
  END IF;
END$$;

-- Table for public user profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for user-defined categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Core table for all transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  type transaction_type NOT NULL,
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for monthly budgets per category
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, month, year)
);

-- Table for financial goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- SECTION 2: AUTOMATION with TRIGGERS
-------------------------------------------------

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- SECTION 3: ROW LEVEL SECURITY (RLS)
-------------------------------------------------

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent errors on re-run
DROP POLICY IF EXISTS "User can manage their own profile." ON public.profiles;
DROP POLICY IF EXISTS "User can manage their own categories." ON public.categories;
DROP POLICY IF EXISTS "User can manage their own transactions." ON public.transactions;
DROP POLICY IF EXISTS "User can manage their own budgets." ON public.budgets;
DROP POLICY IF EXISTS "User can manage their own goals." ON public.goals;

-- Create RLS policies
CREATE POLICY "User can manage their own profile." ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "User can manage their own categories." ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User can manage their own transactions." ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User can manage their own budgets." ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User can manage their own goals." ON public.goals FOR ALL USING (auth.uid() = user_id);


-- SECTION 4: DATABASE FUNCTIONS (RPC)
-------------------------------------------------

-- Function to get a monthly financial summary
CREATE OR REPLACE FUNCTION get_monthly_summary(month_num int, year_num int)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  summary json;
BEGIN
  SELECT json_build_object(
    'total_income', COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    'total_expense', COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  )
  INTO summary
  FROM public.transactions
  WHERE
    user_id = auth.uid() AND
    EXTRACT(MONTH FROM transaction_date) = month_num AND
    EXTRACT(YEAR FROM transaction_date) = year_num;
  RETURN summary;
END;
$$;