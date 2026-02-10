'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    pre({ children }) {
      return <>{children}</>
    },
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const code = String(children).replace(/\n$/, '')

      if (match) {
        return <CodeBlock code={code} language={match[1]} />
      }

      return (
        <code
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      )
    },
    div({ className, children, ...props }) {
      const calloutType = (props as Record<string, string>)['data-callout-type']
      if ('data-callout' in (props as Record<string, unknown>)) {
        return (
          <Callout type={calloutType as 'info' | 'warning' | 'danger' | 'tip'}>
            {children}
          </Callout>
        )
      }
      return <div className={className}>{children}</div>
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse border border-border text-sm">
            {children}
          </table>
        </div>
      )
    },
    th({ children }) {
      return (
        <th className="border border-border bg-muted px-3 py-2 text-left font-medium">
          {children}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="border border-border px-3 py-2">{children}</td>
      )
    },
    a({ href, children }) {
      const isExternal = href?.startsWith('http')
      return (
        <a
          href={href}
          className="text-primary hover:underline"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
    img({ src, alt }) {
      return (
        <img
          src={src}
          alt={alt || ''}
          className="max-w-full rounded-lg my-4"
          loading="lazy"
        />
      )
    },
  }

  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
