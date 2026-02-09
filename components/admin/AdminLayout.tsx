'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { isAdminAuthenticated, checkAdminSession, clearAdminSession } from '@/lib/auth/admin';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Quick client-side check first
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // Then verify with server
    checkAdminSession().then((valid) => {
      if (!valid) {
        clearAdminSession();
        router.push('/admin/login');
      } else {
        setVerified(true);
      }
      setChecking(false);
    });
  }, [router]);

  if (checking || !verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
