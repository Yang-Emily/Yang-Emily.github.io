import { useEffect, useState } from 'react'
import { PLANS, alternatives } from './bubble'
import { Window, ArrayCard } from './ui'

const EXAMPLE = [3, 1, 7, 4]
const alts = alternatives(EXAMPLE, PLANS.one.steps(4))
const WAYS = [
  { key: 'change', title: 'Change one number', note: 'Replace the final 4 with 2. The original pass still makes the same swap decisions, but leaves 3 before 2.' },
  { key: 'reorder', title: 'Reorder', note: 'Exchange the original 3 and 4. The values are unchanged, but the same pass now leaves 4 before 3.' },
  { key: 'add', title: 'Add a number', note: 'Append 2 to the input. The original plan contains only three adjacent-pair operations, so the fifth value is never compared.' },
]
export default function ThreeWays({ onNoteChange }) {
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setActive(index => (index + 1) % WAYS.length), 5000)
    return () => clearInterval(timer)
  }, [held])
  useEffect(() => { onNoteChange?.(WAYS[active].note) }, [active, onNoteChange])
  const way = WAYS[active].key
  const alt = alts[way]
  const changed = alt.input.flatMap((v, i) => v !== EXAMPLE[i] ? [i] : [])

  return (
    <div className="sk-notebook sk-challenge-notebook sk-counterexample-notebook">
      <div className="tabs">
        {WAYS.map((item, index) => (
          <div key={item.key} className="sk-challenge-tab">
            <button type="button" className={active === index ? 'on' : ''} aria-pressed={active === index} onClick={() => { setActive(index); setHeld(true) }}>
              <b>({String.fromCharCode(97 + index)})</b> {item.title}
            </button>
          </div>
        ))}
      </div>
      <Window className="smw-counterexample">
      <div className="smw-panel">
        <div className="smw-alternative"><span>Original</span><ArrayCard values={EXAMPLE} /></div>
        <div className="smw-alternative"><span>New input</span><ArrayCard values={alt.input} mark={changed} /></div>
      </div>
      </Window>
    </div>
  )
}
