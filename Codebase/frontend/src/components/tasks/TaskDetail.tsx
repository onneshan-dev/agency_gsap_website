import { useEffect } from 'react';
import { X, Calendar, FileText, Paperclip, TriangleAlert, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskStatusBadge, type TaskStatus } from './TaskStatusBadge';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { CommentsSection, type Comment } from './CommentsSection';

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

interface TaskDetailTask {
  id: string;
  name: string;
  subtitle: string;
  description?: string;
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
  milestone?: string;
  milestoneColor?: string;
  warning?: string;
  subtasks: Subtask[];
  comments: Comment[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    icon: string;
    color: string;
  }[];
}

interface TaskDetailProps {
  task: TaskDetailTask | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    initials: string;
    color: string;
  };
  onAddComment?: (taskId: string, content: string) => void;
  onAddSubtask?: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export function TaskDetail({
  task,
  isOpen,
  onClose,
  currentUser,
  onAddComment,
  onAddSubtask,
  onToggleSubtask,
}: TaskDetailProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (!task || !isOpen) return null;

  const handleAddComment = (content: string) => {
    onAddComment?.(task.id, content);
  };

  const handleAddSubtask = () => {
    onAddSubtask?.(task.id);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    onToggleSubtask?.(task.id, subtaskId);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {/* Modal */}
        <div
          className={cn(
            'w-full max-w-[900px] max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col',
            'transform transition-all duration-300 ease-out',
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          )}
          style={{ touchAction: 'auto' }}
        >
          {/* Header */}
          <div className="h-14 border-b border-[#E5E3DE] flex items-center justify-between px-5 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-6 h-6 rounded border-2 flex items-center justify-center shrink-0',
                  task.progress === 100
                    ? 'bg-[#22C55E] border-[#22C55E]'
                    : task.status === 'in_review'
                    ? 'border-[#F59E0B]'
                    : 'border-[#E5E3DE]'
                )}
              >
                {task.progress === 100 && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              <h2 className="text-[16px] font-bold text-[#1A1A1E]">{task.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#9A9AA0] hover:text-[#5F5F67] rounded-lg hover:bg-[#F4F3F0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content - 2 Column Layout */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin overscroll-contain"
            style={{ touchAction: 'pan-y' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left Column */}
              <div className="p-5 border-r border-[#E5E3DE]">
                {/* Badges Row */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <TaskStatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.milestone && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#DBEAFE] rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                      <span className="text-[11px] font-medium text-[#1D4ED8]">{task.milestone}</span>
                    </div>
                  )}
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Assignee */}
                  <div className="p-3 bg-[#F8FAFC] rounded-lg">
                    <span className="text-[10px] font-semibold text-[#9A9AA0] uppercase tracking-wide block mb-1.5">Assignee</span>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px]', task.assignee.color)}>
                        {task.assignee.initials}
                      </div>
                      <span className="text-[12px] font-medium text-[#1A1A1E]">{task.assignee.name}</span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="p-3 bg-[#F8FAFC] rounded-lg">
                    <span className="text-[10px] font-semibold text-[#9A9AA0] uppercase tracking-wide block mb-1.5">Due Date</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className={cn('w-3.5 h-3.5', task.dueDateColor || 'text-[#9A9AA0]')} />
                      <span className={cn('text-[12px] font-semibold', task.dueDateColor || 'text-[#9A9AA0]')}>
                        {task.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="p-3 bg-[#F8FAFC] rounded-lg col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-[#9A9AA0] uppercase tracking-wide">Progress</span>
                      <span
                        className={cn(
                          'text-[13px] font-bold',
                          task.status === 'in_review' ? 'text-[#D97706]' : 'text-[#2563EB]'
                        )}
                      >
                        {task.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#E5E3DE] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          task.status === 'in_review' ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'
                        )}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                {task.description && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-3.5 h-3.5 text-[#5F5F67]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1E]">Description</span>
                    </div>
                    <div className="bg-[#F8F7F4] border border-[#E5E3DE] rounded-lg p-3.5">
                      <p className="text-[13px] text-[#5F5F67] leading-relaxed">{task.description}</p>
                      {task.warning && (
                        <div className="mt-3 flex items-center gap-2 text-[#D97706]">
                          <TriangleAlert className="w-4 h-4" />
                          <span className="text-[12px] font-medium">{task.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subtasks Section */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#5F5F67]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </svg>
                      <span className="text-[13px] font-semibold text-[#1A1A1E]">Subtasks</span>
                      <div className="h-[18px] px-2 bg-[#F4F3F0] rounded-[9px] flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-[#5F5F67]">
                          {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleAddSubtask}
                      className="h-7 px-3 bg-[#F4F3F0] border border-[#E5E3DE] rounded-md flex items-center gap-1.5 hover:bg-[#E5E3DE] transition-colors"
                    >
                      <svg className="w-3 h-3 text-[#5F5F67]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <span className="text-[12px] font-medium text-[#5F5F67]">Add</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 p-2.5 bg-[#F8FAFC] rounded-lg"
                      >
                        <button
                          onClick={() => handleToggleSubtask(subtask.id)}
                          className={cn(
                            'w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors shrink-0',
                            subtask.completed
                              ? 'bg-[#22C55E]'
                              : subtask.status === 'review'
                              ? 'border-2 border-[#F59E0B]'
                              : 'border-2 border-[#D1D5DB]'
                          )}
                        >
                          {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                        <span
                          className={cn(
                            'flex-1 text-[13px]',
                            subtask.completed ? 'text-[#9A9AA0] line-through' : 'text-[#1A1A1E]'
                          )}
                        >
                          {subtask.name}
                        </span>
                        {subtask.status === 'review' && !subtask.completed && (
                          <span className="px-1.5 py-0.5 bg-[#FEF3C7] rounded text-[10px] font-semibold text-[#D97706]">
                            Review
                          </span>
                        )}
                        {subtask.assignee && (
                          <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px]', subtask.assignee.color)}>
                            {subtask.assignee.initials}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments Section */}
                {task.attachments && task.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-3.5 h-3.5 text-[#5F5F67]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1E]">Attachments</span>
                      <div className="px-2 py-0.5 bg-[#F1F5F9] rounded-full">
                        <span className="text-[11px] font-semibold text-[#5F5F67]">{task.attachments.length}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {task.attachments.map((file) => (
                        <div
                          key={file.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border',
                            file.color === 'blue' && 'bg-[#EFF6FF] border-[#BFDBFE]',
                            file.color === 'yellow' && 'bg-[#FFFBEB] border-[#FDE68A]'
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                            {file.icon === 'figma' ? (
                              <svg className="w-5 h-5 text-[#3B82F6]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.332 8.668a3.333 3.333 0 000-6.666H8.668v6.666h6.664zm0 0a3.333 3.333 0 110 6.666 3.333 3.333 0 010-6.666zM8.668 15.332a3.333 3.333 0 103.333 3.334v-3.334H8.668zm0-6.666h6.666v6.666H8.668V8.666z" />
                              </svg>
                            ) : (
                              <FileText className="w-5 h-5 text-[#D97706]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-[12px] font-medium truncate', file.color === 'blue' ? 'text-[#1D4ED8]' : 'text-[#92400E]')}>
                              {file.name}
                            </p>
                            <p className="text-[10px] text-[#9A9AA0]">
                              {file.type} • {file.size} • {file.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Comments */}
              <div className="p-5 bg-[#FAFAFA]">
                <CommentsSection
                  comments={task.comments}
                  currentUser={currentUser}
                  onAddComment={handleAddComment}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export type { TaskDetailTask };
