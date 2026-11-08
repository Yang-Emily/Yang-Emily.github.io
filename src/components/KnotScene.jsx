import { Hand, HandsShadow } from './KnotHands'
// A drawn version of a pixel-knotting desk: base strings held by a binder clip, the
// piece growing below it, and a working thread tying one knot per pixel. Each lesson is
// a short timeline; `t` (seconds) picks the frame, so the parent controls play and speed.

const N = 8
const XS = Array.from({ length: N }, (_, i) => 120 + i * 40)
const rowY = r => 100 + r * 25
const KT = 2.6 // seconds per knot
const SETUP_T = 7

const clamp = v => Math.max(0, Math.min(1, v))
const ease = v => v * v * (3 - 2 * v)
function shade(hexColor, k) {
  const n = parseInt(hexColor.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * (1 - k)))
  return `rgb(${c.join(',')})`
}

// A small motif already tied above the lesson row, so it looks like a piece in progress.
const MOTIF = [
  ['bg', 'bg', 'bg', 'b', 'b', 'bg', 'bg', 'bg'],
  ['bg', 'bg', 'a', 'a', 'b', 'a', 'bg', 'bg'],
]
export const KNOT_LESSONS = {
  setup: { title: 'Setting up', why: 'The base strings are the columns of the chart. They stay straight and mostly hidden; every bit of color comes from the knots tied around them.' },
  forward: {
    title: 'Forward knot', why: 'Odd rows run left to right. Each base string gets one forward knot, and each knot is one pixel.',
    context: MOTIF, knots: XS.map((_, i) => ({ r: 2, i, c: i > 0 && i < 7 ? 'a' : 'bg', dir: 1 })),
  },
  backward: {
    title: 'Backward knot', why: 'Even rows come back right to left, so the knot is tied as a mirror image. It looks the same from the front.',
    context: [...MOTIF, ['bg', 'a', 'a', 'a', 'a', 'a', 'a', 'bg']], knots: XS.map((_, i) => ({ r: 3, i: N - 1 - i, c: i > 1 && i < 6 ? 'a' : 'bg', dir: -1 })),
  },
  change: {
    title: 'Changing color', why: 'Every color you need has its own thread. The one not in use runs behind the base strings and waits.',
    context: MOTIF,
    knots: XS.map((_, i) => ({ r: 2, i, c: i === 3 || i === 4 ? 'b' : 'bg', dir: 1 })), carry: true,
  },
  turn: {
    title: 'Next row', why: 'At the end of a row the thread turns around. The chart zigzags because the thread does.',
    context: [...MOTIF, ['bg', 'bg', 'bg', 'bg', null, null, null, null]],
    knots: [4, 5, 6, 7].map(i => ({ r: 2, i, c: 'bg', dir: 1 })).concat([7, 6, 5, 4].map(i => ({ r: 3, i, c: 'bg', dir: -1 }))),
  },
}
export const KNOT_ORDER = ['setup', 'forward', 'backward', 'change', 'turn']

export const lessonLength = id => (id === 'setup' ? SETUP_T : KNOT_LESSONS[id].knots.length * KT + 1.4)

// What is happening at time t, in words.
export function knotCaption(id, t) {
  const L = KNOT_LESSONS[id]
  const tt = t % lessonLength(id)
  if (id === 'setup') {
    const p = tt / SETUP_T
    if (p < .35) return ['Cut the base strings', 'One base string for every column of the chart, a good deal longer than the piece will be.']
    if (p < .55) return ['Clip them at the top', 'Line them up side by side under a binder clip, so they hang straight and stay taut.']
    return ['Bring in the first thread', 'The knotting thread starts on the left. It will tie a knot around every base string in turn.']
  }
  const k = Math.floor(tt / KT)
  if (k >= L.knots.length) return ['One row of pixels', 'Each base string now carries one knot. Read the next row of the chart and keep going.']
  const p = (tt - k * KT) / KT
  const K = L.knots[k]
  const prev = L.knots[k - 1]
  if (p < .15) {
    if (prev && prev.r !== K.r) return ['Turn back', 'The row is done. Without cutting anything, the same thread comes back and ties backward knots, right to left.']
    if (L.carry && prev && prev.c !== K.c) return ['Switch threads', 'Let the old color drop behind the base strings. Pick up the thread in the new color and tie with that one.']
    return ['Go to the next base string', 'Bring the working thread over to the next string in the row.']
  }
  if (p < .45) return K.dir > 0
    ? ['Make a “4”', 'Cross the thread over the base string, then loop it behind and up through the gap.']
    : ['Make a mirrored “4”', 'Cross over the base string from the right, loop behind, and come up through the gap.']
  if (p < .55) return ['Pull it up snug', 'Hold the base string taut and slide the loop up to the row above. That’s half a knot.']
  if (p < .85) return ['Again', 'Make exactly the same loop a second time.']
  return ['One knot, one pixel', 'Two half-hitches make one knot. Its color is the pixel on the chart.']
}

function Lump({ x, y, color, dir, s }) {
  if (s <= 0) return null
  return (
    <g transform={`translate(${x} ${y}) rotate(${dir > 0 ? 24 : -24}) scale(${.4 + .6 * s})`} opacity={Math.min(1, s * 1.6)}>
      <ellipse rx="19.5" ry="7.5" fill={color} stroke={shade(color, .32)} strokeWidth="1.2" />
      <path d="M-12 -2.5 Q-2 -7 10 -3.5" stroke="#fff" strokeOpacity=".38" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M-14 2.5 Q0 7 14 1" stroke={shade(color, .25)} strokeOpacity=".5" strokeWidth="1" fill="none" />
    </g>
  )
}
function Knot({ x, y, color, dir, s1 = 1, s2 = 1 }) {
  return (
    <>
      <Lump x={x} y={y - 5.5} color={color} dir={dir} s={s1} />
      <Lump x={x} y={y + 5.5} color={color} dir={dir} s={s2} />
    </>
  )
}

function Wrap({ x, y, dir, color, p }) {
  if (p <= 0 || p >= 1) return null
  // A loop around the base string, drawn on as the thread goes over, behind and through.
  const d = dir > 0
    ? `M${x - 16} ${y - 9} C${x - 2} ${y - 16} ${x + 16} ${y - 8} ${x + 13} ${y + 2} C${x + 10} ${y + 12} ${x - 12} ${y + 10} ${x - 4} ${y - 2}`
    : `M${x + 16} ${y - 9} C${x + 2} ${y - 16} ${x - 16} ${y - 8} ${x - 13} ${y + 2} C${x - 10} ${y + 12} ${x + 12} ${y + 10} ${x + 4} ${y - 2}`
  return <path d={d} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ease(p)} stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" />
}

const Strand = ({ d, color, w = 4.5, ...rest }) => (
  <>
    <path d={d} stroke={shade(color, .22)} strokeWidth={w + 1} fill="none" strokeLinecap="round" {...rest} />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" {...rest} />
    <path d={d} stroke="#ffffff" strokeOpacity=".22" strokeWidth={w * .35} strokeDasharray="3 4" fill="none" strokeLinecap="round" {...rest} />
  </>
)

export default function KnotScene({ lesson, t, colors }) {
  const C = { bg: colors.bg, a: colors.a, b: colors.b }
  const base = '#7a4b2c'
  const L = KNOT_LESSONS[lesson]
  const tt = t % lessonLength(lesson)

  let stringsP = 1, clipY = 0, done = [], current = null, carry = null
  if (lesson === 'setup') {
    const p = tt / SETUP_T
    stringsP = ease(clamp(p / .35))
    clipY = -90 * (1 - ease(clamp((p - .35) / .2)))
    if (p >= .55) current = { K: { r: 0, i: 0, c: 'bg', dir: 1 }, p: clamp((p - .55) / .45), from: [40, rowY(0) + 30] }
  } else {
    L.context.forEach((cells, r) => cells.forEach((c, i) => { if (c) done.push({ r, i, c, dir: r % 2 === 0 ? 1 : -1 }) }))
    const k = Math.floor(tt / KT)
    L.knots.slice(0, Math.min(k, L.knots.length)).forEach(K => done.push(K))
    if (k < L.knots.length) {
      const K = L.knots[k]
      const prev = L.knots[k - 1]
      const from = prev ? [XS[prev.i] + 14 * prev.dir, rowY(prev.r) + 6] : [K.dir > 0 ? XS[0] - 44 : XS[N - 1] + 44, rowY(K.r) + 18]
      current = { K, p: (tt - k * KT) / KT, from }
      if (L.carry) {
        const other = K.c === 'bg' ? 'b' : 'bg'
        carry = { color: C[other], to: XS[K.i] - 18 }
      }
    }
  }

  const cur = current && (() => {
    const { K, p, from } = current
    const x = XS[K.i], y = rowY(K.r), col = C[K.c]
    const reach = ease(clamp(p / .15))
    const tip = [from[0] + (x - 16 * K.dir - from[0]) * reach, from[1] + (y - 9 - from[1]) * reach]
    const half = p < .55 ? clamp((p - .15) / .4) : clamp((p - .55) / .4)
    const pull = ease(clamp((half - .65) / .35))
    const tailX = x + (68 + 38 * pull) * K.dir
    const handY = y + 80 - 100 * pull
    return {
      x, y, col, dir: K.dir, handX: tailX, handY,
      lead: `M${from[0]} ${from[1]} Q${(from[0] + tip[0]) / 2} ${Math.max(from[1], tip[1]) + 10} ${tip[0]} ${tip[1]}`,
      tail: p < .15 ? null : `M${x + 4 * K.dir} ${y + (p < .55 ? -2 : 6)} Q${tailX} ${y + 30} ${tailX} ${handY}`,
      w1: clamp((p - .15) / .3), w2: clamp((p - .55) / .3),
      s1: ease(clamp((p - .45) / .1)), s2: ease(clamp((p - .85) / .1)),
    }
  })()

  return (
    <svg className="pk-scene" viewBox="0 0 520 440" role="img" aria-label={`${L.title}: hands holding the base string and wrapping the working thread on a wooden board`}>
      <defs>
        <HandsShadow />
        <linearGradient id="pk-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6cba4" /><stop offset="1" stopColor="#d2b084" /></linearGradient>
        <linearGradient id="pk-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3f4f5" /><stop offset=".45" stopColor="#b9bec3" /><stop offset=".55" stopColor="#d9dcdf" /><stop offset="1" stopColor="#8d9399" /></linearGradient>
        <filter id="pk-shadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4a3420" floodOpacity=".25" /></filter>
      </defs>
      <rect width="520" height="440" fill="url(#pk-wood)" />
      {[60, 150, 230, 300, 380].map((y, i) => <path key={i} d={`M0 ${y} C130 ${y - 14} 260 ${y + 18} 520 ${y - 6}`} stroke="#a37a48" strokeOpacity=".16" strokeWidth="2" fill="none" />)}

      {/* loose ends of every color, hanging off to the sides as in a real piece */}
      {['bg', 'a', 'b'].map((c, i) => (
        <g key={c} opacity={lesson === 'setup' ? stringsP : 1}>
          <Strand d={`M${XS[0] - 6} ${92 + i * 6} C${50 - i * 8} ${110 + i * 20} ${30 - i * 6} ${200 + i * 40} ${12 + i * 10} 440`} color={C[c]} w={3.5} />
          <Strand d={`M${XS[N - 1] + 6} ${96 + i * 6} C${470 + i * 8} ${120 + i * 26} ${490 + i * 4} ${230 + i * 30} ${506 - i * 8} 440`} color={C[c]} w={3.5} />
        </g>
      ))}

      {carry && <Strand d={`M${XS[0] - 30} ${rowY(2) + 1} L${carry.to} ${rowY(2) + 1}`} color={carry.color} w={3.2} />}

      {XS.map((x, i) => {
        const d = `M${x} 70 L${x + (i - 3.5) * 1.5} 440`
        return (
          <g key={i}>
            <path d={d} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - stringsP} stroke={base} strokeWidth="5" fill="none" />
            {stringsP >= 1 && <path d={d} stroke="#a2714a" strokeWidth="5" strokeDasharray="3 5" fill="none" />}
          </g>
        )
      })}

      {done.map((K, n) => <Knot key={n} x={XS[K.i]} y={rowY(K.r)} color={C[K.c]} dir={K.dir} />)}
      {cur && (
        <>
          <Knot x={cur.x} y={cur.y} color={cur.col} dir={cur.dir} s1={cur.s1} s2={cur.s2} />
          {cur.w1 < 1 && <Wrap x={cur.x} y={cur.y - 5} dir={cur.dir} color={cur.col} p={cur.w1} />}
          {cur.s1 >= 1 && cur.w2 < 1 && <Wrap x={cur.x} y={cur.y + 5} dir={cur.dir} color={cur.col} p={cur.w2} />}
          <Strand d={cur.lead} color={cur.col} w={4} />
          {cur.tail && <Strand d={cur.tail} color={cur.col} w={4} />}
        </>
      )}

      {cur && <>
        <Hand x={cur.x - 8 * cur.dir} y={Math.min(316, cur.y + 116)} mirror={cur.dir > 0} angle={cur.dir * -12} id="scene-hold" />
        <Hand x={cur.handX} y={cur.handY} mirror={cur.dir < 0} angle={cur.dir * 16} id="scene-work" />
      </>}
      <g transform={`translate(0 ${clipY})`} filter="url(#pk-shadow)">
        <path d="M200 44 C200 4 320 4 320 44" stroke="#9aa0a6" strokeWidth="6" fill="none" />
        <path d="M206 44 C206 12 314 12 314 44" stroke="#eef0f2" strokeWidth="2" fill="none" opacity=".7" />
        <rect x="92" y="38" width="336" height="44" rx="9" fill="url(#pk-metal)" stroke="#7d838a" strokeWidth="1.2" />
        <path d="M104 50 H416" stroke="#fff" strokeOpacity=".75" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
