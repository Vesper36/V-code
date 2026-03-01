'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  getLogs, type GatewayRequestLog,
} from '@/lib/api/gateway-admin';
import {
  RefreshCw, Loader2, Search, Filter, X,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<GatewayRequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  const [modelFilter, setModelFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params: Parameters<typeof getLogs>[0] = { page, perPage };
      if (modelFilter) params.modelId = modelFilter;

      if (dateRange !== 'all') {
        const now = new Date();
        const rangeMs: Record<string, number> = {
          '1h': 3600_000,
          '24h': 86400_000,
          '7d': 86400_000 * 7,
          '30d': 86400_000 * 30,
        };
        if (rangeMs[dateRange]) {
          params.startDate = new Date(now.getTime() - rangeMs[dateRange]).toISOString();
          params.endDate = now.toISOString();
        }
      }

      const result = await getLogs(params);
      setLogs(result.items);
      setTotal(result.total);
      if (isRefresh) toast.success('日志已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载日志失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, modelFilter, dateRange]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = () => { setPage(1); fetchLogs(true); };
  const clearFilters = () => { setModelFilter(''); setDateRange('all'); setPage(1); };
  const hasActiveFilters = !!(modelFilter || dateRange !== 'all');
  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <LogsHeader
          refreshing={refreshing}
          onRefresh={() => fetchLogs(true)}
          loading={loading}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        <LogsFilters
          show={showFilters}
          modelFilter={modelFilter}
          onModelFilterChange={setModelFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onSearch={handleSearch}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <LogsTable
          logs={logs}
          loading={loading}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
}

// --- Sub Components ---

function LogsHeader({ refreshing, onRefresh, loading, showFilters, onToggleFilters }: {
  refreshing: boolean;
  onRefresh: () => void;
  loading: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">请求日志</h1>
        <p className="text-muted-foreground">API 网关请求记录</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFilters}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          筛选
        </Button>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading || refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function LogsFilters({ show, modelFilter, onModelFilterChange, dateRange, onDateRangeChange, onSearch, onClear, hasActiveFilters }: {
  show: boolean;
  modelFilter: string;
  onModelFilterChange: (v: string) => void;
  dateRange: string;
  onDateRangeChange: (v: string) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  if (!show) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">模型</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="按模型 ID 筛选..."
                value={modelFilter}
                onChange={(e) => onModelFilterChange(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">时间范围</label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="1h">最近 1 小时</SelectItem>
                <SelectItem value="24h">最近 24 小时</SelectItem>
                <SelectItem value="7d">最近 7 天</SelectItem>
                <SelectItem value="30d">最近 30 天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" onClick={onSearch} className="gap-2">
            <Search className="h-4 w-4" /> 搜索
          </Button>
          {hasActiveFilters && (
            <Button size="sm" variant="outline" onClick={onClear} className="gap-2">
              <X className="h-4 w-4" /> 清除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LogsTable({ logs, loading, total, page, totalPages, onPageChange }: {
  logs: GatewayRequestLog[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const fmtCost = (c: number) => `$${c.toFixed(4)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleString('zh-CN');

  const getStatusStyle = (code: number) => {
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (code >= 400 && code < 500) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>日志 ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无日志记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">时间</th>
                  <th className="pb-2 pr-3 font-medium">密钥</th>
                  <th className="pb-2 pr-3 font-medium">模型</th>
                  <th className="pb-2 pr-3 font-medium text-right">提示词</th>
                  <th className="pb-2 pr-3 font-medium text-right">补全</th>
                  <th className="pb-2 pr-3 font-medium text-right">费用</th>
                  <th className="pb-2 pr-3 font-medium text-right">延迟</th>
                  <th className="pb-2 pr-3 font-medium">状态</th>
                  <th className="pb-2 font-medium">流式</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">{fmtDate(log.createdAt)}</td>
                    <td className="py-2 pr-3">{log.keyName}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{log.modelId}</td>
                    <td className="py-2 pr-3 text-right">{log.promptTokens.toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right">{log.completionTokens.toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right">{fmtCost(log.cost)}</td>
                    <td className="py-2 pr-3 text-right">{log.latencyMs}ms</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-2">{log.isStream ? 'SSE' : 'JSON'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> 上一页
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                下一页 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
