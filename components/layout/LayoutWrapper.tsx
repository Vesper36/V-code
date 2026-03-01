'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar, MobileNav } from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // For admin routes, render children directly without user layout
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For user routes, render with Header and Sidebar
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
