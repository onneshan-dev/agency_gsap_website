-- Migration: Full Proposal-to-Delivery Lifecycle
-- Run this in Supabase SQL Editor after the initial schema (schema.sql)
--
-- This migration adds 10 new tables and extends 2 existing tables to support:
--   proposals, chat, quotes, agreements, milestones, deliverables,
--   revisions, team members, invoices, and notifications.

-- ============================================================
-- 1. Extend profiles table
-- ============================================================

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'client', 'team_member'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. Create proposals table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text CHECK (category IN ('web_app', 'mobile_app', 'ecommerce', 'saas', 'other')),
  budget_range text CHECK (budget_range IN ('under_5k', '5k_15k', '15k_50k', '50k_plus', 'not_sure')),
  timeline_preference text CHECK (timeline_preference IN ('1_month', '1_3_months', '3_6_months', '6_plus', 'flexible')),
  documents jsonb DEFAULT '[]'::jsonb,
  status text CHECK (status IN (
    'draft', 'submitted', 'under_review', 'in_discussion',
    'quoted', 'accepted', 'rejected', 'converted'
  )) DEFAULT 'submitted',
  admin_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all proposals" ON public.proposals
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view own proposals" ON public.proposals
  FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can insert own proposals" ON public.proposals
  FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update own draft proposals" ON public.proposals
  FOR UPDATE USING (client_id = auth.uid() AND status = 'draft');
CREATE POLICY "Admins can update any proposal" ON public.proposals
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can delete own draft proposals" ON public.proposals
  FOR DELETE USING (client_id = auth.uid() AND status = 'draft');

CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);

-- ============================================================
-- 3. Create quotes table (before agreements, since agreements references quotes)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  scope_summary text NOT NULL,
  line_items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  currency text DEFAULT 'BDT',
  timeline_start date,
  timeline_end date,
  payment_schedule jsonb,
  valid_until date,
  status text CHECK (status IN (
    'draft', 'sent', 'accepted', 'negotiating', 'rejected', 'expired'
  )) DEFAULT 'draft',
  client_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage quotes" ON public.quotes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view their quotes" ON public.quotes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = quotes.proposal_id AND client_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_quotes_proposal ON public.quotes(proposal_id);

-- ============================================================
-- 4. Create agreements table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agreements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.profiles(id) NOT NULL,
  checklist_items jsonb NOT NULL,
  status text CHECK (status IN ('pending', 'confirmed', 'voided')) DEFAULT 'pending',
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage agreements" ON public.agreements
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view own agreements" ON public.agreements
  FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can update own pending agreements" ON public.agreements
  FOR UPDATE USING (client_id = auth.uid() AND status = 'pending');

-- ============================================================
-- 5. Extend projects table
-- ============================================================

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES public.quotes(id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS agreement_id uuid REFERENCES public.agreements(id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS current_phase text DEFAULT 'requirements';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS revision_policy jsonb;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('planning', 'in_progress', 'review', 'revision', 'on_hold', 'completed', 'cancelled'));

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_phase_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_phase_check
  CHECK (current_phase IN ('requirements', 'design', 'development', 'testing', 'review', 'revision', 'delivery', 'completed'));

-- ============================================================
-- 6. Create project_team_members table (BEFORE policies that reference it)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.project_team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_in_project text DEFAULT 'developer',
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage team members" ON public.project_team_members
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Team members can view own assignments" ON public.project_team_members
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Clients can view team for own projects" ON public.project_team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_team_members.project_id AND client_id = auth.uid())
  );

-- Now safe to add team policies on projects (project_team_members exists)
CREATE POLICY "Team members can view assigned projects" ON public.projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.project_team_members WHERE project_id = projects.id AND user_id = auth.uid())
  );

-- Team task policies
CREATE POLICY "Team members can view tasks for assigned projects" ON public.tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.project_team_members WHERE project_id = tasks.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Team members can update assigned tasks" ON public.tasks
  FOR UPDATE USING (assigned_to = auth.uid());

-- ============================================================
-- 7. Create chat tables (after project_team_members, since policies reference it)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all conversations" ON public.chat_conversations
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view own conversations" ON public.chat_conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.proposals WHERE id = chat_conversations.proposal_id AND client_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.projects WHERE id = chat_conversations.project_id AND client_id = auth.uid())
  );
CREATE POLICY "Team can view assigned project conversations" ON public.chat_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_team_members
      WHERE project_id = chat_conversations.project_id AND user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  content text,
  attachments jsonb DEFAULT '[]'::jsonb,
  read_by jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id AND (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (SELECT 1 FROM public.proposals WHERE id = c.proposal_id AND client_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.projects WHERE id = c.project_id AND client_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.project_team_members WHERE project_id = c.project_id AND user_id = auth.uid())
      )
    )
  );
CREATE POLICY "Users can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(conversation_id, created_at);

-- ============================================================
-- 8. Create milestones table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  phase text CHECK (phase IN (
    'requirements', 'design', 'development', 'testing',
    'review', 'revision', 'delivery'
  )) NOT NULL,
  sort_order integer NOT NULL,
  payment_amount numeric DEFAULT 0,
  payment_status text CHECK (payment_status IN (
    'not_applicable', 'pending', 'invoiced', 'paid'
  )) DEFAULT 'not_applicable',
  due_date date,
  started_at timestamptz,
  completed_at timestamptz,
  status text CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage milestones" ON public.milestones
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view own project milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = milestones.project_id AND client_id = auth.uid())
  );
CREATE POLICY "Team can view assigned project milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.project_team_members WHERE project_id = milestones.project_id AND user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_milestones_project ON public.milestones(project_id);

-- ============================================================
-- 9. Create deliverables table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deliverables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text CHECK (type IN ('file', 'link')) NOT NULL,
  file_url text,
  file_key text,
  file_name text,
  external_url text,
  uploaded_by uuid REFERENCES public.profiles(id),
  status text CHECK (status IN ('uploaded', 'under_review', 'approved', 'revision_requested')) DEFAULT 'uploaded',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deliverables" ON public.deliverables
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view own project deliverables" ON public.deliverables
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = deliverables.project_id AND client_id = auth.uid())
  );
CREATE POLICY "Team can manage assigned project deliverables" ON public.deliverables
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.project_team_members WHERE project_id = deliverables.project_id AND user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_deliverables_project ON public.deliverables(project_id);

-- ============================================================
-- 10. Create revisions table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.revisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL,
  deliverable_id uuid REFERENCES public.deliverables(id) ON DELETE SET NULL,
  requested_by uuid REFERENCES public.profiles(id) NOT NULL,
  description text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text CHECK (status IN ('requested', 'in_progress', 'completed', 'rejected')) DEFAULT 'requested',
  admin_notes text,
  revision_number integer DEFAULT 1,
  created_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage revisions" ON public.revisions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view revisions for own projects" ON public.revisions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = revisions.project_id AND client_id = auth.uid())
  );
CREATE POLICY "Clients can insert revisions" ON public.revisions
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_revisions_project ON public.revisions(project_id);

-- ============================================================
-- 11. Create invoices table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.profiles(id) NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'BDT',
  description text,
  line_items jsonb,
  status text CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  due_date date,
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can view own invoices" ON public.invoices
  FOR SELECT USING (client_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);

-- ============================================================
-- 12. Create notifications table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  data jsonb,
  read_at timestamptz,
  channels jsonb DEFAULT '["in_app"]'::jsonb,
  email_sent_at timestamptz,
  whatsapp_sent_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE read_at IS NULL;

-- ============================================================
-- 13. Enable Realtime for new tables
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

-- ============================================================
-- 14. Add milestone_id to tasks (optional link)
-- ============================================================

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL;
