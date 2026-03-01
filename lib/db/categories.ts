import { prisma } from './prisma'

export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
  parentId?: number
  icon?: string
  sortOrder?: number
  isVisible?: boolean
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  description?: string
  parentId?: number | null
  icon?: string
  sortOrder?: number
  isVisible?: boolean
}

export async function getCategoryTree() {
  const categories = await prisma.docCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { documents: true } },
    },
  })

  // Build tree structure
  const map = new Map<number, typeof categories[0] & { children: typeof categories }>()
  const roots: (typeof categories[0] & { children: typeof categories })[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function getAllCategories() {
  return prisma.docCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { documents: true } },
    },
  })
}

export async function getCategoryById(id: number) {
  return prisma.docCategory.findUnique({
    where: { id },
    include: {
      _count: { select: { documents: true } },
      children: true,
    },
  })
}

export async function createCategory(data: CreateCategoryInput) {
  return prisma.docCategory.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
      icon: data.icon || 'file-text',
      sortOrder: data.sortOrder || 0,
      isVisible: data.isVisible ?? true,
    },
  })
}

export async function updateCategory(id: number, data: UpdateCategoryInput) {
  return prisma.docCategory.update({ where: { id }, data })
}

export async function deleteCategory(id: number) {
  // Check if category has documents
  const count = await prisma.document.count({ where: { categoryId: id } })
  if (count > 0) {
    throw new Error(`Cannot delete category: ${count} documents still reference it`)
  }

  // Move children to parent (or root)
  const category = await prisma.docCategory.findUnique({ where: { id } })
  if (category) {
    await prisma.docCategory.updateMany({
      where: { parentId: id },
      data: { parentId: category.parentId },
    })
  }

  return prisma.docCategory.delete({ where: { id } })
}
