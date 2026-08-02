-- Fix: Add INSERT policy for users table
-- This allows new users to create their profile during signup

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create INSERT policy for new signups
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
