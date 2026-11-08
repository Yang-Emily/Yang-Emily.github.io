import { useEffect, useRef, useState } from 'react'
import { Hand, HandsShadow } from './KnotHands'

export const CLOSEUP_STEPS = [
  { title: 'Hold the base string straight', text: 'This is a base string. It hangs from the clip and does not move. Keep it a little tight.' },
  { title: 'Cross the working thread over it', text: 'Bring the colored thread from the left, over the front of the base string, so it makes a shape like the number 4.' },
  { title: 'Go behind, then out through the gap', text: 'Pass the end behind the base string, and bring it out through the triangle of the 4.' },
  { title: 'Pull it up tight', text: 'Hold the base string, pull the colored end, and slide the loop up until it sits snugly under the clip.' },
  { title: 'Do it once more', text: 'Repeat steps 2 to 4 exactly the same way. Two loops make one knot, and one knot is one pixel.' },
]


export default function KnotCloseup({ step, color, backward, chart, row = 1, col = 0, previousColor }) {
  const [time, setTime] = useState(0)
  const [paused, setPaused] = useState(false)
  const elapsed = useRef(0)
  useEffect(() => { elapsed.current = 0; setTime(0) }, [step, backward])
  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTime(2.4); return }
    let frame, last
    const tick = now => { last ??= now; elapsed.current += (now - last) / 1000; last = now; setTime(elapsed.current); frame = requestAnimationFrame(tick) }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [step, backward, paused])
  const changing = previousColor && previousColor !== color
  const insetGrid = chart?.grid ?? Array.from({ length: 5 }, (_, r) => Array.from({ length: 8 }, (_, c) => r > 1 && c > 1 && c < 6 ? (r === 2 && c === 4 ? 2 : 1) : 0))
  const insetPalette = chart?.palette ?? ['#91a89a', '#c54e45', '#526c46']
  const insetW = insetGrid[0].length, insetH = insetGrid.length
  const p = Math.min(1, (time % 4.5) / 2.8)
  const ease = p * p * (3 - 2 * p)
  const pull = step === 3 || step === 4
  const x = pull ? 283 + ease * 55 : step === 2 ? 296 - Math.sin(ease * Math.PI) * 98 : 90 + ease * 208
  const y = pull ? 258 - ease * 155 : step === 2 ? 244 - ease * 52 : 275 - ease * 45
  const knotY = 199 - (pull ? ease * 75 : 0)
  const thread = (d, strandColor = color) => <g><path d={d} fill="none" stroke="#49332655" strokeWidth="7" strokeLinecap="round"/><path d={d} fill="none" stroke={strandColor} strokeWidth="5" strokeLinecap="round"/><path d={d} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="2 4"/></g>
  return <div className="kc-study"><svg className="kc-svg" viewBox="0 0 440 440" role="img" aria-label={`${CLOSEUP_STEPS[step].title}; animated hands demonstrating the knot`}>
    <defs>
      <HandsShadow />
      <linearGradient id="kc-board" x2=".8" y2="1"><stop stopColor="#dfc49d"/><stop offset="1" stopColor="#b58b5f"/></linearGradient>
      <linearGradient id="kc-steel" x2="0" y2="1"><stop stopColor="#666c6b"/><stop offset=".22" stopColor="#edf0e9"/><stop offset=".4" stopColor="#9ba3a0"/><stop offset=".55" stopColor="#f8f8ef"/><stop offset="1" stopColor="#636d69"/></linearGradient>
    </defs>
    <rect width="440" height="440" fill="#d9bcb8"/>
    <rect x="19" y="12" width="402" height="460" rx="15" fill="#e3c9c5"/>
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${29 + i * 29} 14 Q${15 + i * 29} 180 ${39 + i * 29} 440`} stroke="#fff7f0" strokeOpacity=".13" strokeWidth={i % 3 ? 1 : 3} fill="none"/>)}
    <g transform={backward ? 'translate(440 0) scale(-1 1)' : undefined}>
      {Array.from({ length: 8 }, (_, i) => thread(`M${171 + i * 14} 80 Q${172 + i * 14} 243 ${130 + i * 29} 450`, '#f3eee2'))}
      <path d="M222 84 L222 448" stroke="#aaa28e" strokeWidth="5"/>
      <path d="M222 84 L222 448" stroke="#fffdf2" strokeWidth="2" strokeDasharray="3 4"/>
      {/* Compact double hitches make the little woven panel above the working area. */}
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 8 }, (_, c) => {
        const col = r > 1 && c > 1 && c < 6 ? (r === 2 && c === 4 ? '#526c46' : '#c54e45') : '#91a89a'
        return <g key={`${r}-${c}`} transform={`translate(${171 + c * 14} ${86 + r * 9}) rotate(18)`}><rect x="-7" y="-4" width="14" height="8" rx="3" fill={col} stroke="#3c493c55" strokeWidth=".7"/><path d="M-4 -2 H4" stroke="#ffffff66" strokeWidth="1"/></g>
      }))}
      {changing && thread('M174 130 C320 168 350 240 427 213', previousColor)}
      {thread('M169 117 C113 125 88 163 45 201 C20 239 39 288 86 309')}
      {step === 0 ? thread(`M165 131 Q90 175 ${x} ${y}`) : <>
        {thread(`M174 130 Q161 168 222 ${knotY} C${286 - ease * (pull ? 55 : 0)} ${knotY + 66} ${145 + ease * (pull ? 70 : 0)} ${knotY + 71} 222 ${knotY} Q258 ${knotY - 12} ${x} ${y}`)}
        {pull && <g opacity={ease}><ellipse cx="222" cy="130" rx="10" ry="5" fill={color}/>{step === 4 && <ellipse cx="222" cy="139" rx="10" ry="5" fill={color}/>}</g>}
      </>}
      <g filter="url(#hands-shadow)">
        <path d="M193 58 V37 C193 6 255 6 255 37 V58" stroke="#a8b0ac" strokeWidth="7" fill="none"/>
        <path d="M194 57 V37 C194 11 254 11 254 37 V57" stroke="#f0f1e9" strokeWidth="2" fill="none"/>
        <rect x="143" y="48" width="162" height="31" rx="5" fill="url(#kc-steel)" stroke="#56605c"/>
        <path d="M150 69 H298" stroke="#434a45" strokeWidth="4"/>
      </g>
      <Hand x="217" y="299" mirror angle={-17} id="close-hold"/>
      <Hand x={x} y={y} angle={12 + ease * (pull ? -20 : 12)} id="close-work"/>
    </g>
    <rect x="30" y="24" width="93" height="24" rx="12" fill="#fff9eddd"/>
    <text x="76" y="40" textAnchor="middle" style={{ font: '10px system-ui', letterSpacing: '1px', fill: '#635241' }}>{changing ? 'CHANGE COLOR' : 'TIE ONE KNOT'}</text>
  </svg>
    <div className="kc-inset" aria-label="Pattern with the current knot highlighted">
      <span>Pattern · {backward ? '←' : '→'}</span>
      <svg viewBox={`-2 -2 ${insetW * 10 + 4} ${insetH * 10 + 4}`} role="img" aria-label={`Row ${row}, string ${col + 1}`}>
        {insetGrid.map((line, r) => line.map((c, x) => <g key={`${r}-${x}`}>
          <path d={`M${x * 10 + 5} ${r * 10} v10 M${x * 10} ${r * 10 + 5} h10`} stroke="#cfc7b8" strokeWidth=".5"/>
          <circle cx={x * 10 + 5} cy={r * 10 + 5} r="3.6" fill={insetPalette[c]} stroke="#7b7264" strokeWidth=".4"/>
          {r === row - 1 && x === col && <circle cx={x * 10 + 5} cy={r * 10 + 5} r="5" fill="none" stroke="#e74337" strokeWidth="1.6"/>}
        </g>))}
      </svg>
      <span>Row {row} · knot {col + 1}</span>
    </div>
    <div className="kc-subtitle">{changing && step === 0 ? 'Leave the old thread behind · pick up the new color' : CLOSEUP_STEPS[step].title}</div>
    <button type="button" className="kc-play" onClick={() => setPaused(v => !v)} aria-label={paused ? 'Play hand demonstration' : 'Pause hand demonstration'}>{paused ? '▶ Play' : 'Ⅱ Pause'}</button></div>
}
