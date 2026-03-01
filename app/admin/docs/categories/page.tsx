'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { CategoryManager } from '@/components/admin/docs/CategoryManager'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/docs" className="p-1.5 hover:bg-muted rounded-md">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">分类管理</h1>
        </div>
        <CategoryManager />
      </div>
    </AdminLayout>
  )
}
