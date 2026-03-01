'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminLogout, getAdminSession } from '@/lib/auth/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, Server, Key, Globe, Loader2, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiBaseUrlLoading, setApiBaseUrlLoading] = useState(true);
  const [apiBaseUrlSaving, setApiBaseUrlSaving] = useState(false);

  const session = getAdminSession();

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setApiBaseUrl(data.url || ''))
      .catch(() => {})
      .finally(() => setApiBaseUrlLoading(false));
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiBaseUrl.trim()) {
      toast.error('URL 不能为空');
      return;
    }
    setApiBaseUrlSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: apiBaseUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存失败');
      setApiBaseUrl(data.url);
      toast.success('API Base URL 已更新');
    } catch (e: any) {
      toast.error(e.message || '保存失败');
    } finally {
      setApiBaseUrlSaving(false);
    }
  };

  const [pwdSaving, setPwdSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd) {
      toast.error('请输入当前密码');
      return;
    }
    if (newPwd.length < 6) {
      toast.error('新密码至少需要 6 个字符');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('两次输入的密码不一致');
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'change_password', currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '修改失败');
      toast.success(data.message || '密码已更新');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (e: any) {
      toast.error(e.message || '修改密码失败');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    await adminLogout();
    toast.success('所有会话已清除');
    router.push('/admin/login');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
          <p className="text-muted-foreground">
            系统配置与安全设置
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" /> API 配置
              </CardTitle>
              <CardDescription>配置后端 API 请求地址</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="api-url">API Base URL</Label>
                {apiBaseUrlLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> 加载中...
                  </div>
                ) : (
                  <>
                    <Input
                      id="api-url"
                      value={apiBaseUrl}
                      onChange={e => setApiBaseUrl(e.target.value)}
                      placeholder="https://v-api.vesper36.top"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      所有 API 代理请求将转发到此地址。修改后立即生效，重启容器后恢复为环境变量值。
                    </p>
                  </>
                )}
              </div>
              <Button
                onClick={handleSaveApiUrl}
                disabled={apiBaseUrlLoading || apiBaseUrlSaving}
                className="w-full gap-2"
              >
                {apiBaseUrlSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {apiBaseUrlSaving ? '保存中...' : '保存'}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" /> 系统信息
              </CardTitle>
              <CardDescription>当前系统配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <Label className="text-muted-foreground">后端 API</Label>
                <p className="text-sm font-mono">{apiBaseUrl || '加载中...'}</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground">管理员用户名</Label>
                <p className="text-sm font-mono">{session?.username || '-'}</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground">管理员 API 密钥</Label>
                <p className="text-sm font-mono text-muted-foreground">仅服务端可见</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground">会话有效期</Label>
                <p className="text-sm">30 天</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> 安全设置
              </CardTitle>
              <CardDescription>身份验证与会话管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor="current-pwd">当前密码</Label>
                    <Input id="current-pwd" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-pwd">新密码</Label>
                    <Input id="new-pwd" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-pwd">确认密码</Label>
                    <Input id="confirm-pwd" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                  </div>
                  <Button type="submit" variant="outline" className="w-full gap-2" disabled={pwdSaving}>
                    {pwdSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    {pwdSaving ? '修改中...' : '修改密码'}
                  </Button>
                </form>
                <div className="flex flex-col justify-end">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">清除服务端所有管理员会话，所有已登录设备将被强制退出。</p>
                    <Button variant="destructive" className="w-full" onClick={handleLogoutAll}>
                      清除所有会话
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
