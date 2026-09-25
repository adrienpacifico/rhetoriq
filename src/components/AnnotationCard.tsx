import { useState } from 'react'
import { AlertTriangle, ExternalLink, Play, Quote, Radar, Scale, SearchCheck } from 'lucide-react'
import type { Phase, PlacedAnnotation, PlacedMoment } from '../types'
import { DIM_LABEL, VERDICT_LABEL, annotationColor, fakenessColor, fmtTime } from '../lib/format'

export function FakeMeter({ value, verdict, pending }: { value: number; verdict?: string; pending?: boolean }) {
  return (
    <div className={`meter ${pending ? 'pending' : ''}`}>
      <div className="meter-track">
        <div className="meter-needle" style={{ left: pending ? '0%' : `${value}%` }} />
        {pending && <div className="meter-scan" />}
      </div>
      <div className="meter-row">
        <span className="meter-verdict" style={{ color: pending ? undefined : fakenessColor(value) }}>
          {pending ? 'vérification…' : verdict}
        </span>
        <span className="mono meter-pct">{pending ? '—' : `${value} % fake`}</span>
      </div>
    </div>
  )
}

export function SeverityBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="sev">
      <div className="sev-track">
        <i style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="mono">{value}</span>
    </div>
  )
}

interface CardProps {
  a: PlacedAnnotation
  phase: Phase
  open: boolean
  onToggle: () => void
  onSeek: (t: number) => void
  speakerName?: string
}

export function AnnotationCard({ a, phase, open, onToggle, onSeek, speakerName }: CardProps) {
  const color = phase === 'checking' ? '#4cc9f0' : annotationColor(a)
  const Icon = a.kind === 'fact' ? (phase === 'checking' ? Radar : SearchCheck) : a.kind === 'fallacy' ? AlertTriangle : Quote
  return (
    <div
      id={`ann-${a.id}`}
      className={`card kind-${a.kind} phase-${phase} ${open ? 'open' : ''}`}
      style={{ ['--c' as string]: color }}
      onClick={onToggle}
    >
      <div className="card-head">
        <Icon size={13} className="card-icon" />
        <span className="card-label">{phase === 'checking' ? 'Agent fact-check' : a.label}</span>
        <span className="card-speaker">{speakerName ?? a.speaker}</span>
      </div>
      <div className="card-title">{phase === 'checking' ? 'Vérification en cours…' : a.title}</div>
      {a.kind === 'fact' ? (
        <FakeMeter value={a.fakeness} verdict={VERDICT_LABEL[a.verdict]} pending={phase === 'checking'} />
      ) : (
        <SeverityBar value={a.severity} color={color} />
      )}
      {open && phase === 'shown' && (
        <div className="card-body" onClick={(e) => e.stopPropagation()}>
          <blockquote>« {a.quote} »</blockquote>
          {a.kind === 'fact' && <p className="card-claim">Affirmation : {a.claim}</p>}
          <p>{a.explanation}</p>
          {a.kind === 'fact' && a.correction && (
            <p className="card-correction">
              <strong>Ce que disent les sources :</strong> {a.correction}
            </p>
          )}
          {a.kind === 'fact' && a.sources.length > 0 && (
            <ul className="sources">
              {a.sources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    <ExternalLink size={11} /> {s.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="card-meta">
            <span>Confiance {a.confidence} %</span>
            {a.habermas && a.habermas.length > 0 && (
              <span className="dims-inline">
                <Scale size={11} /> {a.habermas.map((d) => DIM_LABEL[d]).join(' · ')}
              </span>
            )}
            {a.approx && <span className="approx">passage approximatif</span>}
          </div>
          <button
            className="btn tiny"
            onClick={(e) => {
              e.stopPropagation()
              onSeek(Math.max(0, a.revealAt - 6))
            }}
          >
            <Play size={11} /> Revoir le passage · {fmtTime(a.revealAt)}
          </button>
        </div>
      )}
    </div>
  )
}

export function MomentChip({ m, speakerName, highlight }: { m: PlacedMoment; speakerName?: string; highlight?: boolean }) {
  const [open, setOpen] = useState(false)
  const expanded = open || Boolean(highlight)
  return (
    <div id={`ann-${m.id}`} className={`moment ${m.polarity} ${expanded ? 'open' : ''} ${highlight ? 'sel' : ''}`} onClick={() => setOpen((v) => !v)} title={m.note}>
      <div className="moment-head">
        <Scale size={12} />
        <span className="moment-sign">
          {m.polarity === 'positive' ? '+' : '−'}
          {m.weight}
        </span>
        <span className="moment-dim">{DIM_LABEL[m.dimension]}</span>
        <span className="card-speaker">{speakerName ?? m.speaker}</span>
      </div>
      <div className="moment-title">{m.title}</div>
      {expanded && <p className="moment-note">{m.note}</p>}
    </div>
  )
}
