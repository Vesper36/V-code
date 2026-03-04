'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { DocSidebar } from './DocSidebar'
import { Button } from '@/components/ui/button'

interface DocsLayoutProps {
  children: React.ReactNode
  toc?: React.ReactNode
}

export function DocsLayout({ children, toc }: DocsLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">文档中心</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="fixed top-[57px] left-0 bottom-0 w-80 max-w-[85vw] bg-background border-r overflow-y-auto">
            <div className="px-3">
              <DocSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </nav>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r sticky top-0 h-screen overflow-y-auto">
          <div className="px-3">
            <div className="py-4 border-b">
              <h2 className="text-lg font-bold px-2">文档中心</h2>
            </div>
            <DocSidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 md:px-6 lg:px-10 py-6 md:py-8">
          {children}
        </main>

        {/* TOC */}
        {toc && (
          <aside className="hidden xl:block w-56 shrink-0 sticky top-0 h-screen overflow-y-auto py-8 pr-4">
            {toc}
          </aside>
        )}
      </div>
    </div>
  )
}
