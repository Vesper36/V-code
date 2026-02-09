'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw, Loader2, TrendingUp, BarChart3, PieChart as PieChartIcon,
} from 'lucide-react';
import { getAdminClient, AdminLogItem } from '@/lib/api/admin';
import { toast } from 'sonner';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from 'recharts';

const COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16',
];

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

interface UserUsageItem {
  username: string;
  requests: number;
  quota: number;
  tokens: number;
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState('7');
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const client = getAdminClient();
      const numDays = parseInt(days);

      const [trendData, modelData, logsData] = await Promise.all([
        client.getUsageTrend(numDays),
        client.getModelDistribution(),
        client.getLogs(1, 100),
      ]);

      setTrend(trendData);
      setModels(modelData);

      // Aggregate user usage from logs
      const userMap = new Map<string, UserUsageItem>();
      for (const log of logsData.data) {
        if (log.type !== 2 || !log.username) continue;
        if (!userMap.has(log.username)) {
          userMap.set(log.username, { username: log.username, requests: 0, quota: 0, tokens: 0 });
        }
        const entry = userMap.get(log.username)!;
        entry.requests++;
        entry.quota += log.quota;
        entry.tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0);
      }
      setUserUsage(
        Array.from(userMap.values()).sort((a, b) => b.requests - a.requests)
      );

      if (isRefresh) toast.success('分析数据已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载分析数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fmtQuota = (q: number) => `$${(q / 500000).toFixed(4)}`;
  const fmtQuotaShort = (q: number) => {
    const usd = q / 500000;
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
    if (usd >= 1) return `$${usd.toFixed(2)}`;
    return `$${usd.toFixed(4)}`;
  };

  // Summary stats
  const totalRequests = trend.reduce((s, t) => s + t.requests, 0);
  const totalQuota = trend.reduce((s, t) => s + t.quota, 0);
  const totalTokens = trend.reduce((s, t) => s + t.tokens, 0);

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
        <AnalyticsHeader
          days={days}
          onDaysChange={setDays}
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
        />

        <SummaryCards
          totalRequests={totalRequests}
          totalQuota={totalQuota}
          totalTokens={totalTokens}
          fmtQuota={fmtQuotaShort}
        />

        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trend" className="gap-2">
              <TrendingUp className="h-4 w-4" /> 趋势
            </TabsTrigger>
            <TabsTrigger value="models" className="gap-2">
              <BarChart3 className="h-4 w-4" /> 模型
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <PieChartIcon className="h-4 w-4" /> 用户
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <TrendChart data={trend} fmtQuotaShort={fmtQuotaShort} fmtQuota={fmtQuota} />
          </TabsContent>

          <TabsContent value="models">
            <ModelsChart data={models} fmtQuota={fmtQuota} />
          </TabsContent>

          <TabsContent value="users">
            <UsersChart data={userUsage} fmtQuota={fmtQuota} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// --- Sub Components ---

function AnalyticsHeader({ days, onDaysChange, refreshing, onRefresh }: {
  days: string;
  onDaysChange: (v: string) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据分析</h1>
        <p className="text-muted-foreground">
          使用统计与消耗分析
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={days} onValueChange={onDaysChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">最近 7 天</SelectItem>
            <SelectItem value="14">最近 14 天</SelectItem>
            <SelectItem value="30">最近 30 天</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryCards({ totalRequests, totalQuota, totalTokens, fmtQuota }: {
  totalRequests: number;
  totalQuota: number;
  totalTokens: number;
  fmtQuota: (q: number) => string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">总请求数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">总消耗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fmtQuota(totalQuota)}</div>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">总令牌数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendChart({ data, fmtQuotaShort, fmtQuota }: {
  data: TrendItem[];
  fmtQuotaShort: (q: number) => string;
  fmtQuota: (q: number) => string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="glass">
        <CardHeader>
          <CardTitle>请求趋势</CardTitle>
          <CardDescription>每日 API 请求量</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="analyticsReqs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(l) => `日期: ${l}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Area type="monotone" dataKey="requests" stroke="#8b5cf6" fillOpacity={1} fill="url(#analyticsReqs)" name="请求数" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>消耗趋势</CardTitle>
          <CardDescription>每日额度消耗</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="analyticsQuota" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => fmtQuotaShort(v)} />
              <Tooltip formatter={(value) => [fmtQuota(Number(value ?? 0)), '额度']} labelFormatter={(l) => `日期: ${l}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Area type="monotone" dataKey="quota" stroke="#06b6d4" fillOpacity={1} fill="url(#analyticsQuota)" name="额度" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelsChart({ data, fmtQuota }: {
  data: ModelItem[];
  fmtQuota: (q: number) => string;
}) {
  const top10 = data.slice(0, 10);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="glass">
        <CardHeader>
          <CardTitle>模型请求量</CardTitle>
          <CardDescription>按模型统计的请求数</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart layout="vertical" data={top10} margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="model"
                type="category"
                width={130}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.length > 20 ? v.slice(0, 20) + '...' : v}
              />
              <Tooltip />
              <Bar dataKey="requests" name="请求数" radius={[0, 4, 4, 0]}>
                {top10.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>模型消耗</CardTitle>
          <CardDescription>按模型统计的额度消耗</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={top10}
                dataKey="quota"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }: { name?: string; percent?: number }) => {
                  const label = name || '';
                  const pct = percent ?? 0;
                  return `${label.length > 12 ? label.slice(0, 12) + '..' : label} ${(pct * 100).toFixed(0)}%`;
                }}
                labelLine={false}
                fontSize={11}
              >
                {top10.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [fmtQuota(Number(value ?? 0)), '额度']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersChart({ data, fmtQuota }: {
  data: UserUsageItem[];
  fmtQuota: (q: number) => string;
}) {
  const top10 = data.slice(0, 10);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* User requests bar chart */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>用户请求量</CardTitle>
          <CardDescription>按请求数排名的用户</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={top10} margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="username"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '..' : v}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="requests" name="请求数" radius={[4, 4, 0, 0]}>
                {top10.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User ranking table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>用户排名</CardTitle>
          <CardDescription>按用户统计的详细使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          {top10.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">暂无用户数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-sm">#</th>
                    <th className="text-left p-2 font-medium text-sm">用户</th>
                    <th className="text-right p-2 font-medium text-sm">请求数</th>
                    <th className="text-right p-2 font-medium text-sm">令牌数</th>
                    <th className="text-right p-2 font-medium text-sm">额度</th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map((u, i) => (
                    <tr key={u.username} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="p-2 text-sm font-medium">{u.username}</td>
                      <td className="p-2 text-sm text-right">{u.requests}</td>
                      <td className="p-2 text-sm text-right text-muted-foreground">
                        {u.tokens.toLocaleString()}
                      </td>
                      <td className="p-2 text-sm text-right">{fmtQuota(u.quota)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
