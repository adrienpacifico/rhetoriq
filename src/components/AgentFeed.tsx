import { Activity, AlertTriangle, Loader2, Quote, Scale, SearchCheck } from 'lucide-react'
import type { Kind, Phase, PlacedAnnotation, PlacedMoment, SpeakerId, SpeakerInfo } from '../types'
import { DIM_LABEL, KIND_COLOR, VERDICT_LABEL, fakenessColor, fmtTime, speakerLabel } from '../lib/format'

export interface FeedEvent {
  id: string
  t: number
  kind: Kind | 'moment'
  phase?: Phase
  a?: PlacedAnnotation
  m?: PlacedMoment
}

interface Props {
  events: FeedEvent[]
  active: number
  speakers: Record<SpeakerId, SpeakerInfo>
  onFocus: (id: string) => void
}

export function AgentFeed({ events, active, speakers, onFocus }: Props) {
  return (
    <div className="feed">
      <div className="panel-title">
        <Activity size={13} />
        Flux d'analyse
        {active > 0 && <span className="live">· {active} agent{active > 1 ? 's' : ''} en cours</span>}
      </div>
      {events.length === 0 ? (
        <div className="feed-empty">Lancez la vidéo : les détections apparaîtront ici au fil du discours.</div>
      ) : (
        <div className="feed-list">
          {events.map((e) => {
            let color = '#9aa3b2'
            let Icon: typeof Activity = Activity
            let main = ''
            let sub = ''
            let pill = ''
            let spin = false
            if (e.kind === 'moment' && e.m) {
              color = e.m.polarity === 'positive' ? '#2ec4b6' : '#ff9f1c'
              Icon = Scale
              main = `Habermas ${e.m.polarity === 'positive' ? '+' : '−'}${e.m.weight} ${DIM_LABEL[e.m.dimension]}`
              sub = e.m.title
              pill = speakerLabel(e.m.speaker, speakers)
            } else if (e.a) {
              const a = e.a
              if (a.kind === 'fact') {
                if (e.phase === 'checking') {
                  color = KIND_COLOR.fact
                  Icon = Loader2
                  spin = true
                  main = 'Agent fact-check dépêché'
                  sub = a.claim
                  pill = '…'
                } else {
                  color = fakenessColor(a.fakeness)
                  Icon = SearchCheck
                  main = `Verdict : ${VERDICT_LABEL[a.verdict]}`
                  sub = a.title
                  pill = `${a.fakeness} %`
                }
              } else if (a.kind === 'fallacy') {
                color = KIND_COLOR.fallacy
                Icon = AlertTriangle
                main = `Sophisme · ${a.label}`
                sub = a.title
                pill = speakerLabel(a.speaker, speakers)
              } else {
                color = KIND_COLOR.rhetoric
                Icon = Quote
                main = `Procédé · ${a.label}`
                sub = a.title
                pill = speakerLabel(a.speaker, speakers)
              }
            }
            return (
              <div key={`${e.id}-${e.phase ?? ''}`} className="feed-item" style={{ ['--c' as string]: color }} onClick={() => onFocus(e.id)}>
                <span className="t mono">{fmtTime(e.t)}</span>
                <Icon size={14} className={`ico ${spin ? 'spin' : ''}`} />
                <span className="txt">
                  <b>{main}</b>
                  <div className="sub">{sub}</div>
                </span>
                <span className="pill">{pill}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
