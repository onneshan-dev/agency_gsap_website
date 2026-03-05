import React from 'react';
import { cn } from '@/lib/utils';
import type { StatCard } from '@/types/admin';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  MousePointerClick,
  BarChart3
} from 'lucide-react';

interface StatCardsProps {
  className?: string;
}

const stats: StatCard[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$48,352',
    change: '+12.5%',
    changeType: 'positive',
    icon: 'dollar-sign',
  },
  {
    id: '2',
    title: 'Total Orders',
    value: '1,284',
    change: '+8.2%',
    changeType: 'positive',
    icon: 'shopping-bag',
  },
  {
    id: '3',
    title: 'Active Customers',
    value: '3,642',
    change: '+5.4%',
    changeType: 'positive',
    icon: 'users',
  },
  {
    id: '4',
    title: 'Conversion Rate',
    value: '3.24%',
    change: '-2.1%',
    changeType: 'negative',
    icon: 'mouse-pointer-click',
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  'dollar-sign': DollarSign,
  'shopping-bag': ShoppingBag,
  'users': Users,
  'mouse-pointer-click': MousePointerClick,
  'bar-chart-3': BarChart3,
};

export const StatCards: React.FC<StatCardsProps> = ({ className }) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon] || BarChart3;
        const isPositive = stat.changeType === 'positive';
        
        return (
          <div
            key={stat.id}
            className="bg-admin-surface rounded-xl p-5 border border-admin-border shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-admin-text-muted mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-admin-text-primary">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {isPositive ? (
                    <TrendingUp size={14} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={14} className="text-red-500" />
                  )}
                  <span className={cn(
                    'text-xs font-medium',
                    isPositive ? 'text-emerald-600' : 'text-red-500'
                  )}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-admin-text-muted">from last month</span>
                </div>
              </div>
              
              <div className="w-10 h-10 bg-admin-bg rounded-lg flex items-center justify-center">
                <Icon size={20} className="text-admin-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
