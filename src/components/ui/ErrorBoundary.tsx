import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useApp } from '@/context/AppContext'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

function DefaultFallback({ onRetry }: { onRetry: () => void }) {
  const { locale } = useApp()
  const isEs = locale === 'es'

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div
        role="alert"
        className="glass w-full max-w-md rounded-2xl p-8 text-center"
      >
        <h2 className="font-display text-2xl text-content">
          {isEs ? 'Algo se ha torcido' : 'Something went wrong'}
        </h2>
        <p className="mt-3 text-sm text-muted">
          {isEs
            ? 'Ha ocurrido un error inesperado al mostrar esta sección. Vuelve a intentarlo.'
            : 'An unexpected error occurred while rendering this section. Please try again.'}
        </p>
        <button type="button" onClick={onRetry} className="btn-primary mt-6">
          {isEs ? 'Reintentar' : 'Try again'}
        </button>
      </div>
    </div>
  )
}

/**
 * Límite de error global. Captura errores de render/efecto lanzados por su
 * árbol y muestra un fallback en lugar de una pantalla en blanco.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Error de render capturado:', error, info)
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
