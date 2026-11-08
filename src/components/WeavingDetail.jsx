import { Hand } from './KnotHands'

export const MOVES = [
  { at: 0, title: 'Identify the base and working threads', hold: 'Pinch the current vertical base string and gently pull it downward. Move the neighboring strings aside.', work: 'Pick up the working thread in the color shown on the chart. Leave a short free end to pass through the loop.', check: 'Keep the base string straight. Only the colored working thread wraps around it.' },
  { at: .15, title: '1. Cross in front of the base string', hold: 'Keep the base string vertical as the working thread moves.', work: 'Cross the working thread from left to right in front of the base string. Leave an open figure-4 loop on the left.', check: 'The colored thread sits over the base string at the crossing. Keep the loop open.' },
  { at: .29, title: '2. Take the end behind the base string', hold: 'Keep the loop on the left open and the base string taut downward.', work: 'Bring the end on the right down and behind the base string, back toward the left. Dashes show the hidden section.', check: 'Cross in front, then pass behind. The loop must go around the base string.' },
  { at: .4, title: '3. Pass the end through the loop', hold: 'Hold the loop on the left open with your fingertips so the end can pass through.', work: 'Bring the end from behind into the loop on the left, then pass it through to the front.', check: 'The end must pass through the loop you made, not around its outside.' },
  { at: .48, title: '4. Slide the first half-hitch upward', hold: 'Hold the base string steady and pull gently downward to provide counter-tension.', work: 'Pull the free end diagonally upward so the loop slides snugly beneath the previous row.', check: 'This is only half of one knot. Stay on the same base string.' },
  { at: .56, title: '5. Cross again in the same direction', hold: 'Keep holding the same base string.', work: 'Cross the working thread from left to right again, leaving a second figure-4 loop.', check: 'Make the second half-hitch in the same direction as the first.' },
  { at: .69, title: '6. Pass behind and through again', hold: 'Keep the base string taut and hold the second loop open.', work: 'Pass the end behind the base string, then through the loop on the left to the front.', check: 'Repeat the full sequence: cross in front → pass behind → go through the loop.' },
  { at: .87, title: '7. Tighten to finish one pixel', hold: 'Hold the base string downward so the working thread does not pull the row out of line.', work: 'Pull diagonally upward until the second half-hitch sits beside the first. Then move to the next base string.', check: 'Two half-hitches in the same direction make one circle on the chart. Keep them snug without puckering the fabric.' },
]
export function moveAt(p) { return MOVES.reduce((index, m, i) => p >= m.at ? i : index, 0) }
export function moveText(move, backward) {
  const swap = text => backward ? text.replaceAll('left', '§').replaceAll('right', 'left').replaceAll('§', 'right').replaceAll('figure-4', 'mirrored figure-4') : text
  return { ...move, hold: swap(move.hold), work: swap(move.work), check: swap(move.check) }
}
export default function WeavingDetail({ state, color, oldColor, names, hands, onMove, patternInset }) {
  const n = moveAt(state.p), move = moveText(MOVES[Math.max(0, n)], state.row % 2 === 1)
  const second = n >= 5, cross = n >= 1, behind = n === 2 || n === 3 || n === 6, through = n === 3 || n === 6
  const pull = n === 4 || n === 7
  const start = MOVES[n]?.at ?? 0, end = MOVES[n + 1]?.at ?? 1
  const f = Math.min(1, Math.max(0, (state.p - start) / (end - start)))
  const y = pull ? 230 - f * 100 : 230
  const tx = pull ? 364 + f * 25 : through ? 158 - f * 35 : behind ? 338 - f * 120 : 126 + f * 224
  const ty = pull ? 252 - f * 132 : through ? 232 - f * 27 : behind ? 265 : 242
  const yarn = (d, dashed = false, c = color) => <g fill="none" strokeLinecap="round"><path d={d} stroke="#463a2c66" strokeWidth="10" strokeDasharray={dashed ? '5 10' : undefined}/><path d={d} stroke={c} strokeWidth="7" strokeDasharray={dashed ? '5 10' : undefined}/><path d={d} stroke="#ffffff70" strokeWidth="1.5" strokeDasharray="2 5"/></g>
  return <div className="wd">
    <div className="wd-heading"><span>Close-up · Row {state.row + 1} / String {state.col + 1}</span><b>{state.row % 2 ? '← Backward knot' : 'Forward knot →'}</b></div>
    <div className="wd-canvas">
    {patternInset}
    <svg viewBox="0 0 560 420" role="img" aria-label={move.title}>
      <defs><marker id="wd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#446c75" strokeWidth="2"/></marker></defs>
      <rect width="560" height="420" fill="#ece2d5"/>
      <g transform={state.row % 2 ? 'translate(560 0) scale(-1 1)' : undefined}>
        {[220, 340].map(x => <path key={x} d={`M${x} 60 V420`} stroke="#c5b8a2" strokeWidth="3" opacity=".35"/>)}
        {state.change && yarn('M280 98 C380 124 395 174 480 160', false, oldColor)}
        {behind && yarn('M350 243 Q330 290 280 278 Q225 272 200 241', true)}
        <path d="M280 60 V410" stroke="#a18560" strokeWidth="12"/>
        <path d="M280 60 V410" stroke="#f9f0cf" strokeWidth="7"/>
        <rect x="243" y="47" width="74" height="49" rx="8" fill="#ccb69a"/>
        {[0,1,2].map(i => <path key={i} d={`M249 ${57+i*12} H311`} stroke="#f7e9d0" strokeWidth="8" strokeLinecap="round"/>)}
        {(second || n === 4) && <ellipse cx="280" cy="113" rx="15" ry="7" fill={color} stroke="#6b594b66"/>}
        {cross ? <>
          {yarn(`M266 100 Q218 143 152 ${y + 45} L280 ${y} Q322 ${y - 23} 350 ${y + 13}`)}
          {(behind || through) && yarn(`M200 241 Q185 210 202 196 Q230 178 250 199 L${tx} ${ty}`)}
          {!behind && !through && yarn(`M350 ${y+13} Q370 ${y+42} ${tx} ${ty}`)}
        </> : yarn(`M266 100 Q110 135 ${tx} ${ty}`)}
        {n === 7 && <ellipse cx="280" cy={y - 5} rx="15" ry="7" fill={color}/>}
        {hands && <g opacity=".72"><Hand x={280} y={345} angle={8}/><Hand x={tx} y={ty} mirror angle={8}/></g>}
        {/* Repeat the contact segments over the hand so a finger never hides the route. */}
        {through && yarn(`M202 196 Q228 176 250 199 L${tx} ${ty}`)}
        {pull && <path d="M416 270 Q439 188 391 135" fill="none" stroke="#446c75" strokeWidth="3" markerEnd="url(#wd-arrow)"/>}
        <path d="M305 333 V380" stroke="#446c75" strokeWidth="3" markerEnd="url(#wd-arrow)"/>
      </g>
      <g fontSize="11" fontFamily="system-ui" fill="#5c5344"><rect x="20" y="20" width="174" height="53" rx="7" fill="#fffaf0"/><text x="32" y="41">Beige = base string</text><text x="32" y="60">Color = working thread</text><text x="22" y="392">↓ Keep the base string taut</text><text x="310" y="392">Dashes = behind the base string</text></g>
    </svg>
    </div>
    <div className="wd-steps">{MOVES.map((m,i) => <button key={m.at} className={i === n ? 'on' : ''} onClick={() => onMove(m.at)} aria-label={m.title}>{i+1}</button>)}</div>
    <h3>{move.title}</h3>
    <dl><dt>{state.row % 2 ? 'Right hand · hold the base string' : 'Left hand · hold the base string'}</dt><dd>{move.hold}</dd><dt>{state.row % 2 ? 'Left hand · move the working thread' : 'Right hand · move the working thread'}</dt><dd>{move.work}</dd><dt>Check before moving on</dt><dd>{move.check}</dd></dl>
    {state.change && <p className="wd-change">Change color: {names[state.oldColor]} → {names[state.color]}. Place the old thread behind the work and hold the new thread tail. Tie two half-hitches with the new color. This shows a basic color change; the extra passes for a flat color change are not shown.</p>}
  </div>
}
