import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { HabermasReport, SpeakerId, SpeakerInfo } from '../types'
import { DIMS, DIM_LABEL, debaterIds, initials, speakerName } from '../lib/format'

interface Props {
  report: HabermasReport | null
  speakers: Record<SpeakerId, SpeakerInfo>
  colors: Record<SpeakerId, string>
  onClose: () => void
}

function Ring({ value, size = 96 }: { value: number; size?: number }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const hue = 8 + (value / 100) * 140 // red → green
  return (
    <svg width={size} height={size} className="ring" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="ring-fg"
        style={{ stroke: `hsl(${hue} 80% 60%)`, strokeDasharray: c, strokeDashoffset: c * (1 - value / 100) }}
      />
      <text x="50%" y="50%" dy="0.36em" textAnchor="middle" className="ring-text">
        {value}
      </text>
    </svg>
  )
}

export function HabermasSheet({ report, speakers, colors, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ids = report ? Object.keys(report.speakers).filter((id) => debaterIds(speakers).includes(id) || !speakers[id]) : []

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <button className="sheet-close" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="sheet-kicker">Bilan délibératif</div>
        <h2>Ce débat est-il un bon débat, au sens de Habermas ?</h2>
        {!report ? (
          <p className="muted">L'analyse habermassienne n'est pas encore disponible pour cette vidéo.</p>
        ) : (
          <>
            <div className="sheet-overall">
              <Ring value={report.ideal_speech.overall.score} size={120} />
              <div>
                <div className="sheet-overall-label">Situation idéale de parole</div>
                <p>{report.ideal_speech.overall.verdict}</p>
                <div className="sheet-subscores">
                  {(
                    [
                      ['equal_participation', 'Participation égale'],
                      ['no_coercion', 'Absence de coercition'],
                      ['argument_over_power', 'Force du meilleur argument'],
                    ] as const
                  ).map(([k, label]) => (
                    <div key={k} className="subscore" title={report.ideal_speech[k].note}>
                      <span className="subscore-label">{label}</span>
                      <span className="bar">
                        <i style={{ width: `${report.ideal_speech[k].score}%` }} />
                      </span>
                      <span className="mono">{report.ideal_speech[k].score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sheet-speakers" style={{ ['--cols' as string]: Math.min(ids.length, 3) || 1 }}>
              {ids.map((id) => {
                const s = report.speakers[id]
                const info = speakers[id]
                return (
                  <div key={id} className="sheet-speaker" style={{ ['--sc' as string]: colors[id] ?? colors.unknown }}>
                    <div className="sheet-speaker-head">
                      <span className="avatar">{initials(speakerName(id, speakers))}</span>
                      <div>
                        <div className="name">{speakerName(id, speakers)}</div>
                        <div className="role">{info?.role}</div>
                      </div>
                    </div>
                    <div className="dims">
                      {DIMS.map((d) => (
                        <div key={d} className="dim" title={report.dimensions?.[d]}>
                          <span className="dim-label">{DIM_LABEL[d]}</span>
                          <span className="bar">
                            <i style={{ width: `${s[d]}%` }} />
                          </span>
                          <span className="mono">{s[d]}</span>
                        </div>
                      ))}
                    </div>
                    <p className="verdict">{s.verdict}</p>
                  </div>
                )
              })}
            </div>
            <p className="sheet-foot muted">
              Les quatre prétentions à la validité (vérité, justesse, sincérité, intelligibilité) et la situation idéale de
              parole sont issues de la théorie de l'agir communicationnel. Scores produits par des agents d'analyse : POC,
              à prendre comme une grille de lecture, pas comme un verdict.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
