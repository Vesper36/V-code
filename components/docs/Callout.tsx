'use client'

import { Info, AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react'

const calloutStyles = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
  },
  tip: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    icon: Lightbulb,
    iconColor: 'text-green-600 dark:text-green-400',
  },
}

interface CalloutProps {
  type?: keyof typeof calloutStyles
  children: React.ReactNode
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const style = calloutStyles[type] || calloutStyles.info
  const Icon = style.icon

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${style.bg} ${style.border} my-4`}>
      <Icon size={20} className={`shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1 text-sm">{children}</div>
    </div>
  )
}
