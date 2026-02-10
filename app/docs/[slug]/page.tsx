'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { MarkdownRenderer } from '@/components/docs/MarkdownRenderer'
import { DocTOC } from '@/components/docs/DocTOC'
import { format } from 'date-fns'
import { Clock, Eye } from 'lucide-react'

interface DocDetail {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: { id: number; name: string; slug: string } | null
  publishedAt: string | null
  viewCount: number
  author: string
}

export default function DocDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [doc, setDoc] = useState<DocDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    fetch(`/api/docs?slug=${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((data) => setDoc(data))
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (notFoundState) return notFound()

  if (loading) {
    return (
      <DocsLayout>
        <div className="text-muted-foreground py-8">加载中...</div>
      </DocsLayout>
    )
  }

  if (!doc) return null

  return (
    <DocsLayout toc={<DocTOC content={doc.content} />}>
      <article className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          {doc.category && (
            <span className="inline-block px-2 py-0.5 text-xs bg-muted rounded mb-3">
              {doc.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold">{doc.title}</h1>
          {doc.excerpt && (
            <p className="text-lg text-muted-foreground mt-2">{doc.excerpt}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            {doc.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {format(new Date(doc.publishedAt), 'yyyy-MM-dd')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {doc.viewCount} 次浏览
            </span>
          </div>
        </div>

        {/* Content */}
        <MarkdownRenderer content={doc.content} />
      </article>
    </DocsLayout>
  )
}
