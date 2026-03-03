'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { MarkdownRenderer } from '@/components/docs/MarkdownRenderer'
import { DocTOC } from '@/components/docs/DocTOC'
import { ReadingProgress } from '@/components/docs/ReadingProgress'
import { BackToTop } from '@/components/docs/BackToTop'
import { format } from 'date-fns'
import { Clock, Eye, User, BookOpen } from 'lucide-react'

// 计算阅读时间（基于字数，中文约 300 字/分钟）
function calculateReadingTime(content: string): number {
  const wordCount = content.length
  return Math.ceil(wordCount / 300)
}

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

  if (notFoundState) {
    return (
      <DocsLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">文档不存在或已被移除</p>
          <Link href="/docs" className="text-primary hover:underline text-sm">
            返回文档中心
          </Link>
        </div>
      </DocsLayout>
    )
  }

  if (loading) {
    return (
      <DocsLayout>
        <div className="text-muted-foreground py-8">加载中...</div>
      </DocsLayout>
    )
  }

  if (!doc) return null

  const readingTime = calculateReadingTime(doc.content)

  return (
    <>
      <ReadingProgress />
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

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-md">
                <User size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">作者：</span>
                <span className="font-medium">{doc.author || 'V-CODE'}</span>
              </div>
              {doc.publishedAt && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-md">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">发布：</span>
                  <span className="font-medium">{format(new Date(doc.publishedAt), 'yyyy-MM-dd')}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-md">
                <BookOpen size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">阅读：</span>
                <span className="font-medium">约 {readingTime} 分钟</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-md">
                <Eye size={14} className="text-muted-foreground" />
                <span className="font-medium">{doc.viewCount}</span>
                <span className="text-muted-foreground">次浏览</span>
              </div>
            </div>
          </div>

          <hr className="mb-8 border-border" />

          {/* Content */}
          <MarkdownRenderer content={doc.content} />
        </article>
      </DocsLayout>
      <BackToTop />
    </>
  )
}
