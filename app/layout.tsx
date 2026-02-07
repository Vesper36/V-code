import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/layout/Header';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'V-AI | API Key Dashboard',
  description: 'Visualize and manage your API usage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}