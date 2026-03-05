-- Migration: Add new fields to profiles table
-- Run this if you already have the database set up

-- Add phone column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text;

-- Add project_description column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS project_description text;

-- Add documents column (JSONB for storing file metadata)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Update RLS policies to allow users to update their own phone and description
-- (These are already covered by the existing "Users can update own profile" policy)

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';
