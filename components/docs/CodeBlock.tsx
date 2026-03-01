'use client'

import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('shiki').then(({ codeToHtml }) => {
      codeToHtml(code, {
        lang: language || 'text',
        theme: 'github-dark',
      }).then((result) => {
        if (!cancelled) setHtml(result)
      }).catch(() => {
        if (!cancelled) setHtml('')
      })
    })
    return () => { cancelled = true }
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden">
      {language && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-800 text-zinc-400 text-xs">
          <span>{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      )}
      {!language && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded bg-zinc-700/80 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-200"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
      {html ? (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="[&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:text-sm"
        />
      ) : (
        <pre className="p-4 bg-zinc-900 text-zinc-100 overflow-x-auto text-sm">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
