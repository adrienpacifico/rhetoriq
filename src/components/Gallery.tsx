import { useMemo, useState } from 'react'
import { AlertTriangle, Clapperboard, Info, Play, Quote, Scale, Search, SearchCheck, Sparkles, Terminal } from 'lucide-react'
import type { VideoIndexEntry } from '../types'
import { KIND_COLOR, fakenessColor, fmtDate, fmtTime } from '../lib/format'

interface Props {
  videos: VideoIndexEntry[]
  onOpen: (id: string) => void
}

const cleanTitle = (t: string) => t.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '')
/** Candidate thumbnails, best first. YouTube 404s on missing sizes, so the <img> walks the list on error. */
const thumbCandidates = (v: VideoIndexEntry): string[] => {
  const yt = (q: string) => `https://i.ytimg.com/vi/${v.id}/${q}.jpg`
  const list = [yt('maxresdefault'), yt('sddefault'), yt('hqdefault'), yt('mqdefault')]
  return v.thumbnail && !list.includes(v.thumbnail) ? [v.thumbnail, ...list] : list
}

function ScoreBadge({ value }: { value: number }) {
  const hue = 8 + (value / 100) * 140
  return (
    <span className="score-badge" style={{ ['--h' as string]: hue }} title="Situation idéale de parole (Habermas)">
      <Scale size={11} />
      {value}
    </span>
  )
}

function Card({ v, onOpen }: { v: VideoIndexEntry; onOpen: (id: string) => void }) {
  const candidates = useMemo(() => thumbCandidates(v), [v])
  const [idx, setIdx] = useState(0)
  const s = v.stats
  return (
    <article className={`vcard ${v.hasAnalysis ? '' : 'raw'}`} onClick={() => onOpen(v.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen(v.id)}>
      <div className="thumb">
        {idx < candidates.length ? (
          <img
            src={candidates[idx]}
            alt=""
            loading="lazy"
            onError={() => setIdx((i) => i + 1)}
            onLoad={(e) => {
              // YouTube serves a 120×90 grey placeholder instead of a 404 for some sizes
              if (e.currentTarget.naturalWidth <= 120) setIdx((i) => i + 1)
            }}
          />
        ) : (
          <div className="thumb-fallback">
            <Clapperboard size={26} />
          </div>
        )}
        <span className="thumb-play">
          <Play size={22} fill="currentColor" />
        </span>
        {v.duration != null && <span className="thumb-duration mono">{fmtTime(v.duration)}</span>}
        {s.habermas != null && <ScoreBadge value={s.habermas} />}
        {!v.hasAnalysis && <span className="thumb-raw">transcript seul</span>}
      </div>
      <div className="vcard-body">
        <h3 className="vcard-title">{cleanTitle(v.title)}</h3>
        <div className="vcard-meta">
          {v.channel} · {fmtDate(v.uploadDate)}
          {v.speakers.length > 0 && <span className="vcard-speakers"> · {v.speakers.join(' vs ')}</span>}
        </div>
        {v.hasAnalysis ? (
          <div className="vcard-stats">
            <span style={{ ['--c' as string]: KIND_COLOR.fallacy }} title="Sophismes">
              <AlertTriangle size={12} /> {s.fallacy}
            </span>
            <span style={{ ['--c' as string]: KIND_COLOR.rhetoric }} title="Procédés rhétoriques">
              <Quote size={12} /> {s.rhetoric}
            </span>
            <span style={{ ['--c' as string]: s.avgFakeness == null ? KIND_COLOR.fact : fakenessColor(s.avgFakeness) }} title="Faits vérifiés · fake moyen">
              <SearchCheck size={12} /> {s.fact}
              {s.avgFakeness != null && <em>{s.avgFakeness} % fake</em>}
            </span>
            <span style={{ ['--c' as string]: '#2ec4b6' }} title="Moments Habermas">
              <Scale size={12} /> {s.moments}
            </span>
          </div>
        ) : (
          <div className="vcard-stats muted">{v.segments} segments · analyse à lancer</div>
        )}
      </div>
    </article>
  )
}

export function Gallery({ videos, onOpen }: Props) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return videos
    return videos.filter((v) => [v.title, v.channel ?? '', ...v.speakers].join(' ').toLowerCase().includes(needle))
  }, [videos, q])
  const totals = useMemo(
    () =>
      videos.reduce(
        (acc, v) => ({ fallacy: acc.fallacy + v.stats.fallacy, fact: acc.fact + v.stats.fact, minutes: acc.minutes + (v.duration ?? 0) / 60 }),
        { fallacy: 0, fact: 0, minutes: 0 },
      ),
    [videos],
  )

  return (
    <div className="gallery">
      <header className="gallery-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <Sparkles size={16} />
          </span>
          <span className="brand-name">Rhetoriq</span>
          <span className="brand-tag">analyse du discours</span>
        </div>
        <label className="search">
          <Search size={14} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une vidéo, une chaîne, un·e intervenant·e…" />
        </label>
        <div className="gallery-totals mono">
          {videos.length} vidéo{videos.length > 1 ? 's' : ''} · {Math.round(totals.minutes)} min · {totals.fallacy} sophismes · {totals.fact} faits vérifiés
        </div>
        <a className="btn ghost" href="#about">
          <Info size={14} />
          À propos
        </a>
      </header>

      <main className="gallery-grid">
        {list.map((v) => (
          <Card key={v.id} v={v} onOpen={onOpen} />
        ))}
        <article className="vcard add">
          <div className="thumb">
            <Clapperboard size={28} />
            <span>Ajouter une vidéo</span>
          </div>
          <div className="vcard-body">
            <div className="vcard-meta">Dans Claude Code, à la racine du dépôt :</div>
            <pre>
              <Terminal size={12} /> /analyze-video &lt;url YouTube&gt;
            </pre>
            <div className="vcard-meta">Sous-titres, diarisation (Sonnet), sophismes · fact-check · Habermas (Opus), puis la vidéo apparaît ici.</div>
          </div>
        </article>
        {list.length === 0 && <div className="gallery-empty muted">Aucune vidéo ne correspond à « {q} ».</div>}
      </main>
    </div>
  )
}
