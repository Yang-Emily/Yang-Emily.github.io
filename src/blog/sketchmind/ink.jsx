// Hand-drawn helpers: seeded wobble so a line looks the same on every render.

export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5
    return ((s >>> 0) % 10000) / 10000
  }
}

// Smooth path through points (quadratic curves via midpoints).
export function smooth(pts) {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let k = 1; k < pts.length - 1; k++) {
    const mx = (pts[k].x + pts[k + 1].x) / 2
    const my = (pts[k].y + pts[k + 1].y) / 2
    d += ` Q${pts[k].x.toFixed(1)} ${pts[k].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
  }
  const last = pts[pts.length - 1]
  return d + ` L${last.x.toFixed(1)} ${last.y.toFixed(1)}`
}

export function wobbleLine(x1, y1, x2, y2, seed = 1, amp = 1.4) {
  const r = rng(seed)
  const n = Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 16))
  const pts = Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n
    const j = k === 0 || k === n ? 0.4 : 1
    return { x: x1 + (x2 - x1) * t + (r() - 0.5) * amp * j, y: y1 + (y2 - y1) * t + (r() - 0.5) * amp * 2 * j }
  })
  return smooth(pts)
}

// A loop that doesn't quite close, like a circle drawn around a number.
export function wobbleLoop(cx, cy, rx, ry, seed = 1) {
  const r = rng(seed)
  const start = r() * Math.PI * 2
  const pts = Array.from({ length: 15 }, (_, k) => {
    const a = start + (k / 13) * Math.PI * 2.1
    const f = 1 + (r() - 0.5) * 0.12
    return { x: cx + Math.cos(a) * rx * f, y: cy + Math.sin(a) * ry * f }
  })
  return smooth(pts)
}

export function wobbleBox(x, y, w, h, seed = 1) {
  return [
    wobbleLine(x, y, x + w, y, seed),
    wobbleLine(x + w, y, x + w, y + h, seed + 1),
    wobbleLine(x + w, y + h, x, y + h, seed + 2),
    wobbleLine(x, y + h, x, y, seed + 3),
  ].join(' ')
}

export const Ink = ({ d, color = 'currentColor', width = 2.2, ...rest }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" {...rest} />
)

// Inline circled number for running text.
export function Circled({ children, color = '#e03131', seed = 3 }) {
  return (
    <span className="sk-circled">
      {children}
      <svg viewBox="0 0 40 40" aria-hidden="true"><Ink d={wobbleLoop(20, 21, 17, 15, seed)} color={color} width={1.8} /></svg>
    </span>
  )
}

export function toSvgPoint(svg, e) {
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(svg.getScreenCTM().inverse())
  return { x: p.x, y: p.y }
}
