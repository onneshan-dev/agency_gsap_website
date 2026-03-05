import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RefreshCw, Download, TrendingUp, Users, Clock, DollarSign, Target } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

// Import analytics components
import { KPICards } from '@/components/analytics/KPICards';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { PipelineChart } from '@/components/analytics/PipelineChart';
import { TrendsChart } from '@/components/analytics/TrendsChart';
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown';
import { TeamPerformance } from '@/components/analytics/TeamPerformance';
import { AgingReport } from '@/components/analytics/AgingReport';
import { SLAReport } from '@/components/analytics/SLAReport';

export interface DashboardMetrics {
  active_proposals: number;
  converted_count: number;
  rejected_count: number;
  quoted_count: number;
  accepted_count: number;
  total_proposals: number;
  unique_clients: number;
  conversion_rate: number;
  on_track_count: number;
  warning_count: number;
  breached_count: number;
  sla_compliance_rate: number;
  avg_time_to_review: number;
  avg_review_duration: number;
  avg_discussion_duration: number;
  avg_quote_acceptance_time: number;
  refreshed_at: string;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.get<DashboardMetrics>('/api/analytics/dashboard');
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await api.post('/api/analytics/refresh');
      await fetchDashboardData();
      toast.success('Analytics data refreshed');
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      toast.error('Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.get('/api/analytics/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Analytics data exported');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">Analytics Dashboard</h1>
            <p className="text-admin-text-secondary mt-1">
              Comprehensive insights into your proposal pipeline and team performance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards metrics={metrics} loading={loading} />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-admin-bg border border-admin-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="sla">SLA Metrics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-admin-primary" />
                    Monthly Trends
                  </CardTitle>
                  <CardDescription>Proposal volume and conversion over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendsChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-admin-primary" />
                    Category Breakdown
                  </CardTitle>
                  <CardDescription>Performance by project category</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryBreakdown />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-admin-primary" />
                  Proposal Aging Report
                </CardTitle>
                <CardDescription>Distribution of proposals by age</CardDescription>
              </CardHeader>
              <CardContent>
                <AgingReport />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Funnel Tab */}
          <TabsContent value="funnel">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>
                  Track how proposals move through your pipeline from submission to conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionFunnel dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-admin-primary" />
                    Pipeline Value
                  </CardTitle>
                  <CardDescription>Estimated value by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <PipelineChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-admin-primary" />
                    Template Usage
                  </CardTitle>
                  <CardDescription>Which templates drive the most proposals</CardDescription>
                </CardHeader>
                <CardContent>{/* Template usage chart component */}</CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Individual metrics and SLA compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamPerformance />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLA Metrics Tab */}
          <TabsContent value="sla">
            <Card>
              <CardHeader>
                <CardTitle>SLA Performance</CardTitle>
                <CardDescription>Service level agreement compliance and timing</CardDescription>
              </CardHeader>
              <CardContent>
                <SLAReport />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}