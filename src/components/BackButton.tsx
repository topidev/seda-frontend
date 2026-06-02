'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href: string
}

export default function BackButton({ href }: BackButtonProps) {
  return (
    <Link href={href}>
      <button
        className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--color-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      >
        <ArrowLeft size={16} />
      </button>
    </Link>
  )
}