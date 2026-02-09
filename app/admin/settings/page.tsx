'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearAdminSession } from '@/lib/auth/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, Server, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const adminApiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || '';
  const maskedKey = adminApiKey
    ? `${adminApiKey.substring(0, 8)}...${ adminApiKey.substring(adminApiKey.length - 4)}`
    : 'Not configured';

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const envPwd = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (currentPwd !== envPwd) {
      toast.error('Current password is incorrect');
      return;
    }
    if (newPwd.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('Passwords do not match');
      return;
    }
    toast.error('Password change requires updating NEXT_PUBLIC_ADMIN_PASSWORD in .env.local and redeploying');
  };

  const handleLogoutAll = () => {
    clearAdminSession();
    toast.success('All sessions cleared');
    router.push('/admin/login');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            System configuration and security settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" /> System Info
              </CardTitle>
              <CardDescription>Current system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <Label className="text-muted-foreground">Backend API</Label>
                <p className="text-sm font-mono">https://v-api.vesper36.top</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground">Admin Username</Label>
                <p className="text-sm font-mono">{process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'}</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground">Admin API Key</Label>
                <p className="text-sm font-mono">{maskedKey}</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground">Session Expiry</Label>
                <p className="text-sm">24 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Security
              </CardTitle>
              <CardDescription>Authentication and session management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="current-pwd">Current Password</Label>
                  <Input id="current-pwd" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-pwd">New Password</Label>
                  <Input id="new-pwd" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-pwd">Confirm Password</Label>
                  <Input id="confirm-pwd" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                </div>
                <Button type="submit" variant="outline" className="w-full">
                  <Key className="h-4 w-4 mr-2" /> Change Password
                </Button>
              </form>
              <div className="pt-2 border-t">
                <Button variant="destructive" className="w-full" onClick={handleLogoutAll}>
                  Clear All Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
