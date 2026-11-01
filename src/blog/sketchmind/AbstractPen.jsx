import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { smooth, toSvgPoint } from './ink'
import { TOOL, Window, Toolbar, PenGroup, PenPill, ExampleLabel, StepThumb } from './ui'
import { shapeFromStrokes, addConnectedStroke, parseShapeValue } from './abstractShapes'

const ABSTRACT = '#a66bb4'
const W = 520
const MID = 104
const sleep = ms => new Promise(r => setTimeout(r, ms))

function bubbles() {
  // Independently drawn contours, with uneven proportions and short overlaps
  // where the pen returns to the beginning of a bubble.
  const outlines = [
    [[-.25,-1],[.15,-.98],[.58,-.79],[.88,-.43],[1,.02],[.96,.46],[.65,.84],[.2,1],[-.28,.94],[-.7,.68],[-.96,.22],[-.98,-.2],[-.76,-.66],[-.43,-.94],[-.12,-1.03],[.1,-.99]],
    [[.75,-.55],[.96,-.17],[1.02,.26],[.84,.7],[.42,1],[-.08,1.06],[-.52,.88],[-.86,.53],[-1,.06],[-.92,-.44],[-.59,-.83],[-.13,-1],[.33,-.94],[.67,-.69],[.84,-.39]],
    [[-.84,.28],[-.98,-.1],[-.82,-.52],[-.43,-.84],[.05,-.94],[.51,-.78],[.87,-.44],[1,-.02],[.9,.43],[.58,.77],[.14,.95],[-.29,.9],[-.68,.65],[-.87,.25],[-.88,.06]],
    [[.18,-.94],[.62,-.8],[.95,-.42],[1.04,.06],[.9,.55],[.57,.9],[.12,1.02],[-.37,.96],[-.78,.65],[-1,.22],[-1.04,-.2],[-.82,-.59],[-.42,-.88],[.02,-.98],[.37,-.91]],
  ]
  return [3, 7, 2, 5].map((v, id) => {
    const r = 10 + v * 4
    const cx = 80 + id * 115
    const pts = outlines[id].map(([x, y]) => ({ x: cx + x * r, y: 95 + y * r }))
    return { ...shapeFromStrokes([pts], id), v }
  })
}

export default function AbstractPen() {
  const svg = useRef(null)
  const alive = useRef(true)
  const stroke = useRef(null)
  const nextId = useRef(0)
  const valueInput = useRef(null)
  const editSession = useRef(null)
  const [editing, setEditing] = useState(null)
  const [phase, setPhase] = useState('draw') // draw | array
  const [shapes, setShapes] = useState([])
  const [order, setOrder] = useState([])
  const [live, setLive] = useState(null)
  const [focus, setFocus] = useState(null)
  const [lift, setLift] = useState(null)
  const [busy, setBusy] = useState(false)
  const [passes, setPasses] = useState([])
  const [ink, setInk] = useState(null)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])
  useEffect(() => {
    if (editing) { valueInput.current?.focus(); valueInput.current?.select() }
  }, [editing?.id])

  const byId = id => shapes.find(s => s.id === id)
  const values = order.map(id => byId(id).v)
  const n = order.length
  const slotX = i => (W / (n + 1)) * (i + 1)
  const scale = shapes.length ? Math.min(1, 74 / Math.max(...shapes.map(s => s.size))) : 1
  const sorted = n > 1 && values.every((v, i) => !i || values[i - 1] <= v)

  const down = e => {
    if (busy || editing || e.button !== 0 || !e.isPrimary) return
    e.currentTarget.setPointerCapture(e.pointerId)
    stroke.current = [toSvgPoint(svg.current, e)]
    setLive(stroke.current)
  }
  const move = e => {
    if (!stroke.current) return
    stroke.current = [...stroke.current, toSvgPoint(svg.current, e)]
    setLive(stroke.current)
  }
  const up = e => {
    if (!stroke.current) return
    const pts = [...stroke.current, toSvgPoint(svg.current, e)]
    stroke.current = null
    setLive(null)
    if (phase === 'draw') {
      const id = nextId.current++
      setShapes(previous => addConnectedStroke(previous, pts, id))
      return
    }
    // a Bubble up stroke runs one pass over the shapes it crosses
    const xs = pts.map(p => p.x)
    const lo = Math.min(...xs)
    const hi = Math.max(...xs)
    const hit = order.map((_, i) => i).filter(i => slotX(i) >= lo - 18 && slotX(i) <= hi + 18)
    if (hit.length < 2) return
    setInk(smooth(pts))
    bubbleUp(hit[0], hit[hit.length - 1])
  }

  async function bubbleUp(from, to) {
    setBusy(true)
    let cur = [...order]
    for (let k = from; k < to; k++) {
      if (!alive.current) return
      setFocus([k, k + 1])
      await sleep(380)
      if (byId(cur[k]).v > byId(cur[k + 1]).v) {
        setLift(cur[k])
        ;[cur[k], cur[k + 1]] = [cur[k + 1], cur[k]]
        setOrder([...cur])
        await sleep(460)
        setLift(null)
      }
      await sleep(120)
    }
    setFocus(null)
    setInk(null)
    setPasses(p => [...p, cur.map(id => byId(id).v)])
    setBusy(false)
  }

  const makeArray = list => {
    const ordered = [...list].sort((a, b) => a.cx - b.cx)
    setShapes(list)
    setOrder(ordered.map(s => s.id))
    setPhase('array')
    setPasses([ordered.map(s => s.v)])
  }
  const changeValue = (id, value) => {
    if (busy) return
    const v = value
    if (!Number.isSafeInteger(v) || !byId(id)) return
    const updated = shapes.map(shape => shape.id === id ? { ...shape, v, manualValue: true, valueSource: 'manual' } : shape)
    setShapes(updated)
    if (phase === 'array') {
      setPasses([order.map(key => updated.find(shape => shape.id === key).v)])
      setInk(null)
    }
  }
  const editValue = shape => {
    if (busy) return
    editSession.current = shape.id
    setEditing({ id: shape.id, text: String(shape.v) })
  }
  const finishEdit = (cancel = false, blur = false) => {
    if (!editing || editSession.current !== editing.id) return
    const value = parseShapeValue(editing.text)
    if (!cancel && value === null && !blur) return
    editSession.current = null
    if (!cancel && value !== null) changeValue(editing.id, value)
    setEditing(null)
  }
  const reset = () => { if (!busy) { editSession.current = null; setEditing(null); stroke.current = null; nextId.current = 0; setLive(null); setPhase('draw'); setShapes([]); setOrder([]); setPasses([]); setInk(null) } }

  const place = s => {
    if (phase === 'draw') return { transform: 'translate(0px, 0px)' }
    const i = order.indexOf(s.id)
    const y = MID + (lift === s.id ? -34 : 0)
    return {
      transform: `translate(${slotX(i)}px, ${y}px) scale(${scale}) translate(${-s.cx}px, ${-s.cy}px)`,
      transition: 'transform .45s cubic-bezier(.3,1.2,.5,1)',
    }
  }

  return (
    <Window>
      <Toolbar right={phase === 'array'
        ? <ExampleLabel values={passes[0] ?? []} />
        : <button type="button" className="smw-example-button" title="Load the default bubble example" aria-label="Load the default bubble example" onClick={() => makeArray(bubbles())}>
            <svg width="25" height="20" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="6" cy="15" r="3.5" />
              <circle cx="16" cy="11" r="6" />
              <circle cx="26" cy="15" r="2.5" />
            </svg>
            <span>Example</span>
          </button>}>
        <PenGroup label="Primitives">
          <PenPill color={ABSTRACT} active={phase === 'draw'} disabled={phase !== 'draw'}>Abstract</PenPill>
        </PenGroup>
        {phase === 'array' && (
          <PenGroup label="User created" divider>
            <PenPill color={TOOL.bubble} active pop>Bubble up</PenPill>
          </PenGroup>
        )}
      </Toolbar>
      <div className="smw-body">
        <div className={`smw-canvas ${phase === 'draw' ? 'dashed' : ''}`}>
          <svg ref={svg} viewBox={`0 0 ${W} 200`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { stroke.current = null; setLive(null) }} aria-label="Abstract pen canvas">
            {focus && (
              <rect x={slotX(focus[0]) - 44} y={MID - 50} width={slotX(focus[1]) - slotX(focus[0]) + 88} height="100" rx="16" fill="none" stroke={TOOL.compare} strokeWidth="2" strokeDasharray="6 6" />
            )}
            {shapes.map(s => (
              <g key={s.id} style={place(s)}>
                {s.strokes.map((points, index) => <path key={index} d={smooth(points)} fill="none" stroke={ABSTRACT} strokeWidth={phase === 'array' ? 3 / scale : 3} strokeLinecap="round" strokeLinejoin="round" />)}
              </g>
            ))}
            {shapes.map(s => {
              const i = order.indexOf(s.id)
              const x = phase === 'array' ? slotX(i) : s.cx
              const y = phase === 'array' ? MID + 58 : s.cy + s.size / 2 + 18
              if (editing?.id === s.id) return (
                <foreignObject key={`v${s.id}`} x={x - 34} y={Math.min(y, 186) - 15} width="68" height="29">
                  <input ref={valueInput} className="smw-value-input" type="text" inputMode="numeric" aria-label={`Value of shape ${s.id + 1}`} aria-invalid={parseShapeValue(editing.text) === null}
                    value={editing.text} onChange={e => setEditing(current => ({ ...current, text: e.target.value }))}
                    onPointerDown={e => e.stopPropagation()} onPointerMove={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()}
                    onBlur={() => finishEdit(false, true)} onKeyDown={e => {
                      e.stopPropagation()
                      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); finishEdit(e.key === 'Escape') }
                    }} />
                </foreignObject>
              )
              const width = Math.max(28, String(s.v).length * 10 + 14)
              return (
                <g key={`v${s.id}`} className="smw-fix" role="button" tabIndex={busy ? -1 : 0} aria-label={`Change value ${s.v} of shape ${s.id + 1}`} aria-disabled={busy}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => editValue(s)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault(); e.stopPropagation()
                      editValue(s)
                    }
                  }}
                  style={{ transform: `translate(${x}px, ${Math.min(y, 186)}px)`, transition: 'transform .45s' }}>
                  <title>Tap to edit the value</title>
                  <rect x={-width / 2} y="-13" width={width} height="24" rx="7" />
                  <text x="0" y="5" textAnchor="middle">{s.v}</text>
                </g>
              )
            })}
            {ink && <path d={ink} fill="none" stroke={TOOL.bubble} strokeWidth="4" strokeLinecap="round" opacity=".6" />}
            {live && <path d={smooth(live)} fill="none" stroke={phase === 'draw' ? ABSTRACT : TOOL.bubble} strokeWidth="3.5" strokeLinecap="round" />}
          </svg>
          {phase === 'draw' && (
            <div className="smw-canvasfoot">
              {!shapes.length && <span className="smw-tip">Draw shapes: bubbles, stars, or any shape.</span>}
              {shapes.length > 0 && <span className="smw-tip">tap a number to change its value</span>}
              <span>
                <button type="button" className="smw-scan" disabled={shapes.length < 2} onClick={() => makeArray(shapes)}>Make array</button>
              </span>
            </div>
          )}
          {phase === 'array' && (
            <span className="smw-tip top">{busy ? 'bubbling up…' : sorted ? 'sorted ✓' : 'draw one Bubble up stroke across the shapes'}</span>
          )}
          {shapes.length > 0 && (
            <div className="smw-tools">
              <button type="button" className="smw-icon" onClick={reset} title="Reset" aria-label="Reset"><RotateCcw size={14} /></button>
            </div>
          )}
        </div>
        <div className="smw-strip">
          {passes.length ? passes.map((p, k) => (
            <StepThumb key={k} values={p} color={k ? TOOL.bubble : null} pair={k ? p.map((_, i) => i) : null} active={k === passes.length - 1} />
          )) : <div className="smw-empty">passes show up here</div>}
        </div>
      </div>
    </Window>
  )
}
