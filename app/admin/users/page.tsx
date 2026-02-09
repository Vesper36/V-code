'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAdminClient, AdminUser } from '@/lib/api/admin';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  RefreshCw, Loader2, Search, UserCheck, UserX,
  ChevronLeft, ChevronRight, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editQuota, setEditQuota] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const perPage = 20;

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const client = getAdminClient();
      const result = await client.getUsers(page, perPage);
      setUsers(result.data);
      setTotal(result.total);
      if (isRefresh) toast.success('Users refreshed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatQuota = (quota: number) => {
    const usd = quota / 500000;
    return `$${usd.toFixed(4)}`;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getRoleName = (role: number) => {
    if (role >= 100) return 'Super Admin';
    if (role >= 10) return 'Admin';
    return 'User';
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 1 ? 2 : 1;
    const action = newStatus === 1 ? 'enable' : 'disable';
    if (!confirm(`${action} user "${user.username}"?`)) return;

    try {
      const client = getAdminClient();
      await client.updateUserStatus(user.id, newStatus);
      toast.success(`User ${action}d`);
      fetchUsers(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const openEditQuota = (user: AdminUser) => {
    setEditingUser(user);
    setEditQuota(String((user.quota / 500000).toFixed(2)));
  };

  const handleEditQuota = async () => {
    if (!editingUser) return;
    const usd = parseFloat(editQuota);
    if (isNaN(usd) || usd < 0) {
      toast.error('Invalid quota amount');
      return;
    }
    setEditLoading(true);
    try {
      const client = getAdminClient();
      await client.updateUserQuota(editingUser.id, Math.floor(usd * 500000));
      toast.success(`Quota updated for ${editingUser.username}`);
      setEditingUser(null);
      fetchUsers(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quota');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredUsers = search
    ? users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <p className="text-muted-foreground">
              Manage users, quotas, and permissions
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchUsers(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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
              <CardTitle>Users ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No users found.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">Username</th>
                          <th className="text-left p-3 font-medium">Display Name</th>
                          <th className="text-left p-3 font-medium">Role</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Quota</th>
                          <th className="text-left p-3 font-medium">Used</th>
                          <th className="text-left p-3 font-medium">Requests</th>
                          <th className="text-left p-3 font-medium">Group</th>
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-muted-foreground">{user.id}</td>
                            <td className="p-3 font-medium">{user.username}</td>
                            <td className="p-3">{user.display_name || '-'}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role >= 10
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {getRoleName(user.role)}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 1
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {user.status === 1 ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="p-3">{formatQuota(user.quota)}</td>
                            <td className="p-3">{formatQuota(user.used_quota)}</td>
                            <td className="p-3 text-muted-foreground">{user.request_count}</td>
                            <td className="p-3 text-muted-foreground">{user.group || 'default'}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditQuota(user)}
                                  title="Edit quota"
                                >
                                  <DollarSign className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleStatus(user)}
                                  title={user.status === 1 ? 'Disable user' : 'Enable user'}
                                >
                                  {user.status === 1 ? (
                                    <UserX className="h-3.5 w-3.5 text-destructive" />
                                  ) : (
                                    <UserCheck className="h-3.5 w-3.5 text-green-500" />
                                  )}
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
                          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                          Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-[400px] glass border-white/20">
            <DialogHeader>
              <DialogTitle>Edit Quota</DialogTitle>
              <DialogDescription>
                Update quota for user: {editingUser?.username}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Current Quota</Label>
                <p className="text-sm text-muted-foreground">
                  {editingUser ? `$${(editingUser.quota / 500000).toFixed(4)}` : '-'}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Current Used</Label>
                <p className="text-sm text-muted-foreground">
                  {editingUser ? `$${(editingUser.used_quota / 500000).toFixed(4)}` : '-'}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quota">New Quota (USD)</Label>
                <Input
                  id="edit-quota"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editQuota}
                  onChange={(e) => setEditQuota(e.target.value)}
                  placeholder="e.g., 10.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)} disabled={editLoading}>
                Cancel
              </Button>
              <Button onClick={handleEditQuota} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
