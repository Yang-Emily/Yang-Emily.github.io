import { useMemo, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { PLANS, run, isSorted, firstDisorder, findCounterexamples } from './bubble'
import { TOOL, Window, Toolbar, PenGroup, PenPill, StepThumb, ArrayCard, ExpandBlock, CasInner } from './ui'

const VERSIONS = ['one', 'two', 'full']

function nudge(values, i, dir) {
  let v = values[i]
  for (let k = 0; k < 9; k++) {
    v = ((v - 1 + dir + 9) % 9) + 1
    if (!values.some((w, j) => j !== i && w === v)) return v
  }
  return values[i]
}

function EditableExample({ values, onNudge, shown, changed }) {
  const from = useRef(null)
  const editing = shown === values
  return (
    <span className="smw-example">
      Example <span className="arr">[{shown.map((v, i) => (
        <span
          key={i}
          className={editing ? 'smw-drag' : ''}
          style={changed.includes(i) ? { color: TOOL.bad } : null}
          onPointerDown={editing ? e => { e.currentTarget.setPointerCapture(e.pointerId); from.current = e.clientY } : undefined}
          onPointerMove={editing ? e => {
            if (from.current === null) return
            const dy = from.current - e.clientY
            if (Math.abs(dy) > 12) { onNudge(i, Math.sign(dy)); from.current = e.clientY }
          } : undefined}
          onPointerUp={() => { from.current = null }}
        >{i ? ' ' : ''}{v}</span>
      ))}]</span>
    </span>
  )
}

export default function DoneCheck() {
  const [input, setInput] = useState([3, 1, 7, 4])
  const version = 0
  const [done, setDone] = useState(false)
  const [view, setView] = useState(0)
  const [open, setOpen] = useState(null)
  const [notSorted, setNotSorted] = useState(false)

  const plan = VERSIONS[version]
  const steps = PLANS[plan].steps(input.length)
  const cx = useMemo(() => {
    if (!done) return null
    return findCounterexamples(input, steps, 1)[0] ?? findCounterexamples(input, steps, 1, { keepSteps: false })[0] ?? 'none'
  }, [done, input, plan]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => { setDone(false); setView(0); setNotSorted(false) }
  // As in SketchMind, Done first checks the learner's own example; the search only runs once it is sorted.
  const finish = () => {
    if (!isSorted(run(input, steps).result)) { setNotSorted(true); return }
    setDone(true); setView(1)
  }
  const nudgeAt = (i, dir) => { setInput(vals => vals.map((v, j) => (j === i ? nudge(vals, i, dir) : v))); reset() }

  const found = cx && cx !== 'none'
  const shown = view === 1 && found ? cx.input : input
  const changed = view === 1 && found ? cx.input.map((v, i) => (v !== input[i] ? i : -1)).filter(i => i >= 0) : []
  const trace = run(shown, steps)
  const result = trace.result
  const toggle = k => setOpen(o => (o === k ? null : k))
  const bad = firstDisorder(result)

  const passes = version + 1
  return (
    <Window>
      <Toolbar right={<EditableExample values={input} shown={shown} changed={changed} onNudge={nudgeAt} />}>
        <PenGroup label="User created">
          <PenPill color={TOOL.cas}>Compare &amp; Swap</PenPill>
          {version > 0 && <PenPill color={TOOL.bubble}>Bubble up</PenPill>}
        </PenGroup>
      </Toolbar>
      <div className="smw-body">
        <div className="smw-instances">
          <button type="button" onClick={() => setView(0)}>
            <StepThumb values={input} active={view === 0} badge={cx === 'none' ? <CheckCircle2 className="smw-flag ok" size={16} /> : null} />
          </button>
          {found && (
            <button type="button" onClick={() => setView(1)} className="pop">
              <StepThumb values={cx.input} pair={changed.length ? changed : cx.input.map((v, i) => (v !== input[i] ? i : -1))} color={TOOL.bad} active={view === 1} badge={<span className="smw-flag bad">!</span>} />
            </button>
          )}
        </div>
        <div className="smw-panel" style={{ flex: 1 }}>
          {version === 0
            ? [0, 1, 2].map(i => (
              <ExpandBlock key={i} kind="cas" badge={`i = ${i}`} open={open === i} onToggle={() => toggle(i)}
                head={<>compare_and_swap(<span className="arg">a[i],a[i+1]</span>)</>}>
                <CasInner a={trace.states[i][i]} b={trace.states[i][i + 1]} taken={trace.outcomes[i]} />
              </ExpandBlock>
            ))
            : Array.from({ length: passes }, (_, k) => {
              const first = [0, 3, 5][k]
              return (
                <ExpandBlock key={k} kind="loop" badge={`pass ${k + 1}`} open={open === k} onToggle={() => toggle(k)}
                  head={<>bubble_up(<span className="arg">i = 0‥{2 - k}</span>)</>}>
                  <div className="smw-mini">
                    {Array.from({ length: 3 - k }, (_, i) => {
                      const n = first + i
                      const [x, y] = [trace.states[n][i], trace.states[n][i + 1]]
                      return (
                        <div key={i} className={`branch ${trace.outcomes[n] ? 'yes' : 'idle'}`}>
                          <code style={{ color: TOOL.cas }}>compare_and_swap({x},{y})</code>
                          <code style={{ marginLeft: 'auto', color: trace.outcomes[n] ? TOOL.swap : '#c0c4cc' }}>{trace.outcomes[n] ? 'swapped' : 'kept'}</code>
                        </div>
                      )
                    })}
                  </div>
                </ExpandBlock>
              )
            })}
          <ArrayCard values={result} labels kind={found && view === 1 ? 'result bad' : 'result'} mark={bad > 0 ? [bad - 1, bad] : []} />
        </div>
      </div>
      <div className="smw-foot">
        <span className="smw-status">
          {!done && !notSorted && 'What happens when you click Done?'}
          {notSorted && <span style={{ color: TOOL.bad }}>This plan does not sort the example yet.</span>}
          {cx === 'none' && <span style={{ color: TOOL.ok }}>No failing input among distinct digits 1 to 9.</span>}
          {found && view === 1 && <span style={{ color: TOOL.bad }}>The same plan leaves this input unsorted.</span>}
          {found && view === 0 && <span style={{ color: TOOL.bad }}>Select the new input to inspect the failure.</span>}
        </span>
        <button type="button" className="smw-done" onClick={finish} disabled={done}>
          <CheckCircle2 size={15} /> Done
        </button>
      </div>
    </Window>
  )
}
