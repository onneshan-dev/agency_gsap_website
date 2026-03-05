-- Create Admin User SQL Script
-- Run this in your Supabase SQL Editor to create the admin account

-- Method 1: Using Supabase Auth API (Recommended)
-- This will create the user with proper password hashing

-- Note: You need to run this via the Supabase Dashboard
-- Go to: Authentication → Users → Add User
-- Or use the SQL function below after enabling the pg_crypto extension

-- First, make sure pg_crypto extension is enabled:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email text,
  admin_password text,
  admin_full_name text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_sent_at,
    confirmed_at,
    email_change,
    email_change_sent_at,
    banned_until,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', admin_full_name, 'role', 'admin'),
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    NULL,
    NOW(),
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    NULL
  )
  RETURNING id INTO new_user_id;

  -- The profile will be automatically created by the trigger
  -- If the trigger doesn't work, manually insert:
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new_user_id, admin_email, admin_full_name, 'admin')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
END;
$$;

-- Create the admin user
-- Change the email and password as needed
SELECT create_admin_user(
  'onneshan.dev@gmail.com',  -- Email
  'DIG@NT@02roy',           -- Password
  'Onneshan Admin'          -- Full Name
);

-- Drop the function after use (optional)
-- DROP FUNCTION IF EXISTS create_admin_user(text, text, text);

-- Alternative: Create user via Supabase Dashboard (Easier Method)
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication → Users
-- 3. Click "Add User" or "Invite"
-- 4. Enter: onneshan.dev@gmail.com
-- 5. Set password: DIG@NT@02roy
-- 6. Then run this SQL to set the role to admin:

-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'onneshan.dev@gmail.com';