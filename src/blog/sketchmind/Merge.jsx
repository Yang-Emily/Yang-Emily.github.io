import { useRef, useState } from 'react'
import { Undo2, RotateCcw } from 'lucide-react'
import { smooth, toSvgPoint } from './ink'
import { strokeOperands, executeStroke } from './strokeOperations'
import { TOOL, Window, PenGroup, PenPill, ExampleLabel, Block, Chips, ArrayCard, StepThumb, Toolbar } from './ui'

// The plan is one card per stroke, in order, as in SketchMind's step list.
// Merging follows the tool's rules (useDragHandlers / useAutoMerge): a swap merges
// only into the compare right before it with the same pair; the swap lands on the
// branch the comparison took; then every other adjacent True compare → swap pair
// (each on matching indices) merges into the new pen too.
const EXAMPLE = [3, 1, 7, 4]
let nextId = 0
const step = (type, pair, before, merge) => {
  const after = type === 'swap' ? executeStroke(before, 'swap', pair).values : [...before]
  return { id: nextId++, type, pair, before, after, merge }
}
const initialSteps = () => [step('compare', [0, 1], EXAMPLE), step('swap', [0, 1], EXAMPLE)]

const samePair = (a, b) => a.pair[0] === b.pair[0] && a.pair[1] === b.pair[1]
const bigger = s => s.before[s.pair[0]] > s.before[s.pair[1]]
const args = s => [s.before[s.pair[0]], s.before[s.pair[1]]]

// Groups merged compare (+ swap) steps into one card.
function cards(steps) {
  const out = []
  for (let k = 0; k < steps.length; k++) {
    const s = steps[k]
    if (s.merge) {
      const swap = steps[k + 1]?.merge?.id === s.merge.id ? steps[k + 1] : null
      out.push({ kind: 'cas', compare: s, swap, at: k, last: swap ?? s })
      if (swap) k++
    } else out.push({ kind: s.type, step: s, at: k, last: s })
  }
  return out
}

// Merge every other unmerged compare → swap pair on matching indices whose compare was True.
function autoMerge(steps) {
  const next = [...steps]
  for (let k = 0; k + 1 < next.length; k++) {
    const a = next[k], b = next[k + 1]
    if (a.merge || b.merge || a.type !== 'compare' || b.type !== 'swap') continue
    if (!samePair(a, b) || !bigger(a)) continue
    const merge = { id: `auto-${a.id}`, invert: false, fresh: true }
    next[k] = { ...a, merge }
    next[k + 1] = { ...b, merge }
  }
  return next
}

function CasCard({ card, onUnmerge }) {
  const [a, b] = args(card.compare)
  const result = bigger(card.compare)
  const invert = card.compare.merge.invert
  const swapBranch = <code style={{ color: TOOL.swap }}>swap({a},{b})</code>
  const nothing = <code>do nothing</code>
  return (
    <div className={`smw-block cas expanded ${card.compare.merge.fresh ? 'pop' : ''}`}>
      <div className="head">
        <code>compare_and_swap({a},{b})</code>
        <button type="button" className="smw-round" title="Unmerge" onClick={onUnmerge}><Undo2 size={13} /></button>
      </div>
      <div className="inner">
        <code className="if">if <span style={{ color: TOOL.compare }}>is_bigger({a},{b})</span></code>
        <div className={`branch ${result ? 'yes' : 'idle'}`}>{result && <span className="tick">✓</span>}{invert ? nothing : swapBranch}</div>
        <div className={`branch ${result ? 'idle' : 'yes'}`}>{!result && <span className="tick">✓</span>}{invert ? swapBranch : nothing}</div>
      </div>
    </div>
  )
}

export default function Merge() {
  const from = useRef(null)
  const compareRefs = useRef({})
  const [drag, setDrag] = useState(null)
  const [hover, setHover] = useState(null)
  const canvas = useRef(null)
  const ink = useRef(null)
  const [live, setLive] = useState(null)
  const [steps, setSteps] = useState(initialSteps)
  const [message, setMessage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [pen, setPen] = useState('compare')
  const list = cards(steps)
  const merged = steps.some(s => s.merge)
  const userPen = [...steps].reverse().find(s => s.merge)?.merge
  const values = steps.length ? steps[steps.length - 1].after : EXAMPLE
  const shown = preview === null ? values : list[preview]?.last.after ?? values
  const slots = [100, 200, 300, 400]

  const drawStart = e => {
    if (e.button !== 0 || !e.isPrimary) return
    setPreview(null)
    e.currentTarget.setPointerCapture(e.pointerId)
    ink.current = [toSvgPoint(canvas.current, e)]
    setLive(ink.current)
  }
  const drawMove = e => {
    if (!ink.current) return
    ink.current = [...ink.current, toSvgPoint(canvas.current, e)]
    setLive(ink.current)
  }
  const drawEnd = e => {
    if (!ink.current) return
    const stroke = [...ink.current, toSvgPoint(canvas.current, e)]
    ink.current = null; setLive(null)
    const pair = strokeOperands(stroke, slots)
    if (!pair) { setMessage('Draw across two numbers.'); return }
    if (pen === 'cas') {
      // A stroke with the user pen adds a merged block; its swap runs only on the branch that has it.
      const merge = { id: `pen-${nextId}`, invert: userPen?.invert ?? false }
      const compare = step('compare', pair, values, merge)
      const swaps = bigger(compare) !== merge.invert
      const [a, b] = args(compare)
      setSteps(prev => swaps ? [...prev, compare, step('swap', pair, values, merge)] : [...prev, compare])
      setMessage(`compare_and_swap(${a},${b}) → ${bigger(compare) ? 'True' : 'False'}: ${swaps ? 'swap' : 'do nothing'}`)
    } else {
      setSteps(prev => [...prev, step(pen, pair, values)])
      setMessage(executeStroke(values, pen, pair).label)
    }
  }

  const hitCompare = e => {
    for (const [at, el] of Object.entries(compareRefs.current)) {
      const r = el?.getBoundingClientRect()
      if (r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top - 10 && e.clientY < r.bottom + 10) return +at
    }
    return null
  }
  const down = (e, at) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    from.current = { x: e.clientX, y: e.clientY, at }
    setDrag({ at, dx: 0, dy: 0 })
  }
  const move = e => {
    if (!from.current) return
    setDrag({ at: from.current.at, dx: e.clientX - from.current.x, dy: e.clientY - from.current.y })
    setHover(hitCompare(e))
  }
  const up = e => {
    if (!from.current) return
    const swapAt = from.current.at
    from.current = null
    setDrag(null)
    setHover(null)
    const compareAt = hitCompare(e)
    if (compareAt === null) return
    const compare = steps[compareAt], swap = steps[swapAt]
    if (swapAt !== compareAt + 1) { setMessage('Compare and Swap can only be merged when adjacent.'); return }
    if (!samePair(compare, swap)) { setMessage('Compare and Swap can only be merged when parameters match.'); return }
    // Dropped on the card itself: the swap goes to the branch the comparison actually took.
    const merge = { id: `merge-${compare.id}`, invert: !bigger(compare), fresh: true }
    let next = steps.map((s, k) => (k === compareAt || k === swapAt ? { ...s, merge } : s))
    next = autoMerge(next)
    setSteps(next)
    setPen('cas')
    setPreview(null)
    const [a, b] = args(compare)
    setMessage(merge.invert ? `is_bigger(${a},${b}) was False, so the swap goes on the False branch.` : 'Merged. The swap is the True branch; draw with your new pen.')
  }
  const unmerge = id => {
    const next = steps.map(s => (s.merge?.id === id ? { ...s, merge: undefined } : s))
    setSteps(next)
    if (!next.some(s => s.merge)) setPen('compare')
    setPreview(null)
    setMessage(null)
  }
  const reset = () => {
    setSteps(initialSteps()); setPreview(null); setMessage(null); setPen('compare')
  }

  const status = preview !== null
    ? `Step ${preview + 1} of ${list.length}`
    : message || (merged ? 'Draw across two numbers with your new pen.' : 'Drag the swap card onto the compare card above it.')

  return (
    <Window className="smw-merge">
      <Toolbar right={<ExampleLabel values={EXAMPLE} />}>
        <PenGroup label="Primitives">
          <PenPill color={TOOL.compare} active={pen === 'compare'} onClick={() => setPen('compare')}>Compare</PenPill>
          <PenPill color={TOOL.swap} active={pen === 'swap'} onClick={() => setPen('swap')}>Swap</PenPill>
        </PenGroup>
        {merged && (
          <PenGroup label="User created">
            <PenPill color={TOOL.cas} active={pen === 'cas'} onClick={() => setPen('cas')} pop>Compare &amp; Swap</PenPill>
          </PenGroup>
        )}
      </Toolbar>
      <div className="smw-body">
      <div className="smw-instances">
        {list.map((card, i) => {
          const s = card.kind === 'cas' ? card.compare : card.step
          return (
            <button key={s.id} type="button" onClick={() => setPreview(i)}>
              <StepThumb values={card.last.after} pair={s.pair} color={TOOL[card.kind]} active={preview === i || preview === null && i === list.length - 1} />
            </button>
          )
        })}
      </div>
      <div className="smw-canvas">
        <svg ref={canvas} viewBox="0 0 500 210" aria-label="Draw across two numbers to add a step" onPointerDown={drawStart} onPointerMove={drawMove} onPointerUp={drawEnd} onPointerCancel={() => { ink.current = null; setLive(null) }}>
          {shown.map((value, i) => <text key={i} x={slots[i]} y="118" textAnchor="middle" className="smw-digit">{value}</text>)}
          {live && <path d={smooth(live)} fill="none" stroke={TOOL[pen]} strokeWidth="3.5" strokeLinecap="round" />}
        </svg>
        {(steps.length > 2 || merged) && <div className="smw-tools"><button type="button" className="smw-icon" onClick={reset} title="Reset" aria-label="Reset"><RotateCcw size={14} /></button></div>}
      </div>
      <div className="smw-panel">
        {list.map(card => {
          if (card.kind === 'cas') {
            return <CasCard key={card.compare.id} card={card} onUnmerge={() => unmerge(card.compare.merge.id)} />
          }
          const s = card.step
          const [a, b] = args(s)
          if (s.type === 'compare') {
            return (
              <div key={s.id} ref={el => { if (el) compareRefs.current[card.at] = el; else delete compareRefs.current[card.at] }}>
                <Block kind="cmp" className={hover === card.at ? 'hot' : ''} right={<Chips value={bigger(s)} />}>is_bigger({a},{b})</Block>
              </div>
            )
          }
          const dragging = drag?.at === card.at
          const mergeable = steps[card.at - 1]?.type === 'compare' && !steps[card.at - 1].merge && samePair(steps[card.at - 1], s)
          return (
            <Block
              key={s.id}
              kind="swp"
              className={`grab ${dragging ? 'dragging' : ''}`}
              style={dragging ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(-1.5deg)` } : undefined}
              onPointerDown={e => down(e, card.at)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              right={mergeable && !merged ? <span className="smw-hint">drag onto the compare ↑</span> : null}
            >
              swap({a},{b})
            </Block>
          )
        })}
        <ArrayCard values={shown} labels kind="result" />
      </div>
      </div>
      <div className="smw-foot"><span className="smw-status" role="status">{status}</span></div>
    </Window>
  )
}
