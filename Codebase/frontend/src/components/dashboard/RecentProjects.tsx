import React from 'react';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/admin';
import { MoreHorizontal, ArrowRight, Calendar, Users } from 'lucide-react';

interface RecentProjectsProps {
  className?: string;
  onViewAll?: () => void;
  onProjectClick?: (projectId: string) => void;
}

const recentProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Redesign',
    description: 'Complete overhaul of the online store UI/UX',
    status: 'active',
    progress: 75,
    dueDate: '2024-03-15',
    team: [
      { id: '1', name: 'John Doe', role: 'Lead Designer', email: 'john@example.com', status: 'online' },
      { id: '2', name: 'Jane Smith', role: 'Developer', email: 'jane@example.com', status: 'away' },
      { id: '3', name: 'Mike Johnson', role: 'Product Manager', email: 'mike@example.com', status: 'offline' },
    ],
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android applications',
    status: 'active',
    progress: 45,
    dueDate: '2024-04-20',
    team: [
      { id: '4', name: 'Sarah Wilson', role: 'Mobile Dev', email: 'sarah@example.com', status: 'online' },
      { id: '5', name: 'Tom Brown', role: 'Backend Dev', email: 'tom@example.com', status: 'online' },
    ],
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Q2 marketing campaign materials and assets',
    status: 'pending',
    progress: 10,
    dueDate: '2024-03-30',
    team: [
      { id: '6', name: 'Emily Davis', role: 'Marketing Lead', email: 'emily@example.com', status: 'away' },
    ],
  },
  {
    id: '4',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics and reporting system',
    status: 'completed',
    progress: 100,
    dueDate: '2024-02-28',
    team: [
      { id: '7', name: 'Alex Chen', role: 'Data Engineer', email: 'alex@example.com', status: 'offline' },
      { id: '8', name: 'Lisa Wang', role: 'Frontend Dev', email: 'lisa@example.com', status: 'online' },
    ],
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-700',
};

export const RecentProjects: React.FC<RecentProjectsProps> = ({ 
  className,
  onViewAll,
  onProjectClick
}) => {
  return (
    <div className={cn('bg-admin-surface rounded-xl border border-admin-border shadow-sm', className)}>
      <div className="flex items-center justify-between p-5 border-b border-admin-border">
        <div>
          <h3 className="text-base font-semibold text-admin-text-primary">Recent Projects</h3>
          <p className="text-sm text-admin-text-muted mt-0.5">Your latest project updates</p>
        </div>
        
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-admin-primary hover:text-admin-primary/80 transition-colors"
        >
          View all
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="divide-y divide-admin-border">
        {recentProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectClick?.(project.id)}
            className="p-5 hover:bg-admin-bg/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-semibold text-admin-text-primary">{project.name}</h4>
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    statusColors[project.status]
                  )}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-sm text-admin-text-secondary mt-1">{project.description}</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-admin-text-muted">
                    <Calendar size={14} />
                    <span>Due {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-admin-text-muted">
                    <Users size={14} />
                    <span>{project.team.length} members</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-admin-text-muted">Progress</span>
                    <span className="font-medium text-admin-text-primary">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-admin-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-admin-primary rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <button className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
