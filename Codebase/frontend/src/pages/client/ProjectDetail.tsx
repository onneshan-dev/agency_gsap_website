import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { api } from '@/lib/api';
import type {
  Project,
  Task,
  Milestone,
  Deliverable,
  Invoice,
  Profile,
  ProjectTeamMember,
} from '@/types/supabase';
import { ChatPanel } from '@/components/chat/ChatPanel';
import MilestoneTimeline from '@/components/milestones/MilestoneTimeline';
import RevisionList from '@/components/revisions/RevisionList';
import RevisionRequest from '@/components/revisions/RevisionRequest';
import InvoiceView from '@/components/payments/InvoiceView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  LayoutDashboard,
  ListChecks,
  Package,
  Users,
  MessageSquare,
  Receipt,
  RotateCcw,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

/* ───────────── Project Phases ───────────── */
const PHASES = [
  'requirements',
  'design',
  'development',
  'testing',
  'review',
  'revision',
  'delivery',
  'completed',
] as const;

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

/* ───────────── Status colors ───────────── */
const STATUS_BADGE: Record<string, string> = {
  planning: 'border-amber-200 bg-amber-50 text-amber-700',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  review: 'border-purple-200 bg-purple-50 text-purple-700',
  revision: 'border-orange-200 bg-orange-50 text-orange-700',
  on_hold: 'border-gray-200 bg-gray-50 text-gray-600',
  completed: 'border-green-200 bg-green-50 text-green-700',
  cancelled: 'border-red-200 bg-red-50 text-red-600',
};

const TASK_STATUS_STYLE: Record<string, string> = {
  todo: 'text-admin-text-muted',
  in_progress: 'text-blue-600',
  done: 'text-green-600',
};

const TASK_STATUS_ICON: Record<string, React.ElementType> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const PRIORITY_BADGE: Record<string, string> = {
  high: 'border-red-200 bg-red-50 text-red-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-gray-200 bg-gray-50 text-gray-600',
};

const DELIVERABLE_STATUS: Record<string, string> = {
  uploaded: 'border-blue-200 bg-blue-50 text-blue-700',
  under_review: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-green-200 bg-green-50 text-green-700',
  revision_requested: 'border-red-200 bg-red-50 text-red-700',
};

/* ───────────── Team member with profile ───────────── */
interface TeamMemberWithProfile extends ProjectTeamMember {
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'designation'>;
}

/* ───────────── Main Component ───────────── */
export default function ClientProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithProfile[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingDeliverableId, setUpdatingDeliverableId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [proj, t, m, d, inv, team] = await Promise.all([
        api.get<Project>(`/api/projects/${id}`),
        api.get<Task[]>(`/api/projects/${id}/tasks`),
        api.get<Milestone[]>(`/api/projects/${id}/milestones`),
        api.get<Deliverable[]>(`/api/projects/${id}/deliverables`),
        api.get<Invoice[]>(`/api/projects/${id}/invoices`),
        api.get<TeamMemberWithProfile[]>(`/api/projects/${id}/team`),
      ]);
      setProject(proj);
      setTasks(t);
      setMilestones(m);
      setDeliverables(d);
      setInvoices(inv);
      setTeamMembers(team);

      try {
        const conv = await api.get<{ id: string }>(
          `/api/chat/conversations?project_id=${id}`,
        );
        setConversationId(conv.id ?? null);
      } catch {
        setConversationId(null);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDeliverableAction(
    deliverableId: string,
    status: 'approved' | 'revision_requested',
  ) {
    setUpdatingDeliverableId(deliverableId);
    try {
      await api.patch(`/api/projects/${id}/deliverables/${deliverableId}`, {
        status,
      });
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? { ...d, status } : d)),
      );
      toast.success(
        status === 'approved'
          ? 'Deliverable approved'
          : 'Revision requested',
      );
    } catch {
      toast.error('Failed to update deliverable');
    } finally {
      setUpdatingDeliverableId(null);
    }
  }

  function getInitials(name?: string | null) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  if (isLoading || !project) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-admin-text-muted" />
        </div>
      </AdminLayout>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/client/dashboard')}
          className="flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Project Header */}
        <div className="bg-admin-surface rounded-xl border border-admin-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-admin-text-primary truncate">
                  {project.name}
                </h1>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[11px] ${STATUS_BADGE[project.status] || ''}`}
                >
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              {project.description && (
                <p className="text-sm text-admin-text-secondary line-clamp-3">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Phase Stepper */}
          <div className="mt-6 overflow-x-auto">
            <div className="flex items-center gap-0 min-w-max">
              {PHASES.map((phase, i) => {
                const phaseIdx = PHASES.indexOf(project.current_phase as typeof phase);
                const isCompleted = i < phaseIdx;
                const isCurrent = i === phaseIdx;

                return (
                  <div key={phase} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isCurrent
                            ? 'bg-admin-primary border-admin-primary text-white'
                            : 'border-admin-border bg-admin-bg text-admin-text-muted'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-[10px] whitespace-nowrap ${
                          isCurrent
                            ? 'font-semibold text-admin-primary'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-admin-text-muted'
                        }`}
                      >
                        {PHASE_LABELS[phase]}
                      </span>
                    </div>
                    {i < PHASES.length - 1 && (
                      <div
                        className={`h-0.5 w-8 sm:w-12 mx-1 ${
                          isCompleted ? 'bg-green-400' : 'bg-admin-border'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-admin-text-muted">Overall Progress</span>
              <span className="font-semibold text-admin-text-primary">
                {project.progress}%
              </span>
            </div>
            <div className="h-2 bg-admin-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-admin-primary rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-admin-text-muted">
            {project.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Start: {format(new Date(project.start_date), 'MMM d, yyyy')}
              </span>
            )}
            {project.end_date && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                End: {format(new Date(project.end_date), 'MMM d, yyyy')}
              </span>
            )}
            {project.budget != null && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Budget: ${project.budget.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-admin-surface border border-admin-border flex-wrap h-auto gap-0.5 p-1">
            <TabsTrigger value="overview" className="text-xs">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">
              <ListChecks className="h-3.5 w-3.5 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="text-xs">
              <Package className="h-3.5 w-3.5 mr-1" />
              Deliverables
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs">
              <Users className="h-3.5 w-3.5 mr-1" />
              Team
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">
              <Receipt className="h-3.5 w-3.5 mr-1" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="revisions" className="text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Revisions
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ─────────────────────────────── */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <OverviewStat
                label="Tasks"
                value={tasks.length}
                sub={`${doneTasks.length} completed`}
                icon={ListChecks}
              />
              <OverviewStat
                label="Milestones"
                value={milestones.length}
                sub={`${milestones.filter((m) => m.status === 'completed').length} completed`}
                icon={Calendar}
              />
              <OverviewStat
                label="Deliverables"
                value={deliverables.length}
                sub={`${deliverables.filter((d) => d.status === 'approved').length} approved`}
                icon={Package}
              />
              <OverviewStat
                label="Invoices"
                value={invoices.length}
                sub={`${invoices.filter((i) => i.status === 'paid').length} paid`}
                icon={Receipt}
              />
            </div>
          </TabsContent>

          {/* ── Tasks (read-only, grouped) ─────────── */}
          <TabsContent value="tasks" className="mt-6 space-y-6">
            {tasks.length === 0 ? (
              <EmptyState icon={ListChecks} message="No tasks yet." />
            ) : (
              <>
                <TaskGroup label="In Progress" tasks={inProgressTasks} teamMembers={teamMembers} getInitials={getInitials} />
                <TaskGroup label="To Do" tasks={todoTasks} teamMembers={teamMembers} getInitials={getInitials} />
                <TaskGroup label="Done" tasks={doneTasks} teamMembers={teamMembers} getInitials={getInitials} />
              </>
            )}
          </TabsContent>

          {/* ── Milestones ──────────────────────────── */}
          <TabsContent value="milestones" className="mt-6">
            <Card className="border-admin-border bg-admin-surface">
              <CardContent className="p-5">
                <MilestoneTimeline milestones={milestones} isAdmin={false} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Deliverables ────────────────────────── */}
          <TabsContent value="deliverables" className="mt-6">
            {deliverables.length === 0 ? (
              <EmptyState icon={Package} message="No deliverables yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliverables.map((d) => (
                  <Card key={d.id} className="border-admin-border bg-admin-surface">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-admin-text-primary truncate">
                            {d.title}
                          </p>
                          {d.description && (
                            <p className="text-xs text-admin-text-muted mt-0.5 line-clamp-2">
                              {d.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] shrink-0 ${
                            DELIVERABLE_STATUS[d.status] || ''
                          }`}
                        >
                          {d.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-admin-text-muted">
                        <span className="capitalize">{d.type}</span>
                        <span>·</span>
                        <span>{format(new Date(d.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      {/* Links */}
                      <div className="flex items-center gap-3">
                        {d.type === 'file' && d.file_url && (
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-admin-primary hover:underline"
                          >
                            <Download className="h-3 w-3" />
                            {d.file_name || 'Download'}
                          </a>
                        )}
                        {d.type === 'link' && d.external_url && (
                          <a
                            href={d.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-admin-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open Link
                          </a>
                        )}
                      </div>

                      {/* Client Actions */}
                      {d.status !== 'approved' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-admin-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50"
                            disabled={updatingDeliverableId === d.id}
                            onClick={() =>
                              handleDeliverableAction(d.id, 'approved')
                            }
                          >
                            {updatingDeliverableId === d.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <ThumbsUp className="h-3 w-3 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                            disabled={updatingDeliverableId === d.id}
                            onClick={() =>
                              handleDeliverableAction(d.id, 'revision_requested')
                            }
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Request Revision
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Team ────────────────────────────────── */}
          <TabsContent value="team" className="mt-6">
            {teamMembers.length === 0 ? (
              <EmptyState icon={Users} message="No team members assigned." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((tm) => (
                  <Card key={tm.id} className="border-admin-border bg-admin-surface">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarImage
                            src={tm.profile?.avatar_url ?? undefined}
                          />
                          <AvatarFallback className="bg-admin-bg text-admin-text-secondary text-sm font-medium">
                            {getInitials(tm.profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-admin-text-primary truncate">
                            {tm.profile?.full_name || 'Team Member'}
                          </p>
                          {tm.profile?.designation && (
                            <p className="text-xs text-admin-text-muted truncate">
                              {tm.profile.designation}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-admin-border">
                        <Badge
                          variant="outline"
                          className="text-[10px] border-admin-border text-admin-text-secondary"
                        >
                          {tm.role_in_project || 'Member'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Chat ────────────────────────────────── */}
          <TabsContent value="chat" className="mt-6">
            <Card className="border-admin-border bg-admin-surface overflow-hidden">
              <div className="h-[500px]">
                <ChatPanel conversationId={conversationId} projectId={id} />
              </div>
            </Card>
          </TabsContent>

          {/* ── Payments ────────────────────────────── */}
          <TabsContent value="payments" className="mt-6 space-y-4">
            {invoices.length === 0 ? (
              <EmptyState icon={Receipt} message="No invoices yet." />
            ) : (
              invoices.map((invoice) => (
                <InvoiceView key={invoice.id} invoice={invoice} isAdmin={false} />
              ))
            )}
          </TabsContent>

          {/* ── Revisions ───────────────────────────── */}
          <TabsContent value="revisions" className="mt-6 space-y-6">
            <Card className="border-admin-border bg-admin-surface">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-admin-text-primary mb-4">
                  Request a Revision
                </h3>
                <RevisionRequest
                  projectId={id!}
                  onSubmitted={fetchData}
                />
              </CardContent>
            </Card>

            <Card className="border-admin-border bg-admin-surface">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-admin-text-primary mb-4">
                  Revision History
                </h3>
                <RevisionList projectId={id!} isAdmin={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

/* ───────────── Sub-components ───────────── */

function OverviewStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-admin-border bg-admin-surface">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-admin-bg text-admin-text-secondary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-admin-text-primary">{value}</p>
          <p className="text-xs text-admin-text-muted">
            {label} · {sub}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskGroup({
  label,
  tasks,
  teamMembers,
  getInitials,
}: {
  label: string;
  tasks: Task[];
  teamMembers: TeamMemberWithProfile[];
  getInitials: (name?: string | null) => string;
}) {
  if (tasks.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-admin-text-primary mb-3">
        {label} ({tasks.length})
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => {
          const Icon = TASK_STATUS_ICON[task.status] || Circle;
          const iconStyle = TASK_STATUS_STYLE[task.status] || '';
          const assignee = teamMembers.find(
            (m) => m.user_id === task.assigned_to,
          );

          return (
            <Card key={task.id} className="border-admin-border bg-admin-surface">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`shrink-0 ${iconStyle}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-admin-text-primary truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-admin-text-muted">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {assignee?.profile && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={assignee.profile.avatar_url ?? undefined}
                      />
                      <AvatarFallback className="text-[9px] bg-admin-bg text-admin-text-muted">
                        {getInitials(assignee.profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${PRIORITY_BADGE[task.priority] || ''}`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <Card className="border-admin-border bg-admin-surface">
      <CardContent className="py-12 text-center">
        <Icon className="h-10 w-10 mx-auto text-admin-text-muted/40 mb-3" />
        <p className="text-sm text-admin-text-muted">{message}</p>
      </CardContent>
    </Card>
  );
}
