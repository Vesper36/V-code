'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Globe, Plus, Trash2, Loader2, Shield, RefreshCw,
  ExternalLink, Edit, AlertTriangle, Server,
} from 'lucide-react';

interface DomainInfo {
  filename: string;
  domain: string;
  port: number | null;
  ssl: boolean;
  cors: boolean;
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/domains', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setDomains(data.domains || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-7 w-7 text-primary" />
              域名管理
            </h1>
            <p className="text-muted-foreground">
              管理 Nginx 反向代理与 SSL 证书配置
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchDomains} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <AddDomainDialog onSuccess={fetchDomains} />
          </div>
        </div>

        <VpsInfoCard />

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  请确认 VPS 上的域名管理服务已启动 (domain-manager.service)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card className="glass">
            <CardContent className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <DomainList domains={domains} onRefresh={fetchDomains} />
        )}
      </div>
    </AdminLayout>
  );
}

function VpsInfoCard() {
  return (
    <Card className="glass border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-primary">VPS: 23.80.90.30 (HZUS)</p>
            <p className="text-muted-foreground">
              添加域名前，请先在 DNS 服务商处将域名 A 记录指向此 IP。
              系统将自动配置 Nginx 反向代理并通过 Certbot 申请 SSL 证书 (HTTP-01 验证)。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DomainList({ domains, onRefresh }: { domains: DomainInfo[]; onRefresh: () => void }) {
  const [deleting, setDeleting] = useState('');

  const handleDelete = async (domain: string) => {
    if (!confirm(`确定要删除域名 ${domain} 的配置吗？将同时移除 Nginx 配置和 SSL 证书。`)) return;
    setDeleting(domain);
    try {
      const res = await fetch(`/api/admin/domains/${encodeURIComponent(domain)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '删除失败');
      toast.success(`${domain} 已删除`);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || '删除失败');
    } finally {
      setDeleting('');
    }
  };

  if (domains.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Globe className="h-8 w-8 mb-2 opacity-50" />
          <p>暂无域名配置</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {domains.map(d => (
        <Card key={d.filename} className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-medium truncate">{d.domain}</span>
                    {d.ssl && (
                      <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                        <Shield className="h-3 w-3 mr-1" /> SSL
                      </Badge>
                    )}
                    {d.cors && (
                      <Badge variant="secondary" className="text-xs">CORS</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.port ? `127.0.0.1:${d.port}` : '未知端口'} | {d.filename}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => window.open(`https://${d.domain}`, '_blank')}
                  title="访问"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(d.domain)}
                  disabled={deleting === d.domain}
                  title="删除"
                >
                  {deleting === d.domain
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AddDomainDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [port, setPort] = useState('');
  const [cors, setCors] = useState(false);
  const [ssl, setSsl] = useState(true);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setDomain('');
    setPort('');
    setCors(false);
    setSsl(true);
  };

  const handleSubmit = async () => {
    if (!domain.trim()) {
      toast.error('请输入域名');
      return;
    }
    if (!port.trim() || isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535) {
      toast.error('请输入有效端口 (1-65535)');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          domain: domain.trim(),
          port: Number(port),
          cors,
          ssl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '添加失败');

      if (data.ssl === false && ssl) {
        toast.warning(`${domain} 已添加，但 SSL 证书申请失败。请确认 DNS 已指向 VPS IP。`);
      } else {
        toast.success(`${domain} 添加成功`);
      }
      reset();
      setOpen(false);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || '添加失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> 添加域名
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加域名</DialogTitle>
          <DialogDescription>
            配置 Nginx 反向代理，自动申请 SSL 证书
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="add-domain">域名</Label>
            <Input
              id="add-domain"
              placeholder="example.vesper36.top"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              请先将此域名的 A 记录指向 23.80.90.30
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="add-port">目标端口</Label>
            <Input
              id="add-port"
              placeholder="3000"
              value={port}
              onChange={e => setPort(e.target.value)}
              type="number"
              min={1}
              max={65535}
            />
            <p className="text-xs text-muted-foreground">
              Nginx 将代理到 127.0.0.1:端口
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>SSL 证书</Label>
              <p className="text-xs text-muted-foreground">通过 Certbot 自动申请</p>
            </div>
            <Switch checked={ssl} onCheckedChange={setSsl} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>CORS 跨域</Label>
              <p className="text-xs text-muted-foreground">允许所有来源的跨域请求</p>
            </div>
            <Switch checked={cors} onCheckedChange={setCors} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? '配置中...' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
