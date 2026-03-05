import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SLAStatusBadge } from './SLAIndicator';

interface AtRiskProposal {
  proposal_id: string;
  status: string;
  hours_in_status: number;
  sla_target_hours: number;
  sla_status: 'warning' | 'breached';
  hours_remaining: number;
  proposals: {
    id: string;
    title: string;
    client_id: string;
    status: string;
    client: {
      full_name: string;
      email: string;
    };
  };
}

interface ProposalsAtRiskProps {
  className?: string;
  limit?: number;
}

export function ProposalsAtRisk({ className, limit = 5 }: ProposalsAtRiskProps) {
  const [proposals, setProposals] = useState<AtRiskProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAtRiskProposals();
  }, []);

  const fetchAtRiskProposals = async () => {
    try {
      setLoading(true);
      const data = await api.get<AtRiskProposal[]>(`/api/sla/at-risk?limit=${limit}`);
      setProposals(data);
    } catch (error) {
      console.error('Error fetching at-risk proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle className="h-6 bg-gray-200 rounded w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className={cn('bg-emerald-50/50 border-emerald-200', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-emerald-800 flex items-center gap-2 text-base">
            <Clock className="w-5 h-5" />
            All Proposals On Track
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-emerald-600">
            No proposals are currently at risk of breaching SLA targets.
          </p>
        </CardContent>
      </Card>
    );
  }

  const breachedCount = proposals.filter(p => p.sla_status === 'breached').length;
  const warningCount = proposals.filter(p => p.sla_status === 'warning').length;

  return (
    <Card className={cn('border-red-200', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-red-800 flex items-center gap-2 text-base">
          <AlertCircle className="w-5 h-5" />
          Proposals at Risk
          <span className="ml-auto text-sm font-normal text-red-600">
            {breachedCount > 0 && (
              <span className="mr-3">{breachedCount} overdue</span>
            )}
            {warningCount > 0 && (
              <span>{warningCount} at risk</span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {proposals.map((item) => (
          <Link
            key={item.proposal_id}
            to={`/admin/proposals/${item.proposal_id}`}
            className="block p-3 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-admin-text-primary truncate">
                  {item.proposals.title}
                </h4>
                <p className="text-sm text-admin-text-secondary mt-0.5">
                  {item.proposals.client.full_name}
                </p>
              </div>
              <SLAStatusBadge status={item.sla_status} size="sm" />
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.abs(item.hours_remaining) > 24 
                  ? `${Math.round(Math.abs(item.hours_remaining) / 24)} days`
                  : `${Math.round(Math.abs(item.hours_remaining))} hours`
                }
                {item.sla_status === 'breached' ? ' overdue' : ' remaining'}
              </span>
              <span className="text-gray-400">
                Target: {item.sla_target_hours}h
              </span>
            </div>
          </Link>
        ))}
        
        {proposals.length >= limit && (
          <Link
            to="/admin/proposals?filter=at_risk"
            className="block text-center text-sm text-admin-primary hover:underline pt-2"
          >
            View all at-risk proposals →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}