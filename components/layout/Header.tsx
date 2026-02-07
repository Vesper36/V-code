'use client';

import { Menu, Sun, Moon, Settings, Github } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary">V-AI</span>
            <span className="text-muted-foreground hidden sm:inline-block text-sm font-normal">API Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/v-ai/v-ai"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2"
          >
            <Github className="h-5 w-5" />
            <span>GitHub</span>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Link href="/settings">
             <Button variant="ghost" size="icon" className="rounded-full">
               <Settings className="h-5 w-5" />
             </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
