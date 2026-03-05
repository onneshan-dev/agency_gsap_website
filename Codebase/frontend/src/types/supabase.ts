export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'client' | 'team_member';
          phone: string | null;
          project_description: string | null;
          documents: Json | null;
          designation: string | null;
          skills: Json | null;
          bio: string | null;
          whatsapp_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'client' | 'team_member';
          phone?: string | null;
          project_description?: string | null;
          documents?: Json | null;
          designation?: string | null;
          skills?: Json | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'client' | 'team_member';
          phone?: string | null;
          project_description?: string | null;
          documents?: Json | null;
          designation?: string | null;
          skills?: Json | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string;
          category: 'web_app' | 'mobile_app' | 'ecommerce' | 'saas' | 'other' | null;
          budget_range: 'under_5k' | '5k_15k' | '15k_50k' | '50k_plus' | 'not_sure' | null;
          timeline_preference: '1_month' | '1_3_months' | '3_6_months' | '6_plus' | 'flexible' | null;
          documents: Json | null;
          status: 'draft' | 'submitted' | 'under_review' | 'in_discussion' | 'quoted' | 'accepted' | 'rejected' | 'converted';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description: string;
          category?: string | null;
          budget_range?: string | null;
          timeline_preference?: string | null;
          documents?: Json | null;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          description?: string;
          category?: string | null;
          budget_range?: string | null;
          timeline_preference?: string | null;
          documents?: Json | null;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_conversations: {
        Row: {
          id: string;
          proposal_id: string | null;
          project_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id?: string | null;
          project_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string | null;
          project_id?: string | null;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          attachments: Json | null;
          read_by: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          attachments?: Json | null;
          read_by?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string | null;
          attachments?: Json | null;
          read_by?: Json | null;
          created_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          proposal_id: string;
          created_by: string;
          scope_summary: string;
          line_items: Json;
          total_amount: number;
          currency: string;
          timeline_start: string | null;
          timeline_end: string | null;
          payment_schedule: Json | null;
          valid_until: string | null;
          status: 'draft' | 'sent' | 'accepted' | 'negotiating' | 'rejected' | 'expired';
          client_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          created_by: string;
          scope_summary: string;
          line_items: Json;
          total_amount: number;
          currency?: string;
          timeline_start?: string | null;
          timeline_end?: string | null;
          payment_schedule?: Json | null;
          valid_until?: string | null;
          status?: string;
          client_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          created_by?: string;
          scope_summary?: string;
          line_items?: Json;
          total_amount?: number;
          currency?: string;
          timeline_start?: string | null;
          timeline_end?: string | null;
          payment_schedule?: Json | null;
          valid_until?: string | null;
          status?: string;
          client_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agreements: {
        Row: {
          id: string;
          quote_id: string;
          client_id: string;
          checklist_items: Json;
          status: 'pending' | 'confirmed' | 'voided';
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          client_id: string;
          checklist_items: Json;
          status?: string;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote_id?: string;
          client_id?: string;
          checklist_items?: Json;
          status?: string;
          confirmed_at?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          client_id: string;
          status: 'planning' | 'in_progress' | 'review' | 'revision' | 'on_hold' | 'completed' | 'cancelled';
          progress: number;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          proposal_id: string | null;
          quote_id: string | null;
          agreement_id: string | null;
          current_phase: 'requirements' | 'design' | 'development' | 'testing' | 'review' | 'revision' | 'delivery' | 'completed';
          revision_policy: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          client_id: string;
          status?: string;
          progress?: number;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          proposal_id?: string | null;
          quote_id?: string | null;
          agreement_id?: string | null;
          current_phase?: string;
          revision_policy?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          client_id?: string;
          status?: string;
          progress?: number;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          proposal_id?: string | null;
          quote_id?: string | null;
          agreement_id?: string | null;
          current_phase?: string;
          revision_policy?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          phase: 'requirements' | 'design' | 'development' | 'testing' | 'review' | 'revision' | 'delivery';
          sort_order: number;
          payment_amount: number;
          payment_status: 'not_applicable' | 'pending' | 'invoiced' | 'paid';
          due_date: string | null;
          started_at: string | null;
          completed_at: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'skipped';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          phase: string;
          sort_order: number;
          payment_amount?: number;
          payment_status?: string;
          due_date?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          phase?: string;
          sort_order?: number;
          payment_amount?: number;
          payment_status?: string;
          due_date?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      deliverables: {
        Row: {
          id: string;
          project_id: string;
          milestone_id: string | null;
          title: string;
          description: string | null;
          type: 'file' | 'link';
          file_url: string | null;
          file_key: string | null;
          file_name: string | null;
          external_url: string | null;
          uploaded_by: string | null;
          status: 'uploaded' | 'under_review' | 'approved' | 'revision_requested';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          milestone_id?: string | null;
          title: string;
          description?: string | null;
          type: string;
          file_url?: string | null;
          file_key?: string | null;
          file_name?: string | null;
          external_url?: string | null;
          uploaded_by?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          milestone_id?: string | null;
          title?: string;
          description?: string | null;
          type?: string;
          file_url?: string | null;
          file_key?: string | null;
          file_name?: string | null;
          external_url?: string | null;
          uploaded_by?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      revisions: {
        Row: {
          id: string;
          project_id: string;
          milestone_id: string | null;
          deliverable_id: string | null;
          requested_by: string;
          description: string;
          attachments: Json | null;
          status: 'requested' | 'in_progress' | 'completed' | 'rejected';
          admin_notes: string | null;
          revision_number: number;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          milestone_id?: string | null;
          deliverable_id?: string | null;
          requested_by: string;
          description: string;
          attachments?: Json | null;
          status?: string;
          admin_notes?: string | null;
          revision_number?: number;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          milestone_id?: string | null;
          deliverable_id?: string | null;
          requested_by?: string;
          description?: string;
          attachments?: Json | null;
          status?: string;
          admin_notes?: string | null;
          revision_number?: number;
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      project_team_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role_in_project: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role_in_project?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role_in_project?: string;
          joined_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          project_id: string;
          milestone_id: string | null;
          client_id: string;
          amount: number;
          currency: string;
          description: string | null;
          line_items: Json | null;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          due_date: string | null;
          paid_at: string | null;
          payment_method: string | null;
          payment_reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          milestone_id?: string | null;
          client_id: string;
          amount: number;
          currency?: string;
          description?: string | null;
          line_items?: Json | null;
          status?: string;
          due_date?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          milestone_id?: string | null;
          client_id?: string;
          amount?: number;
          currency?: string;
          description?: string | null;
          line_items?: Json | null;
          status?: string;
          due_date?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          data: Json | null;
          read_at: string | null;
          channels: Json | null;
          email_sent_at: string | null;
          whatsapp_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          data?: Json | null;
          read_at?: string | null;
          channels?: Json | null;
          email_sent_at?: string | null;
          whatsapp_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string | null;
          data?: Json | null;
          read_at?: string | null;
          channels?: Json | null;
          email_sent_at?: string | null;
          whatsapp_sent_at?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'done';
          priority: 'low' | 'medium' | 'high';
          assigned_to: string | null;
          due_date: string | null;
          milestone_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          assigned_to?: string | null;
          due_date?: string | null;
          milestone_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          assigned_to?: string | null;
          due_date?: string | null;
          milestone_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_updates: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          content: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          content: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          content?: string;
          created_by?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insertables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updateables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type Project = Tables<'projects'>;
export type Task = Tables<'tasks'>;
export type ProjectUpdate = Tables<'project_updates'>;
export type Proposal = Tables<'proposals'>;
export type ChatConversation = Tables<'chat_conversations'>;
export type ChatMessage = Tables<'chat_messages'>;
export type Quote = Tables<'quotes'>;
export type Agreement = Tables<'agreements'>;
export type Milestone = Tables<'milestones'>;
export type Deliverable = Tables<'deliverables'>;
export type Revision = Tables<'revisions'>;
export type ProjectTeamMember = Tables<'project_team_members'>;
export type Invoice = Tables<'invoices'>;
export type Notification = Tables<'notifications'>;
