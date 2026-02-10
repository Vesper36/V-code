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
  RefreshCw, Loader2, Search, Plus, Trash2, Power, Zap, Pencil,
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

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<AdminChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingChannel, setEditingChannel] = useState<AdminChannel | null>(null);
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
      if (isRefresh) toast.success('渠道列表已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载渠道列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleToggleStatus = async (ch: AdminChannel) => {
    const newStatus = ch.status === 1 ? 2 : 1;
    try {
      const client = getAdminClient();
      await client.toggleChannelStatus(ch.id, newStatus);
      toast.success(`渠道已${newStatus === 1 ? '启用' : '禁用'}`);
      fetchChannels(true);
    } catch (error: any) {
      toast.error(error.message || '更新状态失败');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定删除渠道 "${name}" 吗?`)) return;
    try {
      const client = getAdminClient();
      await client.deleteChannel(id);
      toast.success('渠道已删除');
      fetchChannels(true);
    } catch (error: any) {
      toast.error(error.message || '删除渠道失败');
    }
  };

  const handleTest = async (ch: AdminChannel) => {
    const model = ch.models?.[0];
    if (!model) {
      toast.error('该渠道未配置模型');
      return;
    }
    setTestingId(ch.id);
    try {
      const client = getAdminClient();
      const result = await client.testChannel(ch.id, model);
      if (result.success) {
        toast.success(`Channel OK (${result.time ? result.time + 'ms' : 'success'})`);
      } else {
        toast.error(`测试失败: ${result.error || '未知错误'}`);
      }
    } catch (error: any) {
      toast.error(error.message || '测试失败');
    } finally {
      setTestingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formKey.trim() || !formModels.trim()) {
      toast.error('名称、密钥和模型为必填项');
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
      toast.success('渠道已创建');
      setCreateOpen(false);
      resetForm();
      fetchChannels(true);
    } catch (error: any) {
      toast.error(error.message || '创建渠道失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setFormName(''); setFormType('1'); setFormKey('');
    setFormBaseUrl(''); setFormModels(''); setFormPriority('0'); setFormWeight('1');
  };

  const openEdit = (ch: AdminChannel) => {
    setEditingChannel(ch);
    setFormName(ch.name);
    setFormType(String(ch.type));
    setFormKey(ch.key || '');
    setFormBaseUrl('');
    setFormModels(Array.isArray(ch.models) ? ch.models.join(',') : '');
    setFormPriority(String(ch.priority || 0));
    setFormWeight(String(ch.weight || 1));
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel || !formName.trim() || !formModels.trim()) {
      toast.error('名称和模型为必填项');
      return;
    }
    setEditLoading(true);
    try {
      const client = getAdminClient();
      await client.updateChannel(editingChannel.id, {
        name: formName.trim(),
        type: parseInt(formType),
        key: formKey.trim() || undefined,
        models: formModels.trim().split(',') as any,
        priority: parseInt(formPriority) || 0,
        weight: parseInt(formWeight) || 1,
      });
      toast.success('渠道已更新');
      setEditOpen(false);
      setEditingChannel(null);
      resetForm();
      fetchChannels(true);
    } catch (error: any) {
      toast.error(error.message || '更新渠道失败');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredChannels = search
    ? channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : channels;

  const totalPages = Math.ceil(total / perPage);
  const getTypeName = (type: number) => CHANNEL_TYPES[type] || `Type ${type}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">渠道管理</h1>
            <p className="text-muted-foreground">
              管理 API 渠道和上游服务商
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => fetchChannels(true)} disabled={loading || refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> 添加渠道
            </Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索渠道..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
              <CardTitle>渠道列表 ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredChannels.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">未找到渠道。</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">ID</th>
                          <th className="text-left p-3 font-medium">名称</th>
                          <th className="text-left p-3 font-medium">类型</th>
                          <th className="text-left p-3 font-medium">状态</th>
                          <th className="text-left p-3 font-medium">优先级</th>
                          <th className="text-left p-3 font-medium">权重</th>
                          <th className="text-left p-3 font-medium">模型</th>
                          <th className="text-right p-3 font-medium">操作</th>
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
                                {ch.status === 1 ? '已启用' : '已禁用'}
                              </span>
                            </td>
                            <td className="p-3">{ch.priority}</td>
                            <td className="p-3">{ch.weight}</td>
                            <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">
                              {Array.isArray(ch.models) ? ch.models.join(', ') : '-'}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(ch)} title="编辑渠道">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleTest(ch)} disabled={testingId === ch.id} title="测试渠道">
                                  {testingId === ch.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(ch)} title={ch.status === 1 ? '禁用' : '启用'}>
                                  <Power className={`h-3.5 w-3.5 ${ch.status === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(ch.id, ch.name)} className="text-destructive hover:text-destructive" title="删除">
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
                      <p className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> 上一页
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                          下一页 <ChevronRight className="h-4 w-4 ml-1" />
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
              <DialogTitle>添加渠道</DialogTitle>
              <DialogDescription>配置新的上游 API 渠道</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ch-name">名称 *</Label>
                  <Input id="ch-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例如: OpenAI 主渠道" required />
                </div>
                <div className="grid gap-2">
                  <Label>类型 *</Label>
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
                  <Label htmlFor="ch-key">API 密钥 *</Label>
                  <Input id="ch-key" value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="sk-..." required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ch-base">基础 URL</Label>
                  <Input id="ch-base" value={formBaseUrl} onChange={(e) => setFormBaseUrl(e.target.value)} placeholder="https://api.openai.com (可选)" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ch-models">模型 *</Label>
                  <Input id="ch-models" value={formModels} onChange={(e) => setFormModels(e.target.value)} placeholder="gpt-4o,gpt-4o-mini,..." required />
                  <p className="text-xs text-muted-foreground">多个模型用逗号分隔</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ch-priority">优先级</Label>
                    <Input id="ch-priority" type="number" value={formPriority} onChange={(e) => setFormPriority(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ch-weight">权重</Label>
                    <Input id="ch-weight" type="number" min="1" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={createLoading}>取消</Button>
                <Button type="submit" disabled={createLoading}>{createLoading ? '创建中...' : '创建'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditingChannel(null); resetForm(); } }}>
          <DialogContent className="sm:max-w-[550px] glass border-white/20">
            <DialogHeader>
              <DialogTitle>编辑渠道</DialogTitle>
              <DialogDescription>修改渠道 #{editingChannel?.id} 的配置</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>名称 *</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>类型 *</Label>
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
                  <Label>API 密钥</Label>
                  <Input value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="留空则不修改" />
                </div>
                <div className="grid gap-2">
                  <Label>模型 *</Label>
                  <Input value={formModels} onChange={(e) => setFormModels(e.target.value)} required />
                  <p className="text-xs text-muted-foreground">多个模型用逗号分隔</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>优先级</Label>
                    <Input type="number" value={formPriority} onChange={(e) => setFormPriority(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>权重</Label>
                    <Input type="number" min="1" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={editLoading}>取消</Button>
                <Button type="submit" disabled={editLoading}>{editLoading ? '保存中...' : '保存'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
