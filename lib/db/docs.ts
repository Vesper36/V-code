import { prisma } from './prisma'
import { DocStatus } from '@prisma/client'

export interface CreateDocInput {
  title: string
  slug: string
  content: string
  excerpt?: string
  status?: DocStatus
  categoryId?: number
  isPinned?: boolean
  sortOrder?: number
  author?: string
}

export interface UpdateDocInput {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  status?: DocStatus
  categoryId?: number | null
  isPinned?: boolean
  sortOrder?: number
}

export interface DocListParams {
  page?: number
  perPage?: number
  status?: DocStatus
  categoryId?: number
  search?: string
}

export async function getDocuments(params: DocListParams = {}) {
  const { page = 1, perPage = 20, status, categoryId, search } = params
  const skip = (page - 1) * perPage

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (categoryId) where.categoryId = categoryId
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take: perPage,
      orderBy: [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.document.count({ where }),
  ])

  return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) }
}

export async function getDocumentById(id: number) {
  return prisma.document.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, slug: true } } },
  })
}

export async function getDocumentBySlug(slug: string) {
  return prisma.document.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  })
}

export async function createDocument(data: CreateDocInput) {
  return prisma.document.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status || 'draft',
      categoryId: data.categoryId,
      isPinned: data.isPinned || false,
      sortOrder: data.sortOrder || 0,
      author: data.author || 'admin',
    },
  })
}

export async function updateDocument(id: number, data: UpdateDocInput) {
  return prisma.document.update({ where: { id }, data })
}

export async function deleteDocument(id: number) {
  return prisma.document.delete({ where: { id } })
}

export async function publishDocument(id: number) {
  return prisma.document.update({
    where: { id },
    data: { status: 'published', publishedAt: new Date() },
  })
}

export async function incrementViewCount(id: number) {
  return prisma.document.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })
}

export async function getPublishedDocuments(params: DocListParams = {}) {
  return getDocuments({ ...params, status: 'published' })
}
