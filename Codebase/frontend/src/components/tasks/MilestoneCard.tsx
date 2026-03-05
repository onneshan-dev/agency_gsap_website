import { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskList } from './TaskList';
import type { Task } from './TaskList';

interface Milestone {
  id: string;
  title: string;
  color: string;
  dueDate: string;
  dueDateColor?: string;
  progress: number;
  status: 'in_progress' | 'completed' | 'pending';
  tasks: Task[];
}

interface MilestoneCardProps {
  milestone: Milestone;
  className?: string;
  onTaskClick?: (task: Task) => void;
}

export function MilestoneCard({ milestone, className, onTaskClick }: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const statusConfig = {
    in_progress: {
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#D97706]',
      dot: 'bg-[#D97706]',
      label: 'In Progress',
    },
    completed: {
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#16A34A]',
      dot: 'bg-[#16A34A]',
      label: 'Completed',
    },
    pending: {
      bg: 'bg-[#F3F4F6]',
      text: 'text-[#6B7280]',
      dot: 'bg-[#6B7280]',
      label: 'Pending',
    },
  };

  const status = statusConfig[milestone.status];

  return (
    <div className={cn('bg-white border border-[#E5E3DE] rounded-[12px] overflow-hidden', className)}>
      {/* Milestone Header */}
      <div 
        className="h-14 px-5 flex items-center justify-between border-b border-[#E5E3DE] cursor-pointer hover:bg-[#FAFAFA] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          <button className="p-1 hover:bg-[#E5E3DE] rounded transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#9A9AA0]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#9A9AA0]" />
            )}
          </button>

          {/* Color Bar */}
          <div 
            className="w-1 h-5 rounded-full"
            style={{ backgroundColor: milestone.color }}
          />

          {/* Title */}
          <span className="text-[15px] font-semibold text-[#1A1A1E]">{milestone.title}</span>

          {/* Due Date Badge */}
          {milestone.dueDate && (
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium',
              milestone.dueDateColor === 'text-[#EF4444]' ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#F8F7F4] text-[#9A9AA0]'
            )}>
              <Calendar className="w-3 h-3" />
              {milestone.dueDate}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#2D5A3D]">{milestone.progress}% complete</span>
            <div className="w-20 h-1.5 bg-[#E5E3DE] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${milestone.progress}%`,
                  backgroundColor: milestone.color 
                }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-md', status.bg)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
            <span className={cn('text-[12px] font-semibold', status.text)}>{status.label}</span>
          </div>

          {/* Add Task Button */}
          <button className="h-7 px-2.5 bg-[#2D5A3D] rounded-md flex items-center gap-1.5 text-white text-[12px] font-semibold">
            <Plus className="w-3 h-3" />
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {isExpanded && (
        <div className="bg-white">
          <TaskList tasks={milestone.tasks} showHeader onTaskClick={onTaskClick} />
          
          {/* Add Task Footer */}
          <button className="w-full h-10 bg-[#FAFAFA] border-t border-[#E5E3DE] flex items-center gap-2 px-5 text-[#9A9AA0] hover:bg-[#F4F3F0] transition-colors">
            <Plus className="w-[13px] h-[13px]" />
            <span className="text-[12px]">Add task to {milestone.title}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export type { Milestone };
