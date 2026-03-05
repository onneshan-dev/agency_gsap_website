import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  MoreHorizontal,
  Plus,
  Crown,
  Shield,
  User
} from 'lucide-react';
import type { TeamMember } from '@/types/admin';

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Project Manager',
    email: 'john.doe@example.com',
    status: 'online',
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'Lead Designer',
    email: 'jane.smith@example.com',
    status: 'online',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    role: 'Senior Developer',
    email: 'mike.johnson@example.com',
    status: 'away',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    role: 'Frontend Developer',
    email: 'sarah.wilson@example.com',
    status: 'offline',
  },
  {
    id: '5',
    name: 'Tom Brown',
    role: 'Backend Developer',
    email: 'tom.brown@example.com',
    status: 'online',
  },
  {
    id: '6',
    name: 'Emily Davis',
    role: 'QA Engineer',
    email: 'emily.davis@example.com',
    status: 'away',
  },
];

const roleIcons: Record<string, React.ReactNode> = {
  'Project Manager': <Crown size={14} className="text-amber-500" />,
  'Lead Designer': <Shield size={14} className="text-purple-500" />,
};

const statusColors: Record<TeamMember['status'], string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-gray-400',
};

export const ProjectTeam: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-admin-text-muted">
          {teamMembers.length} team members
        </p>
        
        <button className="flex items-center gap-1.5 px-3 py-2 bg-admin-primary text-white text-sm font-medium rounded-lg hover:bg-admin-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-admin-surface rounded-xl p-5 border border-admin-border hover:border-admin-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-admin-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className={cn(
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                    statusColors[member.status]
                  )} />
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-admin-text-primary">{member.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {roleIcons[member.role] || <User size={14} className="text-admin-text-muted" />}
                    <span className="text-xs text-admin-text-secondary">{member.role}</span>
                  </div>
                </div>
              </div>
              
              <button className="p-1.5 hover:bg-admin-bg rounded text-admin-text-muted">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-admin-border space-y-2">
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 text-sm text-admin-text-secondary hover:text-admin-primary transition-colors"
              >
                <Mail size={14} />
                <span className="truncate">{member.email}</span>
              </a>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-1.5 text-xs font-medium text-admin-primary bg-admin-primary/10 rounded-lg hover:bg-admin-primary/20 transition-colors">
                View Profile
              </button>
              <button className="flex-1 py-1.5 text-xs font-medium text-admin-text-secondary bg-admin-bg rounded-lg hover:bg-admin-border transition-colors">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTeam;
