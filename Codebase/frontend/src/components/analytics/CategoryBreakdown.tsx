import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CategoryData {
  category: string;
  total_proposals: number;
  converted: number;
  rejected: number;
  in_progress: number;
  conversion_rate: number;
  avg_days_to_convert: number;
  unique_clients: number;
}

const categoryLabels: Record<string, string> = {
  web_app: 'Web Application',
  mobile_app: 'Mobile Application',
  ecommerce: 'E-Commerce',
  saas: 'SaaS Platform',
  other: 'Other',
  uncategorized: 'Uncategorized',
};

const categoryColors: Record<string, string> = {
  web_app: 'bg-blue-500',
  mobile_app: 'bg-purple-500',
  ecommerce: 'bg-emerald-500',
  saas: 'bg-indigo-500',
  other: 'bg-gray-500',
  uncategorized: 'bg-gray-400',
};

export function CategoryBreakdown() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get<CategoryData[]>('/api/analytics/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No category data available
      </div>
    );
  }

  const maxProposals = Math.max(...categories.map((c) => c.total_proposals), 1);

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const width = `${(cat.total_proposals / maxProposals) * 100}%`;
        const color = categoryColors[cat.category] || 'bg-gray-500';

        return (
          <div key={cat.category} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{categoryLabels[cat.category] || cat.category}</span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-600">{cat.conversion_rate.toFixed(1)}% converted</span>
                <span className="text-gray-500">{cat.total_proposals} total</span>
              </div>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div className={cn('h-full transition-all', color)} style={{ width }} />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-xs">
                <span className="text-white font-medium drop-shadow">
                  {cat.converted} converted
                </span>
                <span className="text-white drop-shadow">
                  {cat.unique_clients} clients
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
