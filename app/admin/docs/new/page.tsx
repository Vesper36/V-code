'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { TiptapEditor } from '@/components/admin/docs/TiptapEditor'
import { DocumentForm } from '@/components/admin/docs/DocumentForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewDocPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

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
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...meta, content }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '创建失败')
        return
      }
      const doc = await res.json()
      router.push(`/admin/docs/${doc.id}/edit`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/docs" className="p-1.5 hover:bg-muted rounded-md">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">新建文档</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <TiptapEditor content={content} onChange={setContent} />
          </div>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">文档信息</h3>
              <DocumentForm
                onSubmit={handleSubmit}
                submitLabel="创建文档"
                loading={saving}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
