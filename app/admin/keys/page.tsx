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
      if (isRefresh) toast.success('Keys refreshed');
    } catch (error: any) {
      console.error('Failed to fetch keys:', error);
      toast.error(error.message || 'Failed to load keys');
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
      toast.success(`Key ${newStatus === 1 ? 'enabled' : 'disabled'}`);
      fetchKeys(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete key "${name}"?`)) return;

    try {
      const client = getAdminClient();
      await client.deleteToken(id);
      toast.success('Key deleted');
      fetchKeys(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete key');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(`sk-${key}`);
    toast.success('Key copied to clipboard');
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
            <h1 className="text-3xl font-bold tracking-tight">Keys Management</h1>
            <p className="text-muted-foreground">
              Manage API keys, quotas, and permissions
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
              placeholder="Search keys..."
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
              <CardTitle>API Keys ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredKeys.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No keys found.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Key</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Remaining</th>
                          <th className="text-left p-3 font-medium">Used</th>
                          <th className="text-left p-3 font-medium">Created</th>
                          <th className="text-right p-3 font-medium">Actions</th>
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
                                {key.status === 1 ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td className="p-3">
                              {key.unlimited_quota ? 'Unlimited' : formatQuota(key.remain_quota)}
                            </td>
                            <td className="p-3">{formatQuota(key.used_quota)}</td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {formatDate(key.created_time)}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleCopyKey(key.key)} title="Copy key">
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(key)} title={key.status === 1 ? 'Disable' : 'Enable'}>
                                  <Power className={`h-3.5 w-3.5 ${key.status === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id, key.name)} className="text-destructive hover:text-destructive" title="Delete">
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
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                          Next
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
