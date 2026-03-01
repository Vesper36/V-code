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
import {
  getUsageTrend, getModelDistribution, getKeyUsage,
  type TrendItem, type ModelDistItem, type KeyUsageItem,
} from '@/lib/api/gateway-admin';
import { toast } from 'sonner';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16',
];

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState('7');
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [models, setModels] = useState<ModelDistItem[]>([]);
  const [keyUsage, setKeyUsage] = useState<KeyUsageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [trendData, modelData, keyData] = await Promise.all([
        getUsageTrend(parseInt(days)),
        getModelDistribution(),
        getKeyUsage(),
      ]);
      setTrend(trendData);
      setModels(modelData.slice(0, 10));
      setKeyUsage(keyData.slice(0, 10));
      if (isRefresh) toast.success('分析数据已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载分析数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmtCost = (c: number) => `$${c.toFixed(4)}`;
  const fmtCostShort = (c: number) => {
    if (c >= 1000) return `$${(c / 1000).toFixed(1)}k`;
    if (c >= 1) return `$${c.toFixed(2)}`;
    return `$${c.toFixed(4)}`;
  };

  const totalRequests = trend.reduce((s, t) => s + t.requests, 0);
  const totalCost = trend.reduce((s, t) => s + t.cost, 0);
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
          totalCost={totalCost}
          totalTokens={totalTokens}
          fmtCost={fmtCostShort}
        />

        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trend" className="gap-2">
              <TrendingUp className="h-4 w-4" /> 趋势
            </TabsTrigger>
            <TabsTrigger value="models" className="gap-2">
              <BarChart3 className="h-4 w-4" /> 模型
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-2">
              <PieChartIcon className="h-4 w-4" /> 密钥
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <TrendChart data={trend} fmtCostShort={fmtCostShort} fmtCost={fmtCost} />
          </TabsContent>
          <TabsContent value="models">
            <ModelsChart data={models} fmtCost={fmtCost} />
          </TabsContent>
          <TabsContent value="keys">
            <KeysChart data={keyUsage} fmtCost={fmtCost} />
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
        <p className="text-muted-foreground">使用统计与消耗分析</p>
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
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function SummaryCards({ totalRequests, totalCost, totalTokens, fmtCost }: {
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  fmtCost: (c: number) => string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">总请求数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">总消耗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fmtCost(totalCost)}</div>
        </CardContent>
      </Card>
      <Card>
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

function TrendChart({ data, fmtCostShort, fmtCost }: {
  data: TrendItem[];
  fmtCostShort: (c: number) => string;
  fmtCost: (c: number) => string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle>消耗趋势</CardTitle>
          <CardDescription>每日费用消耗</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="analyticsCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCostShort(v)} />
              <Tooltip formatter={(value) => [fmtCost(Number(value ?? 0)), '费用']} labelFormatter={(l) => `日期: ${l}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Area type="monotone" dataKey="cost" stroke="#06b6d4" fillOpacity={1} fill="url(#analyticsCost)" name="费用" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelsChart({ data, fmtCost }: {
  data: ModelDistItem[];
  fmtCost: (c: number) => string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>模型请求量</CardTitle>
          <CardDescription>按模型统计的请求数</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart layout="vertical" data={data} margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="model" type="category" width={130}
                fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.length > 20 ? v.slice(0, 20) + '...' : v}
              />
              <Tooltip />
              <Bar dataKey="requests" name="请求数" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>模型消耗</CardTitle>
          <CardDescription>按模型统计的费用消耗</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data} dataKey="cost" nameKey="model"
                cx="50%" cy="50%" outerRadius={120}
                label={({ name, percent }: { name?: string; percent?: number }) => {
                  const label = name || '';
                  const pct = percent ?? 0;
                  return `${label.length > 12 ? label.slice(0, 12) + '..' : label} ${(pct * 100).toFixed(0)}%`;
                }}
                labelLine={false} fontSize={11}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [fmtCost(Number(value ?? 0)), '费用']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function KeysChart({ data, fmtCost }: {
  data: KeyUsageItem[];
  fmtCost: (c: number) => string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>密钥请求量</CardTitle>
          <CardDescription>按请求数排名的密钥</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="keyName" fontSize={12}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '..' : v}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="requests" name="请求数" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>密钥排名</CardTitle>
          <CardDescription>按密钥统计的详细使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">暂无数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">#</th>
                    <th className="pb-2 pr-3 font-medium">密钥</th>
                    <th className="pb-2 pr-3 font-medium text-right">请求数</th>
                    <th className="pb-2 pr-3 font-medium text-right">令牌数</th>
                    <th className="pb-2 font-medium text-right">费用</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((k, i) => (
                    <tr key={k.keyName} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-3 font-medium">{k.keyName}</td>
                      <td className="py-2 pr-3 text-right">{k.requests.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-right text-muted-foreground">{k.tokens.toLocaleString()}</td>
                      <td className="py-2 text-right">{fmtCost(k.cost)}</td>
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