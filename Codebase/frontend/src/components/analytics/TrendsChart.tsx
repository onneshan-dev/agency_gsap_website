import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface TrendData {
  month: string;
  submitted: number;
  reviewed: number;
  quoted: number;
  accepted: number;
  converted: number;
  rejected: number;
}

export function TrendsChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const trends = await api.get<TrendData[]>('/api/analytics/trends?months=12');
      setData(trends);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap((d) => [d.submitted, d.converted]));

  return (
    <div className="space-y-4">
      {data.map((month) => {
        const monthLabel = format(parseISO(month.month), 'MMM yyyy');
        const submittedWidth = `${(month.submitted / maxValue) * 100}%`;
        const convertedWidth = `${(month.converted / maxValue) * 100}%`;

        return (
          <div key={month.month} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{monthLabel}</span>
              <span className="text-gray-500">
                {month.submitted} submitted · {month.converted} converted
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-blue-500 transition-all"
                style={{ width: submittedWidth }}
              />
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500 transition-all"
                style={{ width: convertedWidth }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
