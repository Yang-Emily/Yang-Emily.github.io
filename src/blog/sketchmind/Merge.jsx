import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { trackComplete } from '../../analytics'
import { Undo2, RotateCcw, GripVertical, Hand } from 'lucide-react'
import { smooth, toSvgPoint } from './ink'
import { strokeOperands, executeStroke } from './strokeOperations'
import { TOOL, Window, PenGroup, PenPill, ExampleLabel, Block, Chips, StepThumb, Toolbar } from './ui'

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

// As in SketchMind, a card made by dragging opens expanded; cards drawn with the new
// pen (or merged automatically) start collapsed.
function CasCard({ card, open, onToggle, onUnmerge }) {
  const [a, b] = args(card.compare)
  const result = bigger(card.compare)
  const invert = card.compare.merge.invert
  const swapBranch = <code style={{ color: TOOL.swap }}>swap({a},{b})</code>
  const nothing = <code>do nothing</code>
  return (
    <div className={`smw-block cas ${open ? 'expanded' : ''} ${card.compare.merge.fresh ? 'pop' : ''}`}>
      <div className="head">
        <code>compare_and_swap({a},{b})</code>
        <span className="smw-cas-actions">
          <button type="button" className="smw-round" title="Unmerge" onClick={onUnmerge}><Undo2 size={13} /></button>
          <button type="button" className={`smw-round chev ${open ? 'open' : ''}`} onClick={onToggle} aria-expanded={open} title={open ? 'Collapse' : 'Expand'}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6l4 4 4-4" /></svg>
          </button>
        </span>
      </div>
      {open && <div className="inner">
        <code className="if">if <span style={{ color: TOOL.compare }}>is_bigger({a},{b})</span></code>
        <div className={`branch ${result ? 'yes' : 'idle'}`}>{result && <span className="tick">✓</span>}{invert ? nothing : swapBranch}</div>
        <div className={`branch ${result ? 'idle' : 'yes'}`}>{!result && <span className="tick">✓</span>}{invert ? swapBranch : nothing}</div>
      </div>}
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
  // Bumped whenever a card is shown, so its ink and swap animation play again.
  const [replayKey, setReplayKey] = useState(0)
  const [openCards, setOpenCards] = useState({})
  const [drewWithPen, setDrewWithPen] = useState(false)
  const [pen, setPen] = useState('compare')
  // Until the reader first grabs a swap card, a ghost hand shows the gesture on a loop.
  const [touched, setTouched] = useState(false)
  const swapRefs = useRef({})
  const [ghostDy, setGhostDy] = useState(null)
  const list = cards(steps)
  const merged = steps.some(s => s.merge)
  useEffect(() => { if (merged) trackComplete('merge') }, [merged])
  const userPen = [...steps].reverse().find(s => s.merge)?.merge
  const values = steps.length ? steps[steps.length - 1].after : EXAMPLE
  const shown = preview === null ? values : list[preview]?.last.after ?? values
  // The selected card (the latest one by default) shows the stroke that made it, and a
  // card that swapped slides its two numbers into each other's place, as in SketchMind.
  const focus = list[preview ?? list.length - 1]
  const focusInk = focus && (focus.kind === 'cas' ? focus.compare : focus.step).ink
  const focusSwap = focus?.last.type === 'swap' ? focus.last : null
  const digits = focusSwap ? focusSwap.before : shown
  const slots = [100, 200, 300, 400]
  const mergeableAt = k => steps[k]?.type === 'swap' && !steps[k].merge && steps[k - 1]?.type === 'compare' && !steps[k - 1].merge && samePair(steps[k - 1], steps[k])
  const demoAt = touched || drag ? null : steps.findIndex((_, k) => mergeableAt(k))
  const showGhost = demoAt !== null && demoAt >= 0
  useLayoutEffect(() => {
    if (!showGhost) return
    const swap = swapRefs.current[demoAt]?.getBoundingClientRect()
    const compare = compareRefs.current[demoAt - 1]?.getBoundingClientRect()
    setGhostDy(swap && compare ? compare.top - swap.top : null)
  }, [showGhost, demoAt, steps])

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
    if (!pair) return
    setMessage(null)
    if (pen === 'cas') {
      // A stroke with the user pen adds a merged block; its swap runs only on the branch that has it.
      const merge = { id: `pen-${nextId}`, invert: userPen?.invert ?? false }
      const path = smooth(stroke)
      const compare = { ...step('compare', pair, values, merge), ink: path }
      const swaps = bigger(compare) !== merge.invert
      setSteps(prev => swaps ? [...prev, compare, { ...step('swap', pair, values, merge), ink: path }] : [...prev, compare])
      setDrewWithPen(true)
    } else {
      setSteps(prev => [...prev, { ...step(pen, pair, values), ink: smooth(stroke) }])
    }
    setReplayKey(k => k + 1)
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
    setTouched(true); setMessage(null)
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
    setOpenCards(o => ({ ...o, [merge.id]: true }))
    let next = steps.map((s, k) => (k === compareAt || k === swapAt ? { ...s, merge } : s))
    next = autoMerge(next)
    setSteps(next)
    setPen('cas')
    setPreview(null)
    setMessage(null)
  }
  const unmerge = id => {
    const next = steps.map(s => (s.merge?.id === id ? { ...s, merge: undefined } : s))
    setSteps(next)
    if (!next.some(s => s.merge)) { setPen('compare'); setDrewWithPen(false) }
    setPreview(null)
    setMessage(null)
  }
  const reset = () => {
    setSteps(initialSteps()); setPreview(null); setMessage(null); setPen('compare'); setTouched(false); setOpenCards({}); setDrewWithPen(false)
  }

  // After a merge, until the reader uses it, point at the new pen.
  const penHint = merged && !drewWithPen && preview === null && pen === 'cas'

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
          const active = preview === i || preview === null && i === list.length - 1
          const select = () => { setPreview(i); setReplayKey(k => k + 1) }
          // As in SketchMind's step strip: an expanded compare_and_swap card shows its
          // compare and swap as two thumbnails wrapped together; a folded one shows one.
          if (card.kind === 'cas' && (openCards[s.merge.id] ?? false)) {
            return (
              <button key={s.id} type="button" className={`smw-thumb-group ${active ? 'on' : ''}`} onClick={select}>
                <span className="label"><i />Cmp &amp; Swp</span>
                <StepThumb values={card.compare.after} pair={s.pair} color={TOOL.compare} active={active && !card.swap} />
                {card.swap && <StepThumb values={card.swap.after} pair={s.pair} color={TOOL.swap} active={active} />}
              </button>
            )
          }
          return (
            <button key={s.id} type="button" onClick={select}>
              <StepThumb values={card.last.after} pair={s.pair} color={TOOL[card.kind]} active={active} />
            </button>
          )
        })}
      </div>
      <div className="smw-canvas">
        <svg ref={canvas} viewBox="0 0 500 210" aria-label="Draw across two numbers to add a step" onPointerDown={drawStart} onPointerMove={drawMove} onPointerUp={drawEnd} onPointerCancel={() => { ink.current = null; setLive(null) }}>
          {digits.map((value, i) => {
            const moving = focusSwap?.pair.includes(i)
            const to = moving ? focusSwap.pair.find(j => j !== i) : i
            return <text key={`${replayKey}-${i}`} x={slots[i]} y="118" textAnchor="middle" className={`smw-digit ${moving ? 'swapping' : ''}`} style={moving ? { '--dx': `${slots[to] - slots[i]}px` } : undefined}>{value}</text>
          })}
          {focusInk && <path key={`ink-${replayKey}`} d={focusInk} fill="none" stroke={TOOL[focus.kind]} strokeWidth="3.5" strokeLinecap="round" className="smw-step-ink" />}
          {live && <path d={smooth(live)} fill="none" stroke={TOOL[pen]} strokeWidth="3.5" strokeLinecap="round" />}
        </svg>
        {/* Under the array: the Try label after a merge, or why a drop did not merge. */}
        {penHint
          ? <span className="smw-hint-label smw-hint-inline smw-canvas-note"><b>Try:</b> draw with your new pen</span>
          : message && <span className="smw-canvas-note smw-drop-note" role="status">{message}</span>}
        {(steps.length > 2 || merged) && <div className="smw-tools"><button type="button" className="smw-icon" onClick={reset} title="Reset" aria-label="Reset"><RotateCcw size={14} /></button></div>}
      </div>
      <div className="smw-panel">
        {list.map(card => {
          if (card.kind === 'cas') {
            const id = card.compare.merge.id
            return <CasCard key={card.compare.id} card={card} open={openCards[id] ?? false} onToggle={() => setOpenCards(o => ({ ...o, [id]: !(o[id] ?? false) }))} onUnmerge={() => unmerge(id)} />
          }
          const s = card.step
          const [a, b] = args(s)
          if (s.type === 'compare') {
            return (
              <div key={s.id} ref={el => { if (el) compareRefs.current[card.at] = el; else delete compareRefs.current[card.at] }}>
                <Block
                  kind="cmp"
                  className={hover === card.at ? 'hot' : drag && drag.at === card.at + 1 && mergeableAt(drag.at) ? 'drop' : showGhost && demoAt === card.at + 1 && ghostDy !== null ? 'demo-target' : ''}
                  right={<Chips value={bigger(s)} />}
                >is_bigger({a},{b})</Block>
              </div>
            )
          }
          const dragging = drag?.at === card.at
          const mergeable = mergeableAt(card.at)
          return (
            <Fragment key={s.id}>
            <div className="smw-swapwrap" ref={el => { if (el) swapRefs.current[card.at] = el; else delete swapRefs.current[card.at] }}>
              <Block
                kind="swp"
                className={`grab ${dragging ? 'dragging' : ''} ${mergeable && !touched ? 'beckon' : ''}`}
                style={dragging ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(-1.5deg)` } : undefined}
                onPointerDown={e => down(e, card.at)}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
              >
                <GripVertical className="smw-grip" size={14} aria-hidden="true" />swap({a},{b})
              </Block>
              {showGhost && demoAt === card.at && ghostDy !== null && (
                <div className="smw-ghost" style={{ '--dy': `${ghostDy}px` }} aria-hidden="true">
                  <div className="smw-block swp smw-ghost-card"><code><GripVertical className="smw-grip" size={14} />swap({a},{b})</code></div>
                  <div className="smw-ghost-hand"><span className="ring" /><Hand size={22} strokeWidth={1.8} /></div>
                </div>
              )}
            </div>
            {mergeable && !dragging && !touched && <div className="smw-hint-under"><span className="smw-hint-label smw-hint-inline"><b>Try:</b> drag onto compare ↑</span></div>}
            </Fragment>
          )
        })}
      </div>
      </div>
    </Window>
  )
}
