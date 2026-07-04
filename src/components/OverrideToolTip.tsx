'use client'

import { ReactNode, useEffect, useRef, useState } from "react"

export interface OverrideToolTipProps {
  overrideReason: string | null
  overridedAt: string | null
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  width?: string
  className?: string
}

export function OverrideToolTip({
  overrideReason,
  overridedAt,
  children,
  position = 'top',
  width = '16rem',
  className = ''
}: OverrideToolTipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const formattedDate = overridedAt ?
    new Date(overridedAt).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) :
    null

  const positionClasses = {
    top: 'left-1/2 -translate-x-1/2 bottom-full mb-2',
    bottom: 'left-1/2 -translate-x-1/2 top-full mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'left-1/2 -translate-x-1/2 top-full rotate-45 border-b border-r',
    bottom: 'left-1/2 -translate-x-1/2 bottom-full rotate-[225deg] border-b border-r',
    left: 'top-1/2 -translate-y-1/2 left-full rotate-[135deg] border-b border-r',
    right: 'top-1/2 -translate-y-1/2 right-full rotate-[315deg] border-b border-r',
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={ref}
    >
      <div
        onClick={() => setOpen(!open)}
        className="infline-flex"
      >
        {children}
      </div>

      {open && (
        <div
          className={`absolute z-50 rounded border-p-3 shadow-lx animate fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}
          style={{
            width,
            backgroundColor: 'var(--color-surface-elevated, #1e293b)',
            borderColor: 'var(--color-border-subtle, #334155)'
          }}
        >
          {/* Flecha */}
          <div
            className={`absolute w-2 h-2 ${arrowClasses[position]}`}
            style={{
              backgroundColor: 'var(--color-surface-elevated, #1e293b)',
              borderColor: 'var(--color-border-subtle, #334155)',
            }}
          />
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 shrink-0"
              style={{ color: 'var(--color-warning, #f59e0b)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-warning, #f59e0b)' }}
            >
              Calificación editada
            </span>
          </div>

          {/* Motivo */}
          <p
            className="text-sm leading-relaxed mb-1"
            style={{ color: 'var(--color-text-primary, #f1f5f9)' }}
          >
            {overrideReason || 'Calificación editada manualmente sin motivo especificado'}
          </p>

          {/* Fecha */}
          {formattedDate && (
            <p
              className="text-xs mt-2 pt-2 border-t"
              style={{
                color: 'var(--color-text-disabled, #94a3b8)',
                borderColor: 'var(--color-border-subtle, #334155)',
              }}
            >
              Editada el {formattedDate}
            </p>
          )}
        </div>
      )}
    </div>
  )
}