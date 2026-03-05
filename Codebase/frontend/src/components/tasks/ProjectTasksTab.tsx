import { useState } from 'react';
import { Plus, SlidersHorizontal, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MilestoneCard, type Milestone } from './MilestoneCard';
import { TaskDetail, type TaskDetailTask } from './TaskDetail';
import type { Task } from './TaskList';

// Mock milestones data with tasks
const defaultMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Milestone 1: Design Phase',
    color: '#3B82F6',
    dueDate: 'Due Mar 20',
    progress: 75,
    status: 'in_progress',
    tasks: [
      {
        id: 't1',
        name: 'Wireframes for Homepage & Product Pages',
        subtitle: 'UI Design · 2 comments',
        assignee: { name: 'Sarah A.', initials: 'SA', color: 'bg-[#FEE2E2] text-[#EF4444]' },
        dueDate: 'Mar 18',
        dueDateColor: 'text-[#D97706]',
        status: 'in_review',
        priority: 'high',
        progress: 90,
        highlight: true,
      },
      {
        id: 't2',
        name: 'Hero Section & CTA Redesign',
        subtitle: 'UI Design · Changes requested',
        assignee: { name: 'Sarah A.', initials: 'SA', color: 'bg-[#FEE2E2] text-[#EF4444]' },
        dueDate: 'Mar 18',
        dueDateColor: 'text-[#D97706]',
        status: 'in_review',
        priority: 'high',
        progress: 65,
      },
      {
        id: 't3',
        name: 'Component Library & Design System',
        subtitle: 'UI Design · In progress since Mar 8',
        assignee: { name: 'Mike D.', initials: 'MD', color: 'bg-[#D1FAE5] text-[#059669]' },
        dueDate: 'Mar 22',
        status: 'in_progress',
        priority: 'medium',
        progress: 45,
      },
    ],
  },
  {
    id: '2',
    title: 'Milestone 2: Development Phase',
    color: '#F59E0B',
    dueDate: 'Due Apr 15',
    dueDateColor: 'text-[#EF4444]',
    progress: 40,
    status: 'in_progress',
    tasks: [
      {
        id: 't4',
        name: 'API Integration – Product Catalog',
        subtitle: 'Backend · Assigned Apr 1',
        assignee: { name: 'Alex K.', initials: 'AK', color: 'bg-[#EDE9FE] text-[#7C3AED]' },
        dueDate: 'Apr 2',
        status: 'in_progress',
        priority: 'high',
        progress: 30,
      },
      {
        id: 't5',
        name: 'Shopping Cart & Checkout Flow',
        subtitle: 'Frontend · Not started',
        assignee: { name: 'John S.', initials: 'JS', color: 'bg-[#DBEAFE] text-[#2563EB]' },
        dueDate: 'Apr 8',
        status: 'todo',
        priority: 'high',
        progress: 0,
      },
      {
        id: 't6',
        name: 'User Authentication & Profiles',
        subtitle: 'Backend · In progress',
        assignee: { name: 'Lisa M.', initials: 'LM', color: 'bg-[#FEF3C7] text-[#D97706]' },
        dueDate: 'Apr 5',
        status: 'in_progress',
        priority: 'medium',
        progress: 60,
      },
    ],
  },
  {
    id: '3',
    title: 'Milestone 3: Testing & Launch',
    color: '#22C55E',
    dueDate: 'Due May 1',
    progress: 0,
    status: 'pending',
    tasks: [
      {
        id: 't7',
        name: 'QA Testing & Bug Fixes',
        subtitle: 'QA · Scheduled',
        assignee: { name: 'Tom H.', initials: 'TH', color: 'bg-[#DCFCE7] text-[#16A34A]' },
        dueDate: 'Apr 25',
        status: 'todo',
        priority: 'high',
        progress: 0,
      },
      {
        id: 't8',
        name: 'Performance Optimization',
        subtitle: 'DevOps · Scheduled',
        assignee: { name: 'Anna B.', initials: 'AB', color: 'bg-[#F3E8FF] text-[#7C3AED]' },
        dueDate: 'Apr 28',
        status: 'todo',
        priority: 'medium',
        progress: 0,
      },
    ],
  },
];

// Extended task data for task detail
const taskDetailData: Record<string, Partial<TaskDetailTask>> = {
  t2: {
    description: 'Redesign the hero section with updated brand guidelines. The CTA buttons need to be more prominent and the copy needs to align with the new marketing direction. Include A/B test variants for both desktop and mobile breakpoints.',
    warning: 'Changes requested by client on Mar 16 — awaiting revised mockups',
    milestone: 'UI Design Phase',
    milestoneColor: '#3B82F6',
    subtasks: [
      { id: 'st1', name: 'Desktop hero layout wireframe', completed: true, dueDate: 'Mar 14', assignee: { initials: 'SA', color: 'bg-[#FEE2E2] text-[#EF4444]' } },
      { id: 'st2', name: 'CTA button copy & styling', completed: true, dueDate: 'Mar 15', assignee: { initials: 'SA', color: 'bg-[#FEE2E2] text-[#EF4444]' } },
      { id: 'st3', name: 'Mobile responsive layout', completed: false, status: 'review', assignee: { initials: 'SA', color: 'bg-[#FEE2E2] text-[#EF4444]' } },
      { id: 'st4', name: 'A/B test variant designs', completed: false, dueDate: 'Mar 20' },
    ],
    comments: [
      {
        id: 'c1',
        author: { name: 'Sarah Ahmed', initials: 'SA', color: 'bg-[#F472B6] text-white' },
        content: 'Client requested changes to the hero section — needs larger CTA button and softer gradient background. Please revise before EOD.',
        timestamp: 'Mar 16, 2:30 PM',
        bubbleColor: 'bg-[#FEF3C7]',
      },
      {
        id: 'c2',
        author: { name: 'Mike Chen', initials: 'MC', color: 'bg-[#6366F1] text-white' },
        content: 'On it! Updated the CTA to 52px height with rounded-full corners. Also swapped the gradient to a softer sage-to-white. Uploading revised mockup shortly.',
        timestamp: 'Mar 16, 4:15 PM',
        bubbleColor: 'bg-[#F1F5F9]',
      },
      {
        id: 'c3',
        author: { name: 'Sarah Ahmed', initials: 'SA', color: 'bg-[#F472B6] text-white' },
        content: 'Mockup uploaded! Check hero_redesign_v2.fig in attachments. Gradient now uses #F0FDF4 → white. CTA is 52×200px with $primary bg. Awaiting client approval.',
        timestamp: 'Mar 17, 9:05 AM',
        isLatest: true,
        bubbleColor: 'bg-[#F0FDF4]',
      },
    ],
    attachments: [
      { id: 'a1', name: 'hero_redesign_v2.fig', type: 'Figma', size: '4.2 MB', date: 'Mar 17', icon: 'figma', color: 'blue' },
      { id: 'a2', name: 'cta_feedback_notes.pdf', type: 'PDF', size: '1.8 MB', date: 'Mar 16', icon: 'pdf', color: 'yellow' },
    ],
  },
  t1: {
    description: 'Create comprehensive wireframes for the homepage and all product pages. Include mobile and desktop breakpoints, navigation structure, and key interaction patterns.',
    milestone: 'UI Design Phase',
    milestoneColor: '#3B82F6',
    subtasks: [
      { id: 'st1', name: 'Homepage wireframe', completed: true },
      { id: 'st2', name: 'Product listing page', completed: true },
      { id: 'st3', name: 'Product detail page', completed: false },
    ],
    comments: [
      {
        id: 'c1',
        author: { name: 'Sarah Ahmed', initials: 'SA', color: 'bg-[#F472B6] text-white' },
        content: 'Homepage wireframe is ready for review. Please check the latest version.',
        timestamp: 'Mar 15, 10:00 AM',
        bubbleColor: 'bg-[#F1F5F9]',
      },
    ],
  },
};

interface ProjectTasksTabProps {
  milestones?: Milestone[];
  className?: string;
}

export function ProjectTasksTab({ milestones, className }: ProjectTasksTabProps) {
  const milestonesList = milestones || defaultMilestones;
  const [filterStatus] = useState<string>('All Status');
  const [filterPriority] = useState<string>('Priority');
  const [selectedTask, setSelectedTask] = useState<TaskDetailTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    // Merge basic task data with detailed data
    const detailData = taskDetailData[task.id] || {};
    const fullTask: TaskDetailTask = {
      ...task,
      ...detailData,
      subtasks: detailData.subtasks || [],
      comments: detailData.comments || [],
    };
    setSelectedTask(fullTask);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTask(null), 300); // Clear after animation
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="h-[52px] bg-white border border-[#E5E3DE] rounded-[12px] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <button className="h-[34px] px-2.5 bg-[#F8F7F4] border border-[#E5E3DE] rounded-lg flex items-center gap-1.5 text-[12px] font-medium text-[#5F5F67] hover:bg-[#F1F0ED] transition-colors">
            <SlidersHorizontal className="w-[13px] h-[13px]" />
            {filterStatus}
          </button>

          {/* Priority Filter */}
          <button className="h-[34px] px-2.5 bg-[#F8F7F4] border border-[#E5E3DE] rounded-lg flex items-center gap-1.5 text-[12px] font-medium text-[#5F5F67] hover:bg-[#F1F0ED] transition-colors">
            <Flag className="w-[13px] h-[13px]" />
            {filterPriority}
          </button>
        </div>

        {/* Add Task Button */}
        <button className="h-[34px] px-3 bg-[#2D5A3D] rounded-lg flex items-center gap-1.5 text-white text-[12px] font-semibold hover:bg-[#244a32] transition-colors">
          <Plus className="w-[13px] h-[13px]" />
          Add Task
        </button>
      </div>

      {/* Milestones */}
      <div className="flex flex-col gap-4">
        {milestonesList.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} onTaskClick={handleTaskClick} />
        ))}
      </div>

      {/* Task Detail Panel */}
      <TaskDetail
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        currentUser={{ initials: 'JD', color: 'bg-[#3B82F6] text-white' }}
        onAddComment={(taskId, content) => {
          console.log('Add comment to task', taskId, content);
        }}
        onAddSubtask={(taskId) => {
          console.log('Add subtask to task', taskId);
        }}
        onToggleSubtask={(taskId, subtaskId) => {
          console.log('Toggle subtask', taskId, subtaskId);
        }}
      />
    </div>
  );
}

export type { Milestone };
