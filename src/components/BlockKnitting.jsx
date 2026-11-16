import { useEffect, useState } from 'react'
import KnittingBlockEditor from './KnittingBlockEditor'
import WeavingDetail, { MOVES, moveAt } from './WeavingDetail'
import './CatWeaving.css'
import './PixelKnot.css'
import './BlockKnitting.css'

const number = (value, max) => Math.max(1, Math.min(max, Number(value) || 1))

export default function BlockKnitting() {
  const [result, setResult] = useState({ cells: [], frames: [], overflow: false, error: null })
  const [cols, setCols] = useState(12)
  const [rows, setRows] = useState(8)
  const [active, setActive] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showAll, setShowAll] = useState(true)
  const [speed, setSpeed] = useState(1)
  useEffect(() => { setPlaying(false); setStep(0); setProgress(0); setShowAll(true); setActive(null) }, [result])
  useEffect(() => {
    if (!playing || !result.cells.length) return
    let raf, start
    const initial = progress
    const tick = now => {
      start ??= now
      const p = Math.min(1, initial + (now - start) / (6000 / speed))
      setProgress(p)
      if (p === 1) {
        if (step === result.cells.length - 1) { setPlaying(false); return }
        setStep(n => n + 1); setProgress(0); return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, step, speed, result])
  useEffect(() => {
    if (!showAll && result.cells[step]) setActive(result.cells[step].id)
  }, [step, showAll, result])
  const inspect = index => { setStep(index); setProgress(0); setShowAll(false); setPlaying(false); setActive(result.cells[index]?.id ?? null) }
  const visible = showAll ? result.cells : result.cells.slice(0, step + 1)
  const current = result.cells[step]
  const previous = result.cells[Math.max(0, step - 1)]
  const names = Object.fromEntries([...new Set(result.cells.map(cell => cell.color))].map((color, i) => [color, `Thread ${i + 1} (${color})`]))
  const state = current ? { row: current.y, col: current.x, p: Math.min(.9999, progress), color: current.color, oldColor: previous.color, change: step > 0 && current.color !== previous.color } : null
  const move = moveAt(progress)
  const seekMove = direction => {
    if (direction < 0 && move === 0) { inspect(Math.max(0, step - 1)); setProgress(MOVES[MOVES.length - 1].at) }
    else if (direction > 0 && move === MOVES.length - 1) inspect(Math.min(result.cells.length - 1, step + 1))
    else { setPlaying(false); setShowAll(false); setProgress(MOVES[Math.max(0, Math.min(MOVES.length - 1, move + direction))].at) }
  }
  return <div className="pixel-knot bk" lang="en">
    <header className="pk-head"><p className="pk-kicker">little blocks, stitch by stitch</p><h1>Knitting Blocks</h1><p className="pk-lead">Build a pattern with blocks. Watch your stitches come together.</p></header>
    <div className="bk-layout">
      <section className="bk-program" aria-label="Block program"><div className="pk-label"><h2>Your blocks</h2><span>top to bottom ↓</span></div>
        <KnittingBlockEditor cols={cols} rows={rows} active={active} onResult={setResult}/>
        {result.error && <p className="bk-notice" role="alert">{result.error}</p>}
      </section>
      <section className="bk-simulator" aria-labelledby="bk-simulator-title"><div className="bk-simulator-head"><div><p className="pk-kicker">your knitted canvas</p><h2 id="bk-simulator-title">A little world of stitches</h2></div><span>{visible.length} stitches</span></div>
        <div className="bk-size"><label>Columns <input type="number" min="2" max="48" value={cols} onChange={e => setCols(Math.max(2, number(e.target.value, 48)))}/></label><label>Rows <input type="number" min="2" max="48" value={rows} onChange={e => setRows(Math.max(2, number(e.target.value, 48)))}/></label><span>1 square = 1 stitch</span></div>
        <div className="bk-canvas"><svg viewBox={`0 0 ${cols * 30} ${rows * 30}`} role="img" aria-label={`Knitting preview, ${cols} columns by ${rows} rows, ${visible.length} stitches`}>
          <defs><pattern id="bk-grid" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#c9e0ed"/><path d="M0 0H30V30H0ZM30 30H60V60H30Z" fill="#b7d4e5"/></pattern></defs><rect width={cols * 30} height={rows * 30} fill="url(#bk-grid)"/>
          {visible.map((cell, i) => <g key={i} role="button" tabIndex="0" aria-label={`Inspect row ${cell.y + 1}, column ${cell.x + 1}`} aria-pressed={!showAll && i === step} onClick={() => inspect(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inspect(i) } }} transform={`translate(${cell.x * 30} ${cell.y * 30})`}><rect x=".5" y=".5" width="29" height="29" rx="3" fill={cell.color}/><path d="M5 5Q4 19 15 26Q26 19 25 5M15 26V12" fill="none" stroke="#000" strokeOpacity=".13" strokeWidth="5" strokeLinecap="round"/><path d="M7 5Q6 17 15 24Q24 17 23 5" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round"/>{!showAll && i === step && <rect x="1.5" y="1.5" width="27" height="27" rx="3" fill="none" stroke="#66512a" strokeWidth="2.5"/>}</g>)}
        </svg></div>
        <div className="bk-playback"><button disabled={!result.cells.length} onClick={() => { setStep(0); setProgress(0); setShowAll(false); setPlaying(true) }}>▶ Play stitches</button><button disabled={!playing} onClick={() => setPlaying(false)}>Pause</button><button onClick={() => { setPlaying(false); setStep(0); setProgress(0); setShowAll(true); setActive(null) }}>Show all</button><span aria-live="polite">{playing ? 'Knitting…' : 'Select a stitch to inspect its knot'}</span></div>
        {result.overflow && <p className="bk-notice" role="status">Your pattern extends beyond this canvas. Add more rows or columns to see more.</p>}
      </section>
        {state && <section className="bk-hands" aria-labelledby="bk-hands-title">
          <div className="pk-label"><h2 id="bk-hands-title">Run it with your hands</h2><span>{step * MOVES.length + move + 1} / {result.cells.length * MOVES.length} steps</span></div>
          <p className="bk-hint">Each block stitch is demonstrated as a double knot on a base string. Rows alternate direction.</p>
          <WeavingDetail state={state} color={current.color} oldColor={previous.color} names={names} hands/>
          <div className="bk-playback bk-hand-controls">
            <button disabled={step === 0 && move === 0} onClick={() => seekMove(-1)}>← Previous step</button>
            <button onClick={() => { if (progress >= 1) { setStep(0); setProgress(0) } setShowAll(false); setPlaying(value => !value) }}>{playing ? 'Pause' : 'Play animation'}</button>
            <button disabled={step === result.cells.length - 1 && move === MOVES.length - 1} onClick={() => seekMove(1)}>Next step →</button>
            <label>Speed <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>{[.5, 1, 2, 4].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
          </div>
          <label className="bk-knot-slider">Knot {step + 1} / {result.cells.length}<input type="range" min="0" max={result.cells.length - 1} value={step} aria-label="Inspect knot" onChange={e => inspect(Number(e.target.value))}/></label>
        </section>}
    </div>
  </div>
}
