import { useEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { spring } from '@/lib/variants'
import { cn } from '@/lib/utils'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Visible, focusable descendants of `container`, in DOM order. */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => el.getClientRects().length > 0)
}

interface FocusTrapOptions {
  containerRef: RefObject<HTMLElement>
  active: boolean
  onEscape?: () => void
  initialFocusRef?: RefObject<HTMLElement> | undefined
}

/**
 * Traps Tab/Shift+Tab inside `containerRef`, closes on Escape and restores
 * focus to the element that was focused when the trap activated.
 */
export function useFocusTrap({
  containerRef,
  active,
  onEscape,
  initialFocusRef,
}: FocusTrapOptions) {
  const escapeRef = useRef(onEscape)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    escapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!active || typeof document === 'undefined') return
    restoreRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const frame = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return
      const target = initialFocusRef?.current ?? getFocusable(container)[0] ?? container
      target.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        escapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return
      const items = getFocusable(container)
      if (items.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (first === undefined || last === undefined) return
      const activeEl = document.activeElement
      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault()
          last.focus()
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown, true)
      const restore = restoreRef.current
      if (restore && document.contains(restore)) restore.focus()
    }
  }, [active, containerRef, initialFocusRef])
}

/** Locks `body` scroll while `active`. */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [active])
}

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** id of the element that names the dialog (preferred). */
  labelledBy?: string
  /** Accessible name when there is no visible heading. */
  ariaLabel?: string
  /** `fullscreen` covers the viewport (Zen); `modal` centres a card. */
  variant?: 'modal' | 'fullscreen'
  /** Extra classes for the dialog panel. */
  className?: string
  closeOnBackdrop?: boolean
  initialFocusRef?: RefObject<HTMLElement>
}

export default function Dialog({
  open,
  onClose,
  children,
  labelledBy,
  ariaLabel,
  variant = 'modal',
  className,
  closeOnBackdrop = true,
  initialFocusRef,
}: DialogProps) {
  const reduceMotion = usePrefersReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const isFullscreen = variant === 'fullscreen'

  useFocusTrap({
    containerRef: panelRef,
    active: open,
    onEscape: onClose,
    initialFocusRef,
  })
  useBodyScrollLock(open)

  if (typeof document === 'undefined') return null

  const duration = reduceMotion ? 0 : 0.25

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          key="dialog-root"
          className={cn(
            'fixed inset-0 z-[70]',
            isFullscreen ? '' : 'flex items-center justify-center p-4 sm:p-6',
          )}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? {} : { opacity: 0 }}
          transition={{ duration }}
        >
          {!isFullscreen && (
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeOnBackdrop ? onClose : undefined}
              aria-hidden="true"
            />
          )}
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-label={labelledBy ? undefined : ariaLabel}
            tabIndex={-1}
            initial={
              reduceMotion || isFullscreen ? false : { opacity: 0, y: 24, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion || isFullscreen
                ? {}
                : { opacity: 0, y: 24, scale: 0.97 }
            }
            transition={reduceMotion ? { duration: 0 } : spring.hover}
            className={cn(
              'relative z-10 flex flex-col outline-none',
              isFullscreen
                ? 'h-full w-full bg-[var(--bg)]'
                : 'glass-strong max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl shadow-card',
              'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
              className,
            )}
          >
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
