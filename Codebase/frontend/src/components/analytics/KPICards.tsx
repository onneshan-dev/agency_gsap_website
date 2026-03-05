import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardMetrics } from '@/pages/admin/AnalyticsDashboard';

interface KPICardsProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export function KPICards({ metrics, loading }: KPICardsProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Conversion Rate',
      value: `${metrics.conversion_rate.toFixed(1)}%`,
      icon: Target,
      trend: metrics.conversion_rate > 30 ? 'up' : 'down',
      trendValue: `${metrics.converted_count} converted`,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Active Proposals',
      value: metrics.active_proposals.toString(),
      icon: TrendingUp,
      trend: 'neutral',
      trendValue: `${metrics.total_proposals} total`,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'SLA Compliance',
      value: `${metrics.sla_compliance_rate.toFixed(1)}%`,
      icon: Clock,
      trend: metrics.sla_compliance_rate >= 90 ? 'up' : 'down',
      trendValue: `${metrics.breached_count} breached`,
      color: metrics.sla_compliance_rate >= 90 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Unique Clients',
      value: metrics.unique_clients.toString(),
      icon: Users,
      trend: 'neutral',
      trendValue: 'Active clients',
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? ArrowUpRight : card.trend === 'down' ? ArrowDownRight : null;

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={cn('p-2 rounded-lg', card.color)}>
                <Icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                {TrendIcon && <TrendIcon className={cn('w-3 h-3', card.trend === 'up' ? 'text-emerald-500' : 'text-red-500')} />}
                <span>{card.trendValue}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}