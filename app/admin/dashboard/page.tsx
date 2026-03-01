'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Key, DollarSign, Activity, Loader2, RefreshCw,
  TrendingUp, Zap, Server,
} from 'lucide-react';
import {
  getDashboardStats, getUsageTrend, getModelDistribution, getLogs,
  type DashboardStats, type TrendItem, type ModelDistItem, type GatewayRequestLog,
} from '@/lib/api/gateway-admin';
import { toast } from 'sonner';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [models, setModels] = useState<ModelDistItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<GatewayRequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsData, trendData, modelData, logsData] = await Promise.all([
        getDashboardStats(),
        getUsageTrend(7),
        getModelDistribution(),
        getLogs({ page: 1, perPage: 8 }),
      ]);
      setStats(statsData);
      setTrend(trendData);
      setModels(modelData.slice(0, 8));
      setRecentLogs(logsData.items);
      if (isRefresh) toast.success('仪表盘已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载仪表盘失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmtCost = (c: number) => `$${c.toFixed(4)}`;
  const fmtCostShort = (c: number) => {
    if (c >= 1000) return `$${(c / 1000).toFixed(1)}k`;
    if (c >= 1) return `$${c.toFixed(2)}`;
    return `$${c.toFixed(4)}`;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
            <p className="text-muted-foreground">API 网关系统概览</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchAll(true)} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="总密钥数" value={String(stats?.totalKeys ?? 0)} desc="已创建" icon={<Key className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="活跃密钥" value={String(stats?.activeKeys ?? 0)} desc="已启用" icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="上游源" value={String(stats?.totalSources ?? 0)} desc="已启用" icon={<Server className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="今日请求" value={String(stats?.todayRequests ?? 0)} desc="今日 API 调用" icon={<Zap className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="今日消耗" value={fmtCost(stats?.todayCost ?? 0)} desc="今日费用" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="今日 Tokens" value={(stats?.todayTokens ?? 0).toLocaleString()} desc="今日令牌数" icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>请求趋势</CardTitle>
              <CardDescription>近 7 天请求量与费用</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => String(v ?? 0)} labelFormatter={(l) => `日期: ${l}`} />
                  <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="请求数" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>模型分布</CardTitle>
              <CardDescription>各模型请求占比</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={models} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="model" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v) => String(v ?? 0)} />
                  <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="请求数" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近请求</CardTitle>
            <CardDescription>最近 8 条 API 调用记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">密钥</th>
                    <th className="pb-2 pr-4 font-medium">模型</th>
                    <th className="pb-2 pr-4 font-medium text-right">Tokens</th>
                    <th className="pb-2 pr-4 font-medium text-right">费用</th>
                    <th className="pb-2 pr-4 font-medium text-right">延迟</th>
                    <th className="pb-2 font-medium text-right">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{log.keyName}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{log.modelId}</td>
                      <td className="py-2 pr-4 text-right">{log.totalTokens.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right">{fmtCost(log.cost)}</td>
                      <td className="py-2 pr-4 text-right">{log.latencyMs}ms</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {recentLogs.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">暂无记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, desc, icon }: { title: string; value: string; desc: string; icon: React.ReactNode }) {
  return (
    <Card>
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