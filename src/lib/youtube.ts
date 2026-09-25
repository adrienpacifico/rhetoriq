import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<void> | null = null
function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    document.head.appendChild(s)
  })
  return apiPromise
}

export interface PlayerState {
  ready: boolean
  playing: boolean
  ended: boolean
  time: number
  duration: number
}

/**
 * Mounts a YouTube IFrame player inside `host` and polls its current time (10 Hz).
 * The video is never downloaded: it stays hosted on YouTube.
 */
export function useYouTube(videoId: string, host: RefObject<HTMLDivElement | null>, fallbackDuration: number) {
  const playerRef = useRef<any>(null)
  const [state, setState] = useState<PlayerState>({
    ready: false,
    playing: false,
    ended: false,
    time: 0,
    duration: fallbackDuration,
  })

  useEffect(() => {
    const container = host.current
    if (!container) return
    let disposed = false
    const el = document.createElement('div')
    container.appendChild(el)
    loadApi().then(() => {
      if (disposed) return
      playerRef.current = new window.YT.Player(el, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, hl: 'fr', cc_load_policy: 0 },
        events: {
          onReady: (e: any) =>
            setState((s) => ({ ...s, ready: true, duration: e.target.getDuration?.() || s.duration })),
          onStateChange: (e: any) => {
            const YT = window.YT
            setState((s) => ({
              ...s,
              playing: e.data === YT.PlayerState.PLAYING,
              ended: e.data === YT.PlayerState.ENDED,
            }))
          },
        },
      })
    })
    return () => {
      disposed = true
      try {
        playerRef.current?.destroy?.()
      } catch {
        /* ignore */
      }
      playerRef.current = null
      container.innerHTML = ''
    }
  }, [videoId, host])

  useEffect(() => {
    if (!state.ready) return
    const id = window.setInterval(() => {
      const p = playerRef.current
      if (!p?.getCurrentTime) return
      const t = p.getCurrentTime()
      if (typeof t !== 'number') return
      setState((s) => (Math.abs(s.time - t) < 0.02 ? s : { ...s, time: t }))
    }, 100)
    return () => window.clearInterval(id)
  }, [state.ready])

  const seek = useCallback((t: number, andPlay = true) => {
    const p = playerRef.current
    if (!p?.seekTo) return
    p.seekTo(Math.max(0, t), true)
    if (andPlay) p.playVideo?.()
    setState((s) => ({ ...s, time: Math.max(0, t), ended: false }))
  }, [])

  const toggle = useCallback(() => {
    const p = playerRef.current
    if (!p?.getPlayerState) return
    if (p.getPlayerState() === window.YT.PlayerState.PLAYING) p.pauseVideo()
    else p.playVideo()
  }, [])

  return { ...state, seek, toggle }
}
