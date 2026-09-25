import type { RefObject } from 'react'

export function Player({ hostRef, ready }: { hostRef: RefObject<HTMLDivElement | null>; ready: boolean }) {
  return (
    <div className={`player ${ready ? 'ready' : ''}`}>
      <div className="player-host" ref={hostRef} />
      {!ready && <div className="player-skeleton">Chargement du lecteur YouTube…</div>}
    </div>
  )
}
