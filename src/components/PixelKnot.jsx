import { useEffect, useMemo, useRef, useState } from 'react'
import { tracked, trackComplete } from '../analytics'
import { loadImage, makeChart, light } from './pixelChart'
import KnotScene, { KNOT_LESSONS, KNOT_ORDER, knotCaption, lessonLength } from './KnotScene'
import KnotCloseup, { CLOSEUP_STEPS } from './KnotCloseup'
import './PixelKnot.css'

// Pixel knotting (alpha patterns) for people who program and have never tied one. A
// picture becomes a chart; each column is a base string held by a clip, and each pixel is
// one knot tied around it. Rows run top to bottom and zigzag: forward knots left to right,
// backward knots right to left.

const SAMPLE = `${import.meta.env.BASE_URL}trial/pixel-cat.png`

// Row 1 is the top row, right under the clip. Odd rows go left to right.
const leftToRight = row => row % 2 === 1
const colAt = (chart, row, j) => (leftToRight(row) ? j : chart.W - 1 - j)
const colorAt = (chart, row, col) => chart.grid[row - 1][col]
function runsOf(chart, row) {
  const out = []
  for (let j = 0; j < chart.W; j++) {
    const c = colorAt(chart, row, colAt(chart, row, j))
    const last = out[out.length - 1]
    if (last && last.color === c) last.count++
    else out.push({ color: c, count: 1, start: j })
  }
  return out
}
const name = i => `color ${i + 1}`

// Beginners learn the knot first; the picture and the pattern come after.
const STEPS = ['Tie one knot', 'Tie a row', 'Your picture', 'Follow the pattern']

export default function PixelKnot() {
  const [step, setStep] = useState(0)
  const [source, setSource] = useState(SAMPLE)
  const [sourceName, setSourceName] = useState('the walking cat')
  const [image, setImage] = useState(null)
  const [width, setWidth] = useState(35)
  const [colors, setColors] = useState(6)
  const [at, setAt] = useState(0) // knot index in working order
  const [playing, setPlaying] = useState(false)
  const [followPhase, setFollowPhase] = useState(0)
  const [lesson, setLesson] = useState('forward')
  const [clock, setClock] = useState(0)
  const [running, setRunning] = useState(false)
  const [slow, setSlow] = useState(false)
  const [knotStep, setKnotStep] = useState(0)
  const [backward, setBackward] = useState(false)
  const [doneRows, setDoneRows] = useState(() => new Set())
  const [copied, setCopied] = useState(false)
  const file = useRef(null)

  useEffect(() => { let live = true; loadImage(source).then(img => { if (live) setImage(img) }); return () => { live = false } }, [source])
  const chart = useMemo(() => (image ? makeChart(image, width, colors) : null), [image, width, colors])
  useEffect(() => { setAt(0); setDoneRows(new Set()); setPlaying(false) }, [chart])

  const total = chart ? chart.W * chart.H : 0
  const row = chart ? Math.floor(at / chart.W) + 1 : 1
  const j = chart ? at % chart.W : 0
  const col = chart ? colAt(chart, row, j) : 0
  const runs = chart ? runsOf(chart, row) : []
  const run = runs.find(r => j >= r.start && j < r.start + r.count)
  const color = chart ? colorAt(chart, row, col) : 0
  const prevColor = chart && j > 0 ? colorAt(chart, row, colAt(chart, row, j - 1)) : null

  useEffect(() => {
    if (!playing || step !== 3) return
    const id = setTimeout(() => {
      if (followPhase < CLOSEUP_STEPS.length - 1) setFollowPhase(p => p + 1)
      else if (at < total - 1) { setAt(a => a + 1); setFollowPhase(0) }
      else setPlaying(false)
    }, 4500)
    return () => clearTimeout(id)
  }, [playing, at, total, followPhase, step])


  // The knotting scene runs on its own clock, like a short video.
  useEffect(() => { if (step === 1) { setClock(0); setRunning(true) } else setRunning(false) }, [step])
  useEffect(() => {
    if (!running) return
    let last = performance.now(), id
    const tick = now => { setClock(c => c + ((now - last) / 1000) * (slow ? .5 : 1)); last = now; id = requestAnimationFrame(tick) }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [running, slow])
  useEffect(() => { if (chart && doneRows.size === chart.H) trackComplete('pixel_knot') }, [doneRows, chart])

  // Thread colors for the lessons: the chart's most common color as the background,
  // its most colorful one, and its darkest.
  const sceneColors = useMemo(() => {
    if (!chart) return { bg: '#f3e6d2', a: '#e9a96a', b: '#6b3a22' }
    const counts = chart.palette.map((_, i) => chart.grid.flat().filter(c => c === i).length)
    const bg = chart.palette[counts.indexOf(Math.max(...counts))]
    const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
    const sat = h => { const c = rgb(h); return Math.max(...c) - Math.min(...c) }
    const rest = chart.palette.filter(h => h !== bg)
    const a = [...rest].sort((x, y) => sat(y) - sat(x))[0] ?? '#e9a96a'
    const b = rest.filter(h => h !== a).sort((x, y) => light(rgb(x)) - light(rgb(y)))[0] ?? '#6b3a22'
    return { bg, a, b }
  }, [chart])

  const upload = e => {
    const f = e.target.files?.[0]
    if (!f) return
    setSource(URL.createObjectURL(f))
    setSourceName(f.name)
    setWidth(w => Math.min(w, 40))
  }

  const pattern = () => {
    if (!chart) return ''
    const lines = [`Set up: ${chart.W} base strings clipped side by side, and one thread in each of ${chart.palette.length} colors.`]
    for (let r = 1; r <= chart.H; r++) {
      const knots = runsOf(chart, r).map(x => `${x.count} in ${name(x.color)}`).join(', ')
      lines.push(`Row ${r} (${leftToRight(r) ? 'left to right, forward knots' : 'right to left, backward knots'}): ${knots}.`)
    }
    lines.push('Tie off the threads, trim, and unclip.')
    return lines.join('\n')
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(pattern()); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* clipboard blocked */ }
  }
  const save = () => {
    const cell = 18, pad = 30
    const canvas = document.createElement('canvas')
    canvas.width = chart.W * cell + pad * 2; canvas.height = chart.H * cell + pad * 2
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    chart.grid.forEach((line, r) => line.forEach((c, x) => { ctx.fillStyle = chart.palette[c]; ctx.fillRect(pad + x * cell, pad + r * cell, cell, cell) }))
    ctx.strokeStyle = '#0000001f'
    for (let x = 0; x <= chart.W; x++) { ctx.lineWidth = x % 5 ? 1 : 2; ctx.beginPath(); ctx.moveTo(pad + x * cell, pad); ctx.lineTo(pad + x * cell, pad + chart.H * cell); ctx.stroke() }
    for (let y = 0; y <= chart.H; y++) { ctx.lineWidth = y % 5 ? 1 : 2; ctx.beginPath(); ctx.moveTo(pad, pad + y * cell); ctx.lineTo(pad + chart.W * cell, pad + y * cell); ctx.stroke() }
    ctx.fillStyle = '#6d655a'; ctx.font = '11px sans-serif'; ctx.textBaseline = 'middle'
    for (let r = 1; r <= chart.H; r++) {
      const yy = pad + (r - 1) * cell + cell / 2
      if (leftToRight(r)) { ctx.textAlign = 'right'; ctx.fillText(r, pad - 6, yy) } else { ctx.textAlign = 'left'; ctx.fillText(r, pad + chart.W * cell + 6, yy) }
    }
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png'); a.download = 'pixel-knotting-chart.png'; a.click()
  }

  const cell = 18
  const chartSvg = interactive => chart && (
    <svg className="pk-chart" viewBox={`0 0 ${chart.W * cell} ${chart.H * cell}`} role="img" aria-label={`Chart, ${chart.W} strings by ${chart.H} rows`}>
      {chart.grid.map((line, r) => line.map((c, x) => {
        const rowNo = r + 1
        const k = r * chart.W + (leftToRight(rowNo) ? x : chart.W - 1 - x)
        return (
          <g key={`${r}-${x}`} className={interactive ? (k < at ? `made${k === at - 1 ? ' pk-pop' : ''}` : 'todo') : ''}
            onClick={interactive ? () => pickKnot(k) : undefined}
            role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `Row ${rowNo}, string ${x + 1}, ${name(c)}, ${leftToRight(rowNo) ? 'forward' : 'backward'} knot` : undefined}
            onKeyDown={interactive ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickKnot(k) } } : undefined}>
            {interactive ? <>
              <path d={`M${x * cell + cell / 2} ${r * cell} v${cell}`} stroke="#baa991" strokeWidth="1"/>
              <path d={`M${x * cell} ${r * cell + cell / 2} h${cell}`} stroke={chart.palette[c]} strokeWidth="2"/>
              <circle cx={x * cell + cell / 2} cy={r * cell + cell / 2} r={cell * .39} fill={chart.palette[c]} stroke="#645b4d" strokeWidth=".65"/>
              <text x={x * cell + cell / 2} y={r * cell + cell / 2 + .5} textAnchor="middle" dominantBaseline="middle" fill={light([1, 3, 5].map(i => parseInt(chart.palette[c].slice(i, i + 2), 16))) > 145 ? '#39352e' : '#fffaf0'} style={{ font: '11px system-ui', pointerEvents: 'none' }}>{leftToRight(rowNo) ? '→' : '←'}</text>
            </> : <rect x={x * cell} y={r * cell} width={cell} height={cell} fill={chart.palette[c]} />}
            {false && interactive && k < at && (
              <path d={leftToRight(rowNo)
                ? `M${x * cell + 2} ${r * cell + 3} L${x * cell + 8} ${r * cell + 7}`
                : `M${x * cell + 8} ${r * cell + 3} L${x * cell + 2} ${r * cell + 7}`} className="pk-knotmark" />
            )}
          </g>
        )
      }))}
      {interactive && <rect className="pk-band" x="0" y={(row - 1) * cell} width={chart.W * cell} height={cell} />}
      {interactive && <rect className="pk-cursor" x={col * cell} y={(row - 1) * cell} width={cell} height={cell} />}
    </svg>
  )

  const [capTitle, capText] = knotCaption(lesson, clock)
  const progress = (clock % lessonLength(lesson)) / lessonLength(lesson)
  const lastKnotStep = knotStep === CLOSEUP_STEPS.length - 1
  const pickKnot = k => { setPlaying(false); setAt(k); setFollowPhase(0) }

  return (
    <div className="pixel-knot" {...tracked('pixel_knot')}>
      <header className="pk-head">
        <p className="pk-kicker">Trial</p>
        <h1 id="pixel-knot-title">Pixel knotting</h1>
        <p className="pk-lead">Every pixel of a picture becomes one small knot. First learn the knot, then turn your own picture into a pattern and follow it row by row.</p>
      </header>

      <nav className="pk-steps" aria-label="Steps">
        {STEPS.map((s, i) => (
          <button key={s} type="button" className={i === step ? 'on' : i < step ? 'past' : ''} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
            <span>{i + 1}</span>{s}
          </button>
        ))}
      </nav>

      {step === 0 && (
        <section className="pk-page pk-knot">
          <div className="pk-col">
            <KnotCloseup step={knotStep} color={sceneColors.a} backward={backward} />
            <div className="pk-dots">{CLOSEUP_STEPS.map((_, i) => <button key={i} type="button" aria-label={`Step ${i + 1}`} className={i === knotStep ? 'on' : i < knotStep ? 'past' : ''} onClick={() => setKnotStep(i)} />)}</div>
          </div>
          <div className="pk-col">
            <p className="pk-count">Step {knotStep + 1} of {CLOSEUP_STEPS.length}</p>
            <h3 className="pk-big">{CLOSEUP_STEPS[knotStep].title}</h3>
            <p className="pk-plain">{CLOSEUP_STEPS[knotStep].text}</p>
            <div className="pk-actions big">
              <button type="button" disabled={knotStep === 0} onClick={() => setKnotStep(k => k - 1)}>Back</button>
              {lastKnotStep
                ? <button type="button" className="main" onClick={() => setStep(1)}>Now tie a whole row →</button>
                : <button type="button" className="main" onClick={() => setKnotStep(k => k + 1)}>Next</button>}
            </div>
            <div className="pk-switch" role="group" aria-label="Knot direction">
              <button type="button" className={!backward ? 'on' : ''} onClick={() => setBackward(false)}>Going right →</button>
              <button type="button" className={backward ? 'on' : ''} onClick={() => setBackward(true)}>← Going left</button>
            </div>
            <p className="pk-aside">{backward
              ? 'Going left, you do the same moves as a mirror image. This is called a backward knot.'
              : 'Going right, this is called a forward knot. It is the only knot you need.'}</p>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="pk-page pk-learn">
          <div className="pk-col">
            <div className="pk-tabs" role="tablist">
              {KNOT_ORDER.map(id => (
                <button key={id} type="button" role="tab" aria-selected={lesson === id} className={lesson === id ? 'on' : ''} onClick={() => { setLesson(id); setClock(0); setRunning(true) }}>{KNOT_LESSONS[id].title}</button>
              ))}
            </div>
            <KnotScene lesson={lesson} t={clock} colors={sceneColors} />
            <div className="pk-timeline"><div style={{ width: `${progress * 100}%` }} /></div>
          </div>
          <div className="pk-col">
            <p className="pk-why">{KNOT_LESSONS[lesson].why}</p>
            <h3 className="pk-move-title">{capTitle}</h3>
            <p className="pk-move-text">{capText}</p>
            <div className="pk-actions">
              <button type="button" className="main" onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Play'}</button>
              <button type="button" onClick={() => setSlow(s => !s)}>{slow ? 'Normal speed' : 'Slower'}</button>
              <button type="button" onClick={() => { setClock(0); setRunning(true) }}>Watch again</button>
            </div>
            <p className="pk-aside">The same knot from step 1, tied on one base string after another. Zoomed out, like your own desk.</p>
          </div>
          <button type="button" className="pk-next" onClick={() => setStep(2)}>Make a pattern from a picture →</button>
        </section>
      )}

      {step === 2 && (
        <section className="pk-page">
          <div className="pk-col">
            <div className="pk-label">Your picture</div>
            <div className="pk-source"><img src={source} alt={sourceName} className={source === SAMPLE ? 'pixel' : ''} /></div>
            <div className="pk-actions">
              <button type="button" className="main" onClick={() => file.current?.click()}>Upload a photo</button>
              {source !== SAMPLE && <button type="button" onClick={() => { setSource(SAMPLE); setSourceName('the walking cat'); setWidth(35) }}>Use the cat</button>}
              <input ref={file} type="file" accept="image/*" hidden onChange={upload} />
            </div>
            <p className="pk-aside">Your photo stays on your computer.</p>
          </div>
          <div className="pk-col">
            <div className="pk-label">Pattern <span>{chart ? `${chart.W} × ${chart.H} knots · ${chart.palette.length} colors` : ''}</span></div>
            {chartSvg(false)}
            <label className="pk-slider">Width (how many base strings) <b>{width}</b>
              <input type="range" min="12" max="52" value={width} onChange={e => setWidth(+e.target.value)} />
            </label>
            <label className="pk-slider">Colors (how many threads) <b>{colors}</b>
              <input type="range" min="3" max="8" value={colors} onChange={e => setColors(+e.target.value)} />
            </label>
            <p className="pk-aside">Each square is one knot. For a first try, pick a small width and few colors.</p>
          </div>
          <button type="button" className="pk-next" onClick={() => setStep(3)}>Follow the pattern →</button>
        </section>
      )}

      {step === 3 && chart && (
        <section className="pk-page">
          <div className="pk-col">
            <div className="pk-label">Pattern <span>each circle = one knot · arrows = direction</span></div>
            <div className="pk-chart-wrap">
              {chartSvg(true)}
              <span className={`pk-rowtag ${leftToRight(row) ? 'l' : 'r'}`} style={{ top: `${((row - 0.5) / chart.H) * 100}%` }}>
                {leftToRight(row) ? `row ${row} →` : `← row ${row}`}
              </span>
            </div>
            <div className="pk-actions">
              <button type="button" disabled={at === 0} onClick={() => pickKnot(at - 1)}>Back</button>
              <button type="button" className="main" disabled={at >= total - 1} onClick={() => pickKnot(at + 1)}>Next knot</button>
              <button type="button" disabled={at >= total - 1} onClick={() => setPlaying(p => !p)}>{playing ? 'Pause' : 'Play'}</button>
            </div>
            <p className="pk-aside">Read from the top: → across the first row, ← back across the next. Tap a circle to practise that exact knot.</p>
            <p className="pk-start">Before you start: clip {chart.W} base strings side by side, and get one thread in each color below.</p>
            <div className="pk-palette">{chart.palette.map((p, i) => <span key={i}><i style={{ background: p }} />{name(i)}</span>)}</div>
          </div>
          <div className="pk-col">
            <div className="pk-now">
              <p className="pk-count">Row {row} · knot {j + 1} of {chart.W}</p>
              <p className="pk-what"><i style={{ background: chart.palette[color] }} />{name(color)}, {leftToRight(row) ? 'going right →' : '← going left'}</p>
              <ul className="pk-facts">
                {j === 0 && row === 1 && <li>The very first knot: on the leftmost string, right under the clip.</li>}
                {j === 0 && row > 1 && <li>A new row starts at the end where the last row stopped.</li>}
                {prevColor !== null && prevColor !== color && <li className="change">New color here: pick up the {name(color)} thread. Leave the {name(prevColor)} thread hanging at the back.</li>}
                {run && <li>{run.count > 1 ? `${run.count} knots in a row in this color; this is number ${j - run.start + 1}.` : 'Just one knot in this color.'}</li>}
              </ul>
            </div>
            <div className="pk-follow-demo">
              <div className="pk-label">This circle, in your hands <span>string {col + 1}</span></div>
              <KnotCloseup key={at} step={followPhase} color={chart.palette[color]} backward={!leftToRight(row)} chart={chart} row={row} col={col} previousColor={prevColor === null ? undefined : chart.palette[prevColor]} />
              <p className="pk-count">Move {followPhase + 1} of {CLOSEUP_STEPS.length}</p>
              <h3 className="pk-move-title">{CLOSEUP_STEPS[followPhase].title}</h3>
              <p className="pk-aside">{CLOSEUP_STEPS[followPhase].text}</p>
              <div className="pk-actions">
                <button type="button" disabled={followPhase === 0} onClick={() => { setPlaying(false); setFollowPhase(p => p - 1) }}>Previous move</button>
                <button type="button" className="main" disabled={followPhase === CLOSEUP_STEPS.length - 1 && at === total - 1} onClick={() => { setPlaying(false); if (followPhase < CLOSEUP_STEPS.length - 1) setFollowPhase(p => p + 1); else pickKnot(at + 1) }}>{followPhase === CLOSEUP_STEPS.length - 1 ? 'Next circle →' : 'Next move'}</button>
              </div>
            </div>
            <div className="pk-label">Row by row <span>{doneRows.size} of {chart.H} done</span></div>
            <div className="pk-progress"><div style={{ width: `${(doneRows.size / chart.H) * 100}%` }} /></div>
            <ol className="pk-rows">
              {Array.from({ length: chart.H }, (_, i) => {
                const r = i + 1
                const isDone = doneRows.has(r)
                const rr = runsOf(chart, r)
                return (
                  <li key={r} className={`${isDone ? 'done' : ''} ${r === row ? 'here' : ''}`}>
                    <label>
                      <input type="checkbox" checked={isDone} onChange={() => setDoneRows(s => { const n = new Set(s); if (n.has(r)) n.delete(r); else n.add(r); return n })} />
                      <span className="pk-row-name">Row {r} <em>{leftToRight(r) ? '→' : '←'}</em></span>
                    </label>
                    <button type="button" className="pk-run-list" onClick={() => pickKnot((r - 1) * chart.W)} aria-label={`Go to row ${r}`}>
                      {rr.map((x, k) => <span key={k}><i style={{ background: chart.palette[x.color] }} />{x.count}</span>)}
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="pk-actions">
              <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy the steps'}</button>
              <button type="button" onClick={save}>Save the pattern</button>
            </div>
            <details className="pk-code">
              <summary>For programmers: the same thing as code</summary>
              <pre>{`for row in range(1, ${chart.H + 1}):        # top to bottom
    strings = range(${chart.W})
    if row % 2 == 0:
        strings = reversed(strings)   # thread turned back
    for s in strings:
        knot(chart[row][s], forward=row % 2 == 1)

# row ${row}, run-length encoded:
${JSON.stringify(runs.map(r => [r.color + 1, r.count]))}`}</pre>
            </details>
          </div>
        </section>
      )}
    </div>
  )
}
