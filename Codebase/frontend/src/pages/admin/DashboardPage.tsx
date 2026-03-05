import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCards } from '@/components/dashboard/StatCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">Welcome back, Admin!</h1>
            <p className="text-admin-text-secondary mt-1">Here's what's happening with your projects today.</p>
          </div>
          
          <button className="px-4 py-2 bg-admin-primary text-white text-sm font-medium rounded-lg hover:bg-admin-primary/90 transition-colors"
          >
            + New Project
          </button>
        </div>

        {/* Stats Cards */}
        <StatCards />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          
          <div>
            <RecentActivityFeed />
          </div>
        </div>

        {/* Recent Projects */}
        <RecentProjects 
          onViewAll={() => navigate('/admin/projects')}
          onProjectClick={(id) => navigate(`/admin/projects/${id}`)}
        />
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
