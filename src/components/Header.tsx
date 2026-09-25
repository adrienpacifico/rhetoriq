import { ChevronDown, Eye, EyeOff, Info, LayoutGrid, Radio, Scale, Sparkles } from 'lucide-react'
import type { Layer, Transcript, VideoIndexEntry } from '../types'
import { KIND_COLOR, fmtDate } from '../lib/format'

interface Props {
  transcript: Transcript
  videos: VideoIndexEntry[]
  onSelectVideo: (id: string) => void
  onHome: () => void
  filters: Record<Layer, boolean>
  counts: Record<Layer, { shown: number; total: number }>
  onToggle: (layer: Layer) => void
  revealAll: boolean
  onRevealAll: (v: boolean) => void
  onOpenSheet: () => void
  agentsActive: number
}

const LAYERS: { id: Layer; label: string; color: string }[] = [
  { id: 'fallacy', label: 'Sophismes', color: KIND_COLOR.fallacy },
  { id: 'rhetoric', label: 'Procédés', color: KIND_COLOR.rhetoric },
  { id: 'fact', label: 'Faits vérifiés', color: KIND_COLOR.fact },
  { id: 'habermas', label: 'Habermas', color: '#2ec4b6' },
]

const cleanTitle = (t: string) => t.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '')

export function Header(p: Props) {
  const { transcript: t } = p
  return (
    <header className="header">
      <button className="brand as-link" onClick={p.onHome} title="Retour à la bibliothèque">
        <span className="brand-mark" aria-hidden>
          <Sparkles size={16} />
        </span>
        <span className="brand-name">Rhetoriq</span>
        <span className="brand-tag">analyse du discours</span>
      </button>
      <button className="btn ghost" onClick={p.onHome} title="Toutes les vidéos">
        <LayoutGrid size={14} />
        <span className="btn-label">Vidéos</span>
      </button>
      <a className="btn ghost" href="#about" title="À propos de Rhetoriq">
        <Info size={14} />
        <span className="btn-label">À propos</span>
      </a>

      <div className="video-meta" title={t.title}>
        {p.videos.length > 1 ? (
          <label className="video-picker">
            <select value={t.videoId} onChange={(e) => p.onSelectVideo(e.target.value)} aria-label="Choisir une vidéo">
              {p.videos.map((v) => (
                <option key={v.id} value={v.id}>
                  {cleanTitle(v.title)}
                  {v.hasAnalysis ? '' : ' (sans analyse)'}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        ) : (
          <div className="video-title">{cleanTitle(t.title)}</div>
        )}
        <div className="video-sub">
          {t.channel} · {fmtDate(t.uploadDate)}
        </div>
      </div>

      <div className="layers" role="group" aria-label="Couches d'analyse">
        {LAYERS.map((l) => {
          const c = p.counts[l.id]
          return (
            <button
              key={l.id}
              className={`layer ${p.filters[l.id] ? 'on' : 'off'}`}
              style={{ ['--c' as string]: l.color }}
              onClick={() => p.onToggle(l.id)}
              aria-pressed={p.filters[l.id]}
            >
              <span className="dot" />
              {l.label}
              <span className="count">
                {c.shown}
                <span className="count-total">/{c.total}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="header-actions">
        <div className="agents-status" title="Agents de vérification en cours">
          <Radio size={14} className={p.agentsActive ? 'pulse' : ''} />
          {p.agentsActive ? `${p.agentsActive} agent${p.agentsActive > 1 ? 's' : ''} en cours` : 'agents en veille'}
        </div>
        <div className="segmented" role="group" aria-label="Mode de lecture">
          <button className={!p.revealAll ? 'on' : ''} onClick={() => p.onRevealAll(false)} title="Les annotations n'apparaissent qu'au fil de la vidéo">
            <EyeOff size={13} />
            <span className="btn-label">No spoil</span>
          </button>
          <button className={p.revealAll ? 'on' : ''} onClick={() => p.onRevealAll(true)} title="Toute l'analyse visible, transcript libre">
            <Eye size={13} />
            <span className="btn-label">Analyse complète</span>
          </button>
        </div>
        <button className="btn primary" onClick={p.onOpenSheet}>
          <Scale size={14} />
          Bilan
        </button>
      </div>
    </header>
  )
}
