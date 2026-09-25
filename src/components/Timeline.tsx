import type { Chapter, Phase, PlacedAnnotation, PlacedMoment, SpeakerId, SpeakerInfo } from '../types'
import type { TurnBlock } from '../lib/analysis'
import { annotationColor, fmtTime, intensity, speakerLabel } from '../lib/format'

interface Props {
  duration: number
  time: number
  chapters: Chapter[]
  turns: TurnBlock[]
  speakers: Record<SpeakerId, SpeakerInfo>
  colors: Record<SpeakerId, string>
  annotations: PlacedAnnotation[]
  phases: Record<string, Phase>
  moments: PlacedMoment[]
  showMoments: boolean
  revealAll: boolean
  onSeek: (t: number) => void
  selected: string | null
}

export function Timeline(p: Props) {
  const pct = (t: number) => `${Math.max(0, Math.min(100, (t / p.duration) * 100))}%`
  const seekFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    p.onSeek(((e.clientX - r.left) / r.width) * p.duration)
  }
  const legendIds = Object.keys(p.speakers)
  return (
    <div className="timeline">
      <div className="tl-chapters">
        {p.chapters.map((c) => (
          <div
            key={c.id}
            className="tl-chapter"
            style={{ left: pct(c.start), width: pct(c.end - c.start) }}
            title={c.summary ?? c.title}
            onClick={() => p.onSeek(c.start)}
          >
            <span>{c.title}</span>
          </div>
        ))}
      </div>
      <div className="tl-body" onClick={seekFromEvent} role="slider" aria-valuenow={p.time} aria-valuemax={p.duration}>
        <div className="tl-track">
          {p.turns.map((b, i) => (
            <div
              key={i}
              className="tl-turn"
              style={{ left: pct(b.start), width: pct(b.end - b.start), background: p.colors[b.speaker] ?? p.colors.unknown }}
            />
          ))}
        </div>
        <div className="tl-ticks">
          {p.annotations.map((a) => {
            const ph = p.phases[a.id]
            const shown = ph === 'shown'
            return (
              <div
                key={a.id}
                className={`tl-tick ${shown ? 'shown' : ph === 'checking' ? 'checking' : 'hidden'} ${p.selected === a.id ? 'sel' : ''}`}
                style={{
                  left: pct(a.revealAt),
                  height: `${35 + 65 * intensity(a)}%`,
                  background: shown ? annotationColor(a) : undefined,
                }}
                title={`${fmtTime(a.revealAt)} · ${a.label}`}
              />
            )
          })}
          {p.showMoments &&
            p.moments.map((m) => {
              const shown = p.revealAll || p.time >= m.revealAt
              return (
                <div
                  key={m.id}
                  className={`tl-moment ${m.polarity} ${shown ? 'shown' : 'hidden'}`}
                  style={{ left: pct(m.revealAt) }}
                  title={`${fmtTime(m.revealAt)} · ${m.title}`}
                />
              )
            })}
        </div>
        <div className="tl-progress" style={{ width: pct(p.time) }} />
        <div className="tl-playhead" style={{ left: pct(p.time) }} />
      </div>
      <div className="tl-times">
        <span className="mono">{fmtTime(p.time)}</span>
        <span className="tl-legend">
          {legendIds.map((id) => (
            <span key={id}>
              <i style={{ background: p.colors[id] }} /> {speakerLabel(id, p.speakers)}
            </span>
          ))}
        </span>
        <span className="mono">{fmtTime(p.duration)}</span>
      </div>
    </div>
  )
}
