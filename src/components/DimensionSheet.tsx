import { useEffect, useMemo } from 'react'
import { AlertTriangle, EyeOff, Quote, Scale, SearchCheck, X } from 'lucide-react'
import type { Dimension, HabermasReport, Phase, PlacedAnnotation, PlacedMoment, SpeakerId, SpeakerInfo } from '../types'
import { DIM_LABEL, KIND_COLOR, KIND_LABEL, annotationColor, fmtTime, initials, speakerName } from '../lib/format'

const DIM_DESC: Record<Dimension, string> = {
  truth: 'Les faits avancés sont-ils exacts ?',
  rightness: 'Les normes invoquées sont-elles légitimes et ouvertes à la discussion ?',
  sincerity: "Le locuteur croit-il ce qu'il dit, sans manipulation ?",
  comprehensibility: 'Le propos est-il clair et compréhensible ?',
}

interface Props {
  speaker: SpeakerId
  dimension: Dimension
  speakers: Record<SpeakerId, SpeakerInfo>
  colors: Record<SpeakerId, string>
  report: HabermasReport | null
  moments: PlacedMoment[]
  annotations: PlacedAnnotation[]
  phases: Record<string, Phase>
  revealAll: boolean
  onJump: (t: number, id: string) => void
  onClose: () => void
}

export function DimensionSheet(p: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p.onClose])

  const mine = useMemo(
    () => p.moments.filter((m) => m.speaker === p.speaker && m.dimension === p.dimension).sort((a, b) => a.revealAt - b.revealAt),
    [p.moments, p.speaker, p.dimension],
  )
  const shown = mine.filter((m) => p.phases[m.id] === 'shown')
  const hiddenCount = mine.length - shown.length
  const tally = shown.reduce((s, m) => s + (m.polarity === 'positive' ? 1 : -1) * m.weight * 6, 0)
  const live = Math.max(0, Math.min(100, 50 + tally))
  const finalScore = p.report?.speakers[p.speaker]?.[p.dimension]

  const related = useMemo(
    () =>
      p.annotations
        .filter((a) => a.speaker === p.speaker && a.habermas?.includes(p.dimension) && p.phases[a.id] === 'shown')
        .sort((a, b) => a.revealAt - b.revealAt),
    [p.annotations, p.speaker, p.dimension, p.phases],
  )

  const desc = p.report?.dimensions?.[p.dimension]?.replace(/^[^:]+:\s*/, '') ?? DIM_DESC[p.dimension]

  return (
    <div className="sheet-backdrop" onClick={p.onClose}>
      <div className="sheet sheet-dim" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal style={{ ['--sc' as string]: p.colors[p.speaker] }}>
        <button className="sheet-close" onClick={p.onClose} aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="sheet-speaker-head">
          <span className="avatar">{initials(speakerName(p.speaker, p.speakers))}</span>
          <div>
            <div className="sheet-kicker">{speakerName(p.speaker, p.speakers)}</div>
            <h2 className="dim-title">
              <Scale size={18} /> {DIM_LABEL[p.dimension]}
            </h2>
          </div>
        </div>
        <p className="dim-desc">{desc}</p>

        <div className="dim-scores">
          <div className="dim-score">
            <div className="dim-score-v" style={{ color: tally === 0 ? 'var(--muted)' : tally > 0 ? 'var(--pos)' : 'var(--neg)' }}>
              {tally > 0 ? '+' : ''}
              {tally}
            </div>
            <div className="dim-score-l">
              en direct · {shown.length} moment{shown.length > 1 ? 's' : ''}
              {hiddenCount > 0 && ` · ${hiddenCount} à venir`}
            </div>
            <div className="ldim-bar big">
              <i className={live >= 50 ? 'pos' : 'neg'} style={{ left: `${live >= 50 ? 50 : live}%`, width: `${Math.abs(live - 50)}%` }} />
            </div>
          </div>
          <div className="dim-score">
            <div className="dim-score-v">{p.revealAll || hiddenCount === 0 ? (finalScore ?? '—') : <EyeOff size={20} />}</div>
            <div className="dim-score-l">
              {p.revealAll || hiddenCount === 0 ? 'score final de l’agent / 100' : 'score final masqué (no spoil)'}
            </div>
            {(p.revealAll || hiddenCount === 0) && finalScore != null && (
              <div className="bar">
                <i style={{ width: `${finalScore}%` }} />
              </div>
            )}
          </div>
        </div>

        <h3 className="dim-section">Moments qui ont fait bouger le score</h3>
        {shown.length === 0 ? (
          <p className="muted small">Aucun moment révélé pour l'instant. Laissez la vidéo avancer, ou passez en « Analyse complète ».</p>
        ) : (
          <ul className="dim-list">
            {shown.map((m) => (
              <li key={m.id} className={`dim-item ${m.polarity}`} onClick={() => p.onJump(Math.max(0, m.revealAt - 5), m.id)}>
                <span className="mono t">{fmtTime(m.revealAt)}</span>
                <span className="delta mono">
                  {m.polarity === 'positive' ? '+' : '−'}
                  {m.weight * 6}
                </span>
                <span className="body">
                  <span className="title">{m.title}</span>
                  <span className="note">{m.note}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {hiddenCount > 0 && !p.revealAll && (
          <p className="muted small">
            <EyeOff size={12} /> {hiddenCount} moment{hiddenCount > 1 ? 's' : ''} encore masqué{hiddenCount > 1 ? 's' : ''} en mode no spoil.
          </p>
        )}

        {related.length > 0 && (
          <>
            <h3 className="dim-section">Annotations qui touchent cette prétention</h3>
            <ul className="dim-list">
              {related.map((a) => {
                const Icon = a.kind === 'fact' ? SearchCheck : a.kind === 'fallacy' ? AlertTriangle : Quote
                const color = a.kind === 'fact' ? annotationColor(a) : KIND_COLOR[a.kind]
                return (
                  <li key={a.id} className="dim-item ann" style={{ ['--c' as string]: color }} onClick={() => p.onJump(Math.max(0, a.revealAt - 6), a.id)}>
                    <span className="mono t">{fmtTime(a.revealAt)}</span>
                    <span className="kind">
                      <Icon size={12} /> {KIND_LABEL[a.kind]}
                    </span>
                    <span className="body">
                      <span className="title">{a.title}</span>
                      <span className="note">{a.label}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
        <p className="sheet-foot muted">Chaque moment déplace la jauge de ± poids × 6 autour de 50. Cliquez sur un élément pour revoir le passage.</p>
      </div>
    </div>
  )
}
