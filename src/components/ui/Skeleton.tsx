import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type SkeletonVariant = 'line' | 'card'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** `line` (default) is a single text bar; `card` mimics a quote card. */
  variant?: SkeletonVariant
}

/**
 * Base del efecto shimmer. Reutiliza `animate-shimmer` (tailwind.config.js)
 * corrigiendo F-20 (utilidad definida pero sin uso). Con `prefers-reduced-motion`
 * el gradiente desaparece y queda un gris medio estático (spec §3.6).
 */
const SHIMMER =
  'animate-shimmer rounded-md bg-[length:200%_100%] bg-gradient-to-r from-line-soft via-glass to-line-soft motion-reduce:animate-none motion-reduce:bg-none motion-reduce:bg-line-soft'

function Bar({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(SHIMMER, 'block', className)} {...rest} />
}

/**
 * Primitivo de carga con dos variantes. Siempre `aria-hidden`: el estado de
 * carga se comunica por el flujo real (Suspense/gate), no por el lector.
 */
export default function Skeleton({ variant = 'line', className, ...rest }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div
        aria-hidden="true"
        className={cn('glass h-full rounded-2xl p-6 sm:p-8', className)}
        {...rest}
      >
        <Bar className="h-8 w-8 rounded-full" />
        <Bar className="mt-6 h-5 w-11/12" />
        <Bar className="mt-3 h-5 w-10/12" />
        <Bar className="mt-3 h-5 w-7/12" />
        <Bar className="mt-6 h-4 w-40" />
        <div className="mt-6 flex gap-2">
          <Bar className="h-11 w-11 rounded-full" />
          <Bar className="h-11 w-11 rounded-full" />
          <Bar className="h-11 w-11 rounded-full" />
        </div>
      </div>
    )
  }

  return <Bar aria-hidden="true" className={cn('h-4 w-full', className)} {...rest} />
}
