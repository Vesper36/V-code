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
      .then(r => r.json())
      .then((docsData) => {
        setDocs(docsData.items || [])
      })
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
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">欢迎使用 V-CODE</h1>
          <p className="text-muted-foreground">
            从左侧菜单选择文档开始阅读,或使用下方搜索快速查找内容
          </p>
        </div>

        {/* Search Only */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="搜索文档标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground py-8">加载中...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? '未找到匹配的文档' : '暂无已发布的文档'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <Link
                key={doc.id}
                href={`/docs/${doc.slug}`}
                className="block p-5 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {doc.title}
                    </h3>
                    {doc.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                        {doc.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      {doc.category && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {doc.category.name}
                        </span>
                      )}
                      {doc.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {format(new Date(doc.publishedAt), 'yyyy-MM-dd')}
                        </span>
                      )}
                      <span>{doc.viewCount} 次浏览</span>
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
