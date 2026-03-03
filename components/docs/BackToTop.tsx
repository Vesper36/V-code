'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', toggleVisible, { passive: true })
    toggleVisible()

    return () => window.removeEventListener('scroll', toggleVisible)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
      aria-label="回到顶部"
    >
      <ArrowUp size={20} />
    </button>
  )
}