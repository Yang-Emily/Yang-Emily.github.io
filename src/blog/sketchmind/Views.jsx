import { useState } from 'react'
import { run, pass } from './bubble'
import { Window, Segmented, ArrayCard, ExpandBlock, CasInner } from './ui'

const EXAMPLE = [3, 1, 7, 4]
const { states, outcomes } = run(EXAMPLE, pass(4))

export default function Views({ onViewChange }) {
  const [view, setView] = useState('value')
  const [open, setOpen] = useState(0)
  const args = i => {
    if (view === 'value') return [states[i][i], states[i][i + 1]]
    if (view === 'index') return [`a[${i}]`, `a[${i + 1}]`]
    return ['a[i]', 'a[i+1]']
  }
  return (
    <Window>
      <div className="smw-panel">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <Segmented options={['value', 'index', 'param']} value={view} onChange={next => { setView(next); onViewChange?.(next) }} />
        </div>
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
