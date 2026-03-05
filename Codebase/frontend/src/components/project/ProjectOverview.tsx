import React from 'react';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  Calendar, 
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ProjectOverviewProps {
  project: {
    budget: string;
    spent: string;
    client: string;
    startDate: string;
    dueDate: string;
  };
}

const taskData = [
  { name: 'Completed', value: 45, color: '#2D5A3D' },
  { name: 'In Progress', value: 15, color: '#C76F30' },
  { name: 'Pending', value: 10, color: '#9A9AA0' },
];

const weeklyProgress = [
  { day: 'Mon', completed: 8, added: 3 },
  { day: 'Tue', completed: 12, added: 5 },
  { day: 'Wed', completed: 7, added: 2 },
  { day: 'Thu', completed: 15, added: 4 },
  { day: 'Fri', completed: 10, added: 3 },
  { day: 'Sat', completed: 5, added: 1 },
  { day: 'Sun', completed: 3, added: 0 },
];

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  const budgetPercent = Math.round((parseInt(project.spent.replace(/[^0-9]/g, '')) / parseInt(project.budget.replace(/[^0-9]/g, ''))) * 100);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-admin-surface rounded-xl p-4 border border-admin-border">
            <div className="flex items-center gap-2 text-admin-text-muted mb-1">
              <CheckCircle2 size={14} />
              <span className="text-xs font-medium">Tasks Done</span>
            </div>
            <p className="text-xl font-bold text-admin-text-primary">45/70</p>
          </div>

          <div className="bg-admin-surface rounded-xl p-4 border border-admin-border">
            <div className="flex items-center gap-2 text-admin-text-muted mb-1">
              <Clock size={14} />
              <span className="text-xs font-medium">Hours Logged</span>
            </div>
            <p className="text-xl font-bold text-admin-text-primary">324h</p>
          </div>

          <div className="bg-admin-surface rounded-xl p-4 border border-admin-border">
            <div className="flex items-center gap-2 text-admin-text-muted mb-1">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">Efficiency</span>
            </div>
            <p className="text-xl font-bold text-admin-text-primary">94%</p>
          </div>

          <div className="bg-admin-surface rounded-xl p-4 border border-admin-border">
            <div className="flex items-center gap-2 text-admin-text-muted mb-1">
              <AlertCircle size={14} />
              <span className="text-xs font-medium">Issues</span>
            </div>
            <p className="text-xl font-bold text-admin-text-primary">3</p>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-admin-surface rounded-xl p-5 border border-admin-border">
          <h3 className="text-sm font-semibold text-admin-text-primary mb-4">Weekly Activity</h3>
          
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DE" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9A9AA0', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9A9AA0', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E3DE',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="completed" fill="#2D5A3D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="added" fill="#C76F30" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-admin-surface rounded-xl p-5 border border-admin-border">
          <h3 className="text-sm font-semibold text-admin-text-primary mb-4">Recent Updates</h3>
          
          <div className="space-y-4">
            {[
              { date: 'Today', message: 'Design mockups approved by client', user: 'John Doe' },
              { date: 'Yesterday', message: 'Completed homepage redesign', user: 'Jane Smith' },
              { date: '2 days ago', message: 'Started mobile responsive implementation', user: 'Mike Johnson' },
              { date: '3 days ago', message: 'Weekly team sync completed', user: 'Sarah Wilson' },
            ].map((update, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-admin-accent mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-admin-text-primary">{update.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-admin-text-muted">{update.user}</span>
                    <span className="text-xs text-admin-text-muted">•</span>
                    <span className="text-xs text-admin-text-muted">{update.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Project Details */}
        <div className="bg-admin-surface rounded-xl p-5 border border-admin-border">
          <h3 className="text-sm font-semibold text-admin-text-primary mb-4">Project Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-admin-text-muted mt-0.5" />
              <div>
                <p className="text-xs text-admin-text-muted">Client</p>
                <p className="text-sm font-medium text-admin-text-primary">{project.client}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign size={16} className="text-admin-text-muted mt-0.5" />
              <div>
                <p className="text-xs text-admin-text-muted">Budget</p>
                <p className="text-sm font-medium text-admin-text-primary">{project.budget}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-admin-text-muted mt-0.5" />
              <div>
                <p className="text-xs text-admin-text-muted">Timeline</p>
                <p className="text-sm font-medium text-admin-text-primary">
                  {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-admin-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-admin-text-secondary">Budget Usage</span>
              <span className="font-medium text-admin-text-primary">{budgetPercent}%</span>
            </div>
            <div className="h-2 bg-admin-bg rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 75 ? 'bg-admin-accent' : 'bg-admin-primary'
                )}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <p className="text-xs text-admin-text-muted mt-2">{project.spent} of {project.budget} used</p>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-admin-surface rounded-xl p-5 border border-admin-border">
          <h3 className="text-sm font-semibold text-admin-text-primary mb-4">Task Distribution</h3>
          
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E3DE',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-2">
            {taskData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-admin-text-secondary">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-admin-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
