'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { FileText, Clock, Search } from 'lucide-react'
import { format } from 'date-fns'

interface DocItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  category: { id: number; name: string; slug: string } | null
  publishedAt: string | null
  viewCount: number
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/docs?status=published&perPage=50')
      .then((r) => r.json())
      .then((data) => setDocs(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredDocs = docs.filter((doc) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.excerpt?.toLowerCase().includes(query) ||
      doc.category?.name.toLowerCase().includes(query)
    )
  })

  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">文档中心</h1>
        <p className="text-muted-foreground mb-6">
          浏览所有已发布的文档和指南。
        </p>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="搜索文档标题、内容或分类..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {loading ? (
          <div className="text-muted-foreground py-8">加载中...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-muted-foreground py-8">
            {searchQuery ? '未找到匹配的文档' : '暂无已发布的文档'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <Link
                key={doc.id}
                href={`/docs/${doc.slug}`}
                className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <FileText size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{doc.title}</h3>
                    {doc.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {doc.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {doc.category && (
                        <span className="px-1.5 py-0.5 bg-muted rounded">
                          {doc.category.name}
                        </span>
                      )}
                      {doc.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {format(new Date(doc.publishedAt), 'yyyy-MM-dd')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DocsLayout>
  )
}
