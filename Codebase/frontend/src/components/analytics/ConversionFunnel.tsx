import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ArrowRight, Users, Eye, FileText, CheckCircle, Package } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

interface ConversionFunnelProps {
  dateRange?: DateRange;
}

const stageConfig: Record<string, { icon: typeof Users; color: string; label: string }> = {
  Submitted: { icon: Users, color: 'bg-blue-500', label: 'Submitted' },
  Reviewed: { icon: Eye, color: 'bg-amber-500', label: 'Under Review' },
  Quoted: { icon: FileText, color: 'bg-indigo-500', label: 'Quoted' },
  Accepted: { icon: CheckCircle, color: 'bg-emerald-500', label: 'Accepted' },
  Converted: { icon: Package, color: 'bg-green-500', label: 'Converted' },
};

export function ConversionFunnel({ dateRange }: ConversionFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, [dateRange]);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append('from', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange?.to) {
        params.append('to', format(dateRange.to, 'yyyy-MM-dd'));
      }
      
      const data = await api.get<FunnelStage[]>(`/api/analytics/funnel?${params}`);
      setFunnelData(data);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  const maxCount = Math.max(...funnelData.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {funnelData.map((stage, index) => {
        const config = stageConfig[stage.stage] || stageConfig.Submitted;
        const Icon = config.icon;
        const width = `${(stage.count / maxCount) * 100}%`;
        const isLast = index === funnelData.length - 1;

        return (
          <div key={stage.stage} className="relative">
            <div
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg transition-all',
                'bg-gray-50 hover:bg-gray-100'
              )}
              style={{ width }}
            >
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', config.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{config.label}</span>
                  <span className="text-lg font-bold">{stage.count}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{stage.percentage.toFixed(1)}% of submitted</span>
                  {!isLast && (
                    <span className="text-emerald-600">
                      {index > 0
                        ? `${((stage.count / funnelData[index - 1].count) * 100).toFixed(1)}% conversion`
                        : 'Starting point'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isLast && (
              <div className="flex justify-center py-2">
                <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}