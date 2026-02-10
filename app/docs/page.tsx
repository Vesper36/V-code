'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { FileText, Clock } from 'lucide-react'
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

  useEffect(() => {
    fetch('/api/docs?status=published&perPage=50')
      .then((r) => r.json())
      .then((data) => setDocs(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <DocsLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">文档中心</h1>
        <p className="text-muted-foreground mb-8">
          浏览所有已发布的文档和指南。
        </p>

        {loading ? (
          <div className="text-muted-foreground py-8">加载中...</div>
        ) : docs.length === 0 ? (
          <div className="text-muted-foreground py-8">暂无已发布的文档。</div>
        ) : (
          <div className="space-y-4">
            {docs.map((doc) => (
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
