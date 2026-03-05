import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  assignee?: {
    initials: string;
    color: string;
  };
  dueDate?: string;
  status?: string;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle?: (id: string) => void;
  onAdd?: () => void;
  className?: string;
}

export function SubtaskList({ subtasks, onToggle, onAdd, className }: SubtaskListProps) {
  const [localSubtasks, setLocalSubtasks] = useState(subtasks);
  const completedCount = localSubtasks.filter(st => st.completed).length;

  const handleToggle = (id: string) => {
    const updated = localSubtasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    setLocalSubtasks(updated);
    onToggle?.(id);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#5F5F67]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <span className="text-[13px] font-semibold text-[#1A1A1E]">Subtasks</span>
          <div className="h-[18px] px-2 bg-[#F4F3F0] rounded-[9px] flex items-center justify-center">
            <span className="text-[10px] font-semibold text-[#5F5F67]">{completedCount}/{localSubtasks.length}</span>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="h-7 px-3 bg-[#F4F3F0] border border-[#E5E3DE] rounded-md flex items-center gap-1.5 hover:bg-[#E5E3DE] transition-colors"
        >
          <Plus className="w-3 h-3 text-[#5F5F67]" />
          <span className="text-[12px] font-medium text-[#5F5F67]">Add subtask</span>
        </button>
      </div>

      {/* Subtask List */}
      <div className="flex flex-col">
        {localSubtasks.map((subtask, index) => (
          <div
            key={subtask.id}
            className={cn(
              'h-9 flex items-center gap-3 px-3 rounded-lg',
              index !== localSubtasks.length - 1 && 'border-b border-[#F1F5F9]'
            )}
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggle(subtask.id)}
              className={cn(
                'w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors',
                subtask.completed
                  ? 'bg-[#22C55E]'
                  : subtask.status === 'review'
                  ? 'border-2 border-[#F59E0B]'
                  : 'border-2 border-[#D1D5DB]'
              )}
            >
              {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
            </button>

            {/* Name */}
            <span
              className={cn(
                'flex-1 text-[13px]',
                subtask.completed ? 'text-[#9A9AA0] line-through' : 'text-[#1A1A1E]'
              )}
            >
              {subtask.name}
            </span>

            {/* Status Badge (if in review) */}
            {subtask.status === 'review' && !subtask.completed && (
              <span className="px-1.5 py-0.5 bg-[#FEF3C7] rounded text-[10px] font-semibold text-[#D97706]">
                Review
              </span>
            )}

            {/* Assignee */}
            {subtask.assignee && (
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px]',
                  subtask.assignee.color
                )}
              >
                {subtask.assignee.initials}
              </div>
            )}

            {/* Due Date */}
            {subtask.dueDate && (
              <span className="text-[11px] text-[#9A9AA0]">{subtask.dueDate}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Subtask };
