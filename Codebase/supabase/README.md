# Supabase Setup Guide for Project Management System

This guide will help you set up Supabase for your admin and client portals with live progress updates.

## Prerequisites

- Supabase account (create one at https://supabase.com)
- Your project URL and anon key from the Supabase dashboard

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Give your project a name and set a secure database password
4. Choose a region closest to your users
5. Wait for the project to be created

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to Project Settings → API
2. Copy the following values:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon key**: `eyJ...` (the public anon key)

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Create a "New Query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL

This will create:
- `profiles` table (extends auth.users) with fields:
  - Basic info: id, email, full_name, avatar_url, role
  - **Contact: phone** (with country code)
  - **Project: project_description**
  - **Documents: documents** (JSON array of uploaded files)
- `projects` table
- `tasks` table
- `project_updates` table
- Row Level Security (RLS) policies
- Realtime subscriptions
- Automatic profile creation on signup

## Step 5: Create Admin User

**Important:** Registration is for clients only. Admin accounts must be created manually.

### Method 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter these credentials:
   - **Email:** `onneshan.dev@gmail.com`
   - **Password:** `DIG@NT@02roy`
4. Click "Create User"
5. Then run this SQL to set the role to admin:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin', full_name = 'Onneshan Admin'
   WHERE email = 'onneshan.dev@gmail.com';
   ```

### Method 2: Using SQL Script

1. Open the SQL Editor in Supabase
2. Run the script from `supabase/create-admin.sql`
3. This will create the admin user automatically

## Step 6: Enable Authentication

1. Go to Authentication → Providers in your Supabase dashboard
2. Enable "Email" provider
3. Configure settings:
   - Enable "Confirm email" (recommended for production)
   - Set custom email templates if needed

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. **Test Admin Login:**
   - Visit `http://localhost:5173/login`
   - Use admin credentials:
     - Email: `onneshan.dev@gmail.com`
     - Password: `DIG@NT@02roy`
   - Should redirect to `/admin` dashboard

3. **Test Client Registration:**
   - Visit `http://localhost:5173/register`
   - Fill in your details:
     - Full Name (required)
     - Email (required)
     - Phone Number with country code selector (optional)
     - Project Description (optional)
     - Upload Documents: PDF, Images, Word docs (optional, max 5 files)
     - Password & Confirm Password (required)
   - Submit to create client account
   - Login should redirect to `/client` dashboard
   - **Note:** Make sure Cloudflare R2 is configured for file uploads

4. Verify that:
   - Clients cannot see admin portal
   - Admins can see all projects
   - Clients can only see their own projects
   - Real-time updates work in both portals

## Features Implemented

### Authentication
- **Client-only registration** (admins pre-configured)
- Email/password signup and login
- Role-based access (admin/client)
- Protected routes
- Automatic profile creation

### Admin Portal
- View all projects
- View all tasks
- Real-time updates
- Project statistics dashboard

### Client Portal
- View own projects only
- View project updates
- Real-time progress tracking
- Update notifications
- **Profile with contact info and project details**

### Registration Features
- **Phone number with country code selector** (28+ countries)
- **Project description textarea** for requirements
- **File upload support**: PDF, Images (PNG/JPG/GIF/WebP), Word docs, Text files
- **Cloudflare R2 storage** for document management
- Max 5 files, 10MB each

### Real-time Features
- Live project updates
- Live task updates
- Toast notifications for changes
- Automatic data refresh

## Database Schema

### Profiles Table
- `id`: UUID (linked to auth.users)
- `email`: User email
- `full_name`: Display name
- `avatar_url`: Profile picture
- `role`: 'admin' or 'client'
- `phone`: Phone number with country code (e.g., +8801234567890)
- `project_description`: Client's project requirements/description
- `documents`: JSON array of uploaded file metadata (name, url, key)
- `created_at`, `updated_at`: Timestamps

### Projects Table
- `id`: UUID
- `name`: Project name
- `description`: Project details
- `client_id`: UUID (linked to profiles)
- `status`: planning, in_progress, review, completed, on_hold
- `progress`: 0-100 percentage
- `start_date`, `end_date`: Project timeline
- `budget`: Project budget

### Tasks Table
- `id`: UUID
- `project_id`: UUID (linked to projects)
- `title`: Task name
- `description`: Task details
- `status`: todo, in_progress, done
- `priority`: low, medium, high
- `assigned_to`: UUID (linked to profiles)
- `due_date`: Deadline

### Project Updates Table
- `id`: UUID
- `project_id`: UUID (linked to projects)
- `title`: Update title
- `content`: Update message
- `created_by`: UUID (linked to profiles)
- `created_at`: Timestamp

## Security

- Row Level Security (RLS) enabled on all tables
- Admins can access all data
- Clients can only access their own projects
- Realtime subscriptions respect RLS policies

## Next Steps

1. Add project creation forms in the admin portal
2. Add task management features
3. Implement file uploads for project documents
4. Add email notifications
5. Create more detailed reporting views

## Troubleshooting

### Connection Issues
- Verify your `.env` file has correct credentials
- Check that the Supabase project is active
- Ensure your IP is not blocked in Supabase settings

### Real-time Not Working
- Check that realtime is enabled in Supabase dashboard
- Verify RLS policies allow the user to access the data
- Check browser console for WebSocket errors

### Authentication Issues
- Ensure the email provider is enabled
- Check that the trigger function was created properly
- Verify profiles are being created on signup