'use client'

import { DocSidebar } from './DocSidebar'

interface DocsLayoutProps {
  children: React.ReactNode
  toc?: React.ReactNode
}

export function DocsLayout({ children, toc }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r sticky top-0 h-screen overflow-y-auto">
          <div className="px-3">
            <div className="py-4 border-b">
              <h2 className="text-lg font-bold px-2">文档中心</h2>
            </div>
            <DocSidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 lg:px-10 py-8">
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
