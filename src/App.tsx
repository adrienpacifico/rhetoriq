import { useEffect, useState } from 'react'
import videosIndex from './data/videos.json'
import type { Analysis, Transcript as TranscriptData, VideoIndexEntry } from './types'
import { Workspace } from './Workspace'
import { Gallery } from './components/Gallery'
import { About } from './components/About'

// Lazy-loaded per-video data: src/data/videos/<id>/{transcript,analysis}.json
const transcriptModules = import.meta.glob<{ default: TranscriptData }>('./data/videos/*/transcript.json')
const analysisModules = import.meta.glob<{ default: Analysis }>('./data/videos/*/analysis.json')
const videos = videosIndex as VideoIndexEntry[]
const EMPTY_ANALYSIS: Analysis = { speakers: {}, turns: {}, chapters: [], annotations: [], habermas: null }

/** Routes: ``  → gallery, `#about` → about page, `#v=<id>` → analysis workspace. */
type Route = { page: 'gallery' } | { page: 'about' } | { page: 'video'; id: string }
function routeFromHash(): Route {
  if (location.hash === '#about') return { page: 'about' }
  const m = location.hash.match(/v=([\w-]{11})/)
  return m ? { page: 'video', id: m[1] } : { page: 'gallery' }
}
export function goHome() {
  location.hash = ''
}
export function goVideo(id: string) {
  location.hash = `v=${id}`
}

interface Loaded { id: string; transcript: TranscriptData; analysis: Analysis }

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [data, setData] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const videoId = route.page === 'video' ? route.id : null
  useEffect(() => {
    if (!videoId) return
    let cancelled = false
    const loadT = transcriptModules[`./data/videos/${videoId}/transcript.json`]
    if (!loadT) {
      setError(`Aucune donnée pour la vidéo « ${videoId} ».`)
      return
    }
    setError(null)
    const loadA = analysisModules[`./data/videos/${videoId}/analysis.json`]
    Promise.all([loadT(), loadA ? loadA() : Promise.resolve({ default: EMPTY_ANALYSIS })])
      .then(([t, a]) => {
        if (!cancelled) setData({ id: videoId, transcript: t.default, analysis: a.default })
      })
      .catch((e) => !cancelled && setError(String(e)))
    return () => {
      cancelled = true
    }
  }, [videoId])

  if (route.page === 'gallery') return <Gallery videos={videos} onOpen={goVideo} />
  if (route.page === 'about') return <About />

  if (error) {
    return (
      <div className="empty-state">
        <div className="brand-name">Rhetoriq</div>
        <p>{error}</p>
        <pre>uv run scripts/fetch_transcript.py &lt;url&gt;{'\n'}/analyze-video &lt;url&gt;</pre>
        <button className="btn" onClick={goHome}>
          Retour à la bibliothèque
        </button>
      </div>
    )
  }
  if (!data || data.id !== route.id) return <div className="empty-state muted">Chargement…</div>
  return <Workspace key={data.id} transcript={data.transcript} analysis={data.analysis} videos={videos} onSelectVideo={goVideo} onHome={goHome} />
}
