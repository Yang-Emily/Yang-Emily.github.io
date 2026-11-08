import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, X } from 'lucide-react'
import { WholePiece, PatternPreview, Pattern } from './CatWeaving'
import WeavingDetail from './WeavingDetail'
import { simulationAt, SETUP, KNOT_TIME } from './catSimulation'
import { KNOT_EXAMPLES, runKnotProgram, frameForLine, frameForKnot } from './knotProgram'
import { tracked } from '../analytics'
import './PixelKnot.css'
import './CatWeaving.css'
import './CodeWeaving.css'

function CodeGuidance() {
  const [open, setOpen] = useState(false)
  const host = useRef(null)
  const trigger = useRef(null)
  useEffect(() => {
    if (!open) return
    const outside = event => { if (!host.current?.contains(event.target)) setOpen(false) }
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open])
  return <div className="cd-guidance" ref={host}>
    <button ref={trigger} type="button" className="cd-guidance-trigger" aria-label="Code guidance" title="Code guidance" aria-expanded={open} aria-controls="cd-code-guidance" onClick={() => setOpen(v => !v)}><BookOpen size={18} strokeWidth={1.6}/></button>
    {open && <div id="cd-code-guidance" className="cd-guidance-panel cd-help" role="dialog" aria-labelledby="cd-guidance-title">
      <div className="cd-guidance-heading"><h3 id="cd-guidance-title">Code guidance</h3><button type="button" aria-label="Close code guidance" onClick={() => { setOpen(false); trigger.current?.focus() }}><X size={16}/></button></div>
<dl>
          <dt><code>setup(6)</code></dt><dd>Clip six base strings. Call this once.</dd>
          <dt><code>thread(name, hex)</code></dt><dd>Pick up a working thread. Give its color the first time; use the name alone to switch back.</dd>
          <dt><code>forwardKnot()</code></dt><dd>One complete forward knot: two half-hitches on the next base string. The animation plays both half-hitches continuously.</dd>
          <dt><code>backwardKnot()</code></dt><dd>The same double knot mirrored, for rows going right to left.</dd>
          <dt><code>turn()</code></dt><dd>Start the next row from the same edge. Finish every base string before turning.</dd>
          <dt><code>finish()</code></dt><dd>Secure the ends after completing the last row.</dd>
        </dl><p>Use JavaScript loops to repeat moves. The program checks the knot direction and missing knots before playback.</p>
    </div>}
  </div>
}

function Editor({ code, setCode, errorLine, activeLine, onLineHover, preview }) {
  const gutter = useRef(null)
  const input = useRef(null)
  const pointerInside = useRef(false)
  const lastHovered = useRef(null)
  useEffect(() => {
    if (!activeLine || !input.current || pointerInside.current) return
    const field = input.current, style = getComputedStyle(field)
    const lineHeight = parseFloat(style.lineHeight), paddingTop = parseFloat(style.paddingTop)
    const y = paddingTop + (activeLine - 1) * lineHeight
    if (y < field.scrollTop || y > field.scrollTop + field.clientHeight - 52) {
      field.scrollTop = Math.max(0, y - field.clientHeight / 3)
      if (gutter.current) gutter.current.style.transform = `translateY(${-field.scrollTop}px)`
    }
  }, [activeLine])
  const inspectLine = line => {
    if (line < 1 || line > code.split('\n').length || lastHovered.current === line) return
    lastHovered.current = line
    onLineHover?.(line)
  }
  const inspectPointer = e => {
    if (e.pointerType === 'touch') return
    const field = input.current
    if (!field) return
    const rect = field.getBoundingClientRect(), style = getComputedStyle(field)
    const scale = rect.height / field.offsetHeight
    const localY = (e.clientY - rect.top) / scale - field.clientTop + field.scrollTop
    inspectLine(Math.floor((localY - parseFloat(style.paddingTop)) / parseFloat(style.lineHeight)) + 1)
  }
  const inspectCaret = e => inspectLine(code.slice(0, e.currentTarget.selectionStart).split('\n').length)
  const lines = code.split('\n').length
  const key = e => {
    if (e.key !== 'Tab' || e.shiftKey) return
    e.preventDefault()
    const t = e.currentTarget, { selectionStart: a, selectionEnd: b } = t
    t.setRangeText('  ', a, b, 'end')
    setCode(t.value)
  }
  return <div className="cd-editor" onPointerEnter={() => { pointerInside.current = true }} onPointerLeave={() => { pointerInside.current = false; lastHovered.current = null }}>
    <div className="cd-gutter" aria-hidden="true"><div ref={gutter} className="cd-gutter-lines">{Array.from({ length: lines }, (_, i) => <span key={i} onPointerEnter={() => inspectLine(i + 1)} className={i + 1 === errorLine ? 'bad' : i + 1 === activeLine ? 'active' : ''}>{i + 1}</span>)}</div></div>
    <textarea ref={input} style={activeLine ? { backgroundImage: `linear-gradient(to bottom, transparent calc(var(--code-padding-top) + ${activeLine - 1} * var(--code-line-height)), #eef3e5 calc(var(--code-padding-top) + ${activeLine - 1} * var(--code-line-height)), #eef3e5 calc(var(--code-padding-top) + ${activeLine} * var(--code-line-height)), transparent calc(var(--code-padding-top) + ${activeLine} * var(--code-line-height)))`, backgroundAttachment: 'local' } : undefined} value={code} onPointerMove={inspectPointer} onClick={inspectCaret} onKeyUp={inspectCaret} spellCheck="false" autoCapitalize="off" autoComplete="off" aria-label="Pattern code (JavaScript)" onChange={e => setCode(e.target.value)} onKeyDown={key} onScroll={e => { if (gutter.current) gutter.current.style.transform = `translateY(${-e.currentTarget.scrollTop}px)` }}/>
    {preview}
    <div className="cd-editor-tools"><span>{activeLine ? `Executing line ${activeLine}` : ''}</span><CodeGuidance/></div>
  </div>
}

export default function CodeWeaving() {
  const [code, setCode] = useState(KNOT_EXAMPLES[0].code)
  const [example, setExample] = useState(KNOT_EXAMPLES[0].id)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewOnly, setPreviewOnly] = useState(false)
  const [speed, setSpeed] = useState(1)
  const job = useRef(null)
  const runId = useRef(0)
  const patternDialog = useRef(null)
  const execute = async (text, autoplay = true) => {
    const id = ++runId.current
    job.current?.cancel()
    setRunning(true); setPlaying(false); setPreviewOnly(false); setProgress(0)
    job.current = runKnotProgram(text)
    const output = await job.current
    if (id !== runId.current || output.cancelled) return
    setResult(output); setFrame(0); setProgress(0); setRunning(false)
    setPlaying(autoplay && !output.error && !!output.frames?.length)
  }
  useEffect(() => { execute(KNOT_EXAMPLES[0].code, false); return () => { runId.current++; job.current?.cancel() } }, [])
  const frames = useMemo(() => (result?.frames ?? []).filter(f => f.move === undefined || f.move === 0), [result])
  const current = frames[frame]
  useEffect(() => {
    if (!playing || !current) return
    let raf, start
    const resumedProgress = progress
    const tick = now => {
      start ??= now
      const p = Math.min(1, resumedProgress + (now - start) / ((current.move !== undefined ? 6000 : 600) / speed))
      setProgress(p)
      if (p === 1) {
        if (previewOnly || frame === frames.length - 1) { setPlaying(false); return }
        setProgress(0)
        setFrame(f => f + 1)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, frame, speed, current, frames.length, previewOnly])
  const selectFrame = index => { setPlaying(true); setPreviewOnly(true); setFrame(Math.max(0, Math.min(frames.length - 1, index))); setProgress(0) }
  const chart = result?.chart
  const time = current ? current.time + (current.move !== undefined ? KNOT_TIME * Math.min(.999, progress) : 0) : 0
  const state = chart ? simulationAt(time, chart) : null
  const updateCode = value => { setCode(value); setExample(null); setPlaying(false); setResult(null); setFrame(0); runId.current++; job.current?.cancel(); setRunning(false) }
  const hoverLine = line => {
    const index = frameForLine(frames, line, frame)
    if (index >= 0 && (index !== frame || playing)) selectFrame(index)
  }
  const inspectKnot = knot => {
    const index = frameForKnot(frames, knot, chart.W)
    if (index >= 0) selectFrame(index)
  }
  const wholeInset = chart && state ? <section className="cd-live-piece cd-whole-inset" aria-label="Whole piece execution preview"><div className="pk-label"><h2>Whole piece</h2><span>{state.count} / {result.knots} knots</span></div><WholePiece chart={chart} time={time} compact/><div className="cd-piece-progress"><span style={{ width: `${Math.min(100, (state.count / Math.max(1, result.knots)) * 100)}%` }}/></div></section> : null
  const patternInset = chart && state ? <PatternPreview chart={chart} state={state} names={chart.names} custom onInspect={inspectKnot} onOpen={() => { setPlaying(false); patternDialog.current?.showModal() }}/> : null
  return <div className="pixel-knot cd" lang="en" {...tracked('code_weave')}>
    <dialog ref={patternDialog} className="cw-pattern-dialog" aria-labelledby="cd-pattern-title" onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
      <div className="cw-pattern-dialog-heading"><h2 id="cd-pattern-title">Design chart</h2><button type="button" onClick={() => patternDialog.current?.close()}>Close ×</button></div>
      {chart && state && <div className="cw-pattern-large"><Pattern chart={chart} names={chart.names} state={state} seek={t => inspectKnot(Math.floor((t - SETUP) / KNOT_TIME))} onInspect={inspectKnot}/></div>}
    </dialog>
    <header className="pk-head"><p className="pk-kicker">write a move, watch a knot</p><h1 id="pixel-knot-title">Programming with knots</h1></header>
    <div className="cd-layout">
      <section className="cd-code" aria-labelledby="cd-code-title">
        <div className="pk-label"><h2 id="cd-code-title">Your weaving program</h2></div>
        <div className="cd-examples">{KNOT_EXAMPLES.map(ex => <button key={ex.id} className={example === ex.id ? 'on' : ''} onClick={() => { setExample(ex.id); setCode(ex.code); execute(ex.code) }}>{ex.name}</button>)}</div>
        <Editor code={code} setCode={updateCode} errorLine={result?.line} activeLine={current?.line} onLineHover={hoverLine} preview={wholeInset}/>
        <div className="cw-buttons cd-unified-controls"><button className="main" disabled={running} onClick={() => execute(code)}>{running ? 'Running…' : 'Run program'}</button>{chart && state && <><button disabled={frame === 0} onClick={() => selectFrame(frame - 1)}>← Previous step</button><button className="main" onClick={() => { if (frame === frames.length - 1) { setFrame(0); setProgress(0) } setPreviewOnly(false); setPlaying(p => !p) }}>{playing ? 'Pause' : 'Play animation'}</button><button disabled={frame === frames.length - 1} onClick={() => selectFrame(frame + 1)}>Next step →</button><label>Speed <select value={speed} onChange={e => setSpeed(+e.target.value)}>{[.5,1,2,4].map(n => <option key={n} value={n}>{n}×</option>)}</select></label></>}</div>
        {chart && state && <input className="cd-execution-range" type="range" min="0" max={Math.max(0, frames.length - 1)} value={frame} onChange={e => selectFrame(+e.target.value)} aria-label="Program execution step"/>}

        {result?.error && <p className="cd-error" role="alert">{result.line ? `Line ${result.line}: ` : ''}{result.error}</p>}

      </section>
      <section className="cd-result" aria-label="Code-controlled weaving animation">
        <div className="pk-label"><h2>Run it with your hands</h2><span>{frames.length ? `${frame + 1} / ${frames.length} steps` : ''}</span></div>
        {chart && state ? <>
          {state.phase === 'knot' ? <WeavingDetail patternInset={patternInset} state={state} color={chart.palette[state.color]} oldColor={chart.palette[state.oldColor]} names={chart.names} hands={true}/> : <div className="cw-phase-card">{patternInset}<h2>{current.title}</h2><p>{state.detail}</p></div>}

        </> : <div className="cd-frame cd-empty">{running ? 'Recording your knotting moves…' : 'Run your program to see each knotting move here.'}</div>}
      </section>
    </div>
  </div>
}
