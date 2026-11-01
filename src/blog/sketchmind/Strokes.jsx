import { useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { smooth, toSvgPoint } from './ink'
import { TOOL, Window, Toolbar, PenGroup, PenPill, ExampleLabel, StepThumb, Block, Chips, ArrayCard } from './ui'
import { strokeOperands, executeStroke } from './strokeOperations'

const EXAMPLE = [3, 1, 7, 4]
export default function Strokes() {
  const svg = useRef(null)
  const points = useRef(null)
  const playback = useRef(0)
  const input = EXAMPLE
  const [pen, setPen] = useState('compare')
  const [steps, setSteps] = useState([])
  const [live, setLive] = useState(null)
  const [lastInk, setLastInk] = useState(null)
  const [preview, setPreview] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState(null)
  const current = steps.length ? steps[steps.length - 1].values : input
  const values = preview === null ? current : preview < 0 ? input : steps[preview].values
  const slots = input.map((_, i) => 500 * (i + 1) / (input.length + 1))

  const stop = () => { playback.current++; setPlaying(false) }
  const reset = () => {
    stop(); setPen('compare')
    setSteps([]); setLastInk(null); setPreview(null); setMessage(null); points.current = null; setLive(null)
  }
  const down = e => {
    if (e.button !== 0 || !e.isPrimary) return
    stop(); setPreview(null); setMessage(null)
    e.currentTarget.setPointerCapture(e.pointerId)
    points.current = [toSvgPoint(svg.current, e)]
    setLive(points.current)
  }
  const move = e => {
    if (!points.current) return
    points.current = [...points.current, toSvgPoint(svg.current, e)]
    setLive(points.current)
  }
  const up = e => {
    if (!points.current) return
    const stroke = [...points.current, toSvgPoint(svg.current, e)]
    points.current = null; setLive(null)
    const pair = strokeOperands(stroke, slots)
    if (!pair) { setMessage('Draw across two numbers.'); return }
    const result = executeStroke(current, pen, pair)
    setSteps(history => [...history, { ...result, pen, pair, args: pair.map(i => current[i]) }])
    setLastInk({ path: smooth(stroke), color: TOOL[pen] }); setMessage(null)
  }
  const replay = async () => {
    if (playing) { stop(); setPreview(null); return }
    if (!steps.length) return
    const version = ++playback.current
    setPlaying(true)
    for (let i = -1; i < steps.length; i++) {
      if (playback.current !== version || !svg.current) return
      setPreview(i)
      await new Promise(resolve => setTimeout(resolve, 550))
    }
    if (playback.current === version && svg.current) { setPlaying(false); setPreview(null) }
  }

  return (
    <Window className="smw-strokes">
      <Toolbar right={<ExampleLabel values={input} />}>
        <PenGroup label="Primitives">
          <PenPill color={TOOL.data} disabled>Data</PenPill>
            <PenPill color={TOOL.compare} active={pen === 'compare'} onClick={() => setPen('compare')}>Compare</PenPill>
            <PenPill color={TOOL.swap} active={pen === 'swap'} onClick={() => setPen('swap')}>Swap</PenPill>
        </PenGroup>
      </Toolbar>
      <div className="smw-body">
        <div className="smw-instances">
            <button type="button" className="smw-play" title="Replay steps" disabled={!steps.length} onClick={replay}>{playing ? <Pause size={13} /> : <Play size={13} />}</button>
            <button type="button" title="Initial input" onClick={() => { stop(); setPreview(-1) }}><StepThumb values={input} active={preview === -1} /></button>
            {steps.map((step, index) => <button key={index} type="button" title={step.label} onClick={() => { stop(); setPreview(index) }}><StepThumb values={step.values} pair={step.pair} color={TOOL[step.pen]} active={preview === index || preview === null && index === steps.length - 1} /></button>)}
        </div>
        <div className="smw-canvas">
          <svg ref={svg} viewBox="0 0 500 210" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { points.current = null; setLive(null) }} aria-label="Draw across two array elements to compare or swap them">
            {values.map((value, index) => <text key={index} x={slots[index]} y="118" textAnchor="middle" className="smw-digit">{value}</text>)}
            {lastInk && preview === null && <path d={lastInk.path} fill="none" stroke={lastInk.color} strokeWidth="3" opacity=".6" strokeLinecap="round" />}
            {live && <path d={smooth(live)} fill="none" stroke={TOOL[pen]} strokeWidth="3.5" strokeLinecap="round" />}
          </svg>
          <span className="smw-tip" role="status">{message || (preview !== null ? preview < 0 ? 'initial input' : steps[preview].label : steps.length ? steps[steps.length - 1].label : 'draw across two numbers')}</span>
          {steps.length > 0 && <div className="smw-tools"><button type="button" className="smw-icon" onClick={reset} title="Reset" aria-label="Reset"><RotateCcw size={14} /></button></div>}
        </div>
        <div className="smw-panel">
          {steps.map((step, index) => <div key={index} className={preview === index ? 'smw-operation-selected' : ''}>
            <Block kind={step.pen === 'compare' ? 'cmp' : 'swp'} right={step.pen === 'compare' ? <Chips value={step.comparison} /> : null}>
              {step.pen === 'compare' ? 'is_bigger' : 'swap'}({step.args.join(',')})
            </Block>
          </div>)}
          <ArrayCard values={values} labels kind="result" />
        </div>
      </div>

    </Window>
  )
}
