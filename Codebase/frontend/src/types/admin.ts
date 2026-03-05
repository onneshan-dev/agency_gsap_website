// Admin Dashboard Types

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
  active?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
  expanded?: boolean;
}

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'archived';
  progress: number;
  team: TeamMember[];
  dueDate: string;
  startDate?: string;
  budget?: string;
  spent?: string;
  priority?: 'high' | 'medium' | 'low';
  client?: string;
  tags?: string[];
  files?: FileItem[];
  timeline?: TimelineEvent[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email: string;
  status: 'online' | 'offline' | 'away';
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'comment' | 'file';
  user?: TeamMember;
  status?: 'completed' | 'in-progress' | 'pending';
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

export interface RecentActivity {
  id: string;
  type: 'project_created' | 'file_uploaded' | 'member_added' | 'status_changed' | 'comment';
  message: string;
  timestamp: string;
  user: TeamMember;
  projectId?: string;
}
