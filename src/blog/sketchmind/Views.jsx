import { useEffect, useRef, useState } from 'react'
import { Hand } from 'lucide-react'
import { run, pass } from './bubble'
import { Window, Segmented, ArrayCard, ExpandBlock, CasInner } from './ui'

const EXAMPLE = [3, 1, 7, 4]
const { states, outcomes } = run(EXAMPLE, pass(4))
const OPTIONS = ['value', 'index', 'param']

export default function Views({ onViewChange }) {
  const [view, setView] = useState('value')
  const [open, setOpen] = useState(0)
  // Until the reader touches the demo, a ghost hand taps through the three views.
  const [demo, setDemo] = useState(true)
  const [hand, setHand] = useState(null)
  const root = useRef(null)
  const seg = useRef(null)
  const select = next => { setView(next); onViewChange?.(next) }
  useEffect(() => {
    if (!demo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let k = 0
    const timers = []
    const tick = () => {
      k = (k + 1) % OPTIONS.length
      const box = root.current?.getBoundingClientRect()
      const r = seg.current?.querySelectorAll('button')[k]?.getBoundingClientRect()
      if (!box || !r) return
      const next = OPTIONS[k]
      setHand({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height * 0.6, tap: false })
      timers.push(setTimeout(() => { setHand(h => h && { ...h, tap: true }); select(next) }, 700))
      timers.push(setTimeout(() => setHand(h => h && { ...h, tap: false }), 1000))
    }
    timers.push(setTimeout(tick, 900))
    const id = setInterval(tick, 2200)
    return () => { clearInterval(id); timers.forEach(clearTimeout) }
  }, [demo]) // eslint-disable-line react-hooks/exhaustive-deps
  const args = i => {
    if (view === 'value') return [states[i][i], states[i][i + 1]]
    if (view === 'index') return [`a[${i}]`, `a[${i + 1}]`]
    return ['a[i]', 'a[i+1]']
  }
  return (
    <Window>
      <div ref={root} className="smw-panel smw-views" onPointerDownCapture={() => { setDemo(false); setHand(null) }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
          <div ref={seg}><Segmented options={OPTIONS} value={view} onChange={select} /></div>
          {demo && <span className="smw-hint-label smw-hint-inline"><b>Try:</b> switch the view</span>}
        </div>
        {demo && hand && (
          <span className={`smw-tap-hand ${hand.tap ? 'tap' : ''}`} style={{ left: hand.x, top: hand.y }} aria-hidden="true">
            <span className="ring" /><Hand size={22} strokeWidth={1.8} />
          </span>
        )}
        <ArrayCard values={EXAMPLE} labels={view !== 'value'} />
        {[0, 1, 2].map(i => {
          const [a, b] = args(i)
          return (
            <ExpandBlock
              key={i}
              kind="cas"
              badge={view === 'param' ? `i = ${i}` : null}
              head={<>compare_and_swap(<span className="arg">{a},{b}</span>)</>}
              open={open === i}
              onToggle={() => setOpen(o => (o === i ? null : i))}
            >
              <CasInner a={a} b={b} taken={outcomes[i]} />
            </ExpandBlock>
          )
        })}
      </div>
    </Window>
  )
}
