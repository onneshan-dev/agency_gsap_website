import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Project, Task, Milestone, Deliverable } from '@/types/supabase';
import { ChatPanel } from '@/components/chat/ChatPanel';
import MilestoneTimeline from '@/components/milestones/MilestoneTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  FileUp,
  ExternalLink,
  Download,
  ListChecks,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type TaskStatus = Task['status'];

const STATUS_BADGE: Record<string, string> = {
  planning: 'border-amber-200 bg-amber-50 text-amber-700',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  review: 'border-purple-200 bg-purple-50 text-purple-700',
  revision: 'border-orange-200 bg-orange-50 text-orange-700',
  on_hold: 'border-gray-200 bg-gray-50 text-gray-600',
  completed: 'border-green-200 bg-green-50 text-green-700',
  cancelled: 'border-red-200 bg-red-50 text-red-600',
};

const TASK_STATUS_ICON: Record<TaskStatus, React.ElementType> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
  todo: 'text-admin-text-muted',
  in_progress: 'text-blue-600',
  done: 'text-green-600',
};

const DELIVERABLE_STATUS: Record<string, string> = {
  uploaded: 'border-blue-200 bg-blue-50 text-blue-700',
  under_review: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-green-200 bg-green-50 text-green-700',
  revision_requested: 'border-red-200 bg-red-50 text-red-700',
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

export default function TeamProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'file' as 'file' | 'link',
    external_url: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [proj, t, m, d] = await Promise.all([
        api.get<Project>(`/api/projects/${id}`),
        api.get<Task[]>(`/api/projects/${id}/tasks`),
        api.get<Milestone[]>(`/api/projects/${id}/milestones`),
        api.get<Deliverable[]>(`/api/projects/${id}/deliverables`),
      ]);
      setProject(proj);
      setTasks(t);
      setMilestones(m);
      setDeliverables(d);

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

  async function handleTaskStatusChange(taskId: string, status: TaskStatus) {
    setUpdatingTaskId(taskId);
    try {
      await api.patch(`/api/projects/${id}/tasks/${taskId}`, { status });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
      );
      toast.success(`Task marked as ${status.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleUploadDeliverable(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setIsUploading(true);

    try {
      let file_url: string | undefined;
      let file_name: string | undefined;

      if (uploadForm.type === 'file' && uploadFile) {
        const fd = new FormData();
        fd.append('file', uploadFile);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`,
          { method: 'POST', body: fd },
        );
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        file_url = data.url;
        file_name = uploadFile.name;
      }

      await api.post(`/api/projects/${id}/deliverables`, {
        title: uploadForm.title,
        description: uploadForm.description || undefined,
        type: uploadForm.type,
        ...(uploadForm.type === 'file'
          ? { file_url, file_name }
          : { external_url: uploadForm.external_url }),
      });

      toast.success('Deliverable uploaded');
      setUploadDialogOpen(false);
      setUploadForm({ title: '', description: '', type: 'file', external_url: '' });
      setUploadFile(null);
      const updated = await api.get<Deliverable[]>(`/api/projects/${id}/deliverables`);
      setDeliverables(updated);
    } catch {
      toast.error('Failed to upload deliverable');
    } finally {
      setIsUploading(false);
    }
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

  const myTasks = tasks.filter((t) => t.assigned_to === user?.id);
  const otherTasks = tasks.filter((t) => t.assigned_to !== user?.id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/team/dashboard')}
          className="flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Header */}
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
                <p className="text-sm text-admin-text-secondary line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-admin-text-muted">
                {project.current_phase && (
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard size={13} />
                    Phase: {PHASE_LABELS[project.current_phase] || project.current_phase}
                  </span>
                )}
                {project.start_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    Started {format(new Date(project.start_date), 'MMM d, yyyy')}
                  </span>
                )}
                {project.end_date && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    Due {format(new Date(project.end_date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-admin-text-muted">Progress</span>
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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-admin-surface border border-admin-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Info */}
              <Card className="lg:col-span-1 border-admin-border bg-admin-surface">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-admin-text-primary">
                    Project Info
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <InfoRow label="Status" value={project.status.replace('_', ' ')} />
                    <InfoRow
                      label="Phase"
                      value={PHASE_LABELS[project.current_phase] || project.current_phase}
                    />
                    <InfoRow label="Progress" value={`${project.progress}%`} />
                    {project.start_date && (
                      <InfoRow
                        label="Start Date"
                        value={format(new Date(project.start_date), 'MMM d, yyyy')}
                      />
                    )}
                    {project.end_date && (
                      <InfoRow
                        label="End Date"
                        value={format(new Date(project.end_date), 'MMM d, yyyy')}
                      />
                    )}
                    {project.budget != null && (
                      <InfoRow
                        label="Budget"
                        value={`$${project.budget.toLocaleString()}`}
                      />
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card className="lg:col-span-2 border-admin-border bg-admin-surface">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-admin-text-primary mb-4">
                    Milestones
                  </h3>
                  <MilestoneTimeline milestones={milestones} isAdmin={false} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks" className="mt-6 space-y-6">
            {/* My Tasks */}
            <section>
              <h3 className="text-sm font-semibold text-admin-text-primary mb-3">
                My Tasks ({myTasks.length})
              </h3>
              {myTasks.length === 0 ? (
                <EmptyState icon={ListChecks} message="No tasks assigned to you." />
              ) : (
                <div className="space-y-2">
                  {myTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      editable
                      updating={updatingTaskId === task.id}
                      onStatusChange={(s) => handleTaskStatusChange(task.id, s)}
                    />
                  ))}
                </div>
              )}
            </section>

            {otherTasks.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-admin-text-primary mb-3">
                  Other Tasks ({otherTasks.length})
                </h3>
                <div className="space-y-2">
                  {otherTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Deliverables */}
          <TabsContent value="deliverables" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-admin-text-primary">
                Deliverables ({deliverables.length})
              </h3>
              <Button
                size="sm"
                onClick={() => setUploadDialogOpen(true)}
                className="bg-admin-primary hover:bg-admin-primary/90 text-white"
              >
                <FileUp className="h-4 w-4 mr-1.5" />
                Upload Deliverable
              </Button>
            </div>

            {deliverables.length === 0 ? (
              <EmptyState icon={Package} message="No deliverables yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliverables.map((d) => (
                  <Card key={d.id} className="border-admin-border bg-admin-surface">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-admin-text-primary truncate">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Deliverable</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUploadDeliverable} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-admin-text-primary">Title</Label>
                    <Input
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                      placeholder="Deliverable title"
                      className="border-admin-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-admin-text-primary">
                      Description (optional)
                    </Label>
                    <Textarea
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Brief description..."
                      className="border-admin-border min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-admin-text-primary">Type</Label>
                    <Select
                      value={uploadForm.type}
                      onValueChange={(v: 'file' | 'link') =>
                        setUploadForm((f) => ({ ...f, type: v }))
                      }
                    >
                      <SelectTrigger className="border-admin-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="file">File Upload</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {uploadForm.type === 'file' ? (
                    <div className="space-y-2">
                      <Label className="text-sm text-admin-text-primary">File</Label>
                      <input
                        ref={fileRef}
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-admin-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-admin-bg file:text-admin-text-primary hover:file:bg-admin-border"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm text-admin-text-primary">URL</Label>
                      <Input
                        value={uploadForm.external_url}
                        onChange={(e) =>
                          setUploadForm((f) => ({ ...f, external_url: e.target.value }))
                        }
                        placeholder="https://..."
                        className="border-admin-border"
                      />
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUploading || !uploadForm.title}
                      className="bg-admin-primary hover:bg-admin-primary/90 text-white"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <FileUp className="h-4 w-4 mr-1.5" />
                      )}
                      Upload
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Chat */}
          <TabsContent value="chat" className="mt-6">
            <Card className="border-admin-border bg-admin-surface overflow-hidden">
              <div className="h-[500px]">
                <ChatPanel
                  conversationId={conversationId}
                  projectId={id}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function TaskRow({
  task,
  editable = false,
  updating = false,
  onStatusChange,
}: {
  task: Task;
  editable?: boolean;
  updating?: boolean;
  onStatusChange?: (status: TaskStatus) => void;
}) {
  const Icon = TASK_STATUS_ICON[task.status];
  const iconStyle = TASK_STATUS_STYLE[task.status];

  return (
    <Card className="border-admin-border bg-admin-surface">
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
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        {editable && onStatusChange ? (
          <Select
            value={task.status}
            onValueChange={(v: TaskStatus) => onStatusChange(v)}
            disabled={updating}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs border-admin-border">
              {updating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge
            variant="outline"
            className={`text-[10px] ${
              task.status === 'done'
                ? 'border-green-200 bg-green-50 text-green-700'
                : task.status === 'in_progress'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-admin-border text-admin-text-muted'
            }`}
          >
            {task.status.replace('_', ' ')}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === 'high'
      ? 'text-red-600'
      : priority === 'medium'
      ? 'text-amber-600'
      : 'text-admin-text-muted';
  return <span className={`capitalize ${cls}`}>{priority}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-admin-text-muted">{label}</dt>
      <dd className="font-medium text-admin-text-primary capitalize">{value}</dd>
    </div>
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
