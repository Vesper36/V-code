'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getAdminClient, AdminLogItem } from '@/lib/api/admin';
import {
  RefreshCw, Loader2, Search, Filter, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  // Filter states
  const [keyword, setKeyword] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const client = getAdminClient();

      const hasFilters = keyword || modelFilter || typeFilter !== 'all' || dateRange !== 'all';

      let result: { data: AdminLogItem[]; total: number };

      if (hasFilters) {
        const params: Parameters<typeof client.searchLogs>[0] = {
          page,
          perPage,
        };
        if (keyword) params.keyword = keyword;
        if (modelFilter) params.model_name = modelFilter;

        // Date range
        if (dateRange !== 'all') {
          const now = Math.floor(Date.now() / 1000);
          const daySeconds = 86400;
          const rangeMap: Record<string, number> = {
            '1h': 3600,
            '24h': daySeconds,
            '7d': daySeconds * 7,
            '30d': daySeconds * 30,
          };
          if (rangeMap[dateRange]) {
            params.start_timestamp = now - rangeMap[dateRange];
            params.end_timestamp = now;
          }
        }

        result = await client.searchLogs(params);
      } else {
        result = await client.getLogs(page, perPage);
      }

      // Client-side type filter (API may not support type param)
      let filtered = result.data;
      if (typeFilter !== 'all') {
        const typeNum = parseInt(typeFilter);
        filtered = filtered.filter(l => l.type === typeNum);
      }

      setLogs(filtered);
      setTotal(result.total);
      if (isRefresh) toast.success('日志已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载日志失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, keyword, modelFilter, typeFilter, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs(true);
  };

  const clearFilters = () => {
    setKeyword('');
    setModelFilter('');
    setTypeFilter('all');
    setDateRange('all');
    setPage(1);
  };

  const hasActiveFilters = !!(keyword || modelFilter || typeFilter !== 'all' || dateRange !== 'all');
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
          keyword={keyword}
          onKeywordChange={setKeyword}
          modelFilter={modelFilter}
          onModelFilterChange={setModelFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
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
        <h1 className="text-3xl font-bold tracking-tight">系统日志</h1>
        <p className="text-muted-foreground">
          查看请求日志和 API 使用记录
        </p>
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
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={loading || refreshing}
        >
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

function LogsFilters({ show, keyword, onKeywordChange, modelFilter, onModelFilterChange, typeFilter, onTypeFilterChange, dateRange, onDateRangeChange, onSearch, onClear, hasActiveFilters }: {
  show: boolean;
  keyword: string;
  onKeywordChange: (v: string) => void;
  modelFilter: string;
  onModelFilterChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  dateRange: string;
  onDateRangeChange: (v: string) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  if (!show) return null;

  return (
    <Card className="glass">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">关键词</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索日志..."
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">模型</label>
            <Input
              placeholder="按模型筛选..."
              value={modelFilter}
              onChange={(e) => onModelFilterChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">类型</label>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="1">充值</SelectItem>
                <SelectItem value="2">消费</SelectItem>
                <SelectItem value="3">管理</SelectItem>
                <SelectItem value="4">系统</SelectItem>
              </SelectContent>
            </Select>
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
  logs: AdminLogItem[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const formatDate = (ts: number) => {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleString();
  };

  const formatQuota = (q: number) => {
    const usd = q / 500000;
    return `$${usd.toFixed(6)}`;
  };

  const getTypeName = (type: number) => {
    switch (type) {
      case 1: return '充值';
      case 2: return '消费';
      case 3: return '管理';
      case 4: return '系统';
      default: return `类型 ${type}`;
    }
  };

  const getTypeStyle = (type: number) => {
    switch (type) {
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 2: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 3: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>日志 ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无日志记录。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">时间</th>
                  <th className="text-left p-3 font-medium">类型</th>
                  <th className="text-left p-3 font-medium">用户</th>
                  <th className="text-left p-3 font-medium">令牌</th>
                  <th className="text-left p-3 font-medium">模型</th>
                  <th className="text-left p-3 font-medium">提示词</th>
                  <th className="text-left p-3 font-medium">补全</th>
                  <th className="text-left p-3 font-medium">额度</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(log.type)}`}>
                        {getTypeName(log.type)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{log.username || '-'}</td>
                    <td className="p-3 text-sm">{log.token_name || '-'}</td>
                    <td className="p-3 text-sm font-mono">{log.model_name || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{log.prompt_tokens || 0}</td>
                    <td className="p-3 text-sm text-muted-foreground">{log.completion_tokens || 0}</td>
                    <td className="p-3 text-sm">{formatQuota(log.quota)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 页
            </p>
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
