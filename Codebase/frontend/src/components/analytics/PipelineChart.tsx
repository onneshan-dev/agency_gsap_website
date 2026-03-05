import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface PipelineData {
  status: string;
  proposal_count: number;
  avg_estimated_value: number;
  total_estimated_value: number;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500',
  under_review: 'bg-amber-500',
  in_discussion: 'bg-purple-500',
  quoted: 'bg-indigo-500',
  accepted: 'bg-emerald-500',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_discussion: 'In Discussion',
  quoted: 'Quoted',
  accepted: 'Accepted',
};

export function PipelineChart() {
  const [pipeline, setPipeline] = useState<PipelineData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ by_status: PipelineData[]; total_pipeline_value: number }>(
        '/api/analytics/pipeline'
      );
      setPipeline(data.by_status);
      setTotalValue(data.total_pipeline_value);
    } catch (error) {
      console.error('Error fetching pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (pipeline.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No pipeline data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500">Total Pipeline Value</p>
        <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {pipeline.map((item) => {
          const percentage = totalValue > 0 ? (item.total_estimated_value / totalValue) * 100 : 0;
          const color = statusColors[item.status] || 'bg-gray-500';

          return (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{statusLabels[item.status] || item.status}</span>
                <span className="text-gray-500">
                  {item.proposal_count} proposals · ${item.total_estimated_value.toLocaleString()}
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn('h-full transition-all', color)} style={{ width: `${percentage}%` }} />
              </div>
              <p className="text-xs text-gray-400">{percentage.toFixed(1)}% of pipeline</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
