import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskStatusBadge, type TaskStatus } from './TaskStatusBadge';
import { PriorityBadge, type Priority } from './PriorityBadge';

interface Task {
  id: string;
  name: string;
  subtitle: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  dueDate: string;
  dueDateColor?: string;
  status: TaskStatus;
  priority: Priority;
  progress: number;
  highlight?: boolean;
}

interface TaskListProps {
  tasks: Task[];
  showHeader?: boolean;
  className?: string;
  onTaskClick?: (task: Task) => void;
}

export function TaskList({ tasks, showHeader = false, className, onTaskClick }: TaskListProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className={className}>
      {/* Table Header */}
      {showHeader && (
        <div className="h-[34px] bg-[#F4F3F0] border-b border-[#E5E3DE] px-5 flex items-center">
          <div className="w-5 h-5" /> {/* Checkbox placeholder */}
          <div className="flex-1 px-3.5">
            <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Task</span>
          </div>
          <div className="w-[120px]">
            <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Assignee</span>
          </div>
          <div className="w-[90px]">
            <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Due Date</span>
          </div>
          <div className="w-[130px]">
            <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Status</span>
          </div>
          <div className="w-[90px]">
            <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Priority</span>
          </div>
          <div className="w-[110px]">
            <span className="text-[11px] font-semibold text-[#9A9AA0] uppercase">Progress</span>
          </div>
          <div className="w-6" /> {/* More options placeholder */}
        </div>
      )}

      {/* Task Rows */}
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task)}
            className={cn(
              'h-[54px] px-5 flex items-center border-b border-[#E5E3DE] last:border-b-0 cursor-pointer hover:bg-[#FAFAF8] transition-colors',
              task.highlight && 'bg-[#FFF8ED]'
            )}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTask(task.id)}
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                selectedTasks.includes(task.id)
                  ? 'bg-[#2D5A3D] border-[#2D5A3D]'
                  : 'border-[#E5E3DE] hover:border-[#2D5A3D]'
              )}
            >
              {selectedTasks.includes(task.id) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Task Info */}
            <div className="flex-1 px-3.5 flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold text-[#1A1A1E]">{task.name}</span>
              <span className={cn(
                'text-[11px]',
                task.highlight ? 'text-[#D97706]' : 'text-[#9A9AA0]'
              )}>
                {task.subtitle}
              </span>
            </div>

            {/* Assignee */}
            <div className="w-[120px] flex items-center gap-1.5">
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px]', task.assignee.color)}>
                {task.assignee.initials}
              </div>
              <span className="text-[12px] text-[#5F5F67]">{task.assignee.name}</span>
            </div>

            {/* Due Date */}
            <div className={cn('w-[90px] text-[12px]', task.dueDateColor || 'text-[#9A9AA0]')}>
              {task.dueDate}
            </div>

            {/* Status */}
            <div className="w-[130px]">
              <TaskStatusBadge status={task.status} />
            </div>

            {/* Priority */}
            <div className="w-[90px]">
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Progress */}
            <div className="w-[110px] flex flex-col gap-1">
              <span className={cn(
                'text-[12px] font-semibold',
                task.status === 'in_review' ? 'text-[#D97706]' : 'text-[#2563EB]'
              )}>
                {task.progress}%
              </span>
              <div className="w-[90px] h-[5px] bg-[#E5E3DE] rounded-[3px] overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-[3px]',
                    task.status === 'in_review' ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'
                  )}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* More Options */}
            <button className="w-6 h-6 flex items-center justify-center text-[#9A9AA0] hover:text-[#5F5F67]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Task };
