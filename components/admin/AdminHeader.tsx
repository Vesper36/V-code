'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { adminLogout, getAdminSession } from '@/lib/auth/admin';
import { cn } from '@/lib/utils';
import {
  LogOut, Shield, Menu, X,
  LayoutDashboard, Key, Users, BarChart3,
  Settings, FileText, Radio, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/keys', label: '密钥管理', icon: Key },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/channels', label: '渠道管理', icon: Radio },
  { href: '/admin/docs', label: '文档管理', icon: BookOpen },
  { href: '/admin/analytics', label: '数据分析', icon: BarChart3 },
  { href: '/admin/logs', label: '系统日志', icon: FileText },
  { href: '/admin/settings', label: '系统设置', icon: Settings },
];

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (session) setUsername(session.username);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await adminLogout();
    toast.success('已退出登录');
    router.push('/admin/login');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">V-AI Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">退出</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="fixed top-14 left-0 bottom-0 w-64 bg-background border-r overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
