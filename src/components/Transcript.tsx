import { Fragment, memo, useEffect, useMemo, useRef } from 'react'
import { ArrowDownToLine } from 'lucide-react'
import type { Chapter, Phase, PlacedAnnotation, PlacedMoment, Segment, SpeakerId, SpeakerInfo } from '../types'
import { fmtTime, initials, speakerLabel, speakerName } from '../lib/format'
import { AnnotationCard, MomentChip } from './AnnotationCard'
import { annotationColor, intensity, rgba } from '../lib/format'

type Status = 'past' | 'current' | 'future'

interface Props {
  segments: Segment[]
  speakerBySeg: SpeakerId[]
  speakers: Record<SpeakerId, SpeakerInfo>
  colors: Record<SpeakerId, string>
  chapterAt: Map<number, Chapter>
  annotationsBySeg: Map<number, PlacedAnnotation[]>
  momentsBySeg: Map<number, PlacedMoment[]>
  segKeys: string[]
  currentIndex: number
  time: number
  follow: boolean
  setFollow: (v: boolean) => void
  onSeek: (t: number) => void
  selected: string | null
  onSelect: (id: string | null) => void
}

export function Transcript(p: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Any user-initiated scroll pauses the auto-follow.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = () => p.setFollow(false)
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) stop()
    }
    el.addEventListener('wheel', stop, { passive: true })
    el.addEventListener('touchmove', stop, { passive: true })
    el.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', stop)
      el.removeEventListener('touchmove', stop)
      el.removeEventListener('keydown', onKey)
    }
  }, [p.setFollow])

  // Auto-follow: keep the spoken segment around the upper third of the pane.
  useEffect(() => {
    if (!p.follow || p.currentIndex < 0) return
    const el = ref.current
    const seg = el?.querySelector<HTMLElement>(`[data-seg="${p.currentIndex}"]`)
    if (!el || !seg) return
    const target = seg.offsetTop - el.clientHeight * 0.3
    el.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [p.currentIndex, p.follow])

  const resume = () => {
    p.setFollow(true)
  }

  return (
    <div className="transcript-wrap">
      <div className="transcript" ref={ref} tabIndex={0}>
        <div className="transcript-inner">
          {p.segments.map((s, i) => {
            const chapter = p.chapterAt.get(i)
            const speaker = p.speakerBySeg[i]
            const turnStart = i === 0 || p.speakerBySeg[i - 1] !== speaker
            const status: Status = i === p.currentIndex ? 'current' : i < p.currentIndex ? 'past' : 'future'
            return (
              <Fragment key={s.id}>
                {chapter && (
                  <div className="chapter" onClick={() => p.onSeek(chapter.start)}>
                    <span className="chapter-kicker">Chapitre</span>
                    <span className="chapter-title">{chapter.title}</span>
                    <span className="chapter-line" />
                    <span className="mono chapter-time">{fmtTime(chapter.start)}</span>
                  </div>
                )}
                {turnStart && (
                  <div className="turn" style={{ ['--sc' as string]: p.colors[speaker] ?? p.colors.unknown }} onClick={() => p.onSeek(s.start)}>
                    <span className="avatar">{initials(speakerName(speaker, p.speakers))}</span>
                    <span className="turn-name">{speakerName(speaker, p.speakers)}</span>
                    <span className="turn-role">{p.speakers[speaker]?.role}</span>
                    <span className="mono turn-time">{fmtTime(s.start)}</span>
                  </div>
                )}
                <SegmentRow
                  seg={s}
                  index={i}
                  status={status}
                  time={status === 'current' ? p.time : status === 'past' ? Infinity : -1}
                  annotations={p.annotationsBySeg.get(i)}
                  moments={p.momentsBySeg.get(i)}
                  segKey={p.segKeys[i]}
                  selected={p.selected}
                  onSelect={p.onSelect}
                  onSeek={p.onSeek}
                  speakers={p.speakers}
                />
              </Fragment>
            )
          })}
        </div>
      </div>
      {!p.follow && (
        <button className="follow-pill" onClick={resume}>
          <ArrowDownToLine size={14} />
          Reprendre le suivi
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

interface Run { from: number; to: number; ids: string[] }
function buildRuns(seg: Segment, anns: PlacedAnnotation[] | undefined): Run[] {
  const n = seg.words.length
  const cover: string[][] = Array.from({ length: n }, () => [])
  for (const a of anns ?? []) for (let i = a.wordStart; i <= a.wordEnd && i < n; i++) cover[i].push(a.id)
  const runs: Run[] = []
  let start = 0
  for (let i = 1; i <= n; i++) {
    if (i === n || cover[i].join('|') !== cover[start].join('|')) {
      runs.push({ from: start, to: i - 1, ids: cover[start] })
      start = i
    }
  }
  return runs
}

interface RowProps {
  seg: Segment
  index: number
  status: Status
  time: number
  annotations?: PlacedAnnotation[]
  moments?: PlacedMoment[]
  segKey: string
  selected: string | null
  onSelect: (id: string | null) => void
  onSeek: (t: number) => void
  speakers: Record<SpeakerId, SpeakerInfo>
}

const PRIORITY: Record<string, number> = { fact: 3, fallacy: 2, rhetoric: 1 }

const SegmentRow = memo(
  function SegmentRow(r: RowProps) {
    const runs = useMemo(() => buildRuns(r.seg, r.annotations), [r.seg, r.annotations])
    const phases = useMemo(() => {
      const m: Record<string, Phase> = {}
      for (const part of r.segKey.split('|')) {
        if (!part) continue
        const [id, ph] = part.split(':')
        m[id] = ph as Phase
      }
      return m
    }, [r.segKey])
    const byId = useMemo(() => new Map((r.annotations ?? []).map((a) => [a.id, a] as const)), [r.annotations])
    const selectedHere = r.selected && byId.has(r.selected) ? r.selected : null
    const momentShown = (m: PlacedMoment) => phases[m.id] && phases[m.id] !== 'hidden'

    const visibleCards = (r.annotations ?? []).filter((a) => phases[a.id] && phases[a.id] !== 'hidden')
    const visibleMoments = (r.moments ?? []).filter(momentShown)

    return (
      <div className={`seg ${r.status} ${selectedHere ? 'has-sel' : ''}`} data-seg={r.index}>
        <div className="seg-text">
          <button className="seg-time mono" onClick={() => r.onSeek(r.seg.start)} title="Lire ce passage">
            {fmtTime(r.seg.start)}
          </button>
          {runs.map((run) => {
            // pick the most prominent visible annotation of the run for styling
            let top: PlacedAnnotation | undefined
            let topPhase: Phase = 'hidden'
            for (const id of run.ids) {
              const ph = phases[id]
              if (!ph || ph === 'hidden') continue
              const a = byId.get(id)
              if (!a) continue
              if (!top || PRIORITY[a.kind] > PRIORITY[top.kind]) {
                top = a
                topPhase = ph
              }
            }
            const style: React.CSSProperties = {}
            let cls = 'run'
            if (top) {
              const c = annotationColor(top)
              cls += ` run-${top.kind} run-${topPhase}`
              if (topPhase === 'shown') {
                const i = intensity(top)
                style.background = rgba(colorToHex(c), 0.10 + 0.32 * i)
                style.boxShadow = `inset 0 -2px 0 ${c}`
              }
              if (selectedHere && run.ids.includes(selectedHere)) cls += ' run-selected'
            }
            const words = r.seg.words.slice(run.from, run.to + 1)
            return (
              <span
                key={run.from}
                className={cls}
                style={style}
                onClick={
                  top
                    ? (e) => {
                        e.stopPropagation()
                        r.onSelect(r.selected === top!.id ? null : top!.id)
                      }
                    : undefined
                }
                title={top && topPhase === 'shown' ? `${top.label} — ${top.title}` : undefined}
              >
                {words.map((w, k) => {
                  const said = w.t <= r.time
                  const now = said && r.time < w.e
                  return (
                    <span key={k} className={now ? 'w now' : said ? 'w said' : 'w unsaid'}>
                      {w.w}{' '}
                    </span>
                  )
                })}
              </span>
            )
          })}
        </div>
        <div className="gutter">
          {visibleCards.map((a) => (
            <AnnotationCard
              key={a.id}
              a={a}
              phase={phases[a.id]}
              open={selectedHere === a.id}
              onToggle={() => r.onSelect(selectedHere === a.id ? null : a.id)}
              onSeek={r.onSeek}
              speakerName={speakerLabel(a.speaker, r.speakers)}
            />
          ))}
          {visibleMoments.map((m) => (
            <MomentChip key={m.id} m={m} speakerName={speakerLabel(m.speaker, r.speakers)} highlight={r.selected === m.id} />
          ))}
        </div>
      </div>
    )
  },
  (a, b) =>
    a.status === b.status &&
    a.segKey === b.segKey &&
    a.annotations === b.annotations &&
    a.moments === b.moments &&
    a.seg === b.seg &&
    a.speakers === b.speakers &&
    (a.selected === b.selected || (!inSeg(a.selected, a.annotations, a.moments) && !inSeg(b.selected, b.annotations, b.moments))) &&
    (a.status !== 'current' || a.time === b.time),
)

function inSeg(id: string | null, anns?: PlacedAnnotation[], moments?: PlacedMoment[]): boolean {
  return Boolean(id && (anns?.some((a) => a.id === id) || moments?.some((m) => m.id === id)))
}

/** annotationColor may return rgb(); normalise to hex for rgba(). */
function colorToHex(c: string): string {
  if (c.startsWith('#')) return c
  const m = c.match(/\d+/g)
  if (!m) return '#ffffff'
  return '#' + m.slice(0, 3).map((x) => Number(x).toString(16).padStart(2, '0')).join('')
}
