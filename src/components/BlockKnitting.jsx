import { useEffect, useMemo, useState } from 'react'
import './PixelKnot.css'
import './BlockKnitting.css'

let nextId = 0
const block = (type, extra = {}) => ({ id: ++nextId, type, count: 4, color: '#ef4974', ...extra })
const heart = () => {
  const rows = ['000000000000','000110011000','001111111100','001111111100','000111111000','000011110000','000001100000','000000000000']
  return rows.flatMap(row => {
    const runs = row.match(/0+|1+/g)
    return [...runs.map(run => block('knit', { count: run.length, color: run[0] === '1' ? '#ef4974' : '#fffaf2' })), block('row')]
  })
}
const stripes = () => [block('repeat', { count: 4, children: [block('knit', { count: 12, color: '#9278cc' }), block('row'), block('knit', { count: 12, color: '#fffaf2' }), block('row')] })]
const change = (list, id, fn) => list.flatMap(item => item.id === id ? fn(item) : [{ ...item, ...(item.children ? { children: change(item.children, id, fn) } : {}) }])
const number = (value, max) => Math.max(1, Math.min(max, Number(value) || 1))

export default function BlockKnitting() {
  const [blocks, setBlocks] = useState(heart)
  const [cols, setCols] = useState(12)
  const [rows, setRows] = useState(8)
  const [active, setActive] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const result = useMemo(() => {
    const cells = [], frames = []
    let x = 0, y = 0, operations = 0, overflow = false
    const run = list => {
      for (const item of list) {
        if (++operations >= 10000 || frames.length >= 4096) { overflow = true; return }
        if (item.type === 'repeat') { for (let n = 0; n < item.count; n++) { run(item.children); if (overflow) return } }
        else if (item.type === 'row') { if (x !== 0) { y++; x = 0 } }
        else for (let n = 0; n < item.count; n++) {
          if (y >= rows) { overflow = true; return }
          cells.push({ x, y, color: item.color, id: item.id })
          frames.push(item.id)
          x++; if (x === cols) { x = 0; y++ }
        }
      }
    }
    run(blocks)
    return { cells, frames, overflow }
  }, [blocks, rows, cols])
  useEffect(() => { setPlaying(false); setStep(0) }, [blocks, rows, cols])
  useEffect(() => {
    if (!playing) return
    if (step >= result.frames.length) { setPlaying(false); setActive(null); return }
    setActive(result.frames[step])
    const timer = setTimeout(() => setStep(n => n + 1), 100)
    return () => clearTimeout(timer)
  }, [playing, step, result])
  const update = (id, patch) => { setActive(id); setBlocks(list => change(list, id, item => [{ ...item, ...patch }])) }
  const add = (type, parent = null, before = null) => {
    const item = block(type, type === 'repeat' ? { children: [block('knit'), block('row')] } : {})
    const insert = list => { const copy = [...list]; const index = before ? copy.findIndex(b => b.id === before) : copy.length; copy.splice(index < 0 ? copy.length : index, 0, item); return copy }
    setBlocks(list => parent ? change(list, parent, p => [{ ...p, children: insert(p.children) }]) : insert(list)); setActive(item.id)
  }
  const drop = (event, parent, before) => { event.preventDefault(); event.stopPropagation(); const type = event.dataTransfer.getData('text/plain'); if (['knit','row','repeat'].includes(type)) add(type, parent, before) }
  const render = (list, parent = null) => <div className="bk-stack" onDragOver={e => e.preventDefault()} onDrop={e => drop(e, parent)}>
    {list.map((item, index) => <div key={item.id} className={`bk-block bk-${item.type} ${active === item.id ? 'bk-active' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => drop(e, parent, item.id)}>
      <div className="bk-block-line"><span aria-hidden="true">{item.type === 'knit' ? '⋎' : item.type === 'row' ? '↵' : '↻'}</span>
        {item.type === 'knit' ? <><b>Knit</b><input aria-label="Stitch count" type="number" min="1" max="48" value={item.count} onChange={e => update(item.id, { count: number(e.target.value, 48) })}/><span>in</span><input aria-label="Yarn color" type="color" value={item.color} onChange={e => update(item.id, { color: e.target.value })}/></> : item.type === 'row' ? <b>Next row</b> : <><b>Repeat</b><input aria-label="Repeat count" type="number" min="1" max="12" value={item.count} onChange={e => update(item.id, { count: number(e.target.value, 12) })}/><span>times</span></>}
        <div className="bk-block-tools"><button disabled={index === 0} aria-label="Move block up" onClick={() => { const move = items => { const copy = [...items]; [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]]; return copy }; setBlocks(items => parent ? change(items, parent, p => [{ ...p, children: move(p.children) }]) : move(items)) }}>↑</button><button aria-label="Delete block" onClick={() => setBlocks(items => change(items, item.id, () => []))}>×</button></div>
      </div>
      {item.children && <>{render(item.children, item.id)}<button className="bk-add-inside" onClick={() => add('knit', item.id)}>+ Knit inside repeat</button></>}
    </div>)}
    {!list.length && <p className="bk-drop-note">Drop a block here to begin.</p>}
  </div>
  const visible = playing || step > 0 ? result.cells.slice(0, step) : result.cells
  return <div className="pixel-knot bk" lang="en">
    <header className="pk-head"><p className="pk-kicker">little blocks, stitch by stitch</p><h1>Knitting Blocks</h1><p className="pk-lead">Build a pattern with blocks. Watch your stitches come together.</p></header>
    <div className="bk-layout">
      <section className="bk-program" aria-label="Block program"><div className="pk-label"><h2>Your blocks</h2><span>top to bottom ↓</span></div>
        <div className="bk-presets"><button onClick={() => { setCols(12); setRows(8); setBlocks(heart()) }}>♡ Heart</button><button onClick={() => { setCols(12); setRows(8); setBlocks(stripes()) }}>≋ Stripes</button><button onClick={() => setBlocks([])}>Clear</button></div>
        <div className="bk-palette">{[['knit','⋎ Knit'],['row','↵ Next row'],['repeat','↻ Repeat']].map(([type, name]) => <button key={type} className={`bk-${type}`} draggable onDragStart={e => e.dataTransfer.setData('text/plain', type)} onClick={() => add(type)}>{name} +</button>)}</div>
        <p className="bk-hint">Click to add, or drag a block into the stack. Changes appear instantly.</p>
        <div className="bk-workspace"><div className="bk-start">⚑ When we begin</div>{render(blocks)}<div className="bk-end">■ Finish</div></div>
      </section>
      <section className="bk-simulator" aria-labelledby="bk-simulator-title"><div className="bk-simulator-head"><div><p className="pk-kicker">your knitted canvas</p><h2 id="bk-simulator-title">A little world of stitches</h2></div><span>{visible.length} stitches</span></div>
        <div className="bk-size"><label>Columns <input type="number" min="2" max="48" value={cols} onChange={e => setCols(Math.max(2, number(e.target.value, 48)))}/></label><label>Rows <input type="number" min="2" max="48" value={rows} onChange={e => setRows(Math.max(2, number(e.target.value, 48)))}/></label><span>1 square = 1 stitch</span></div>
        <div className="bk-canvas"><svg viewBox={`0 0 ${cols * 30} ${rows * 30}`} role="img" aria-label={`Knitting preview, ${cols} columns by ${rows} rows, ${visible.length} stitches`}>
          <defs><pattern id="bk-grid" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#c9e0ed"/><path d="M0 0H30V30H0ZM30 30H60V60H30Z" fill="#b7d4e5"/></pattern></defs><rect width={cols * 30} height={rows * 30} fill="url(#bk-grid)"/>
          {visible.map((cell, i) => <g key={i} transform={`translate(${cell.x * 30} ${cell.y * 30})`}><rect x=".5" y=".5" width="29" height="29" rx="3" fill={cell.color}/><path d="M5 5Q4 19 15 26Q26 19 25 5M15 26V12" fill="none" stroke="#000" strokeOpacity=".13" strokeWidth="5" strokeLinecap="round"/><path d="M7 5Q6 17 15 24Q24 17 23 5" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round"/></g>)}
        </svg></div>
        <div className="bk-playback"><button disabled={!result.cells.length} onClick={() => { setStep(0); setPlaying(true) }}>▶ Play stitches</button><button disabled={!playing} onClick={() => setPlaying(false)}>Pause</button><button onClick={() => { setPlaying(false); setStep(0); setActive(null) }}>Show all</button><span aria-live="polite">{playing ? 'Knitting…' : 'Preview updates as you build'}</span></div>
        {result.overflow && <p className="bk-notice" role="status">Your pattern extends beyond this canvas. Add more rows or columns to see more.</p>}
      </section>
    </div>
  </div>
}
