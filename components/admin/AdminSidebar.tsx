'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Key,
  Users,
  BarChart3,
  Settings,
  FileText,
  Radio
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { href: '/admin/keys', label: '密钥管理', icon: Key },
    { href: '/admin/users', label: '用户管理', icon: Users },
    { href: '/admin/channels', label: '渠道管理', icon: Radio },
    { href: '/admin/analytics', label: '数据分析', icon: BarChart3 },
    { href: '/admin/logs', label: '系统日志', icon: FileText },
    { href: '/admin/settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="hidden border-r bg-background/60 backdrop-blur-md md:block md:w-64 lg:w-72 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
