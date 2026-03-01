'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  getModels, createModel, updateModel, deleteModel,
  GatewayModelConfig,
} from '@/lib/api/gateway-admin';
import {
  RefreshCw, Loader2, Search, Bot, Pencil, Plus, Trash2, Power,
  ChevronLeft, ChevronRight, DollarSign, Gauge,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminModelsPage() {
  const [models, setModels] = useState<GatewayModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingModel, setEditingModel] = useState<GatewayModelConfig | null>(null);
  const perPage = 20;

  // Form state
  const [formModelId, setFormModelId] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formInputPrice, setFormInputPrice] = useState('');
  const [formOutputPrice, setFormOutputPrice] = useState('');
  const [formRpm, setFormRpm] = useState('60');
  const [formTpm, setFormTpm] = useState('100000');

  const fetchModels = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getModels(1, 500);
      setModels(result.items);
      setTotal(result.total);
      if (isRefresh) toast.success('模型列表已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载模型列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const filtered = useMemo(() => {
    if (!search) return models;
    const q = search.toLowerCase();
    return models.filter(m => m.modelId.toLowerCase().includes(q) || m.displayName.toLowerCase().includes(q));
  }, [models, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const resetForm = () => {
    setFormModelId(''); setFormDisplayName('');
    setFormInputPrice(''); setFormOutputPrice('');
    setFormRpm('60'); setFormTpm('100000');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModelId.trim() || !formDisplayName.trim()) {
      toast.error('模型 ID 和显示名称为必填项');
      return;
    }
    setCreateLoading(true);
    try {
      await createModel({
        modelId: formModelId.trim(),
        displayName: formDisplayName.trim(),
        inputPrice: parseFloat(formInputPrice) || 0,
        outputPrice: parseFloat(formOutputPrice) || 0,
        rpm: parseInt(formRpm) || 60,
        tpm: parseInt(formTpm) || 100000,
      } as any);
      toast.success('模型已创建');
      setCreateOpen(false);
      resetForm();
      fetchModels(true);
    } catch (error: any) {
      toast.error(error.message || '创建模型失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (m: GatewayModelConfig) => {
    setEditingModel(m);
    setFormModelId(m.modelId);
    setFormDisplayName(m.displayName);
    setFormInputPrice(String(m.inputPrice || ''));
    setFormOutputPrice(String(m.outputPrice || ''));
    setFormRpm(String(m.rpm));
    setFormTpm(String(m.tpm));
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;
    setEditLoading(true);
    try {
      await updateModel(editingModel.id, {
        displayName: formDisplayName.trim(),
        inputPrice: parseFloat(formInputPrice) || 0,
        outputPrice: parseFloat(formOutputPrice) || 0,
        rpm: parseInt(formRpm) || 60,
        tpm: parseInt(formTpm) || 100000,
      } as any);
      toast.success('模型配置已更新');
      setEditOpen(false);
      setEditingModel(null);
      resetForm();
      fetchModels(true);
    } catch (error: any) {
      toast.error(error.message || '更新失败');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number, modelId: string) => {
    if (!confirm(`确定删除模型 "${modelId}" 吗?`)) return;
    try {
      await deleteModel(id);
      toast.success('模型已删除');
      fetchModels(true);
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  const handleToggleStatus = async (m: GatewayModelConfig) => {
    const newStatus = m.status === 1 ? 0 : 1;
    try {
      await updateModel(m.id, { status: newStatus } as any);
      toast.success(`模型已${newStatus === 1 ? '启用' : '禁用'}`);
      fetchModels(true);
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="h-7 w-7 text-primary" /> 模型管理
            </h1>
            <p className="text-muted-foreground">管理模型定价、速率限制 (共 {total} 个模型)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => fetchModels(true)} disabled={loading || refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button className="gap-2" onClick={() => { resetForm(); setCreateOpen(true); }}>
              <Plus className="h-4 w-4" /> 添加模型
            </Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索模型..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
              <CardTitle>模型列表 ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {paged.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">未找到模型</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">模型 ID</th>
                          <th className="text-left p-3 font-medium">显示名称</th>
                          <th className="text-left p-3 font-medium">状态</th>
                          <th className="text-left p-3 font-medium">
                            <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> 定价 ($/1M)</span>
                          </th>
                          <th className="text-left p-3 font-medium">
                            <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> 速率</span>
                          </th>
                          <th className="text-right p-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paged.map((m) => (
                          <tr key={m.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-mono text-sm font-medium">{m.modelId}</td>
                            <td className="p-3 text-sm">{m.displayName}</td>
                            <td className="p-3">
                              <Badge variant={m.status === 1 ? 'default' : 'secondary'} className={
                                m.status === 1
                                  ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-0'
                                  : 'bg-red-500/15 text-red-600 dark:text-red-400 border-0'
                              }>
                                {m.status === 1 ? '启用' : '禁用'}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              ${Number(m.inputPrice)} / ${Number(m.outputPrice)}
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {m.rpm} RPM / {m.tpm} TPM
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(m)} title="编辑">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(m)} title={m.status === 1 ? '禁用' : '启用'}>
                                  <Power className={`h-3.5 w-3.5 ${m.status === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id, m.modelId)} className="text-destructive hover:text-destructive" title="删除">
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
          <DialogContent className="sm:max-w-[500px] glass border-white/20">
            <DialogHeader>
              <DialogTitle>添加模型</DialogTitle>
              <DialogDescription>配置新的模型定价和速率限制</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-model-id">模型 ID *</Label>
                  <Input id="create-model-id" value={formModelId} onChange={e => setFormModelId(e.target.value)}
                    placeholder="例如: gpt-4o" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-display-name">显示名称 *</Label>
                  <Input id="create-display-name" value={formDisplayName} onChange={e => setFormDisplayName(e.target.value)}
                    placeholder="例如: GPT-4o" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>输入价格 ($/1M tokens)</Label>
                    <Input type="number" step="0.01" min="0" value={formInputPrice}
                      onChange={e => setFormInputPrice(e.target.value)} placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>输出价格 ($/1M tokens)</Label>
                    <Input type="number" step="0.01" min="0" value={formOutputPrice}
                      onChange={e => setFormOutputPrice(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>RPM</Label>
                    <Input type="number" min="1" value={formRpm} onChange={e => setFormRpm(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>TPM</Label>
                    <Input type="number" min="1" value={formTpm} onChange={e => setFormTpm(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={createLoading}>取消</Button>
                <Button type="submit" disabled={createLoading}>{createLoading ? '创建中...' : '创建模型'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditingModel(null); resetForm(); } }}>
          <DialogContent className="sm:max-w-[500px] glass border-white/20">
            <DialogHeader>
              <DialogTitle>编辑模型</DialogTitle>
              <DialogDescription>修改模型 {editingModel?.modelId} 的配置</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>模型 ID</Label>
                  <Input value={formModelId} disabled className="opacity-60" />
                </div>
                <div className="grid gap-2">
                  <Label>显示名称 *</Label>
                  <Input value={formDisplayName} onChange={e => setFormDisplayName(e.target.value)}
                    placeholder="显示名称" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>输入价格 ($/1M tokens)</Label>
                    <Input type="number" step="0.01" min="0" value={formInputPrice}
                      onChange={e => setFormInputPrice(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>输出价格 ($/1M tokens)</Label>
                    <Input type="number" step="0.01" min="0" value={formOutputPrice}
                      onChange={e => setFormOutputPrice(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>RPM</Label>
                    <Input type="number" min="1" value={formRpm} onChange={e => setFormRpm(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>TPM</Label>
                    <Input type="number" min="1" value={formTpm} onChange={e => setFormTpm(e.target.value)} />
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