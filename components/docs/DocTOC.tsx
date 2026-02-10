'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface DocTOCProps {
  content: string
}

export function DocTOC({ content }: DocTOCProps) {
  const [items, setItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const headingRegex = /<h([1-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-3]>/gi
    const toc: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      toc.push({
        level: parseInt(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]*>/g, ''),
      })
    }

    setItems(toc)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    const headings = document.querySelectorAll('h1[id], h2[id], h3[id]')
    headings.forEach((h) => observer.observe(h))

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className="space-y-1">
      <h4 className="text-sm font-semibold mb-3">目录</h4>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`block text-sm py-0.5 transition-colors hover:text-primary ${
            activeId === item.id
              ? 'text-primary font-medium'
              : 'text-muted-foreground'
          }`}
          style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  )
}
