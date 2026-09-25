import type { Dimension, Kind, PlacedAnnotation, SpeakerId, SpeakerInfo, Verdict } from '../types'

export const KIND_COLOR: Record<Kind, string> = {
  fallacy: '#ff5c7a',
  rhetoric: '#b48cff',
  fact: '#4cc9f0',
}
export const KIND_LABEL: Record<Kind, string> = {
  fallacy: 'Sophisme',
  rhetoric: 'Procédé',
  fact: 'Fait',
}
export const VERDICT_LABEL: Record<Verdict, string> = {
  true: 'Exact',
  mostly_true: 'Plutôt exact',
  misleading: 'Trompeur',
  mostly_false: 'Plutôt faux',
  false: 'Faux',
  unverifiable: 'Invérifiable',
}
export const DIM_LABEL: Record<Dimension, string> = {
  truth: 'Vérité',
  rightness: 'Justesse',
  sincerity: 'Sincérité',
  comprehensibility: 'Clarté',
}
export const DIMS: Dimension[] = ['truth', 'rightness', 'sincerity', 'comprehensibility']

/* ---------- speakers ---------- */
export const DEBATER_PALETTE = ['#ffd166', '#6ea8fe', '#f78fd0', '#7ee8a2', '#ffa07a', '#c3f0ff']
export const MODERATOR_COLOR = '#9aa3b2'
export const UNKNOWN_SPEAKER = 'unknown'

export function speakerKind(id: SpeakerId, s?: SpeakerInfo): 'moderator' | 'debater' {
  if (s?.kind) return s.kind
  return id === 'moderator' ? 'moderator' : 'debater'
}
/** Stable colour per speaker: explicit colour, grey for moderators, palette order for debaters. */
export function speakerColors(speakers: Record<SpeakerId, SpeakerInfo>): Record<SpeakerId, string> {
  const out: Record<SpeakerId, string> = { [UNKNOWN_SPEAKER]: MODERATOR_COLOR }
  let i = 0
  for (const [id, s] of Object.entries(speakers)) {
    out[id] = s.color ?? (speakerKind(id, s) === 'moderator' ? MODERATOR_COLOR : DEBATER_PALETTE[i++ % DEBATER_PALETTE.length])
  }
  return out
}
export function debaterIds(speakers: Record<SpeakerId, SpeakerInfo>): SpeakerId[] {
  return Object.keys(speakers).filter((id) => speakerKind(id, speakers[id]) === 'debater')
}
/** Short label for chips: "Modération" for moderators, last name for debaters. */
export function speakerLabel(id: SpeakerId, speakers: Record<SpeakerId, SpeakerInfo>): string {
  const s = speakers[id]
  if (!s) return id === UNKNOWN_SPEAKER ? 'Intervenant' : id
  if (speakerKind(id, s) === 'moderator') return 'Modération'
  return s.name.split(/\s+/).slice(-1)[0] || s.name
}
export function speakerName(id: SpeakerId, speakers: Record<SpeakerId, SpeakerInfo>): string {
  return speakers[id]?.name ?? (id === UNKNOWN_SPEAKER ? 'Intervenant' : id)
}

/* ---------- misc ---------- */
export function fmtTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}
export function fmtDate(d: string | null | undefined): string {
  if (!d || !/^\d{8}$/.test(d)) return d ?? ''
  const dt = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`)
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  const c = (x: number, y: number) => Math.round(x + (y - x) * t)
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`
}
/** 0 (exact, green) → 50 (amber) → 100 (false, red) */
export function fakenessColor(f: number): string {
  const v = Math.max(0, Math.min(100, f))
  return v <= 50 ? mix('#3ddc97', '#ffb347', v / 50) : mix('#ffb347', '#ff4d4d', (v - 50) / 50)
}
export function annotationColor(a: PlacedAnnotation): string {
  return a.kind === 'fact' ? fakenessColor(a.fakeness) : KIND_COLOR[a.kind]
}
/** 0..1 visual intensity of an annotation (drives highlight opacity) */
export function intensity(a: PlacedAnnotation): number {
  return (a.kind === 'fact' ? a.fakeness : a.severity) / 100
}
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
