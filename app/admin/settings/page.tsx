'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminLogout, getAdminSession } from '@/lib/auth/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, Server, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const session = getAdminSession();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 6) {
      toast.error('新密码至少需要 6 个字符');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('两次输入的密码不一致');
      return;
    }
    toast.error('修改密码需要更新 .env.local 中的 ADMIN_PASSWORD 并重新部署');
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
                <Server className="h-5 w-5" /> 系统信息
              </CardTitle>
              <CardDescription>当前系统配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <Label className="text-muted-foreground">后端 API</Label>
                <p className="text-sm font-mono">https://v-api.vesper36.top</p>
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
                <p className="text-sm">24 小时</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> 安全设置
              </CardTitle>
              <CardDescription>身份验证与会话管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button type="submit" variant="outline" className="w-full">
                  <Key className="h-4 w-4 mr-2" /> 修改密码
                </Button>
              </form>
              <div className="pt-2 border-t">
                <Button variant="destructive" className="w-full" onClick={handleLogoutAll}>
                  清除所有会话
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
