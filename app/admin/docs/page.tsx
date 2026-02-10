'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Plus, Pencil, Trash2, Eye, Send, Search } from 'lucide-react'
import { format } from 'date-fns'

interface Document {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  category: { id: number; name: string; slug: string } | null
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

interface DocListResponse {
  items: Document[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

const statusMap = {
  draft: { label: '草稿', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  published: { label: '已发布', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  archived: { label: '已归档', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
}

export default function AdminDocsPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Document[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), perPage: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/docs?${params}`)
      const data: DocListResponse = await res.json()
      setDocs(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Failed to fetch docs:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此文档?')) return
    const res = await fetch(`/api/docs/${id}`, {
      method: 'DELETE', credentials: 'include',
    })
    if (res.ok) fetchDocs()
  }

  const handlePublish = async (id: number) => {
    const res = await fetch(`/api/docs/${id}/publish`, {
      method: 'POST', credentials: 'include',
    })
    if (res.ok) fetchDocs()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">文档管理</h1>
            <p className="text-sm text-muted-foreground mt-1">共 {total} 篇文档</p>
          </div>
          <button
            onClick={() => router.push('/admin/docs/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus size={16} /> 新建文档
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索文档..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 border rounded-md bg-background text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">标题</th>
                <th className="text-left px-4 py-3 font-medium">分类</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">浏览</th>
                <th className="text-left px-4 py-3 font-medium">更新时间</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">加载中...</td></tr>
              ) : docs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">暂无文档</td></tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="font-medium">{doc.title}</span>
                      <span className="block text-xs text-muted-foreground font-mono">{doc.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {doc.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[doc.status].class}`}>
                        {statusMap[doc.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.viewCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(doc.updatedAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {doc.status === 'published' && (
                          <button
                            onClick={() => window.open(`/docs/${doc.slug}`, '_blank')}
                            title="查看"
                            className="p-1.5 hover:bg-muted rounded"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {doc.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(doc.id)}
                            title="发布"
                            className="p-1.5 hover:bg-muted rounded text-green-600"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/admin/docs/${doc.id}/edit`)}
                          title="编辑"
                          className="p-1.5 hover:bg-muted rounded"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="删除"
                          className="p-1.5 hover:bg-muted rounded text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 hover:bg-muted"
            >
              上一页
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 hover:bg-muted"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
