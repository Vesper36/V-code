'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, ChevronDown, FileText } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  children: Category[]
  _count: { documents: number }
}

interface SidebarDoc {
  slug: string
  title: string
  categoryId: number | null
}

export function DocSidebar() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [docs, setDocs] = useState<SidebarDoc[]>([])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/api/docs/categories').then((r) => r.json()),
      fetch('/api/docs?status=published&perPage=200').then((r) => r.json()),
    ]).then(([cats, docsRes]) => {
      setCategories(cats)
      setDocs(docsRes.items || [])
      // Auto-expand all categories
      const ids = new Set<number>()
      const collect = (list: Category[]) => {
        for (const c of list) {
          ids.add(c.id)
          if (c.children) collect(c.children)
        }
      }
      collect(cats)
      setExpanded(ids)
    })
  }, [])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const getDocsForCategory = (catId: number) =>
    docs.filter((d) => d.categoryId === catId)

  const getUncategorizedDocs = () =>
    docs.filter((d) => !d.categoryId)

  const renderCategory = (cat: Category, depth: number = 0) => {
    const catDocs = getDocsForCategory(cat.id)
    const hasChildren = cat.children?.length > 0 || catDocs.length > 0
    const isExpanded = expanded.has(cat.id)

    return (
      <div key={cat.id}>
        <button
          type="button"
          onClick={() => toggleExpand(cat.id)}
          className="flex items-center gap-1.5 w-full text-left py-1.5 px-2 text-sm font-medium hover:bg-muted/50 rounded-md"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-3.5" />
          )}
          {cat.name}
        </button>
        {isExpanded && (
          <>
            {catDocs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className={`flex items-center gap-1.5 py-1.5 px-2 text-sm rounded-md transition-colors ${
                  pathname === `/docs/${doc.slug}`
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              >
                <FileText size={14} className="shrink-0" />
                {doc.title}
              </Link>
            ))}
            {cat.children?.map((child) => renderCategory(child, depth + 1))}
          </>
        )}
      </div>
    )
  }

  const uncategorized = getUncategorizedDocs()

  return (
    <nav className="space-y-1 py-4">
      {categories.map((cat) => renderCategory(cat))}
      {uncategorized.length > 0 && (
        <>
          {categories.length > 0 && <div className="border-t my-2" />}
          {uncategorized.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className={`flex items-center gap-1.5 py-1.5 px-2 text-sm rounded-md transition-colors ${
                pathname === `/docs/${doc.slug}`
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <FileText size={14} className="shrink-0" />
              {doc.title}
            </Link>
          ))}
        </>
      )}
      {categories.length === 0 && docs.length === 0 && (
        <div className="text-sm text-muted-foreground px-2 py-4">
          暂无文档
        </div>
      )}
    </nav>
  )
}
