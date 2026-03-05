import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { Project, ProjectUpdate, Proposal, Invoice } from '@/types/supabase';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Calendar,
  MessageSquare,
  Plus,
  FileText,
  FolderKanban,
  Clock,
  CheckCircle,
  ArrowRight,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-purple-100 text-purple-700',
  revision: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  in_discussion: 'bg-purple-100 text-purple-700',
  quoted: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  converted: 'bg-green-100 text-green-700',
};

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientData = useCallback(async () => {
    try {
      const [projectsRes, proposalsRes, invoicesRes] = await Promise.allSettled([
        supabase
          .from('projects')
          .select('*')
          .eq('client_id', user?.id)
          .order('updated_at', { ascending: false }),
        api.get<Proposal[]>('/api/proposals/mine'),
        api.get<Invoice[]>('/api/invoices'),
      ]);

      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        setProjects(projectsRes.value.data);

        const projectIds = projectsRes.value.data.map((p) => p.id);
        if (projectIds.length > 0) {
          const { data: updatesData } = await supabase
            .from('project_updates')
            .select('*')
            .in('project_id', projectIds)
            .order('created_at', { ascending: false })
            .limit(10);
          setUpdates(updatesData || []);
        }
      }

      if (proposalsRes.status === 'fulfilled') {
        setProposals(proposalsRes.value);
      }

      if (invoicesRes.status === 'fulfilled') {
        setInvoices(invoicesRes.value);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user) {
      return () => {};
    }

    const projectsSub = supabase
      .channel('client-projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `client_id=eq.${user.id}` },
        () => {
          fetchClientData();
          toast.info('Your project has been updated');
        },
      )
      .subscribe();

    const updatesSub = supabase
      .channel('client-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_updates' },
        () => {
          fetchClientData();
          toast.info('New project update available');
        },
      )
      .subscribe();

    return () => {
      projectsSub.unsubscribe();
      updatesSub.unsubscribe();
    };
  }, [user, fetchClientData]);

  useEffect(() => {
    if (!user) return;
    fetchClientData();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [user, fetchClientData, setupRealtimeSubscriptions]);

  const activeProjects = projects.filter((p) => !['completed', 'cancelled'].includes(p.status));
  const pendingInvoices = invoices.filter((i) => i.status === 'sent');
  const activeProposals = proposals.filter((p) => !['converted', 'rejected'].includes(p.status));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-admin-text-secondary mt-1">Here's an overview of your projects and proposals.</p>
          </div>
          <Link to="/client/proposals/templates">
            <Button className="bg-admin-primary hover:bg-admin-primary/90">
              <Plus size={16} className="mr-2" />
              New Proposal
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FolderKanban size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-text-primary">{activeProjects.length}</p>
                <p className="text-xs text-admin-text-muted">Active Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-text-primary">{activeProposals.length}</p>
                <p className="text-xs text-admin-text-muted">Active Proposals</p>
              </div>
            </div>
          </div>
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-text-primary">{pendingInvoices.length}</p>
                <p className="text-xs text-admin-text-muted">Pending Invoices</p>
              </div>
            </div>
          </div>
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {projects.filter((p) => p.status === 'completed').length}
                </p>
                <p className="text-xs text-admin-text-muted">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="bg-admin-bg border border-admin-border">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="proposals">My Proposals</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4 mt-4">
            {projects.length === 0 ? (
              <div className="text-center py-16 bg-admin-surface rounded-xl border border-admin-border">
                <FolderKanban className="h-12 w-12 mx-auto text-admin-text-muted mb-4" />
                <p className="text-admin-text-secondary">No projects yet. Submit a proposal to get started!</p>
                <Link to="/client/proposals/templates">
                  <Button variant="outline" className="mt-4">
                    <Plus size={16} className="mr-2" />
                    Submit Proposal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/client/projects/${project.id}`}
                    className="block bg-admin-surface border border-admin-border rounded-xl p-5 hover:shadow-md hover:border-admin-primary/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base font-semibold text-admin-text-primary">{project.name}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status] || STATUS_COLORS.planning}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-admin-text-secondary line-clamp-2 mb-4">{project.description}</p>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs text-admin-text-muted">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-admin-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Phase: {(project.current_phase || 'planning').replace('_', ' ')}
                      </span>
                      {project.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(project.start_date), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-4 mt-4">
            {proposals.length === 0 ? (
              <div className="text-center py-16 bg-admin-surface rounded-xl border border-admin-border">
                <FileText className="h-12 w-12 mx-auto text-admin-text-muted mb-4" />
                <p className="text-admin-text-secondary">No proposals yet.</p>
                <Link to="/client/proposals/templates">
                  <Button variant="outline" className="mt-4">
                    <Plus size={16} className="mr-2" />
                    Submit Your First Proposal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    to={`/client/proposals/${proposal.id}`}
                    className="flex items-center justify-between bg-admin-surface border border-admin-border rounded-xl p-4 hover:shadow-md hover:border-admin-primary/30 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-admin-text-primary">{proposal.title}</h3>
                      <p className="text-xs text-admin-text-muted mt-1">
                        Submitted {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PROPOSAL_STATUS_COLORS[proposal.status] || PROPOSAL_STATUS_COLORS.draft}`}>
                        {proposal.status.replace('_', ' ')}
                      </span>
                      <ArrowRight size={16} className="text-admin-text-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4 mt-4">
            {updates.length === 0 ? (
              <div className="text-center py-16 bg-admin-surface rounded-xl border border-admin-border">
                <MessageSquare className="h-12 w-12 mx-auto text-admin-text-muted mb-4" />
                <p className="text-admin-text-secondary">No updates yet. Check back later!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {updates.map((update) => {
                  const project = projects.find((p) => p.id === update.project_id);
                  return (
                    <div key={update.id} className="bg-admin-surface border border-admin-border rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-semibold text-admin-text-primary">{update.title}</h3>
                          <p className="text-xs text-admin-text-muted">
                            {project?.name} &middot; {format(new Date(update.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                      <p className="text-sm text-admin-text-secondary">{update.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4 mt-4">
            {invoices.length === 0 ? (
              <div className="text-center py-16 bg-admin-surface rounded-xl border border-admin-border">
                <CreditCard className="h-12 w-12 mx-auto text-admin-text-muted mb-4" />
                <p className="text-admin-text-secondary">No invoices yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-admin-surface border border-admin-border rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-semibold text-admin-text-primary">
                          {invoice.currency} {invoice.amount.toLocaleString()}
                        </h3>
                        <p className="text-xs text-admin-text-muted">{invoice.description || 'Invoice'}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'sent' ? 'bg-amber-100 text-amber-700' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    {invoice.due_date && (
                      <p className="text-xs text-admin-text-muted mt-2">
                        Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
