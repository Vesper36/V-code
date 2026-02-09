'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { adminLogout, getAdminSession } from '@/lib/auth/admin';
import { LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function AdminHeader() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      setUsername(session.username);
    }
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">V-AI Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {username}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
