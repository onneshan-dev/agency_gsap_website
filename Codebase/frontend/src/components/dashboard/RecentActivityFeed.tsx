import React from 'react';
import { cn } from '@/lib/utils';
import type { RecentActivity } from '@/types/admin';
import { 
  FolderPlus, 
  FileUp, 
  UserPlus, 
  RefreshCw, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface RecentActivityProps {
  className?: string;
}

const activities: RecentActivity[] = [
  {
    id: '1',
    type: 'project_created',
    message: 'Created new project "E-commerce Redesign"',
    timestamp: '2024-03-04T10:30:00Z',
    user: { id: '1', name: 'John Doe', role: 'Admin', email: 'john@example.com', status: 'online' },
  },
  {
    id: '2',
    type: 'file_uploaded',
    message: 'Uploaded 5 new files to "Marketing Campaign"',
    timestamp: '2024-03-04T09:15:00Z',
    user: { id: '2', name: 'Jane Smith', role: 'Designer', email: 'jane@example.com', status: 'away' },
  },
  {
    id: '3',
    type: 'member_added',
    message: 'Added Mike Johnson to "Mobile App Development"',
    timestamp: '2024-03-04T08:45:00Z',
    user: { id: '1', name: 'John Doe', role: 'Admin', email: 'john@example.com', status: 'online' },
  },
  {
    id: '4',
    type: 'status_changed',
    message: 'Changed status of "Analytics Dashboard" to Completed',
    timestamp: '2024-03-03T16:20:00Z',
    user: { id: '3', name: 'Mike Johnson', role: 'Developer', email: 'mike@example.com', status: 'offline' },
  },
  {
    id: '5',
    type: 'comment',
    message: 'Commented on "Mobile App Development"',
    timestamp: '2024-03-03T14:10:00Z',
    user: { id: '2', name: 'Jane Smith', role: 'Designer', email: 'jane@example.com', status: 'away' },
  },
];

const activityIcons: Record<RecentActivity['type'], React.ComponentType<{ className?: string; size?: number }>> = {
  project_created: FolderPlus,
  file_uploaded: FileUp,
  member_added: UserPlus,
  status_changed: RefreshCw,
  comment: MessageSquare,
};

const activityColors: Record<RecentActivity['type'], string> = {
  project_created: 'bg-blue-100 text-blue-600',
  file_uploaded: 'bg-purple-100 text-purple-600',
  member_added: 'bg-emerald-100 text-emerald-600',
  status_changed: 'bg-amber-100 text-amber-600',
  comment: 'bg-gray-100 text-gray-600',
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const RecentActivityFeed: React.FC<RecentActivityProps> = ({ className }) => {
  return (
    <div className={cn('bg-admin-surface rounded-xl border border-admin-border shadow-sm', className)}>
      <div className="flex items-center justify-between p-5 border-b border-admin-border">
        <div>
          <h3 className="text-base font-semibold text-admin-text-primary">Recent Activity</h3>
          <p className="text-sm text-admin-text-muted mt-0.5">Latest updates from your team</p>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            
            return (
              <div key={activity.id} className="flex gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  activityColors[activity.type]
                )}>
                  <Icon size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-admin-text-primary">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    {activity.message}
                  </p>
                  <p className="text-xs text-admin-text-muted mt-0.5">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button className="w-full mt-5 flex items-center justify-center gap-1 text-sm font-medium text-admin-primary hover:text-admin-primary/80 transition-colors py-2 border border-dashed border-admin-border rounded-lg hover:bg-admin-bg/50"
        >
          View all activity
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default RecentActivityFeed;
