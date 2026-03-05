import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  FileText,
  Milestone
} from 'lucide-react';
import type { TimelineEvent } from '@/types/admin';

const timelineEvents: TimelineEvent[] = [
  {
    id: '1',
    title: 'Project Kickoff',
    description: 'Initial project meeting with stakeholders and team setup.',
    date: '2024-01-15T09:00:00Z',
    type: 'milestone',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Requirements Gathering',
    description: 'Collected and documented all project requirements from the client.',
    date: '2024-01-22T14:30:00Z',
    type: 'task',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Design Phase Started',
    description: 'Began creating wireframes and initial design concepts.',
    date: '2024-02-01T10:00:00Z',
    type: 'task',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Design Review Meeting',
    description: 'Reviewed initial designs with the client and received feedback.',
    date: '2024-02-15T15:00:00Z',
    type: 'comment',
    user: { id: '2', name: 'Jane Smith', role: 'Designer', email: 'jane@example.com', status: 'online' },
  },
  {
    id: '5',
    title: 'Development Sprint 1',
    description: 'Completed homepage and navigation components.',
    date: '2024-02-20T17:00:00Z',
    type: 'task',
    status: 'completed',
  },
  {
    id: '6',
    title: 'Mid-Project Review',
    description: 'Project is 75% complete. On track for delivery.',
    date: '2024-03-01T11:00:00Z',
    type: 'milestone',
    status: 'completed',
  },
  {
    id: '7',
    title: 'Final Testing Phase',
    description: 'Currently performing QA testing and bug fixes.',
    date: '2024-03-08T09:00:00Z',
    type: 'task',
    status: 'in-progress',
  },
  {
    id: '8',
    title: 'Project Delivery',
    description: 'Final delivery and handover to the client.',
    date: '2024-03-15T16:00:00Z',
    type: 'milestone',
    status: 'pending',
  },
];

const typeIcons: Record<TimelineEvent['type'], React.ComponentType<{ className?: string; size?: number }>> = {
  milestone: Milestone,
  task: CheckCircle2,
  comment: MessageSquare,
  file: FileText,
};

const typeColors: Record<TimelineEvent['type'], string> = {
  milestone: 'bg-purple-100 text-purple-600 border-purple-200',
  task: 'bg-blue-100 text-blue-600 border-blue-200',
  comment: 'bg-gray-100 text-gray-600 border-gray-200',
  file: 'bg-emerald-100 text-emerald-600 border-emerald-200',
};

const statusIcons = {
  completed: CheckCircle2,
  'in-progress': Clock,
  pending: Circle,
};

const statusColors = {
  completed: 'text-emerald-500',
  'in-progress': 'text-amber-500',
  pending: 'text-gray-400',
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const isUpcoming = (dateString: string): boolean => {
  return new Date(dateString) > new Date();
};

export const ProjectTimeline: React.FC = () => {
  return (
    <div className="bg-admin-surface rounded-xl border border-admin-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-admin-text-primary">Project Timeline</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-admin-text-muted">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-xs text-admin-text-muted">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="text-xs text-admin-text-muted">Pending</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-admin-border" />

        {/* Timeline Events */}
        <div className="space-y-6">
          {timelineEvents.map((event, index) => {
            const Icon = typeIcons[event.type];
            const StatusIcon = event.status ? statusIcons[event.status] : null;
            const upcoming = isUpcoming(event.date);

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={cn(
                  'relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  typeColors[event.type]
                )}>
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 pb-6',
                  index === timelineEvents.length - 1 && 'pb-0'
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          'text-sm font-semibold',
                          upcoming ? 'text-admin-text-primary' : 'text-admin-text-primary'
                        )}>
                          {event.title}
                        </h4>
                        
                        {StatusIcon && (
                          <StatusIcon 
                            size={14} 
                            className={statusColors[event.status!]} 
                          />
                        )}
                      </div>
                      
                      <p className="text-sm text-admin-text-secondary mt-1">
                        {event.description}
                      </p>
                      
                      {event.user && (
                        <p className="text-xs text-admin-text-muted mt-1">
                          by {event.user.name}
                        </p>
                      )}
                    </div>

                    <time className="text-xs text-admin-text-muted whitespace-nowrap">
                      {formatDate(event.date)}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
