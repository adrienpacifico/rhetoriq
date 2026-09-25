import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Analysis, Dimension, Kind, Layer, Phase, SpeakerId, Transcript as TranscriptData, VideoIndexEntry } from './types'
import { useYouTube } from './lib/youtube'
import {
  chapterStarts,
  phaseOf,
  placeAnnotations,
  placeMoments,
  segmentIndexAt,
  speakersBySegment,
  turnBlocks,
} from './lib/analysis'
import { speakerColors } from './lib/format'
import { Header } from './components/Header'
import { Player } from './components/Player'
import { Timeline } from './components/Timeline'
import { SpeakerPanel } from './components/SpeakerPanel'
import { AgentFeed, type FeedEvent } from './components/AgentFeed'
import { Transcript } from './components/Transcript'
import { HabermasSheet } from './components/HabermasSheet'
import { DimensionSheet } from './components/DimensionSheet'
import { KindSheet } from './components/KindSheet'

interface Props {
  transcript: TranscriptData
  analysis: Analysis
  videos: VideoIndexEntry[]
  onSelectVideo: (id: string) => void
  onHome: () => void
}

function groupBySeg<T extends { segIndex: number }>(items: T[]): Map<number, T[]> {
  const m = new Map<number, T[]>()
  for (const it of items) {
    const arr = m.get(it.segIndex)
    if (arr) arr.push(it)
    else m.set(it.segIndex, [it])
  }
  return m
}

/** One video's reading workspace. Remounted (keyed) when the video changes. */
export function Workspace({ transcript, analysis, videos, onSelectVideo, onHome }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const player = useYouTube(transcript.videoId, hostRef, transcript.duration)
  const [filters, setFilters] = useState<Record<Layer, boolean>>({ fallacy: true, rhetoric: true, fact: true, habermas: true })
  const [revealAll, setRevealAll] = useState(false)
  const [follow, setFollow] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dim, setDim] = useState<{ speaker: SpeakerId; dimension: Dimension } | null>(null)
  const [kindSheet, setKindSheet] = useState<{ speaker: SpeakerId; kind: Kind } | null>(null)

  // static derivations
  const placedAll = useMemo(() => placeAnnotations(transcript, analysis), [transcript, analysis])
  const momentsAll = useMemo(() => placeMoments(transcript, analysis), [transcript, analysis])
  const speakerBySeg = useMemo(() => speakersBySegment(transcript, analysis), [transcript, analysis])
  const chapterAt = useMemo(() => chapterStarts(transcript, analysis), [transcript, analysis])
  const turns = useMemo(() => turnBlocks(transcript, speakerBySeg), [transcript, speakerBySeg])
  const colors = useMemo(() => speakerColors(analysis.speakers), [analysis.speakers])

  // layer filtering
  const placed = useMemo(() => placedAll.filter((a) => filters[a.kind]), [placedAll, filters])
  const moments = useMemo(() => (filters.habermas ? momentsAll : []), [momentsAll, filters.habermas])
  const annotationsBySeg = useMemo(() => groupBySeg(placed), [placed])
  const momentsBySeg = useMemo(() => groupBySeg(moments), [moments])

  // time-dependent derivations
  const time = player.time
  const currentIndex = useMemo(() => segmentIndexAt(transcript.segments, time), [transcript, time])
  const phases = useMemo(() => {
    const m: Record<string, Phase> = {}
    for (const a of placedAll) m[a.id] = phaseOf(a, time, revealAll)
    for (const mo of momentsAll) m[mo.id] = revealAll || time >= mo.revealAt ? 'shown' : 'hidden'
    return m
  }, [placedAll, momentsAll, time, revealAll])

  const segKeys = useMemo(() => {
    const keys: string[][] = transcript.segments.map(() => [])
    for (const a of placed) keys[a.segIndex].push(`${a.id}:${phases[a.id]}`)
    for (const m of moments) keys[m.segIndex].push(`${m.id}:${phases[m.id]}`)
    return keys.map((k) => k.join('|'))
  }, [transcript, placed, moments, phases])

  const counts = useMemo(() => {
    const c: Record<Layer, { shown: number; total: number }> = {
      fallacy: { shown: 0, total: 0 },
      rhetoric: { shown: 0, total: 0 },
      fact: { shown: 0, total: 0 },
      habermas: { shown: 0, total: 0 },
    }
    for (const a of placedAll) {
      c[a.kind].total++
      if (phases[a.id] === 'shown') c[a.kind].shown++
    }
    for (const m of momentsAll) {
      c.habermas.total++
      if (phases[m.id] === 'shown') c.habermas.shown++
    }
    return c
  }, [placedAll, momentsAll, phases])

  const agentsActive = useMemo(
    () => placedAll.filter((a) => a.kind === 'fact' && phases[a.id] === 'checking').length,
    [placedAll, phases],
  )

  const events = useMemo<FeedEvent[]>(() => {
    const ev: FeedEvent[] = []
    for (const a of placed) {
      const ph = phases[a.id]
      if (ph === 'hidden') continue
      ev.push({ id: a.id, t: ph === 'shown' && a.kind === 'fact' ? a.verdictAt : a.revealAt, kind: a.kind, phase: ph, a })
    }
    for (const m of moments) if (phases[m.id] === 'shown') ev.push({ id: m.id, t: m.revealAt, kind: 'moment', m })
    return ev.sort((x, y) => y.t - x.t).slice(0, 8)
  }, [placed, moments, phases])

  // actions
  const seek = useCallback(
    (t: number) => {
      player.seek(t)
      setFollow(true)
    },
    [player.seek],
  )
  const focus = useCallback((id: string) => {
    setSelected(id)
    setFollow(false)
    requestAnimationFrame(() => {
      document.getElementById(`ann-${id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }, [])
  const toggleLayer = useCallback((l: Layer) => setFilters((f) => ({ ...f, [l]: !f[l] })), [])
  /** No spoil (false) follows the video; full analysis (true) frees the transcript for browsing. */
  const setMode = useCallback((full: boolean) => {
    setRevealAll(full)
    setFollow(!full)
  }, [])
  const jumpTo = useCallback(
    (t: number, id: string) => {
      setDim(null)
      setKindSheet(null)
      setSheetOpen(false)
      setSelected(id)
      player.seek(t)
      setFollow(true)
    },
    [player.seek],
  )

  useEffect(() => {
    if (player.ended) setSheetOpen(true)
  }, [player.ended])

  return (
    <div className="app">
      <Header
        transcript={transcript}
        videos={videos}
        onSelectVideo={onSelectVideo}
        onHome={onHome}
        filters={filters}
        counts={counts}
        onToggle={toggleLayer}
        revealAll={revealAll}
        onRevealAll={setMode}
        onOpenSheet={() => setSheetOpen(true)}
        agentsActive={agentsActive}
      />
      <main className="layout">
        <section className="left">
          <Player hostRef={hostRef} ready={player.ready} />
          <Timeline
            duration={player.duration}
            time={time}
            chapters={analysis.chapters}
            turns={turns}
            speakers={analysis.speakers}
            colors={colors}
            annotations={placed}
            phases={phases}
            moments={moments}
            showMoments={filters.habermas}
            revealAll={revealAll}
            onSeek={seek}
            selected={selected}
          />
          <SpeakerPanel
            speakers={analysis.speakers}
            colors={colors}
            annotations={placed}
            phases={phases}
            moments={moments}
            time={time}
            revealAll={revealAll}
            segments={transcript.segments}
            speakerBySeg={speakerBySeg}
            onOpenSheet={() => setSheetOpen(true)}
            onDimension={(speaker, dimension) => setDim({ speaker, dimension })}
            onKind={(speaker, kind) => setKindSheet({ speaker, kind })}
          />
          <AgentFeed events={events} active={agentsActive} speakers={analysis.speakers} onFocus={focus} />
        </section>
        <section className="right">
          <Transcript
            segments={transcript.segments}
            speakerBySeg={speakerBySeg}
            speakers={analysis.speakers}
            colors={colors}
            chapterAt={chapterAt}
            annotationsBySeg={annotationsBySeg}
            momentsBySeg={momentsBySeg}
            segKeys={segKeys}
            currentIndex={currentIndex}
            time={time}
            follow={follow}
            setFollow={setFollow}
            onSeek={seek}
            selected={selected}
            onSelect={setSelected}
          />
        </section>
      </main>
      {sheetOpen && (
        <HabermasSheet report={analysis.habermas} speakers={analysis.speakers} colors={colors} onClose={() => setSheetOpen(false)} />
      )}
      {kindSheet && (
        <KindSheet
          speaker={kindSheet.speaker}
          kind={kindSheet.kind}
          speakers={analysis.speakers}
          colors={colors}
          annotations={placedAll}
          phases={phases}
          revealAll={revealAll}
          onJump={jumpTo}
          onClose={() => setKindSheet(null)}
        />
      )}
      {dim && (
        <DimensionSheet
          speaker={dim.speaker}
          dimension={dim.dimension}
          speakers={analysis.speakers}
          colors={colors}
          report={analysis.habermas}
          moments={momentsAll}
          annotations={placedAll}
          phases={phases}
          revealAll={revealAll}
          onJump={jumpTo}
          onClose={() => setDim(null)}
        />
      )}
    </div>
  )
}
