'use client'

import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react'
import slugify from 'slugify'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  icon: string
  sortOrder: number
  isVisible: boolean
  children: Category[]
  _count: { documents: number }
}

interface FormData {
  name: string
  slug: string
  description: string
  parentId: number | null
  icon: string
  sortOrder: number
  isVisible: boolean
}

const emptyForm: FormData = {
  name: '', slug: '', description: '', parentId: null,
  icon: 'file-text', sortOrder: 0, isVisible: true,
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/docs/categories')
    const data = await res.json()
    setCategories(data)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing
        ? `/api/docs/categories/${editing}`
        : '/api/docs/categories'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '操作失败')
        return
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
      await fetchCategories()
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (cat: Category) => {
    setEditing(cat.id)
    setForm({
      name: cat.name, slug: cat.slug,
      description: cat.description || '',
      parentId: cat.parentId, icon: cat.icon,
      sortOrder: cat.sortOrder, isVisible: cat.isVisible,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此分类?')) return
    const res = await fetch(`/api/docs/categories/${id}`, {
      method: 'DELETE', credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || '删除失败')
      return
    }
    await fetchCategories()
  }

  const handleAdd = (parentId: number | null = null) => {
    setEditing(null)
    setForm({ ...emptyForm, parentId })
    setShowForm(true)
  }

  const renderCategory = (cat: Category, depth: number = 0) => {
    const hasChildren = cat.children?.length > 0
    const isExpanded = expanded.has(cat.id)

    return (
      <div key={cat.id}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md group"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {hasChildren ? (
            <button type="button" onClick={() => toggleExpand(cat.id)} className="p-0.5">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <span className="flex-1 text-sm">{cat.name}</span>
          <span className="text-xs text-muted-foreground">{cat._count.documents} 篇</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button type="button" onClick={() => handleAdd(cat.id)} title="添加子分类" className="p-1 hover:bg-muted rounded">
              <Plus size={14} />
            </button>
            <button type="button" onClick={() => handleEdit(cat)} title="编辑" className="p-1 hover:bg-muted rounded">
              <Pencil size={14} />
            </button>
            <button type="button" onClick={() => handleDelete(cat.id)} title="删除" className="p-1 hover:bg-muted rounded text-destructive">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && cat.children.map((child) => renderCategory(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">分类管理</h2>
        <button
          type="button"
          onClick={() => handleAdd()}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus size={14} /> 新建分类
        </button>
      </div>

      {/* Category tree */}
      <div className="border rounded-lg divide-y">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">暂无分类</div>
        ) : (
          categories.map((cat) => renderCategory(cat))
        )}
      </div>

      {/* Form dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? '编辑分类' : '新建分类'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setForm((f) => ({
                      ...f, name,
                      slug: !editing ? slugify(name, { lower: true, strict: true }) : f.slug,
                    }))
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md bg-background resize-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">排序</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">可见</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null) }}
                  className="flex-1 py-2 border rounded-md hover:bg-muted"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
