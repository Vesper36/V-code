'use client'

import { useState, useEffect } from 'react'
import slugify from 'slugify'

interface Category {
  id: number
  name: string
  slug: string
}

interface DocumentFormProps {
  initialData?: {
    title: string
    slug: string
    excerpt: string
    categoryId: number | null
    isPinned: boolean
    sortOrder: number
    status: string
  }
  onSubmit: (data: {
    title: string
    slug: string
    excerpt: string
    categoryId: number | null
    isPinned: boolean
    sortOrder: number
  }) => void
  submitLabel: string
  loading?: boolean
}

export function DocumentForm({ initialData, onSubmit, submitLabel, loading }: DocumentFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.categoryId || null)
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false)
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0)
  const [categories, setCategories] = useState<Category[]>([])
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug)

  useEffect(() => {
    fetch('/api/docs/categories')
      .then((res) => res.json())
      .then((data) => {
        const flat = flattenCategories(data)
        setCategories(flat)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title, { lower: true, strict: true }))
    }
  }, [title, autoSlug])

  function flattenCategories(cats: (Category & { children?: Category[] })[], depth = 0): Category[] {
    const result: Category[] = []
    for (const cat of cats) {
      result.push({ ...cat, name: '\u00A0'.repeat(depth * 4) + cat.name })
      if (cat.children?.length) {
        result.push(...flattenCategories(cat.children, depth + 1))
      }
    }
    return result
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ title, slug, excerpt, categoryId, isPinned, sortOrder })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Slug
          <button
            type="button"
            onClick={() => setAutoSlug(!autoSlug)}
            className="ml-2 text-xs text-muted-foreground hover:text-primary"
          >
            {autoSlug ? '手动编辑' : '自动生成'}
          </button>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setAutoSlug(false); setSlug(e.target.value) }}
          className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
          required
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium mb-1">摘要</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded-md bg-background resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">分类</label>
        <select
          value={categoryId || ''}
          onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">无分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Sort & Pin */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">排序</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">置顶</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !title || !slug}
        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? '保存中...' : submitLabel}
      </button>
    </form>
  )
}
