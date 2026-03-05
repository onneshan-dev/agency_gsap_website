import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TeamMember {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  proposals_handled: number;
  total_status_assignments: number;
  avg_hours_per_status: number;
  sla_compliance_rate: number;
  sla_breaches: number;
  avg_review_time_hours: number;
  status_changes_made: number;
}

export function TeamPerformance() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const data = await api.get<TeamMember[]>('/api/analytics/team');
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (team.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No team performance data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {team.map((member) => (
        <div key={member.user_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.full_name} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900">{member.full_name}</h4>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{member.proposals_handled} proposals</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{member.avg_review_time_hours?.toFixed(1) || 0}h avg review</span>
            </div>

            <div className={cn('flex items-center gap-1', member.sla_compliance_rate >= 90 ? 'text-emerald-600' : 'text-amber-600')}>
              {member.sla_compliance_rate >= 90 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{member.sla_compliance_rate.toFixed(1)}% SLA</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
