'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, Key, DollarSign, Activity, Loader2, RefreshCw,
  TrendingUp, Zap
} from 'lucide-react';
import { getAdminClient, AdminLogItem } from '@/lib/api/admin';
import { toast } from 'sonner';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  activeTokens: number;
  totalQuota: number;
  usedQuota: number;
  todayConsumption: number;
  todayRequests: number;
}

interface TrendItem {
  date: string;
  requests: number;
  quota: number;
  tokens: number;
}

interface ModelItem {
  model: string;
  requests: number;
  quota: number;
  tokens: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<AdminLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const client = getAdminClient();
      const [statsData, trendData, modelData, logsData] = await Promise.all([
        client.getDashboardStats(),
        client.getUsageTrend(7),
        client.getModelDistribution(),
        client.getRecentActivity(8),
      ]);
      setStats(statsData);
      setTrend(trendData);
      setModels(modelData.slice(0, 8));
      setRecentLogs(logsData);
      if (isRefresh) toast.success('仪表盘已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载仪表盘失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fmtQuota = (q: number) => `$${(q / 500000).toFixed(2)}`;
  const fmtQuotaShort = (q: number) => {
    const usd = q / 500000;
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
    return `$${usd.toFixed(2)}`;
  };
  const fmtDate = (ts: number) => {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
            <p className="text-muted-foreground">
              API 管理系统概览
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchAll(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="总用户数"
            value={String(stats?.totalUsers ?? 0)}
            desc="已注册用户"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="活跃密钥"
            value={String(stats?.activeTokens ?? 0)}
            desc="已启用令牌"
            icon={<Key className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="总额度"
            value={fmtQuota(stats?.totalQuota ?? 0)}
            desc="已分配"
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="已用额度"
            value={fmtQuota(stats?.usedQuota ?? 0)}
            desc="已消耗"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="今日请求"
            value={String(stats?.todayRequests ?? 0)}
            desc="今日 API 调用"
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="今日消耗"
            value={fmtQuota(stats?.todayConsumption ?? 0)}
            desc="今日已消耗"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Usage Trend */}
          <Card className="glass lg:col-span-4">
            <CardHeader>
              <CardTitle>使用趋势 (7天)</CardTitle>
              <CardDescription>每日请求量与额度消耗</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="adminReqs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminQuota" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => fmtQuotaShort(v)}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const v = Number(value ?? 0);
                      if (name === '额度') return [fmtQuota(v), name];
                      return [v, name];
                    }}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="requests"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#adminReqs)"
                    name="请求数"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="quota"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#adminQuota)"
                    name="额度"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Distribution */}
          <Card className="glass lg:col-span-3">
            <CardHeader>
              <CardTitle>热门模型</CardTitle>
              <CardDescription>按请求量排序的常用模型</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={models}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="model"
                    type="category"
                    width={120}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + '...' : v}
                  />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#a78bfa" radius={[0, 4, 4, 0]} name="请求数" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>Latest API request logs</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">暂无活动记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">时间</th>
                      <th className="text-left p-3 font-medium">用户</th>
                      <th className="text-left p-3 font-medium">模型</th>
                      <th className="text-left p-3 font-medium">令牌数</th>
                      <th className="text-right p-3 font-medium">额度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                          {fmtDate(log.created_at)}
                        </td>
                        <td className="p-3 text-sm">{log.username || '-'}</td>
                        <td className="p-3 text-sm font-mono">{log.model_name || '-'}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {(log.prompt_tokens || 0) + (log.completion_tokens || 0)}
                        </td>
                        <td className="p-3 text-sm text-right">{fmtQuota(log.quota)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, desc, icon }: {
  title: string;
  value: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
