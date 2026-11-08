import { useEffect, useRef, useState } from 'react'
import CatGarden from './CatGarden'
import CatWeaving from './CatWeaving'

// The pixel knotting demo opens from a small card in the garden sky, in a window over the page.
function KnitDialog({ onClose }) {
  const close = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const scroll = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    close.current?.focus()
    const onKey = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = scroll; window.removeEventListener('keydown', onKey); previous?.focus?.() }
  }, [onClose])
  return (
    <div className="knit-overlay" onPointerDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="knit-dialog" role="dialog" aria-modal="true" aria-labelledby="pixel-knot-title">
        <button ref={close} type="button" className="knit-close" aria-label="Close" onClick={onClose}>×</button>
        <CatWeaving />
      </div>
    </div>
  )
}

export default function TrialPage() {
  const [knitOpen, setKnitOpen] = useState(false)
  return (
    <main className="trial-page">
      <CatGarden onOpenKnit={() => setKnitOpen(true)} />
      {knitOpen && <KnitDialog onClose={() => setKnitOpen(false)} />}
    </main>
  )
}
