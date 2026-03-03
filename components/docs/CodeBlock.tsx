'use client'

import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  variants?: Array<{ lang: string; code: string; label?: string }>
}

export function CodeBlock({ code, language, variants }: CodeBlockProps) {
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const hasVariants = variants && variants.length > 0
  const currentCode = hasVariants ? variants[activeTab].code : code
  const currentLang = hasVariants ? variants[activeTab].lang : language

  useEffect(() => {
    let cancelled = false
    import('shiki').then(({ codeToHtml }) => {
      codeToHtml(currentCode, {
        lang: currentLang || 'text',
        theme: 'github-dark',
      }).then((result) => {
        if (!cancelled) setHtml(result)
      }).catch(() => {
        if (!cancelled) setHtml('')
      })
    })
    return () => { cancelled = true }
  }, [currentCode, currentLang])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-zinc-800">
      {(currentLang || hasVariants) && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-800 text-zinc-400 text-xs border-b border-zinc-700">
          {hasVariants ? (
            <div className="flex gap-2">
              {variants.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-2 py-1 rounded transition-colors ${
                    activeTab === idx
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'hover:bg-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  {variant.label || variant.lang}
                </button>
              ))}
            </div>
          ) : (
            <span>{currentLang}</span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      )}
      {!currentLang && !hasVariants && (
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
          className="[&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:text-sm [&>pre]:bg-zinc-900"
        />
      ) : (
        <pre className="p-4 bg-zinc-900 text-zinc-100 overflow-x-auto text-sm">
          <code>{currentCode}</code>
        </pre>
      )}
    </div>
  )
}
