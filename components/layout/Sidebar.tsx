'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Key, BookOpen, Settings, Sparkles, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useI18n';

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslation();

  const navItems = [
    { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/keys', label: t.nav.keys, icon: Key },
    { href: '/models', label: t.nav.models, icon: Activity },
    { href: '/showcase', label: t.nav.showcase, icon: Sparkles },
    { href: '/tutorial', label: t.nav.tutorial, icon: BookOpen },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="hidden border-r bg-background/60 backdrop-blur-md md:block md:w-64 lg:w-72 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
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

export function MobileNav() {
    const pathname = usePathname();
    const t = useTranslation();

    const navItems = [
      { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
      { href: '/keys', label: t.nav.keys, icon: Key },
      { href: '/models', label: t.nav.models, icon: Activity },
      { href: '/tutorial', label: t.nav.tutorial, icon: BookOpen },
      { href: '/settings', label: t.nav.settings, icon: Settings },
    ];
    
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg p-2 z-50 pb-safe">
            <nav className="flex justify-around items-center">
                 {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-md transition-all text-xs",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
