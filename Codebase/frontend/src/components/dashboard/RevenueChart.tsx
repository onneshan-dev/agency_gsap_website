import React from 'react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  className?: string;
}

const data = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 198 },
  { name: 'Mar', revenue: 5000, orders: 300 },
  { name: 'Apr', revenue: 4500, orders: 280 },
  { name: 'May', revenue: 6000, orders: 390 },
  { name: 'Jun', revenue: 5500, orders: 350 },
  { name: 'Jul', revenue: 7000, orders: 420 },
  { name: 'Aug', revenue: 6500, orders: 400 },
  { name: 'Sep', revenue: 8000, orders: 480 },
  { name: 'Oct', revenue: 7500, orders: 450 },
  { name: 'Nov', revenue: 9000, orders: 520 },
  { name: 'Dec', revenue: 8500, orders: 500 },
];

export const RevenueChart: React.FC<RevenueChartProps> = ({ className }) => {
  return (
    <div className={cn('bg-admin-surface rounded-xl p-5 border border-admin-border shadow-sm', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-admin-text-primary">Revenue Overview</h3>
          <p className="text-sm text-admin-text-muted mt-0.5">Monthly revenue and orders</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-admin-primary"></span>
            <span className="text-xs text-admin-text-secondary">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-admin-accent"></span>
            <span className="text-xs text-admin-text-secondary">Orders</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C76F30" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#C76F30" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DE" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9A9AA0', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9A9AA0', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E5E3DE',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#1A1A1E', fontWeight: 500 }}
            />
            
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2D5A3D"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#C76F30"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
