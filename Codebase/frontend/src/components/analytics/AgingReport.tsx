import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlertCircle, Clock, Calendar, AlertTriangle } from 'lucide-react';

interface AgingData {
  days_range: string;
  proposal_count: number;
  percentage: number;
}

export function AgingReport() {
  const [aging, setAging] = useState<AgingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAging();
  }, []);

  const fetchAging = async () => {
    try {
      setLoading(true);
      const data = await api.get<AgingData[]>('/api/analytics/aging');
      setAging(data);
    } catch (error) {
      console.error('Error fetching aging data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (aging.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No aging data available
      </div>
    );
  }

  const getIcon = (range: string) => {
    if (range.includes('31+')) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (range.includes('15-30')) return <AlertCircle className="w-5 h-5 text-amber-500" />;
    if (range.includes('8-14')) return <Clock className="w-5 h-5 text-blue-500" />;
    return <Calendar className="w-5 h-5 text-emerald-500" />;
  };

  const getColor = (range: string) => {
    if (range.includes('31+')) return 'bg-red-100 text-red-700 border-red-200';
    if (range.includes('15-30')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (range.includes('8-14')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {aging.map((item) => (
        <div
          key={item.days_range}
          className={cn(
            'p-4 rounded-lg border flex items-center gap-3',
            getColor(item.days_range)
          )}
        >
          {getIcon(item.days_range)}
          <div>
            <p className="text-2xl font-bold">{item.proposal_count}</p>
            <p className="text-sm">{item.days_range}</p>
            <p className="text-xs opacity-75">{item.percentage.toFixed(1)}% of total</p>
          </div>
        </div>
      ))}
    </div>
  );
}
