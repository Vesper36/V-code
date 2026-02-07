'use client';

import { Menu, Sun, Moon, Settings, Github } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function Header() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
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
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            <span>GitHub</span>
          </Link>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
          
          <Link href="/settings" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
             <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
