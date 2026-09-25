import type { KeyboardEvent, PointerEvent } from 'react'

// Keep in sync with the clamp() in `.layout` (styles.css).
const MIN_LEFT = 340
const MIN_RIGHT = 380
const STEP = 0.02

interface Props {
  /** Share of the layout width given to the left column; null = default. */
  value: number | null
  onChange: (frac: number | null) => void
}

function clampFrac(frac: number, width: number): number {
  const lo = MIN_LEFT / width
  const hi = 1 - MIN_RIGHT / width
  return Math.min(Math.max(frac, lo), Math.max(lo, hi))
}

/** Draggable divider between the video column and the transcript. */
export function Splitter({ value, onChange }: Props) {
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    const handle = e.currentTarget
    const layout = handle.parentElement
    if (!layout) return
    handle.setPointerCapture(e.pointerId)
    handle.classList.add('dragging')
    document.body.classList.add('resizing')
    const rect = layout.getBoundingClientRect()
    let frac = value

    // Write the CSS variable directly while dragging; commit to React state on release.
    const move = (ev: globalThis.PointerEvent) => {
      frac = clampFrac((ev.clientX - rect.left) / rect.width, rect.width)
      layout.style.setProperty('--left-w', `${(frac * 100).toFixed(2)}%`)
    }
    const up = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
      handle.classList.remove('dragging')
      document.body.classList.remove('resizing')
      if (frac !== value) onChange(frac)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const layout = e.currentTarget.parentElement
    if (!layout) return
    const rect = layout.getBoundingClientRect()
    const current = (e.currentTarget.getBoundingClientRect().left - rect.left) / rect.width
    if (e.key === 'ArrowLeft') onChange(clampFrac(current - STEP, rect.width))
    else if (e.key === 'ArrowRight') onChange(clampFrac(current + STEP, rect.width))
    else if (e.key === 'Home') onChange(clampFrac(0, rect.width))
    else if (e.key === 'End') onChange(clampFrac(1, rect.width))
    else if (e.key === 'Enter') onChange(null)
    else return
    e.preventDefault()
  }

  return (
    <div
      className="splitter"
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionner la vidéo et le transcript"
      aria-valuenow={value == null ? undefined : Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      title="Glisser pour redimensionner · double-clic pour réinitialiser"
      onPointerDown={onPointerDown}
      onDoubleClick={() => onChange(null)}
      onKeyDown={onKeyDown}
    />
  )
}
