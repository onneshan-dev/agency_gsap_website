import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  MoreHorizontal,
  Edit3,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  Activity,
  FolderOpen,
  ListTodo
} from 'lucide-react';
import { ProjectOverview } from '@/components/project/ProjectOverview';
import { ProjectFiles } from '@/components/project/ProjectFiles';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { ProjectTasksTab } from '@/components/tasks';

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, count: 12 },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: Activity },
];

// Mock project data
const projectData = {
  id: '1',
  name: 'E-commerce Redesign',
  description: 'Complete overhaul of the online store UI/UX with modern design principles and improved user experience.',
  status: 'active',
  progress: 75,
  startDate: '2024-01-15',
  dueDate: '2024-03-15',
  budget: '$50,000',
  spent: '$37,500',
  priority: 'high',
  client: 'Acme Corp',
  tags: ['Design', 'Development', 'E-commerce'],
};

const ProjectDetailsPage: React.FC = () => {
  useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProjectOverview project={projectData} />;
      case 'tasks':
        return <ProjectTasksTab />;
      case 'files':
        return <ProjectFiles />;
      case 'team':
        return <ProjectTeam />;
      case 'timeline':
        return <ProjectTimeline />;
      default:
        return <ProjectOverview project={projectData} />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button & Breadcrumb */}
        <button
          onClick={() => navigate('/admin/projects')}
          className="flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        {/* Project Header */}
        <div className="bg-admin-surface rounded-xl border border-admin-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-admin-text-primary">{projectData.name}</h1>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full border',
                  projectData.status === 'active' && 'bg-emerald-100 text-emerald-700 border-emerald-200',
                  projectData.status === 'completed' && 'bg-blue-100 text-blue-700 border-blue-200',
                  projectData.status === 'pending' && 'bg-amber-100 text-amber-700 border-amber-200',
                )}>
                  {projectData.status.charAt(0).toUpperCase() + projectData.status.slice(1)}
                </span>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full border',
                  projectData.priority === 'high' && 'bg-red-100 text-red-700 border-red-200',
                  projectData.priority === 'medium' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                  projectData.priority === 'low' && 'bg-gray-100 text-gray-700 border-gray-200',
                )}>
                  {projectData.priority.charAt(0).toUpperCase() + projectData.priority.slice(1)} Priority
                </span>
              </div>
              
              <p className="text-sm text-admin-text-secondary">{projectData.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-admin-text-muted">
                  <Calendar size={14} />
                  <span>Due {new Date(projectData.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-admin-text-muted">
                  <Clock size={14} />
                  <span>{Math.ceil((new Date(projectData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-admin-text-muted">
                  <CheckCircle2 size={14} />
                  <span>{projectData.progress}% Complete</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {projectData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-admin-bg text-admin-text-secondary rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-admin-primary text-white text-sm font-medium rounded-lg hover:bg-admin-primary/90 transition-colors">
                <Edit3 size={16} />
                Edit Project
              </button>
              
              <button className="p-2 border border-admin-border rounded-lg text-admin-text-secondary hover:bg-admin-bg transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-admin-text-secondary">Project Progress</span>
              <span className="font-semibold text-admin-text-primary">{projectData.progress}%</span>
            </div>
            <div className="h-2.5 bg-admin-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-admin-primary to-admin-accent rounded-full transition-all duration-500"
                style={{ width: `${projectData.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-admin-border">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-admin-primary text-admin-primary'
                      : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary'
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                  {'count' in tab && (
                    <span className={cn(
                      'ml-1 px-2 py-0.5 text-[10px] font-semibold rounded-full',
                      isActive
                        ? 'bg-admin-primary text-white'
                        : 'bg-admin-bg text-admin-text-muted'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProjectDetailsPage;
