/**
 * Web Audio graph for the ambient `<audio>` element.
 *
 * `createMediaElementSource` may be called only ONCE per element, so the
 * resulting `AnalyserNode` is cached per element in a `WeakMap`. The analyser
 * is always reconnected to `destination`: otherwise the element output would be
 * routed into the graph and silenced.
 */

const MIN_BARS = 1
const MAX_BARS = 48
const FFT_SIZE = 128
const SMOOTHING = 0.8

type AudioContextCtor = typeof AudioContext

let sharedContext: AudioContext | null = null
const analysers = new WeakMap<HTMLAudioElement, AnalyserNode>()

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    AudioContext?: AudioContextCtor
    webkitAudioContext?: AudioContextCtor
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

/** `true` when the browser can build the analyser graph at all. */
export function isAudioAnalyserSupported(): boolean {
  return getAudioContextCtor() !== null
}

/** The singleton `AudioContext`, or `null` if it has not been created yet. */
export function getAudioContext(): AudioContext | null {
  return sharedContext
}

function ensureContext(): AudioContext | null {
  if (sharedContext) return sharedContext
  const Ctor = getAudioContextCtor()
  if (!Ctor) return null
  try {
    sharedContext = new Ctor()
  } catch {
    sharedContext = null
  }
  return sharedContext
}

/** Lazily builds and caches the analyser graph for `audioEl`. */
export function getAnalyser(audioEl: HTMLAudioElement | null): AnalyserNode | null {
  if (!audioEl) return null
  const cached = analysers.get(audioEl)
  if (cached) return cached
  const ctx = ensureContext()
  if (!ctx) return null
  try {
    const source = ctx.createMediaElementSource(audioEl)
    try {
      const analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = SMOOTHING
      source.connect(analyser)
      analyser.connect(ctx.destination)
      analysers.set(audioEl, analyser)
      return analyser
    } catch {
      // Never leave the element routed to a dead end.
      source.connect(ctx.destination)
      return null
    }
  } catch {
    return null
  }
}

/** Resumes the context. Call from a user gesture (play button). */
export function resumeAudioAnalyser(): void {
  const ctx = sharedContext
  if (ctx && ctx.state !== 'running') {
    void ctx.resume().catch(() => {})
  }
}

/** `true` when there is no running context (unsupported or suspended). */
export function isAudioAnalyserSuspended(): boolean {
  return !sharedContext || sharedContext.state !== 'running'
}

/**
 * Samples `analyser` into `bars` averaged levels in the `0..255` range.
 * Returns a fresh, small array (≤48 bytes) safe to hand to React.
 */
export function levels(analyser: AnalyserNode, bars: number): Uint8Array {
  const count = Math.max(MIN_BARS, Math.min(MAX_BARS, Math.floor(bars) || MIN_BARS))
  const bins = analyser.frequencyBinCount
  const out = new Uint8Array(count)
  if (bins === 0) return out

  const frequency = new Uint8Array(bins)
  analyser.getByteFrequencyData(frequency)

  for (let i = 0; i < count; i++) {
    const start = Math.floor((i * bins) / count)
    const end = Math.max(start + 1, Math.floor(((i + 1) * bins) / count))
    let sum = 0
    let n = 0
    for (let j = start; j < end && j < bins; j++) {
      sum += frequency[j]
      n += 1
    }
    out[i] = n > 0 ? Math.round(sum / n) : 0
  }
  return out
}
