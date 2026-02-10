'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminClient, AdminToken } from '@/lib/api/admin';
import { RefreshCw, Loader2, Trash2, Power, Copy, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CreateKeyDialog } from '@/components/admin/CreateKeyDialog';

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<AdminToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  const fetchKeys = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const client = getAdminClient();
      const result = await client.getTokens(page, perPage);
      setKeys(result.data);
      setTotal(result.total);
      if (isRefresh) toast.success('密钥列表已刷新');
    } catch (error: any) {
      console.error('Failed to fetch keys:', error);
      toast.error(error.message || '加载密钥列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const formatQuota = (quota: number) => {
    const usd = quota / 500000;
    return `$${usd.toFixed(4)}`;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleToggleStatus = async (token: AdminToken) => {
    try {
      const client = getAdminClient();
      const newStatus = token.status === 1 ? 2 : 1;
      await client.toggleTokenStatus(token.id, newStatus);
      toast.success(`密钥已${newStatus === 1 ? '启用' : '禁用'}`);
      fetchKeys(true);
    } catch (error: any) {
      toast.error(error.message || '更新状态失败');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定删除密钥 "${name}" 吗?`)) return;

    try {
      const client = getAdminClient();
      await client.deleteToken(id);
      toast.success('密钥已删除');
      fetchKeys(true);
    } catch (error: any) {
      toast.error(error.message || '删除密钥失败');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(`sk-${key}`);
    toast.success('密钥已复制到剪贴板');
  };

  const filteredKeys = search
    ? keys.filter(k => k.name.toLowerCase().includes(search.toLowerCase()))
    : keys;

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">密钥管理</h1>
            <p className="text-muted-foreground">
              管理 API 密钥、额度和权限
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchKeys(true)}
              disabled={loading || refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <CreateKeyDialog onSuccess={() => fetchKeys(true)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索密钥..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <Card className="glass">
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <Card className="glass">
            <CardHeader>
              <CardTitle>API 密钥 ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredKeys.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  未找到密钥。
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">名称</th>
                          <th className="text-left p-3 font-medium">密钥</th>
                          <th className="text-left p-3 font-medium">状态</th>
                          <th className="text-left p-3 font-medium">剩余额度</th>
                          <th className="text-left p-3 font-medium">已用</th>
                          <th className="text-left p-3 font-medium">创建时间</th>
                          <th className="text-right p-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredKeys.map((key) => (
                          <tr key={key.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">{key.name}</td>
                            <td className="p-3">
                              <button
                                onClick={() => handleCopyKey(key.key)}
                                className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                                title="Click to copy"
                              >
                                sk-{key.key.substring(0, 8)}...
                              </button>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                key.status === 1
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {key.status === 1 ? '已启用' : '已禁用'}
                              </span>
                            </td>
                            <td className="p-3">
                              {key.unlimited_quota ? '无限' : formatQuota(key.remain_quota)}
                            </td>
                            <td className="p-3">{formatQuota(key.used_quota)}</td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {formatDate(key.created_time)}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleCopyKey(key.key)} title="复制密钥">
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(key)} title={key.status === 1 ? '禁用' : '启用'}>
                                  <Power className={`h-3.5 w-3.5 ${key.status === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id, key.name)} className="text-destructive hover:text-destructive" title="删除">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        第 {page} / {totalPages} 页
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                          上一页
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                          下一页
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
