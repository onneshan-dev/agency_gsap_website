import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Plus, Search, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ProjectsFilterBar,
  ProjectsTable,
  MobileProjectCard,
  ProjectKPICards,
  ProjectFilterTabs,
} from '@/components/projects';
import type { Project, KPICard, FilterTab } from '@/components/projects';

// Mock data for projects
const projectsData: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Website',
    type: 'Web Development',
    badgeColor: 'bg-[#DBEAFE]',
    badgeTextColor: 'text-[#1D4ED8]',
    client: 'Tech Corp',
    status: 'in_progress',
    progress: 75,
    budget: '$45,000',
    dueDate: 'Mar 15, 2025',
    team: [
      { id: '1', initials: 'SJ', color: 'bg-[#2D5A3D]' },
      { id: '2', initials: 'JS', color: 'bg-[#3B82F6]' },
      { id: '3', initials: 'MD', color: 'bg-[#C76F30]' },
    ],
  },
  {
    id: '2',
    name: 'Mobile App Development',
    type: 'Mobile Development',
    badgeColor: 'bg-[#DCFCE7]',
    badgeTextColor: 'text-[#16A34A]',
    client: 'Finance Plus',
    status: 'completed',
    progress: 100,
    budget: '$89,200',
    dueDate: 'Feb 28, 2025',
    team: [
      { id: '4', initials: 'SW', color: 'bg-[#7C3AED]' },
      { id: '5', initials: 'TB', color: 'bg-[#059669]' },
    ],
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    type: 'Marketing',
    badgeColor: 'bg-[#FEF3C7]',
    badgeTextColor: 'text-[#B45309]',
    client: 'Creative Co',
    status: 'pending',
    progress: 45,
    budget: '$25,000',
    dueDate: 'Apr 01, 2025',
    team: [
      { id: '6', initials: 'ED', color: 'bg-[#DC2626]' },
    ],
  },
  {
    id: '4',
    name: 'Analytics Dashboard',
    type: 'Data Analytics',
    badgeColor: 'bg-[#F3E8FF]',
    badgeTextColor: 'text-[#7C3AED]',
    client: 'Analytics Pro',
    status: 'in_progress',
    progress: 60,
    budget: '$35,000',
    dueDate: 'Mar 22, 2025',
    team: [
      { id: '7', initials: 'AC', color: 'bg-[#2563EB]' },
      { id: '8', initials: 'LW', color: 'bg-[#0891B2]' },
      { id: '9', initials: 'RK', color: 'bg-[#EA580C]' },
    ],
  },
  {
    id: '5',
    name: 'Payment Gateway Integration',
    type: 'Backend Development',
    badgeColor: 'bg-[#F3F4F6]',
    badgeTextColor: 'text-[#6B7280]',
    client: 'SecurePay Inc',
    status: 'on_hold',
    progress: 30,
    budget: '$55,000',
    dueDate: 'Apr 10, 2025',
    team: [
      { id: '10', initials: 'MJ', color: 'bg-[#4B5563]' },
    ],
  },
];

// KPI data for mobile
const kpiData: KPICard[] = [
  {
    id: '1',
    value: 12,
    label: 'In Progress',
    icon: 'loader',
    bgColor: 'bg-[#DBEAFE]',
    iconColor: 'text-[#2563EB]',
  },
  {
    id: '2',
    value: 8,
    label: 'Completed',
    icon: 'circle-check',
    bgColor: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
  },
  {
    id: '3',
    value: 4,
    label: 'Pending',
    icon: 'triangle-alert',
    bgColor: 'bg-[#FEF3C7]',
    iconColor: 'text-[#B45309]',
  },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const handleProjectClick = (projectId: string) => {
    navigate(`/admin/projects/${projectId}`);
  };

  // Filter projects based on active tab
  const filteredProjects = projectsData.filter((project) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return project.status === 'in_progress';
    if (activeTab === 'completed') return project.status === 'completed';
    if (activeTab === 'pending') return project.status === 'pending';
    return true;
  });

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] pb-20">
        {/* Mobile AppBar */}
        <div className="h-[52px] bg-white border-b border-[#E5E3DE] px-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-[#F8F7F4] rounded-lg flex items-center justify-center">
              <Menu className="w-5 h-5 text-[#1A1A1E]" />
            </button>
            <span className="text-lg font-semibold text-[#1A1A1E]">Projects</span>
          </div>
          <button className="w-8 h-8 bg-[#2D5A3D] rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Mobile Content */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-[22px] font-bold text-[#1A1A1E]">Projects</h1>
              <p className="text-[13px] text-[#9A9AA0]">24 total · 12 active</p>
            </div>
            <button className="h-8 px-3.5 bg-[#2D5A3D] rounded-lg flex items-center gap-1.5 text-white text-[13px] font-semibold">
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          {/* KPI Cards */}
          <ProjectKPICards cards={kpiData} />

          {/* Search Bar */}
          <div className="h-[42px] bg-white border border-[#E5E3DE] rounded-[10px] px-3.5 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9A9AA0]" />
            <input
              type="text"
              placeholder="Search projects…"
              className="flex-1 bg-transparent text-sm text-[#1A1A1E] placeholder:text-[#9A9AA0] outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <ProjectFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Project Cards */}
          <div className="flex flex-col gap-3">
            {filteredProjects.map((project) => (
              <MobileProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                type={project.type}
                badgeColor={project.badgeColor}
                badgeTextColor={project.badgeTextColor}
                status={project.status}
                progress={project.progress}
                client={project.client}
                dueDate={project.dueDate}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-bold text-[#1A1A1E]">Projects</h1>
            <p className="text-[13px] text-[#9A9AA0]">24 total · 12 active</p>
          </div>
          <button className="h-9 px-4 bg-[#2D5A3D] rounded-lg flex items-center gap-1.5 text-white text-[13px] font-medium hover:bg-[#244a32] transition-colors">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Filter Bar */}
        <ProjectsFilterBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Projects Table */}
        <ProjectsTable projects={projectsData} onProjectClick={handleProjectClick} />
      </div>
    </AdminLayout>
  );
}
