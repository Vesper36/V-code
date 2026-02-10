'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { TiptapEditor } from '@/components/admin/docs/TiptapEditor'
import { DocumentForm } from '@/components/admin/docs/DocumentForm'
import { ArrowLeft, Send, Archive } from 'lucide-react'
import Link from 'next/link'

interface DocData {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: string
  categoryId: number | null
  isPinned: boolean
  sortOrder: number
  category: { id: number; name: string; slug: string } | null
}

export default function EditDocPage() {
  const router = useRouter()
  const params = useParams()
  const docId = params.id as string

  const [doc, setDoc] = useState<DocData | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/docs/${docId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setDoc(data)
        setContent(data.content || '')
      })
      .catch(() => router.push('/admin/docs'))
      .finally(() => setLoading(false))
  }, [docId, router])

  const handleSubmit = async (meta: {
    title: string
    slug: string
    excerpt: string
    categoryId: number | null
    isPinned: boolean
    sortOrder: number
  }) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/docs/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...meta, content }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '保存失败')
        return
      }
      const updated = await res.json()
      setDoc(updated)
      alert('保存成功')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    const res = await fetch(`/api/docs/${docId}/publish`, {
      method: 'POST', credentials: 'include',
    })
    if (res.ok) {
      const updated = await res.json()
      setDoc(updated)
    }
  }

  const handleArchive = async () => {
    const res = await fetch(`/api/docs/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'archived' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setDoc(updated)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          加载中...
        </div>
      </AdminLayout>
    )
  }

  if (!doc) return null

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/docs" className="p-1.5 hover:bg-muted rounded-md">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">编辑文档</h1>
          </div>
          <div className="flex gap-2">
            {doc.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Send size={14} /> 发布
              </button>
            )}
            {doc.status === 'published' && (
              <button
                onClick={handleArchive}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-muted"
              >
                <Archive size={14} /> 归档
              </button>
            )}
          </div>
        </div>

        {/* Editor + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <TiptapEditor
              content={content}
              onChange={setContent}
            />
          </div>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">文档信息</h3>
              <DocumentForm
                initialData={{
                  title: doc.title,
                  slug: doc.slug,
                  excerpt: doc.excerpt || '',
                  categoryId: doc.categoryId,
                  isPinned: doc.isPinned,
                  sortOrder: doc.sortOrder,
                  status: doc.status,
                }}
                onSubmit={handleSubmit}
                submitLabel="保存修改"
                loading={saving}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
