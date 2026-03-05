import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

interface SLAOverview {
  on_track_count: number;
  warning_count: number;
  breached_count: number;
  sla_compliance_rate: number;
}

interface SLAByStatus {
  status: string;
  avg_hours: number;
  compliance_rate: number;
}

interface SLAResponse {
  overview: SLAOverview;
  by_status: SLAByStatus[];
}

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_discussion: 'In Discussion',
  quoted: 'Quoted',
  accepted: 'Accepted',
};

export function SLAReport() {
  const [sla, setSla] = useState<SLAResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSLA();
  }, []);

  const fetchSLA = async () => {
    try {
      setLoading(true);
      const data = await api.get<SLAResponse>('/api/analytics/sla');
      setSla(data);
    } catch (error) {
      console.error('Error fetching SLA data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (!sla) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No SLA data available
      </div>
    );
  }

  const { overview } = sla;
  const total = overview.on_track_count + overview.warning_count + overview.breached_count;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-900">On Track</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{overview.on_track_count}</p>
          <p className="text-sm text-emerald-600">
            {total > 0 ? ((overview.on_track_count / total) * 100).toFixed(1) : 0}% of proposals
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{overview.warning_count}</p>
          <p className="text-sm text-amber-600">
            {total > 0 ? ((overview.warning_count / total) * 100).toFixed(1) : 0}% of proposals
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900">Breached</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{overview.breached_count}</p>
          <p className="text-sm text-red-600">
            {total > 0 ? ((overview.breached_count / total) * 100).toFixed(1) : 0}% of proposals
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Compliance</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {overview.sla_compliance_rate.toFixed(1)}%
          </p>
          <p className="text-sm text-blue-600">Overall SLA rate</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Performance by Status</h4>
        <div className="space-y-3">
          {sla.by_status.map((status) => (
            <div
              key={status.status}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <span className="font-medium">{statusLabels[status.status] || status.status}</span>
                <span className="text-sm text-gray-500">
                  Avg {status.avg_hours?.toFixed(1) || 0} hours
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      status.compliance_rate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                    )}
                    style={{ width: `${status.compliance_rate || 0}%` }}
                  />
                </div>
                <span className={cn(
                  'text-sm font-medium',
                  status.compliance_rate >= 90 ? 'text-emerald-600' : 'text-amber-600'
                )}>
                  {status.compliance_rate?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
