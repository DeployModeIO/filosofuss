import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_TEXT: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl sm:text-5xl',
}

const SIZE_ICON: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 16,
  md: 20,
  lg: 28,
}

export default function Logo({ size = 'md', className }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Filosofuss — ir al inicio"
      className={cn(
        'group inline-flex select-none items-center gap-2 font-logo tracking-[0.18em]',
        className,
      )}
    >
      <Sparkles
        size={SIZE_ICON[size]}
        aria-hidden="true"
        className="text-accent transition-transform duration-300 ease-smooth group-hover:rotate-12 group-hover:scale-110"
      />
      <span
        className={cn(
          'text-gradient-animated inline-block [filter:drop-shadow(0_0_10px_var(--glow))]',
          SIZE_TEXT[size],
        )}
      >
        Filosofuss
      </span>
    </Link>
  )
}
