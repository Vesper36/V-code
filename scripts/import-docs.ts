/**
 * 批量导入 /opt/codex_md/docs/ 文档模板到数据库
 * 运行：npx tsx --env-file=.env.local scripts/import-docs.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

function createPrisma() {
  const url = new URL(process.env.DATABASE_URL!)
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 3,
  })
  return new PrismaClient({ adapter })
}

const prisma = createPrisma()

// 占位符替换映射
const REPLACEMENTS: Record<string, string> = {
  '{YOUR_PLATFORM_NAME}': 'V-CODE',
  '{YOUR_DOMAIN}': 'v-code.vesper36.com',
  '{BASE_URL}': 'v-code.vesper36.com',
  '{API_KEY}': 'sk-xxxxxxxxxxxxxxxx',
  '{MODEL_ID}': 'gpt-4o',
  '{EMBEDDING_MODEL_ID}': 'text-embedding-3-small',
  '{IMAGE_MODEL_ID}': 'dall-e-3',
}

function replacePlaceholders(text: string): string {
  let result = text
  for (const [key, value] of Object.entries(REPLACEMENTS)) {
    result = result.replaceAll(key, value)
  }
  return result
}

// 文档导入配置：[文件名, 标题, slug, 摘要, 分类名, 排序]
const DOCS: Array<{
  file: string
  title: string
  slug: string
  excerpt: string
  category: string
  sortOrder: number
}> = [
  {
    file: '00-beginner-handbook.md',
    title: '零基础入门教程',
    slug: 'beginner-handbook',
    excerpt: '第一次接触 API？这份手把手教程带你从 0 到 1 完成接入，约 15 分钟。',
    category: '入门指南',
    sortOrder: 0,
  },
  {
    file: '01-quickstart.md',
    title: '快速开始（5 分钟接入）',
    slug: 'quickstart',
    excerpt: '5 分钟内完成首个 API 调用，获得可用响应。',
    category: '入门指南',
    sortOrder: 1,
  },
  {
    file: '02-api-reference.md',
    title: 'API 参考',
    slug: 'api-reference',
    excerpt: '完整接口文档：模型列表、Chat Completions、Embeddings 等核心接口说明。',
    category: 'API 文档',
    sortOrder: 0,
  },
  {
    file: '03-sdk-examples.md',
    title: 'SDK 与多语言示例',
    slug: 'sdk-examples',
    excerpt: 'Python、Node.js、curl 等多语言可直接运行示例代码。',
    category: 'API 文档',
    sortOrder: 1,
  },
  {
    file: '04-tools-integration.md',
    title: '工具集成指南',
    slug: 'tools-integration',
    excerpt: 'Postman、Apifox、Cherry Studio、Open WebUI 等客户端接入配置。',
    category: 'API 文档',
    sortOrder: 2,
  },
  {
    file: '05-errors-and-troubleshooting.md',
    title: '错误码与排障手册',
    slug: 'errors-and-troubleshooting',
    excerpt: '常见状态码含义、10 分钟自助排障流程、高频问题处理方案。',
    category: '帮助中心',
    sortOrder: 0,
  },
  {
    file: '06-billing-and-rate-limits.md',
    title: '计费与限流说明',
    slug: 'billing-and-rate-limits',
    excerpt: '计费规则、token 统计、RPM/TPM 限流策略与配额管理。',
    category: '帮助中心',
    sortOrder: 1,
  },
  {
    file: '07-security-and-compliance.md',
    title: '安全与合规',
    slug: 'security-and-compliance',
    excerpt: 'API Key 安全管理、数据保护策略、合规使用规范。',
    category: '帮助中心',
    sortOrder: 2,
  },
  {
    file: '09-faq.md',
    title: '常见问题（FAQ）',
    slug: 'faq',
    excerpt: '开发者最常遇到的问题与解答，快速自助排障。',
    category: '帮助中心',
    sortOrder: 3,
  },
  {
    file: '08-merchant-operations.md',
    title: '商家运营指南',
    slug: 'merchant-operations',
    excerpt: '面向商家的额度管理、子账号、路由策略与监控运营能力。',
    category: '进阶功能',
    sortOrder: 0,
  },
]

const DOCS_DIR = '/opt/codex_md/docs'

async function main() {
  console.log('开始导入文档...')

  // 1. 建分类
  const categoryNames = [...new Set(DOCS.map(d => d.category))]
  const categoryMap = new Map<string, number>()

  for (const name of categoryNames) {
    const slug = name.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '-').toLowerCase()
    const cat = await prisma.docCategory.upsert({
      where: { slug },
      create: { name, slug, icon: 'book', sortOrder: categoryNames.indexOf(name) },
      update: { name },
    })
    categoryMap.set(name, cat.id)
    console.log(`  分类: ${name} (id=${cat.id})`)
  }

  // 2. 导入文档
  let created = 0, skipped = 0
  for (const meta of DOCS) {
    const filePath = path.join(DOCS_DIR, meta.file)
    if (!fs.existsSync(filePath)) {
      console.warn(`  跳过: ${meta.file} (文件不存在)`)
      skipped++
      continue
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8')
    const content = replacePlaceholders(rawContent)
    const categoryId = categoryMap.get(meta.category)

    const existing = await prisma.document.findUnique({ where: { slug: meta.slug } })
    if (existing) {
      await prisma.document.update({
        where: { slug: meta.slug },
        data: {
          title: meta.title,
          content,
          excerpt: meta.excerpt,
          categoryId,
          sortOrder: meta.sortOrder,
          status: 'published',
          publishedAt: existing.publishedAt ?? new Date(),
        },
      })
      console.log(`  更新: ${meta.title}`)
    } else {
      await prisma.document.create({
        data: {
          title: meta.title,
          slug: meta.slug,
          content,
          excerpt: meta.excerpt,
          categoryId,
          sortOrder: meta.sortOrder,
          status: 'published',
          publishedAt: new Date(),
          author: 'admin',
        },
      })
      console.log(`  创建: ${meta.title}`)
    }
    created++
  }

  console.log(`\n完成: ${created} 篇文档, ${skipped} 篇跳过`)
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
