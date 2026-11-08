import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import WeavingDetail, { MOVES, moveAt } from './WeavingDetail'
import { loadImage, makeChart } from './pixelChart'
import { HandsShadow } from './KnotHands'
import { CAT as SAMPLE_CAT, SETUP, KNOT_TIME, FINISH, knotIndex, simulationAt, chartCellAt } from './catSimulation'
import './PixelKnot.css'
import './CatWeaving.css'

const sampleNames = ['White', 'Dark outline', 'Orange', 'Brown stripes', 'Cream', 'Ear pink', 'Collar red', 'Bell gold']
const ease = v => { const p = Math.max(0, Math.min(1, v)); return p * p * (3 - 2 * p) }
const posX = (c, chart) => 180 + c * 196 / Math.max(1, chart.W - 1)
const posY = (r, chart) => 105 + r * Math.min(10, 150 / Math.max(1, chart.H - 1))
function Yarn({ d, color, width = 3 }) { return <g fill="none" strokeLinecap="round"><path d={d} stroke="#51403444" strokeWidth={width + 1.3}/><path d={d} stroke={color} strokeWidth={width}/><path d={d} stroke="#fff8" strokeWidth=".65" strokeDasharray="2 3"/></g> }
function Stitch({ r, c, color, chart, amount = 1 }) { return <g opacity={amount} transform={`translate(${posX(c, chart)} ${posY(r, chart)}) scale(${amount * Math.min(1, 15 / chart.W)} ${amount * Math.min(1, 16 / chart.H)})`}><rect x="-6.6" y="-4.6" width="13.2" height="9.2" rx="3.7" fill={color} stroke="#55443555" strokeWidth=".65"/><path d="M-4 -2 L3 1 M-3 1 L3 3" stroke="#fff6" strokeWidth="1.1"/></g> }
function Pattern({ state, seek, small = false, chart: CAT, names, interactive = true, viewport, onInspect }) {
  return <svg viewBox={viewport ?? `0 0 ${CAT.W * 10 + 20} ${CAT.H * 10 + 20}`} className={small ? 'cw-mini-chart' : 'cw-pattern'} role="img" aria-label="Knot chart. Select a circle to inspect its knot." onPointerMove={onInspect ? e => {
    if (e.pointerType === 'touch') return
    const svg = e.currentTarget, matrix = svg.getScreenCTM()
    if (!matrix) return
    const point = svg.createSVGPoint(); point.x = e.clientX; point.y = e.clientY
    const local = point.matrixTransform(matrix.inverse())
    onInspect(chartCellAt(local.x, local.y, CAT).index)
  } : undefined}>
    {CAT.grid.map((line, r) => line.map((color, c) => {
      const k = knotIndex(r, c, CAT), active = state.phase === 'knot' && k === state.index
      return <g key={`${r}-${c}`} transform={`translate(${15 + c * 10} ${12 + r * 10})`} role={small || !interactive ? undefined : 'button'} tabIndex={small || !interactive ? undefined : 0} aria-label={`Row ${r + 1}, string ${c + 1}, ${names[color]}`} onClick={small || !interactive ? undefined : () => seek(SETUP + k * KNOT_TIME)} onKeyDown={small || !interactive ? undefined : e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seek(SETUP + k * KNOT_TIME) } }}>
        <path d="M0 -5 V5 M-5 0 H5" stroke="#c5baaa" strokeWidth=".5"/>
        <circle r="4" fill={CAT.palette[color]} stroke={active ? '#24251d' : '#998b79'} strokeWidth={active ? 1.6 : .45}/>
        {!small && <text textAnchor="middle" dominantBaseline="central" fill={color === 0 ? '#776e60' : '#fff'} fontSize="6">{r % 2 ? '←' : '→'}</text>}
        {k < state.count && <circle r=".8" fill={color === 0 ? '#988c76' : '#fff8'}/>}
        {active && <><rect x="-5" y="-5" width="10" height="10" rx="2" fill="none" stroke="#db5d3f" strokeWidth="1.2"/><circle r="5.5" fill="none" stroke="#fff9ed" strokeWidth=".5"/></>}
      </g>
    }))}
  </svg>
}
function PatternPreview({ chart, state, names, onOpen, custom, onInspect }) {
  const [lens, setLens] = useState(null)
  const inspect = e => {
    if (e.pointerType === 'touch') return
    const svg = e.currentTarget.querySelector('svg'), matrix = svg.getScreenCTM()
    if (!matrix) return
    const point = svg.createSVGPoint(); point.x = e.clientX; point.y = e.clientY
    const { x, y } = point.matrixTransform(matrix.inverse())
    const cell = chartCellAt(x, y, chart)
    if (state.phase !== 'knot' || cell.index !== state.index) onInspect(cell.index)
    setLens({ x, y, left: Math.max(8, Math.min(window.innerWidth - 140, e.clientX + 18)), top: Math.max(8, Math.min(window.innerHeight - 140, e.clientY + 18)) })
  }
  return <div className="cw-detail-pattern" aria-label="Pattern preview">
    <span>{custom ? 'Photo pattern' : 'Camellia pattern'} · Row {state.row + 1} / Col {state.col + 1} {state.row % 2 ? '←' : '→'}</span>
    <button type="button" className="cw-pattern-preview" aria-label="Enlarge the full pattern" onPointerMove={inspect} onPointerLeave={() => setLens(null)} onBlur={() => setLens(null)} onClick={() => { setLens(null); onOpen() }}>
      <Pattern chart={chart} names={names} state={state} interactive={false}/>
    </button>
    {lens && createPortal(<div className="cw-cursor-lens" style={{ left: lens.left, top: lens.top }} aria-hidden="true"><Pattern chart={chart} names={names} state={state} interactive={false} viewport={`${lens.x - 32} ${lens.y - 32} 64 64`}/><span className="cw-lens-cross"/></div>, document.body)}
  </div>
}

function WeavingPlayer({ chart: CAT, custom, title, children }) {
  const TOTAL_KNOTS = CAT.W * CAT.H
  const DURATION = SETUP + TOTAL_KNOTS * KNOT_TIME + FINISH
  const names = custom ? CAT.palette.map((_, i) => `Thread ${i + 1}`) : sampleNames
  const X = c => posX(c, CAT), Y = r => posY(r, CAT)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const teaching = true
  const [hands, setHands] = useState(true)
  const clock = useRef(0)
  const patternDialog = useRef(null)
  const breakpoints = useMemo(() => {
    let firstChange = -1
    for (let k = 1; k < TOTAL_KNOTS; k++) {
      if (simulationAt(SETUP + k * KNOT_TIME + .001, CAT).change) { firstChange = k; break }
    }
    const marks = [
      { time: .05, title: 'Lesson 1 · Setup & chart', text: `The chart has ${CAT.W} columns, so clip ${CAT.W} base strings. Each cell gives the working color; arrows give the knot direction. Straighten the strings before starting.` },
      ...MOVES.map((m, i) => ({ time: SETUP + m.at * KNOT_TIME + .0001, title: `First knot · Move ${i+1} / ${MOVES.length}`, text: m.title })),
      { time: SETUP + CAT.W * KNOT_TIME + .0001, title: 'Lesson 3 · Turn a row', text: 'Keep the front facing you. After reaching the right edge, begin the next row on that same edge string. Mirror both half-hitches.' },
      { time: SETUP + TOTAL_KNOTS * KNOT_TIME, title: 'Lesson 5 · Finishing', text: 'Check that every cell in the final row has two half-hitches, then secure the base strings in groups. The finish shown is a simplified overview.' },
    ]
    if (firstChange >= 0) marks.push({ time: SETUP + firstChange * KNOT_TIME + .0001, title: 'Lesson 4 · Change color', text: 'Hold the base string still and place the old working thread behind the work. Secure the tail of the new color and tie two half-hitches around the same base string.' })
    return marks.sort((a,b) => a.time - b.time)
  }, [CAT, TOTAL_KNOTS])
  const state = simulationAt(time, CAT)
  clock.current = time
  useEffect(() => {
    if (!playing) return
    let frame, last
    const tick = now => {
      if (last !== undefined) {
        const next = Math.min(DURATION, clock.current + (now - last) / 1000 * speed)
        const stop = teaching && breakpoints.find(b => b.time > clock.current + .00001 && b.time <= next)
        if (stop) { clock.current = stop.time; setTime(stop.time); setPlaying(false); return }
        clock.current = next; setTime(next)
      }
      last = now; frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, DURATION, teaching, breakpoints])
  useEffect(() => { if (time >= DURATION) { setPlaying(false) } }, [time, DURATION])
  const seek = t => { setPlaying(false); setTime(Math.max(0, Math.min(DURATION, t))) }
  const dir = state.row % 2 ? -1 : 1
  const x = X(state.col), y = Y(state.row)
  const half = state.p < .55 ? (state.p - .15) / .4 : (state.p - .55) / .4
  const tight = ease((half - .65) / .35)
  const handX = x + dir * (48 + tight * 38), handY = y + 74 - tight * 80
  const setup = ease(time / SETUP)
  const finishing = state.phase === 'finish' || state.phase === 'done'
  const finish = finishing ? ease((time - SETUP - TOTAL_KNOTS * KNOT_TIME) / 6) : 0
  const color = CAT.palette[state.color]
  const overview = (
<div className="cw-stage cw-overview-stage">
          <svg viewBox="110 30 340 400" role="img" aria-label={`${state.title}, ${state.count} knots completed`}>
            <defs><HandsShadow/><linearGradient id="cw-mat" x2="1" y2="1"><stop stopColor="#e8d3cc"/><stop offset="1" stopColor="#ccb0a9"/></linearGradient><linearGradient id="cw-metal" x2="0" y2="1"><stop stopColor="#78837e"/><stop offset=".3" stopColor="#f8faf2"/><stop offset=".6" stopColor="#939f99"/><stop offset="1" stopColor="#d7ddd4"/></linearGradient></defs>
            <rect width="560" height="480" rx="12" fill="url(#cw-mat)"/>
            {Array.from({ length: 35 }, (_, i) => <path key={i} d={`M0 ${i * 15} H560`} stroke="#fff" strokeOpacity=".05"/>)}
            <g opacity={setup}>
              {Array.from({ length: CAT.W }, (_, c) => <Yarn key={c} color="#eee9db" d={`M${X(c)} 88 L${X(c)} ${finishing ? 275 : 300} Q${X(c)} 370 ${X(c) + (c - 7) * (2 + finish * 2)} ${470 - finish * 80}`}/>)}
              {CAT.palette.map((co, i) => <Yarn key={co} color={co} d={`M180 ${100 + i * 3} C${70 + i * 8} 160 ${120 - i * 12} 210 ${30 + i * 13} 330`}/>)}
              {CAT.grid.map((line, r) => line.map((c, col) => knotIndex(r, col, CAT) < state.count ? <Stitch chart={CAT} key={`${r}-${col}`} r={r} c={col} color={CAT.palette[c]}/> : null))}
            </g>
            {state.phase === 'knot' && <>
              {state.change && <Yarn d={`M${x} ${y} Q${x + 55} ${y + 42} 507 320`} color={CAT.palette[state.oldColor]}/>}
              <Yarn d={`M${x - dir * 14} ${y - 6} Q${x - dir * 30} ${y + 22} ${x} ${y + 30 * (1 - tight)} C${x + dir * 40 * (1 - tight)} ${y + 74 * (1 - tight)} ${x - dir * 44 * (1 - tight)} ${y + 62 * (1 - tight)} ${x} ${y + 30 * (1 - tight)} Q${handX} ${handY + 14} ${handX} ${handY}`} color={color}/>
              {state.p > .45 && <Stitch chart={CAT} r={state.row} c={state.col} color={color} amount={state.p < .85 ? .55 : .55 + ease((state.p - .85) / .15) * .45}/>}
              
            </>}
            {finishing && <>
              {[0, 1, 2, 3, 4].map(i => <g key={i} opacity={finish} transform={`translate(${194 + i * 42} 282)`}><ellipse rx="13" ry="6" fill="#eae5d6" stroke="#b3a68f"/><path d="M-7 -2 L7 2" stroke="#fff"/></g>)}
            </>}
            <g transform={`translate(0 ${-finish * 110})`}><path d="M248 55 V33 C248 2 310 2 310 33 V55" fill="none" stroke="#a2aaa3" strokeWidth="6"/><rect x="157" y="54" width="246" height="37" rx="6" fill="url(#cw-metal)" stroke="#7b857e"/><path d="M164 80 H396" stroke="#6c766e" strokeWidth="4"/></g>
            <text x="22" y="29" fill="#725e54" fontSize="11" letterSpacing="2">CAMELLIA / ALPHA WEAVING</text>
          </svg>
          <div className="cw-caption"><span>{state.phase === 'setup' ? 'Setup' : finishing ? 'Finishing' : `Row ${state.row + 1} · String ${state.col + 1}`}</span><strong>{state.title}</strong></div>
        </div>
  )
  const patternInset = <PatternPreview chart={CAT} state={state} names={names} custom={custom} onInspect={k => seek(SETUP + k * KNOT_TIME + .0001)} onOpen={() => { setPlaying(false); patternDialog.current?.showModal() }}/>
  return <div className="pixel-knot cw" lang="en">
    <dialog ref={patternDialog} className="cw-pattern-dialog" aria-labelledby="cw-pattern-title" onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
      <div className="cw-pattern-dialog-heading"><h2 id="cw-pattern-title">{custom ? 'Photo knot chart' : 'Camellia knot chart'}</h2><button type="button" onClick={() => patternDialog.current?.close()}>Close ×</button></div>
      <p>Row {state.row + 1} · String {state.col + 1} · Select a circle to inspect its knot</p>
      <div className="cw-pattern-large"><Pattern chart={CAT} names={names} state={state} seek={seek} onInspect={k => { if (state.phase !== 'knot' || k !== state.index) seek(SETUP + k * KNOT_TIME + .0001) }}/></div>
    </dialog>
    <header className="pk-head"><p className="pk-kicker">a little knot at a time</p><h1 id="pixel-knot-title">{custom ? 'Weave your photo in pixels' : 'Weave Camellia'}</h1><p className="pk-lead">{CAT.W} base strings · {CAT.palette.length} colors · {TOTAL_KNOTS} knots. {title}, from setup to finishing.</p></header>
<div className="cw-view-options"><span>Knot close-up</span><label><input type="checkbox" checked={hands} onChange={e => setHands(e.target.checked)}/>Show hands (translucent)</label></div>
    <div className="cw-layout">
      <div className="cw-main">
        {state.phase === 'knot' ? <WeavingDetail patternInset={patternInset} state={state} color={color} oldColor={CAT.palette[state.oldColor]} names={names} hands={hands} onMove={p => seek(SETUP + state.index * KNOT_TIME + p * KNOT_TIME + .0001)}/> : <div className="cw-phase-card">{patternInset}<span>{state.phase === 'setup' ? 'Before you begin' : 'The final step'}</span><h2>{state.title}</h2><p>{state.detail}</p><p>{state.phase === 'setup' ? 'Watch the setup in the preview on the right. Once weaving begins, each movement appears here in close-up.' : 'The preview on the right shows the whole piece. Scrub the timeline to revisit any part.'}</p></div>}

        <div className="cw-controls">
          <div className="cw-buttons cw-action-row">{state.phase === 'knot' && <><button disabled={moveAt(state.p) === 0} onClick={() => seek(SETUP + state.index * KNOT_TIME + MOVES[Math.max(0, moveAt(state.p) - 1)].at * KNOT_TIME + .0001)}>← Previous move</button><button onClick={() => { const i = moveAt(state.p); seek(i < MOVES.length - 1 ? SETUP + state.index * KNOT_TIME + MOVES[i + 1].at * KNOT_TIME + .0001 : Math.min(DURATION, SETUP + (state.index + 1) * KNOT_TIME + .0001)) }}>{moveAt(state.p) === MOVES.length - 1 ? 'Next string →' : 'Next move →'}</button></>}<button className="main" onClick={() => { if (time >= DURATION) setTime(0); setPlaying(p => !p) }}>{playing ? 'Pause' : state.phase === 'knot' ? 'Play move' : time >= DURATION ? 'Weave again' : time === 0 ? 'Start weaving' : 'Next step'}</button><label>Speed <select value={speed} onChange={e => setSpeed(+e.target.value)}>{[.5, 1, 4, 16, 64].map(v => <option key={v} value={v}>{v}×</option>)}</select></label></div>
          <div className="cw-knowledge" aria-label="Lessons">{breakpoints.filter(b => !b.title.startsWith('First knot') || b.title.includes('1 /')).map(b => <button key={b.time} onClick={() => seek(b.time)}>{b.title.startsWith('First knot') ? 'Lesson 2 · A complete knot' : b.title}</button>)}<button onClick={() => seek(DURATION)}>Lesson 6 · Finished piece</button></div>
        </div>
      </div>
      <aside className="cw-aside"><section className="cw-overview" aria-label="Whole piece and timeline controls"><div className="cw-heading"><h2>Whole piece</h2><span>{state.count} / {TOTAL_KNOTS} knots</span></div>{overview}<div className="cw-controls">          <input type="range" min="0" max={DURATION} step=".01" value={time} aria-label="Weaving timeline" onChange={e => seek(+e.target.value)}/><div className="cw-buttons cw-overview-buttons"><button className="main" onClick={() => { if (time >= DURATION) setTime(0); setPlaying(p => !p) }}>{playing ? 'Pause' : time >= DURATION ? 'Weave again' : time === 0 ? 'Start weaving' : 'Next step'}</button><button onClick={() => seek(SETUP + Math.max(0, state.index - 1) * KNOT_TIME)}>Previous knot</button><button disabled={state.count >= TOTAL_KNOTS} onClick={() => seek(Math.min(DURATION, SETUP + (state.index + 1) * KNOT_TIME))}>Next knot</button><button onClick={() => seek(0)}>Reset</button></div></div></section><div className="cw-palette">{CAT.palette.map((c, i) => <span key={c} className={state.phase === 'knot' && i === state.color ? 'active' : ''}><i style={{ background: c }}/>{names[i]}</span>)}</div></aside>
    </div>
    {children}
  </div>
}


export default function CatWeaving() {
  const [source, setSource] = useState(null)
  const [image, setImage] = useState(null)
  const [filename, setFilename] = useState('')
  const [width, setWidth] = useState(24)
  const [colors, setColors] = useState(5)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const file = useRef(null)
  useEffect(() => {
    if (!source) { setImage(null); return }
    let live = true
    setLoading(true)
    loadImage(source).then(img => { if (live) { setImage(img); setLoading(false) } }).catch(() => { if (live) { setError('Could not read this image. Try a JPG, PNG or WebP file.'); setLoading(false) } })
    return () => { live = false; URL.revokeObjectURL(source) }
  }, [source])
  const chart = useMemo(() => image ? makeChart(image, width, colors) : SAMPLE_CAT, [image, width, colors])
  const upload = e => {
    const f = e.target.files?.[0]
    if (!f) return
    e.target.value = ''
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) { setError('Choose a JPG, PNG, WebP or GIF image.'); return }
    if (f.size > 20 * 1024 * 1024) { setError('Choose an image smaller than 20 MB.'); return }
    setError(''); setFilename(f.name); setSource(URL.createObjectURL(f))
  }
  const download = () => {
    const n = 22, pad = 44, w = chart.W * n + pad * 2, h = chart.H * n + pad * 2 + 38
    const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
    const cells = chart.grid.map((line, r) => line.map((c, x) => {
      const co = chart.palette[c], l = rgb(co).reduce((sum, v) => sum + v, 0) / 3
      return `<g transform="translate(${pad + x * n + n / 2} ${pad + r * n + n / 2})"><path d="M0 -11V11M-11 0H11" stroke="#c8bdaa"/><circle r="9" fill="${co}" stroke="#8b7c65"/><text text-anchor="middle" dominant-baseline="central" font-size="14" fill="${l > 145 ? '#463e33' : '#fff'}">${r % 2 ? '←' : '→'}</text></g>`
    }).join('')).join('')
    const labels = chart.grid.map((_, r) => `<text x="22" y="${pad + r * n + 15}" font-size="11" fill="#6b5e4c">${r + 1}</text>`).join('')
    const legend = chart.palette.map((co, i) => `<rect x="${pad + i * 65}" y="${h - 28}" width="12" height="12" fill="${co}" stroke="#888"/><text x="${pad + i * 65 + 16}" y="${h - 18}" font-size="11">${i + 1}</text>`).join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(w, chart.palette.length * 65 + pad * 2)}" height="${h}"><rect width="100%" height="100%" fill="#fffdf6"/><text x="${pad}" y="24" font-family="sans-serif" font-size="13">Alpha · ${chart.W} × ${chart.H} · ${chart.palette.length} colors</text><g font-family="sans-serif">${cells}${labels}${legend}</g></svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const a = document.createElement('a'); a.href = url; a.download = 'alpha-pattern.svg'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <WeavingPlayer key={`${source ?? 'cat'}-${width}-${colors}-${image ? 1 : 0}`} chart={chart} custom={!!image} title={image ? 'Your photo' : 'Camellia example'}>
    <section lang="en" className="cw-upload cw-try-photo" aria-labelledby="cw-try-title">
      <h2 id="cw-try-title">Try your own photo</h2>
      <p>Choose a photo to automatically generate a color palette and knot chart, then watch it being woven.</p>
      <button type="button" className="cw-photo-picker" onClick={() => file.current?.click()}>{loading ? 'Generating pattern…' : 'Choose a photo →'}</button>
      <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={upload}/>
      {source && <div className="cw-upload-options">{image && <img src={source} alt="Your uploaded photo"/>}<label>Base strings: {width}<input type="range" min="12" max="40" value={width} onChange={e => setWidth(+e.target.value)}/></label><label>Colors: {colors}<input type="range" min="2" max="8" value={colors} onChange={e => setColors(+e.target.value)}/></label><span>{loading ? 'Generating pattern…' : filename}</span></div>}
      {image && <div className="cw-buttons"><button onClick={download} disabled={loading}>Save pattern</button><button onClick={() => { setSource(null); setFilename(''); setError('') }}>Back to Camellia</button></div>}
      {error && <p role="alert">{error}</p>}
    </section>
  </WeavingPlayer>
}
