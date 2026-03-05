import { StatusBadge, type Status } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { TeamAvatars, type TeamMember } from './TeamAvatars';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  type: string;
  badgeColor: string;
  badgeTextColor: string;
  client: string;
  status: Status;
  progress: number;
  budget: string;
  dueDate: string;
  team: TeamMember[];
}

interface ProjectsTableProps {
  projects: Project[];
  className?: string;
  onProjectClick?: (id: string) => void;
}

export function ProjectsTable({ projects, className, onProjectClick }: ProjectsTableProps) {
  return (
    <div className={cn('bg-white border border-[#E5E3DE] rounded-[12px] overflow-hidden', className)}>
      {/* Table Header */}
      <div className="h-10 bg-[#F8F7F4] border-b border-[#E5E3DE] px-5 flex items-center rounded-t-[12px]">
        <div className="flex-1">
          <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Project</span>
        </div>
        <div className="w-[140px]">
          <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Client</span>
        </div>
        <div className="w-[130px]">
          <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Status</span>
        </div>
        <div className="w-[160px]">
          <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Progress</span>
        </div>
        <div className="w-[110px]">
          <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Budget</span>
        </div>
        <div className="w-[110px]">
          <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Due Date</span>
        </div>
        <div className="w-[100px]">
          <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Team</span>
        </div>
      </div>

      {/* Table Rows */}
      <div>
        {projects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => onProjectClick?.(project.id)}
            className={cn(
              'h-16 px-5 flex items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer',
              index !== projects.length - 1 && 'border-b border-[#E5E3DE]'
            )}
          >
            {/* Project Column */}
            <div className="flex-1 flex items-center gap-[10px]">
              <div
                className={cn(
                  'w-9 h-9 rounded-[10px] flex items-center justify-center text-[14px] font-bold',
                  project.badgeColor,
                  project.badgeTextColor
                )}
              >
                {project.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-[#1A1A1E]">{project.name}</span>
                <span className="text-[12px] text-[#9A9AA0]">{project.type}</span>
              </div>
            </div>

            {/* Client Column */}
            <div className="w-[140px]">
              <span className="text-[13px] text-[#5F5F67]">{project.client}</span>
            </div>

            {/* Status Column */}
            <div className="w-[130px]">
              <StatusBadge status={project.status} />
            </div>

            {/* Progress Column */}
            <div className="w-[160px]">
              <ProgressBar progress={project.progress} />
            </div>

            {/* Budget Column */}
            <div className="w-[110px]">
              <span className="text-[13px] font-semibold text-[#1A1A1E]">{project.budget}</span>
            </div>

            {/* Due Date Column */}
            <div className="w-[110px]">
              <span className="text-[13px] text-[#5F5F67]">{project.dueDate}</span>
            </div>

            {/* Team Column */}
            <div className="w-[100px]">
              <TeamAvatars members={project.team} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Project };
