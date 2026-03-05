import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Project, Task } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  FolderKanban,
  ListChecks,
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isPast, isToday } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  planning: 'border-amber-200 bg-amber-50 text-amber-700',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  review: 'border-purple-200 bg-purple-50 text-purple-700',
  revision: 'border-orange-200 bg-orange-50 text-orange-700',
  on_hold: 'border-gray-200 bg-gray-50 text-gray-600',
  completed: 'border-green-200 bg-green-50 text-green-700',
  cancelled: 'border-red-200 bg-red-50 text-red-600',
};

const PHASE_LABELS: Record<string, string> = {
  requirements: 'Requirements',
  design: 'Design',
  development: 'Development',
  testing: 'Testing',
  review: 'Review',
  revision: 'Revision',
  delivery: 'Delivery',
  completed: 'Completed',
};

export default function TeamDashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const projectsData = await api.get<Project[]>('/api/projects');
      setProjects(projectsData);

      const tasksMap: Record<string, Task[]> = {};
      await Promise.all(
        projectsData.map(async (p) => {
          try {
            const tasks = await api.get<Task[]>(`/api/projects/${p.id}/tasks`);
            tasksMap[p.id] = tasks;
          } catch {
            tasksMap[p.id] = [];
          }
        }),
      );
      setTasksByProject(tasksMap);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  const allTasks = useMemo(
    () => Object.values(tasksByProject).flat(),
    [tasksByProject],
  );

  const stats = useMemo(() => ({
    totalProjects: projects.length,
    activeTasks: allTasks.filter((t) => t.status !== 'done').length,
    completedTasks: allTasks.filter((t) => t.status === 'done').length,
  }), [projects, allTasks]);

  const upcomingTasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.status !== 'done' && t.due_date)
        .sort(
          (a, b) =>
            new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
        )
        .slice(0, 8),
    [allTasks],
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-admin-text-muted" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-admin-text-primary">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Team Member'}
          </h1>
          <p className="mt-1 text-sm text-admin-text-muted">
            Here's what's happening across your assigned projects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={FolderKanban}
            label="Total Projects"
            value={stats.totalProjects}
            color="text-blue-600 bg-blue-50"
          />
          <StatCard
            icon={ListChecks}
            label="Active Tasks"
            value={stats.activeTasks}
            color="text-amber-600 bg-amber-50"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed Tasks"
            value={stats.completedTasks}
            color="text-green-600 bg-green-50"
          />
        </div>

        {/* Project Cards */}
        <section>
          <h2 className="text-base font-semibold text-admin-text-primary mb-4">
            Assigned Projects
          </h2>
          {projects.length === 0 ? (
            <Card className="border-admin-border bg-admin-surface">
              <CardContent className="py-12 text-center">
                <FolderKanban className="h-10 w-10 mx-auto text-admin-text-muted/40 mb-3" />
                <p className="text-sm text-admin-text-muted">
                  No projects assigned yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => {
                const projectTasks = tasksByProject[project.id] || [];
                const done = projectTasks.filter((t) => t.status === 'done').length;
                const total = projectTasks.length;

                return (
                  <Link
                    key={project.id}
                    to={`/team/projects/${project.id}`}
                    className="group"
                  >
                    <Card className="border-admin-border bg-admin-surface hover:border-admin-primary/30 transition-colors h-full">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-admin-text-primary group-hover:text-admin-primary transition-colors line-clamp-1">
                            {project.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${STATUS_BADGE[project.status] || ''}`}
                          >
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        {project.description && (
                          <p className="text-xs text-admin-text-muted line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-admin-text-muted">Progress</span>
                            <span className="font-medium text-admin-text-secondary">
                              {project.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-admin-bg rounded-full overflow-hidden">
                            <div
                              className="h-full bg-admin-primary rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer meta */}
                        <div className="flex items-center justify-between pt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] border-admin-border text-admin-text-muted"
                          >
                            {PHASE_LABELS[project.current_phase] || project.current_phase}
                          </Badge>
                          <span className="text-[11px] text-admin-text-muted">
                            {done}/{total} tasks done
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-admin-text-primary mb-4">
              Upcoming Tasks
            </h2>
            <Card className="border-admin-border bg-admin-surface overflow-hidden">
              <div className="divide-y divide-admin-border">
                {upcomingTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  const due = new Date(task.due_date!);
                  const overdue = isPast(due) && !isToday(due);

                  return (
                    <Link
                      key={task.id}
                      to={`/team/projects/${task.project_id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-admin-bg/50 transition-colors"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          task.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-admin-bg text-admin-text-muted'
                        }`}
                      >
                        {task.status === 'in_progress' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <ListChecks className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-admin-text-primary truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-admin-text-muted truncate">
                          {project?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`flex items-center gap-1 text-[11px] ${
                            overdue
                              ? 'text-red-600 font-medium'
                              : 'text-admin-text-muted'
                          }`}
                        >
                          <CalendarDays className="h-3 w-3" />
                          {format(due, 'MMM d')}
                        </span>
                        <PriorityDot priority={task.priority} />
                        <ArrowRight className="h-3.5 w-3.5 text-admin-text-muted" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="border-admin-border bg-admin-surface">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-admin-text-primary">{value}</p>
          <p className="text-xs text-admin-text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const cls =
    priority === 'high'
      ? 'bg-red-500'
      : priority === 'medium'
      ? 'bg-amber-400'
      : 'bg-gray-300';
  return <span className={`h-2 w-2 rounded-full ${cls}`} title={priority} />;
}
