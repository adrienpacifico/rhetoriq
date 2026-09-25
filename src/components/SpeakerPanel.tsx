import { useMemo } from 'react'
import { ChevronRight, Scale } from 'lucide-react'
import type { Dimension, Kind, Phase, PlacedAnnotation, PlacedMoment, Segment, SpeakerId, SpeakerInfo } from '../types'
import { DIMS, DIM_LABEL, debaterIds, fakenessColor, initials, speakerName } from '../lib/format'

interface Props {
  speakers: Record<SpeakerId, SpeakerInfo>
  colors: Record<SpeakerId, string>
  annotations: PlacedAnnotation[]
  phases: Record<string, Phase>
  moments: PlacedMoment[]
  time: number
  revealAll: boolean
  segments: Segment[]
  speakerBySeg: SpeakerId[]
  onOpenSheet: () => void
  onDimension: (speaker: SpeakerId, dimension: Dimension) => void
  onKind: (speaker: SpeakerId, kind: Kind) => void
}

export function SpeakerPanel(p: Props) {
  const debaters = useMemo(() => debaterIds(p.speakers), [p.speakers])
  const elapsed = useMemo(() => {
    const m: Record<SpeakerId, number> = {}
    p.segments.forEach((s, i) => {
      if (s.start < p.time) m[p.speakerBySeg[i]] = (m[p.speakerBySeg[i]] ?? 0) + Math.min(s.end, p.time) - s.start
    })
    return m
  }, [p.segments, p.speakerBySeg, p.time])
  const debaterTotal = debaters.reduce((s, id) => s + (elapsed[id] ?? 0), 0)

  if (debaters.length === 0) return null

  return (
    <div className="speakers" style={{ ['--cols' as string]: Math.min(debaters.length, 3) }}>
      {debaters.map((id) => {
        const info = p.speakers[id]
        const mine = p.annotations.filter((a) => a.speaker === id && p.phases[a.id] === 'shown')
        const fallacies = mine.filter((a) => a.kind === 'fallacy').length
        const rhetoric = mine.filter((a) => a.kind === 'rhetoric').length
        const facts = mine.filter((a) => a.kind === 'fact')
        const avgFake = facts.length
          ? Math.round(facts.reduce((s, a) => s + (a.kind === 'fact' ? a.fakeness : 0), 0) / facts.length)
          : null
        const share = debaterTotal > 0 ? Math.round(((elapsed[id] ?? 0) / debaterTotal) * 100) : Math.round(100 / debaters.length)

        const live: Record<Dimension, number> = { truth: 50, rightness: 50, sincerity: 50, comprehensibility: 50 }
        for (const m of p.moments) {
          if (m.speaker !== id) continue
          if (!(p.revealAll || p.time >= m.revealAt)) continue
          live[m.dimension] = Math.max(0, Math.min(100, live[m.dimension] + (m.polarity === 'positive' ? 1 : -1) * m.weight * 6))
        }

        return (
          <div key={id} className="speaker" style={{ ['--sc' as string]: p.colors[id] }}>
            <div className="speaker-head">
              <span className="avatar">{initials(speakerName(id, p.speakers))}</span>
              <div>
                <div className="name">{speakerName(id, p.speakers)}</div>
                <div className="role">{info?.role}</div>
              </div>
            </div>

            <div className="stats">
              <button className="stat" onClick={() => p.onKind(id, 'fallacy')} title="Voir le détail des sophismes">
                <div className="stat-v" style={{ color: fallacies ? '#ff5c7a' : undefined }}>{fallacies}</div>
                <div className="stat-l">sophismes</div>
              </button>
              <button className="stat" onClick={() => p.onKind(id, 'rhetoric')} title="Voir le détail des procédés">
                <div className="stat-v" style={{ color: rhetoric ? '#b48cff' : undefined }}>{rhetoric}</div>
                <div className="stat-l">procédés</div>
              </button>
              <button className="stat" onClick={() => p.onKind(id, 'fact')} title={`${facts.length} affirmation(s) vérifiée(s) · voir le détail`}>
                <div className="stat-v" style={{ color: avgFake === null ? undefined : fakenessColor(avgFake) }}>
                  {avgFake === null ? '—' : `${avgFake}%`}
                </div>
                <div className="stat-l">fake moyen</div>
              </button>
            </div>

            <div className="share">
              <div className="share-label">
                <span>Temps de parole</span>
                <span className="mono">{share} %</span>
              </div>
              <div className="share-bar">
                <i style={{ width: `${share}%` }} />
              </div>
            </div>

            <div className="live-dims">
              <div className="hdr">
                <span>
                  <Scale size={10} /> Habermas · en direct
                </span>
                <button className="link" onClick={p.onOpenSheet}>
                  bilan
                </button>
              </div>
              {DIMS.map((d) => {
                const v = live[d]
                const pos = v >= 50
                const n = p.moments.filter((m) => m.speaker === id && m.dimension === d && (p.revealAll || p.time >= m.revealAt)).length
                return (
                  <button key={d} className="ldim clickable" onClick={() => p.onDimension(id, d)} title={`${n} moment${n > 1 ? 's' : ''} · voir le détail`}>
                    <span className="ldim-label">
                      {DIM_LABEL[d]} <ChevronRight size={11} />
                    </span>
                    <span className="ldim-bar">
                      <i className={pos ? 'pos' : 'neg'} style={{ left: `${pos ? 50 : v}%`, width: `${Math.abs(v - 50)}%` }} />
                    </span>
                    <span className="mono" style={{ color: v === 50 ? 'var(--muted)' : pos ? 'var(--pos)' : 'var(--neg)' }}>
                      {v > 50 ? '+' : ''}
                      {v - 50}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
