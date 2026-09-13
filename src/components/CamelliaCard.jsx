import { useLayoutEffect, useRef } from 'react'

export default function CamelliaCard({ onClose }) {
  const dialogRef = useRef(null)
  useLayoutEffect(() => {
    const card = dialogRef.current
    card.querySelector('button')?.focus({ preventScroll: true })
  }, [])
  const close = () => {
    onClose()
    requestAnimationFrame(() => document.querySelector('[aria-controls="camellia-profile"]')?.focus({ preventScroll: true }))
  }
  return <div ref={dialogRef} id="camellia-profile" className="camellia-card" role="dialog" aria-modal="false" aria-labelledby="camellia-card-title"
    onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close() } }}>
    <button className="pet-card-close" type="button" onClick={close} aria-label="Close Camellia’s card">×</button>
    <div className="camellia-photo">
      <img src={`${import.meta.env.BASE_URL}IMG_2594.JPG`} alt="Camellia, a blue golden shorthair with round eyes and a pink nose, looking up at the camera" />
    </div>
    <div className="camellia-card-copy"><p className="garden-eyebrow">MEET THE GARDEN RESIDENT</p><h2 id="camellia-card-title">Camellia</h2>
      <p>Birthday: <time dateTime="2026-04-04">April 4, 2026</time></p>
      <p>Aries · Girl</p>
      <p>Curious · Brave</p>
    </div>
  </div>
}
