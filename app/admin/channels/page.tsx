'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getAdminClient, AdminChannel } from '@/lib/api/admin';
import {
  RefreshCw, Loader2, Search, Plus, Trash2, Power, Zap,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

const CHANNEL_TYPES: Record<number, string> = {
  1: 'OpenAI',
  3: 'Azure',
  14: 'Anthropic',
  15: 'Baidu',
  17: 'Ali (Qwen)',
  18: 'Xunfei',
  19: 'AI360',
  23: 'Tencent',
  24: 'Google Gemini',
  25: 'Moonshot',
  26: 'Baichuan',
  27: 'Minimax',
  28: 'Mistral',
  29: 'Groq',
  31: 'Zero-One',
  33: 'Deepseek',
  34: 'Cohere',
  40: 'Cloudflare',
  999: 'Custom',
};

// PLACEHOLDER_CHANNELS_PAGE_CONTINUE

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<AdminChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const perPage = 20;

  // Create form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('1');
  const [formKey, setFormKey] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formModels, setFormModels] = useState('');
  const [formPriority, setFormPriority] = useState('0');
  const [formWeight, setFormWeight] = useState('1');

  const fetchChannels = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const client = getAdminClient();
      const result = await client.getChannels(page, perPage);
      setChannels(result.data);
      setTotal(result.total);
      if (isRefresh) toast.success('Channels refreshed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load channels');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

// PLACEHOLDER_CHANNELS_HANDLERS

  const handleToggleStatus = async (ch: AdminChannel) => {
    const newStatus = ch.status === 1 ? 2 : 1;
    try {
      const client = getAdminClient();
      await client.toggleChannelStatus(ch.id, newStatus);
      toast.success(`Channel ${newStatus === 1 ? 'enabled' : 'disabled'}`);
      fetchChannels(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete channel "${name}"?`)) return;
    try {
      const client = getAdminClient();
      await client.deleteChannel(id);
      toast.success('Channel deleted');
      fetchChannels(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete channel');
    }
  };

  const handleTest = async (ch: AdminChannel) => {
    const model = ch.models?.[0];
    if (!model) {
      toast.error('No model configured for this channel');
      return;
    }
    setTestingId(ch.id);
    try {
      const client = getAdminClient();
      const result = await client.testChannel(ch.id, model);
      if (result.success) {
        toast.success(`Channel OK (${result.time ? result.time + 'ms' : 'success'})`);
      } else {
        toast.error(`Test failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Test failed');
    } finally {
      setTestingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formKey.trim() || !formModels.trim()) {
      toast.error('Name, Key and Models are required');
      return;
    }
    setCreateLoading(true);
    try {
      const client = getAdminClient();
      await client.createChannel({
        name: formName.trim(),
        type: parseInt(formType),
        key: formKey.trim(),
        base_url: formBaseUrl.trim() || undefined,
        models: formModels.trim(),
        priority: parseInt(formPriority) || 0,
        weight: parseInt(formWeight) || 1,
      });
      toast.success('Channel created');
      setCreateOpen(false);
      resetForm();
      fetchChannels(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create channel');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setFormName(''); setFormType('1'); setFormKey('');
    setFormBaseUrl(''); setFormModels(''); setFormPriority('0'); setFormWeight('1');
  };

  const filteredChannels = search
    ? channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : channels;

  const totalPages = Math.ceil(total / perPage);
  const getTypeName = (type: number) => CHANNEL_TYPES[type] || `Type ${type}`;

// PLACEHOLDER_CHANNELS_RENDER

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
            <p className="text-muted-foreground">
              Manage API channels and upstream providers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => fetchChannels(true)} disabled={loading || refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Add Channel
            </Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search channels..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
              <CardTitle>Channels ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredChannels.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No channels found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Priority</th>
                          <th className="text-left p-3 font-medium">Weight</th>
                          <th className="text-left p-3 font-medium">Models</th>
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredChannels.map((ch) => (
                          <tr key={ch.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-muted-foreground">{ch.id}</td>
                            <td className="p-3 font-medium">{ch.name}</td>
                            <td className="p-3 text-sm">{getTypeName(ch.type)}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                ch.status === 1
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {ch.status === 1 ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td className="p-3">{ch.priority}</td>
                            <td className="p-3">{ch.weight}</td>
                            <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">
                              {Array.isArray(ch.models) ? ch.models.join(', ') : '-'}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleTest(ch)} disabled={testingId === ch.id} title="Test channel">
                                  {testingId === ch.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(ch)} title={ch.status === 1 ? 'Disable' : 'Enable'}>
                                  <Power className={`h-3.5 w-3.5 ${ch.status === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(ch.id, ch.name)} className="text-destructive hover:text-destructive" title="Delete">
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
                      <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
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

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-[550px] glass border-white/20">
            <DialogHeader>
              <DialogTitle>Add Channel</DialogTitle>
              <DialogDescription>Configure a new upstream API channel</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ch-name">Name *</Label>
                  <Input id="ch-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., OpenAI Primary" required />
                </div>
                <div className="grid gap-2">
                  <Label>Type *</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CHANNEL_TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ch-key">API Key *</Label>
                  <Input id="ch-key" value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="sk-..." required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ch-base">Base URL</Label>
                  <Input id="ch-base" value={formBaseUrl} onChange={(e) => setFormBaseUrl(e.target.value)} placeholder="https://api.openai.com (optional)" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ch-models">Models *</Label>
                  <Input id="ch-models" value={formModels} onChange={(e) => setFormModels(e.target.value)} placeholder="gpt-4o,gpt-4o-mini,..." required />
                  <p className="text-xs text-muted-foreground">Comma-separated model names</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ch-priority">Priority</Label>
                    <Input id="ch-priority" type="number" value={formPriority} onChange={(e) => setFormPriority(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ch-weight">Weight</Label>
                    <Input id="ch-weight" type="number" min="1" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={createLoading}>Cancel</Button>
                <Button type="submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
