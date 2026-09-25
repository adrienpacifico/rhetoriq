/** Speaker ids are free slugs defined by the diarization agent (e.g. "moderator", "bompard"). */
export type SpeakerId = string
export type Kind = 'fallacy' | 'rhetoric' | 'fact'
export type Layer = Kind | 'habermas'
export type Verdict = 'true' | 'mostly_true' | 'misleading' | 'mostly_false' | 'false' | 'unverifiable'
export type Dimension = 'truth' | 'rightness' | 'sincerity' | 'comprehensibility'
export type Phase = 'hidden' | 'checking' | 'shown'

export interface Word { w: string; t: number; e: number }
export interface Segment { id: string; start: number; end: number; text: string; words: Word[] }
export interface Transcript {
  videoId: string
  title: string
  channel: string
  uploadDate: string
  duration: number
  language?: string
  segments: Segment[]
}

export interface VideoStats {
  fallacy: number
  rhetoric: number
  fact: number
  avgFakeness: number | null
  moments: number
  habermas: number | null
}
export interface VideoIndexEntry {
  id: string
  title: string
  channel: string | null
  uploadDate: string | null
  duration: number | null
  thumbnail?: string | null
  segments: number
  chapters: number
  annotations: number
  hasAnalysis: boolean
  speakers: string[]
  stats: VideoStats
}

export interface SpeakerInfo {
  name: string
  role: string
  party: string | null
  kind?: 'moderator' | 'debater'
  color?: string
}
export interface Chapter { id: string; title: string; start: number; end: number; summary?: string }
export interface Source { title: string; url: string }

interface AnnotationBase {
  id: string
  type: string
  label: string
  segmentId: string
  quote: string
  speaker: SpeakerId
  confidence: number
  title: string
  explanation: string
  habermas?: Dimension[]
  approx?: boolean
}
export interface RhetoricAnnotation extends AnnotationBase { kind: 'fallacy' | 'rhetoric'; severity: number }
export interface FactAnnotation extends AnnotationBase {
  kind: 'fact'
  claim: string
  verdict: Verdict
  fakeness: number
  correction: string | null
  sources: Source[]
}
export type Annotation = RhetoricAnnotation | FactAnnotation

export interface HabermasMoment {
  id: string
  segmentId: string
  speaker: SpeakerId
  dimension: Dimension
  polarity: 'positive' | 'negative'
  weight: 1 | 2 | 3
  title: string
  note: string
}
export interface HabermasSpeakerScore {
  truth: number
  rightness: number
  sincerity: number
  comprehensibility: number
  verdict: string
}
export interface ScoreNote { score: number; note?: string; verdict?: string }
export interface HabermasReport {
  dimensions?: Partial<Record<Dimension, string>>
  speakers: Record<SpeakerId, HabermasSpeakerScore>
  moments: HabermasMoment[]
  ideal_speech: {
    equal_participation: ScoreNote
    no_coercion: ScoreNote
    argument_over_power: ScoreNote
    overall: ScoreNote
  }
}

export interface Analysis {
  speakers: Record<SpeakerId, SpeakerInfo>
  turns: Record<string, SpeakerId>
  chapters: Chapter[]
  annotations: Annotation[]
  habermas: HabermasReport | null
}

/** An annotation resolved against the transcript: word range + reveal times. */
export type Placed<T> = T & {
  segIndex: number
  wordStart: number
  wordEnd: number
  /** video time (s) at which the annotation becomes visible */
  revealAt: number
  /** for facts: time at which the simulated agent returns its verdict */
  verdictAt: number
}
export type PlacedAnnotation = Placed<Annotation>
export type PlacedMoment = Placed<HabermasMoment>
