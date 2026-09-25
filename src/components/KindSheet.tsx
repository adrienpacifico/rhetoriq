import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, EyeOff, Quote, SearchCheck, X } from 'lucide-react'
import type { Kind, Phase, PlacedAnnotation, SpeakerId, SpeakerInfo, Verdict } from '../types'
import { KIND_COLOR, VERDICT_LABEL, annotationColor, fakenessColor, fmtTime, initials, speakerName } from '../lib/format'

const TITLE: Record<Kind, string> = { fallacy: 'Sophismes', rhetoric: 'Procédés rhétoriques', fact: 'Faits vérifiés' }
const DESC: Record<Kind, string> = {
  fallacy: 'Arguments dont la forme est fallacieuse, indépendamment de la conclusion défendue.',
  rhetoric: 'Procédés de persuasion notables, pas nécessairement malhonnêtes : cadrage, esquive, anaphore…',
  fact: 'Affirmations vérifiables confrontées à des sources. Le score fake va de 0 (exact) à 100 (faux).',
}
const ICON: Record<Kind, typeof Quote> = { fallacy: AlertTriangle, rhetoric: Quote, fact: SearchCheck }
const VERDICT_ORDER: Verdict[] = ['true', 'mostly_true', 'misleading', 'mostly_false', 'false', 'unverifiable']

interface Props {
  speaker: SpeakerId
  kind: Kind
  speakers: Record<SpeakerId, SpeakerInfo>
  colors: Record<SpeakerId, string>
  annotations: PlacedAnnotation[]
  phases: Record<string, Phase>
  revealAll: boolean
  onJump: (t: number, id: string) => void
  onClose: () => void
}

export function KindSheet(p: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p.onClose])

  const mine = useMemo(
    () => p.annotations.filter((a) => a.speaker === p.speaker && a.kind === p.kind).sort((a, b) => a.revealAt - b.revealAt),
    [p.annotations, p.speaker, p.kind],
  )
  const shown = mine.filter((a) => p.phases[a.id] === 'shown')
  const hiddenCount = mine.length - shown.length
  const Icon = ICON[p.kind]
  const color = KIND_COLOR[p.kind]

  // breakdown: by type (fallacy / rhetoric) or by verdict (fact)
  const groups = useMemo(() => {
    const m = new Map<string, { label: string; count: number; color: string }>()
    for (const a of shown) {
      const key = a.kind === 'fact' ? a.verdict : a.type
      const label = a.kind === 'fact' ? VERDICT_LABEL[a.verdict] : a.label
      const c = a.kind === 'fact' ? fakenessColor(a.fakeness) : color
      const g = m.get(key)
      if (g) g.count++
      else m.set(key, { label, count: 1, color: c })
    }
    const arr = [...m.entries()]
    if (p.kind === 'fact') arr.sort((x, y) => VERDICT_ORDER.indexOf(x[0] as Verdict) - VERDICT_ORDER.indexOf(y[0] as Verdict))
    else arr.sort((x, y) => y[1].count - x[1].count)
    return arr
  }, [shown, p.kind, color])

  const list = filter ? shown.filter((a) => (a.kind === 'fact' ? a.verdict : a.type) === filter) : shown
  const avg = shown.length
    ? Math.round(shown.reduce((s, a) => s + (a.kind === 'fact' ? a.fakeness : a.severity), 0) / shown.length)
    : null

  return (
    <div className="sheet-backdrop" onClick={p.onClose}>
      <div className="sheet sheet-dim" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal style={{ ['--sc' as string]: p.colors[p.speaker], ['--c' as string]: color }}>
        <button className="sheet-close" onClick={p.onClose} aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="sheet-speaker-head">
          <span className="avatar">{initials(speakerName(p.speaker, p.speakers))}</span>
          <div>
            <div className="sheet-kicker">{speakerName(p.speaker, p.speakers)}</div>
            <h2 className="dim-title" style={{ color }}>
              <Icon size={18} /> {TITLE[p.kind]}
            </h2>
          </div>
        </div>
        <p className="dim-desc">{DESC[p.kind]}</p>

        <div className="dim-scores">
          <div className="dim-score">
            <div className="dim-score-v" style={{ color }}>{shown.length}</div>
            <div className="dim-score-l">
              révélé{shown.length > 1 ? 's' : ''}
              {hiddenCount > 0 && ` · ${hiddenCount} à venir`}
            </div>
          </div>
          <div className="dim-score">
            <div className="dim-score-v" style={{ color: avg === null ? 'var(--muted)' : p.kind === 'fact' ? fakenessColor(avg) : color }}>
              {avg === null ? '—' : p.kind === 'fact' ? `${avg} %` : avg}
            </div>
            <div className="dim-score-l">{p.kind === 'fact' ? 'fake moyen' : 'gravité moyenne / 100'}</div>
            {avg !== null && p.kind === 'fact' && (
              <div className="meter-track" style={{ position: 'relative', marginTop: 4 }}>
                <div className="meter-needle" style={{ left: `${avg}%` }} />
              </div>
            )}
          </div>
        </div>

        {groups.length > 0 && (
          <>
            <h3 className="dim-section">{p.kind === 'fact' ? 'Par verdict' : 'Par type'}</h3>
            <div className="type-chips">
              {groups.map(([key, g]) => (
                <button
                  key={key}
                  className={`type-chip ${filter === key ? 'on' : ''} ${filter && filter !== key ? 'dim' : ''}`}
                  style={{ ['--c' as string]: g.color }}
                  onClick={() => setFilter(filter === key ? null : key)}
                >
                  {g.label} <b>×{g.count}</b>
                </button>
              ))}
            </div>
          </>
        )}

        <h3 className="dim-section">{filter ? 'Sélection' : 'Chronologie'}</h3>
        {list.length === 0 ? (
          <p className="muted small">Rien de révélé pour l'instant. Laissez la vidéo avancer, ou passez en « Analyse complète ».</p>
        ) : (
          <ul className="dim-list">
            {list.map((a) => (
              <li key={a.id} className="dim-item ann" style={{ ['--c' as string]: annotationColor(a) }} onClick={() => p.onJump(Math.max(0, a.revealAt - 6), a.id)}>
                <span className="mono t">{fmtTime(a.revealAt)}</span>
                {a.kind === 'fact' ? (
                  <span className="delta mono" style={{ color: fakenessColor(a.fakeness), background: `color-mix(in srgb, ${fakenessColor(a.fakeness)} 15%, transparent)` }}>
                    {a.fakeness} %
                  </span>
                ) : (
                  <span className="sev-mini" title={`gravité ${a.severity}`}>
                    <i style={{ width: `${a.severity}%` }} />
                  </span>
                )}
                <span className="body">
                  <span className="title">{a.title}</span>
                  <span className="note">
                    <b style={{ color: 'var(--c)' }}>{a.kind === 'fact' ? VERDICT_LABEL[a.verdict] : a.label}</b> · {a.kind === 'fact' ? a.claim : a.explanation}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {hiddenCount > 0 && !p.revealAll && (
          <p className="muted small">
            <EyeOff size={12} /> {hiddenCount} encore masqué{hiddenCount > 1 ? 's' : ''} en mode no spoil.
          </p>
        )}
        <p className="sheet-foot muted">Cliquez sur un élément pour revoir le passage et ouvrir sa carte dans le transcript.</p>
      </div>
    </div>
  )
}
