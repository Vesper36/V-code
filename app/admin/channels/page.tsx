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
import { Checkbox } from '@/components/ui/checkbox';
import {
  getSources, createSource, updateSource, deleteSource,
  fetchUpstreamModels, GatewaySource,
} from '@/lib/api/gateway-admin';
import {
  RefreshCw, Loader2, Search, Plus, Trash2, Power, Pencil,
  ChevronLeft, ChevronRight, Download, CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<GatewaySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingSource, setEditingSource] = useState<GatewaySource | null>(null);
  const perPage = 20;

  const [formName, setFormName] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formSelectedModels, setFormSelectedModels] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [formPriority, setFormPriority] = useState('0');
  const [formWeight, setFormWeight] = useState('1');

  const fetchSources = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getSources(page, perPage);
      setSources(result.items);
      setTotal(result.total);
      if (isRefresh) toast.success('上游源列表已刷新');
    } catch (error: any) {
      toast.error(error.message || '加载上游源列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const handleToggleStatus = async (s: GatewaySource) => {
    const newStatus = s.status === 1 ? 0 : 1;
    try {
      await updateSource(s.id, { status: newStatus } as any);
      toast.success(`上游源已${newStatus === 1 ? '启用' : '禁用'}`);
      fetchSources(true);
    } catch (error: any) {
      toast.error(error.message || '更新状态失败');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定删除上游源 "${name}" 吗?`)) return;
    try {
      await deleteSource(id);
      toast.success('上游源已删除');
      fetchSources(true);
    } catch (error: any) {
      toast.error(error.message || '删除上游源失败');
    }
  };

  const resetForm = () => {
    setFormName(''); setFormBaseUrl(''); setFormApiKey('');
    setFormSelectedModels([]); setAvailableModels([]);
    setFormPriority('0'); setFormWeight('1');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBaseUrl.trim() || !formApiKey.trim()) {
      toast.error('名称、基础 URL 和 API 密钥为必填项');
      return;
    }
    setCreateLoading(true);
    try {
      await createSource({
        name: formName.trim(),
        baseUrl: formBaseUrl.trim(),
        apiKey: formApiKey.trim(),
        models: formSelectedModels,
        priority: parseInt(formPriority) || 0,
        weight: parseInt(formWeight) || 1,
      } as any);
      toast.success('上游源已创建');
      setCreateOpen(false);
      resetForm();
      fetchSources(true);
    } catch (error: any) {
      toast.error(error.message || '创建上游源失败');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (s: GatewaySource) => {
    setEditingSource(s);
    setFormName(s.name);
    setFormBaseUrl(s.baseUrl);
    setFormApiKey(s.apiKey);
    const models = Array.isArray(s.models) ? s.models : [];
    setFormSelectedModels(models);
    setAvailableModels(models);
    setFormPriority(String(s.priority));
    setFormWeight(String(s.weight));
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource || !formName.trim() || !formBaseUrl.trim()) {
      toast.error('名称和基础 URL 为必填项');
      return;
    }
    setEditLoading(true);
    try {
      await updateSource(editingSource.id, {
        name: formName.trim(),
        baseUrl: formBaseUrl.trim(),
        apiKey: formApiKey.trim() || undefined,
        models: formSelectedModels,
        priority: parseInt(formPriority) || 0,
        weight: parseInt(formWeight) || 1,
      } as any);
      toast.success('上游源已更新');
      setEditOpen(false);
      setEditingSource(null);
      resetForm();
      fetchSources(true);
    } catch (error: any) {
      toast.error(error.message || '更新上游源失败');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredSources = search
    ? sources.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : sources;
  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">上游源管理</h1>
            <p className="text-muted-foreground">管理 API 上游源和转发配置</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => fetchSources(true)} disabled={loading || refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> 添加上游源
            </Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索上游源..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
              <CardTitle>上游源列表 ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSources.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">未找到上游源。</div>
              ) : (
                <SourceTable
                  sources={filteredSources}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onEdit={openEdit}
                  onToggle={handleToggleStatus}
                  onDelete={handleDelete}
                />
              )}
            </CardContent>
          </Card>
        )}

        <SourceFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          title="添加上游源"
          description="配置新的上游 API 源"
          loading={createLoading}
          onSubmit={handleCreate}
          form={{
            formName, setFormName, formBaseUrl, setFormBaseUrl, formApiKey, setFormApiKey,
            formSelectedModels, setFormSelectedModels, availableModels, setAvailableModels,
            fetchingModels, setFetchingModels, formPriority, setFormPriority, formWeight, setFormWeight,
          }}
        />

        <SourceFormDialog
          open={editOpen}
          onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditingSource(null); resetForm(); } }}
          title="编辑上游源"
          description={`修改上游源 #${editingSource?.id} 的配置`}
          loading={editLoading}
          onSubmit={handleEdit}
          form={{
            formName, setFormName, formBaseUrl, setFormBaseUrl, formApiKey, setFormApiKey,
            formSelectedModels, setFormSelectedModels, availableModels, setAvailableModels,
            fetchingModels, setFetchingModels, formPriority, setFormPriority, formWeight, setFormWeight,
          }}
          isEdit
        />
      </div>
    </AdminLayout>
  );
}

function SourceTable({ sources, page, totalPages, onPageChange, onEdit, onToggle, onDelete }: {
  sources: GatewaySource[]
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  onEdit: (s: GatewaySource) => void
  onToggle: (s: GatewaySource) => void
  onDelete: (id: number, name: string) => void
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">ID</th>
              <th className="text-left p-3 font-medium">名称</th>
              <th className="text-left p-3 font-medium">基础 URL</th>
              <th className="text-left p-3 font-medium">状态</th>
              <th className="text-left p-3 font-medium">优先级</th>
              <th className="text-left p-3 font-medium">权重</th>
              <th className="text-left p-3 font-medium">模型</th>
              <th className="text-right p-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b hover:bg-muted/50">
                <td className="p-3 text-muted-foreground">{s.id}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">{s.baseUrl}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    s.status === 1
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {s.status === 1 ? '已启用' : '已禁用'}
                  </span>
                </td>
                <td className="p-3">{s.priority}</td>
                <td className="p-3">{s.weight}</td>
                <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">
                  {Array.isArray(s.models) ? s.models.join(', ') : '-'}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(s)} title="编辑">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggle(s)} title={s.status === 1 ? '禁用' : '启用'}>
                      <Power className={`h-3.5 w-3.5 ${s.status === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(s.id, s.name)} className="text-destructive hover:text-destructive" title="删除">
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
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> 上一页
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              下一页 <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function SourceFormDialog({ open, onOpenChange, title, description, loading, onSubmit, form, isEdit }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  form: {
    formName: string; setFormName: (v: string) => void
    formBaseUrl: string; setFormBaseUrl: (v: string) => void
    formApiKey: string; setFormApiKey: (v: string) => void
    formSelectedModels: string[]; setFormSelectedModels: (v: string[]) => void
    availableModels: string[]; setAvailableModels: (v: string[]) => void
    fetchingModels: boolean; setFetchingModels: (v: boolean) => void
    formPriority: string; setFormPriority: (v: string) => void
    formWeight: string; setFormWeight: (v: string) => void
  }
  isEdit?: boolean
}) {
  const {
    formName, setFormName, formBaseUrl, setFormBaseUrl, formApiKey, setFormApiKey,
    formSelectedModels, setFormSelectedModels, availableModels, setAvailableModels,
    fetchingModels, setFetchingModels, formPriority, setFormPriority, formWeight, setFormWeight,
  } = form;

  const handleFetchModels = async () => {
    if (!formBaseUrl.trim() || !formApiKey.trim()) {
      toast.error('请先填写基础 URL 和 API 密钥');
      return;
    }
    setFetchingModels(true);
    try {
      const result = await fetchUpstreamModels(formBaseUrl.trim(), formApiKey.trim());
      setAvailableModels(result.models);
      if (result.models.length === 0) {
        toast.warning('未获取到任何模型');
      } else {
        toast.success(`获取到 ${result.models.length} 个模型`);
      }
    } catch (error: any) {
      toast.error(error.message || '获取模型列表失败');
    } finally {
      setFetchingModels(false);
    }
  };

  const toggleModel = (model: string) => {
    setFormSelectedModels(
      formSelectedModels.includes(model)
        ? formSelectedModels.filter(m => m !== model)
        : [...formSelectedModels, model]
    );
  };

  const allSelected = availableModels.length > 0 && availableModels.every(m => formSelectedModels.includes(m));

  const toggleAll = () => {
    if (allSelected) {
      setFormSelectedModels([]);
    } else {
      setFormSelectedModels([...availableModels]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] glass border-white/20">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>名称 *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例如: CLI2API 主源" required />
            </div>
            <div className="grid gap-2">
              <Label>基础 URL *</Label>
              <Input value={formBaseUrl} onChange={(e) => setFormBaseUrl(e.target.value)} placeholder="https://api.example.com" required />
            </div>
            <div className="grid gap-2">
              <Label>API 密钥 {isEdit ? '' : '*'}</Label>
              <Input value={formApiKey} onChange={(e) => setFormApiKey(e.target.value)}
                placeholder={isEdit ? '留空则不修改' : 'sk-...'} required={!isEdit} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>支持模型</Label>
                <div className="flex items-center gap-2">
                  {availableModels.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1"
                      onClick={toggleAll}>
                      <CheckSquare className="h-3 w-3" />
                      {allSelected ? '清空' : '全选'}
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs gap-1"
                    onClick={handleFetchModels} disabled={fetchingModels}>
                    {fetchingModels
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Download className="h-3 w-3" />}
                    获取模型
                  </Button>
                </div>
              </div>
              {availableModels.length > 0 ? (
                <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto space-y-1">
                  {availableModels.map(model => (
                    <div key={model} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleModel(model)}>
                      <Checkbox
                        checked={formSelectedModels.includes(model)}
                        onCheckedChange={() => toggleModel(model)}
                        id={`model-${model}`}
                      />
                      <label htmlFor={`model-${model}`} className="text-sm cursor-pointer flex-1 truncate">{model}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md p-3 text-sm text-muted-foreground text-center">
                  点击"获取模型"从上游自动拉取，或手动输入
                </div>
              )}
              {formSelectedModels.length > 0 && (
                <p className="text-xs text-muted-foreground">已选 {formSelectedModels.length} 个模型</p>
              )}
              {availableModels.length === 0 && (
                <Input value={formSelectedModels.join(', ')}
                  onChange={(e) => setFormSelectedModels(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="gpt-4o, claude-3.5-sonnet, ..." />
              )}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>取消</Button>
            <Button type="submit" disabled={loading}>{loading ? '保存中...' : isEdit ? '保存' : '创建'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
