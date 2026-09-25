import type {
  Analysis,
  Chapter,
  PlacedAnnotation,
  PlacedMoment,
  Phase,
  Segment,
  SpeakerId,
  Transcript,
} from '../types'
import { UNKNOWN_SPEAKER, speakerKind } from './format'

const normWord = (w: string) =>
  w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '')

function hash(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** Locate a quote inside a segment and return the covered word range. */
export function locateQuote(seg: Segment, quote: string): { wordStart: number; wordEnd: number; approx: boolean } {
  const n = seg.words.length
  const q = quote.trim()
  if (n === 0) return { wordStart: 0, wordEnd: 0, approx: true }

  // 1. exact character match mapped back to word indices (text === words.join(' '))
  const idx = q ? seg.text.indexOf(q) : -1
  if (idx >= 0) {
    const end = idx + q.length
    let pos = 0
    let ws = -1
    let we = -1
    for (let i = 0; i < n; i++) {
      const a = pos
      const b = pos + seg.words[i].w.length
      if (ws < 0 && b > idx) ws = i
      if (a < end) we = i
      pos = b + 1
    }
    if (ws >= 0 && we >= ws) return { wordStart: ws, wordEnd: we, approx: false }
  }

  // 2. normalised word-sequence match (tolerates punctuation / accents / case)
  const qw = q.split(/\s+/).map(normWord).filter(Boolean)
  const sw = seg.words.map((w) => normWord(w.w))
  if (qw.length) {
    outer: for (let i = 0; i + qw.length <= n; i++) {
      for (let j = 0; j < qw.length; j++) if (sw[i + j] !== qw[j]) continue outer
      return { wordStart: i, wordEnd: i + qw.length - 1, approx: false }
    }
    // 3. anchor on first / last word
    const first = sw.indexOf(qw[0])
    const last = sw.lastIndexOf(qw[qw.length - 1])
    if (first >= 0 && last >= first) return { wordStart: first, wordEnd: last, approx: true }
  }
  return { wordStart: 0, wordEnd: n - 1, approx: true }
}

export function placeAnnotations(tr: Transcript, an: Analysis): PlacedAnnotation[] {
  const index = new Map(tr.segments.map((s, i) => [s.id, i] as const))
  const out: PlacedAnnotation[] = []
  for (const a of an.annotations) {
    const si = index.get(a.segmentId)
    if (si === undefined) continue
    const seg = tr.segments[si]
    const loc = locateQuote(seg, a.quote)
    const revealAt = seg.words[loc.wordEnd]?.e ?? seg.end
    // simulated agent latency for fact-checks: 2.5 s → 5.4 s, deterministic per id
    const latency = a.kind === 'fact' ? 2.5 + (hash(a.id) % 30) / 10 : 0
    out.push({
      ...a,
      segIndex: si,
      wordStart: loc.wordStart,
      wordEnd: loc.wordEnd,
      approx: Boolean(a.approx) || loc.approx,
      revealAt,
      verdictAt: revealAt + latency,
    })
  }
  return out.sort((x, y) => x.revealAt - y.revealAt)
}

export function placeMoments(tr: Transcript, an: Analysis): PlacedMoment[] {
  const index = new Map(tr.segments.map((s, i) => [s.id, i] as const))
  const out: PlacedMoment[] = []
  for (const m of an.habermas?.moments ?? []) {
    const si = index.get(m.segmentId)
    if (si === undefined) continue
    const seg = tr.segments[si]
    out.push({ ...m, segIndex: si, wordStart: 0, wordEnd: seg.words.length - 1, revealAt: seg.end, verdictAt: seg.end })
  }
  return out.sort((x, y) => x.revealAt - y.revealAt)
}

export function phaseOf(a: PlacedAnnotation, t: number, revealAll: boolean): Phase {
  if (revealAll) return 'shown'
  if (t < a.revealAt) return 'hidden'
  if (a.kind === 'fact' && t < a.verdictAt) return 'checking'
  return 'shown'
}

/** Speaker of every segment, carrying the last known speaker forward across gaps. */
export function speakersBySegment(tr: Transcript, an: Analysis): SpeakerId[] {
  const ids = Object.keys(an.speakers)
  let cur: SpeakerId = ids.find((id) => speakerKind(id, an.speakers[id]) === 'moderator') ?? ids[0] ?? UNKNOWN_SPEAKER
  return tr.segments.map((s) => {
    const sp = an.turns[s.id]
    if (sp) cur = sp
    return cur
  })
}

/** Map segment index → chapter starting at that segment. */
export function chapterStarts(tr: Transcript, an: Analysis): Map<number, Chapter> {
  const m = new Map<number, Chapter>()
  for (const c of an.chapters) {
    let idx = tr.segments.findIndex((s) => s.start >= c.start - 0.05)
    if (idx < 0) idx = 0
    if (!m.has(idx)) m.set(idx, c)
  }
  return m
}

/** Index of the segment being spoken at time t (or the last one that started before t). */
export function segmentIndexAt(segments: Segment[], t: number): number {
  let lo = 0
  let hi = segments.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (segments[mid].start <= t) {
      ans = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  return ans
}

export interface TurnBlock { speaker: SpeakerId; start: number; end: number }
export function turnBlocks(tr: Transcript, spk: SpeakerId[]): TurnBlock[] {
  const blocks: TurnBlock[] = []
  tr.segments.forEach((s, i) => {
    const last = blocks[blocks.length - 1]
    if (last && last.speaker === spk[i]) last.end = s.end
    else blocks.push({ speaker: spk[i], start: s.start, end: s.end })
  })
  return blocks
}
