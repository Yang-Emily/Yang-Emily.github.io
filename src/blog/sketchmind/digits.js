// A tiny handwritten-digit reader for the blog. The real tool asks a vision-language
// model; here a $P point-cloud matcher against a few hand-made templates makes a guess,
// and the reader can tap a number to correct it.

const N = 32

// Templates in a 100 x 140 box; each digit is one or more strokes.
const TEMPLATES = {
  1: [[[[50, 10], [50, 130]]], [[[32, 32], [50, 10], [50, 130]]]],
  2: [[[[20, 40], [32, 14], [60, 8], [84, 28], [80, 58], [20, 130], [90, 130]]]],
  3: [
    [[[20, 20], [50, 8], [80, 24], [76, 54], [46, 68], [80, 84], [86, 110], [56, 132], [20, 120]]],
    [[[20, 12], [82, 12], [46, 62], [80, 82], [84, 112], [54, 132], [20, 120]]],
  ],
  4: [
    [[[60, 10], [14, 92], [90, 92]], [[66, 40], [66, 135]]],
    [[[24, 10], [20, 82], [86, 82]], [[70, 18], [70, 135]]],
  ],
  5: [
    [[[82, 10], [30, 10], [26, 62], [60, 54], [86, 80], [76, 120], [46, 132], [18, 118]]],
    [[[30, 10], [26, 62], [60, 54], [86, 80], [76, 120], [46, 132], [18, 118]], [[30, 10], [84, 10]]],
  ],
  6: [[[[76, 10], [42, 38], [22, 88], [34, 128], [64, 132], [82, 106], [70, 80], [40, 78], [24, 96]]]],
  7: [
    [[[14, 12], [86, 12], [44, 135]]],
    [[[14, 12], [86, 12], [44, 135]], [[34, 72], [76, 72]]],
  ],
  8: [[[[76, 26], [50, 8], [24, 26], [34, 56], [66, 80], [80, 110], [50, 132], [22, 110], [34, 80], [66, 56], [76, 26]]]],
  9: [
    [[[80, 40], [62, 12], [30, 14], [22, 44], [46, 64], [78, 46], [80, 40], [76, 135]]],
    [[[80, 30], [56, 10], [26, 22], [28, 56], [60, 62], [82, 36]], [[82, 30], [78, 135]]],
  ],
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

function resample(strokes) {
  const pts = strokes.flatMap((s, id) => s.map(p => ({ x: p.x, y: p.y, id })))
  let length = 0
  for (let k = 1; k < pts.length; k++) if (pts[k].id === pts[k - 1].id) length += dist(pts[k - 1], pts[k])
  const step = length / (N - 1) || 1
  const out = [pts[0]]
  let acc = 0
  for (let k = 1; k < pts.length; k++) {
    if (pts[k].id !== pts[k - 1].id) continue
    let prev = pts[k - 1]
    let d = dist(prev, pts[k])
    while (acc + d >= step && out.length < N) {
      const t = (step - acc) / d
      const q = { x: prev.x + t * (pts[k].x - prev.x), y: prev.y + t * (pts[k].y - prev.y), id: pts[k].id }
      out.push(q)
      d = dist(q, pts[k])
      prev = q
      acc = 0
    }
    acc += d
  }
  while (out.length < N) out.push(pts[pts.length - 1])
  return out
}

function normalize(strokes) {
  const pts = resample(strokes)
  const xs = pts.map(p => p.x)
  const ys = pts.map(p => p.y)
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1
  const cx = xs.reduce((a, b) => a + b, 0) / N
  const cy = ys.reduce((a, b) => a + b, 0) / N
  return pts.map(p => ({ x: (p.x - cx) / size, y: (p.y - cy) / size }))
}

function cloudDistance(a, b, start) {
  const matched = new Array(N).fill(false)
  let sum = 0
  let i = start
  do {
    let best = Infinity
    let index = -1
    for (let j = 0; j < N; j++) {
      if (matched[j]) continue
      const d = dist(a[i], b[j])
      if (d < best) { best = d; index = j }
    }
    matched[index] = true
    sum += (1 - ((i - start + N) % N) / N) * best
    i = (i + 1) % N
  } while (i !== start)
  return sum
}

const greedy = (a, b) => {
  const stepBy = Math.floor(Math.sqrt(N))
  let best = Infinity
  for (let i = 0; i < N; i += stepBy) best = Math.min(best, cloudDistance(a, b, i), cloudDistance(b, a, i))
  return best
}

const CLOUDS = Object.entries(TEMPLATES).flatMap(([digit, variants]) =>
  variants.map(strokes => ({ digit: +digit, cloud: normalize(strokes.map(s => s.map(([x, y]) => ({ x, y })))) })),
)

export function readDigit(strokes) {
  const cloud = normalize(strokes)
  // A tall, thin mark is almost always a 1.
  const xs = strokes.flat().map(p => p.x)
  const ys = strokes.flat().map(p => p.y)
  if ((Math.max(...xs) - Math.min(...xs)) < 0.28 * (Math.max(...ys) - Math.min(...ys))) return 1
  let best = { digit: 1, score: Infinity }
  for (const t of CLOUDS) {
    const score = greedy(cloud, t.cloud)
    if (score < best.score) best = { digit: t.digit, score }
  }
  return best.digit
}

// Unlike the number-only reader, arbitrary-shape input needs a rejection path.
// A circle can mean a bubble or zero, so leave simple closed outlines as shapes.
function simplifyStroke(points, tolerance) {
  if (points.length < 3) return points
  const first = points[0], last = points[points.length - 1]
  const dx = last.x - first.x, dy = last.y - first.y
  const length = dx * dx + dy * dy
  let furthest = 0, at = 0
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    const t = length ? Math.max(0, Math.min(1, ((p.x - first.x) * dx + (p.y - first.y) * dy) / length)) : 0
    const d = Math.hypot(p.x - first.x - t * dx, p.y - first.y - t * dy)
    if (d > furthest) { furthest = d; at = i }
  }
  return furthest <= tolerance ? [first, last] : [...simplifyStroke(points.slice(0, at + 1), tolerance).slice(0, -1), ...simplifyStroke(points.slice(at), tolerance)]
}

function sharpCorners(strokes, size) {
  return strokes.reduce((count, stroke) => {
    const points = simplifyStroke(stroke, size * .045)
    const closed = points.length > 3 && dist(points[0], points[points.length - 1]) < size * .15
    if (closed) points.pop()
    for (let i = closed ? 0 : 1; i < points.length - (closed ? 0 : 1); i++) {
      const a = points[(i + points.length - 1) % points.length], b = points[i], c = points[(i + 1) % points.length]
      const first = dist(a, b), second = dist(b, c)
      if (first < size * .08 || second < size * .08) continue
      const cosine = ((b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y)) / (first * second)
      if (cosine < .5) count++
    }
    return count
  }, 0)
}

export function recognizeDigit(strokes) {
  const points = strokes.flat()
  if (!points.length) return null
  const xs = points.map(p => p.x), ys = points.map(p => p.y)
  const width = Math.max(...xs) - Math.min(...xs)
  const height = Math.max(...ys) - Math.min(...ys)
  if (height < 12) return null
  if (strokes.length === 1) {
    const area = Math.abs(points.reduce((sum, point, i) => {
      const next = points[(i + 1) % points.length]
      return sum + point.x * next.y - next.x * point.y
    }, 0)) / 2
    if (dist(points[0], points[points.length - 1]) < Math.max(width, height) * .25 && area > width * height * .55) return null
  }
  if (width < height * .28 && strokes.length === 1) {
    const length = points.slice(1).reduce((sum, point, i) => sum + dist(points[i], point), 0)
    if (dist(points[0], points[points.length - 1]) > length * .75) return 1
  }
  const cloud = normalize(strokes)
  const scores = new Map()
  for (const template of CLOUDS) {
    const score = greedy(cloud, template.cloud)
    scores.set(template.digit, Math.min(scores.get(template.digit) ?? Infinity, score))
  }
  const ranked = [...scores].sort((a, b) => a[1] - b[1])
  const [digit, score] = ranked[0]
  // Repeated corners make a loose match unreliable for stars and scribbles.
  // Keep very close digit matches, including handwritten 8 and 9.
  if (score > .3 && sharpCorners(strokes, Math.max(width, height)) >= 5) return null
  return score < 1.65 && (ranked[1][1] - score > .2 || score < .65) ? digit : null
}

// Groups strokes into numbers by horizontal overlap, left to right.
export function groupStrokes(strokes, gap = 14) {
  const boxes = strokes
    .map(s => ({ s: [s], lo: Math.min(...s.map(p => p.x)), hi: Math.max(...s.map(p => p.x)) }))
    .sort((a, b) => a.lo - b.lo)
  const groups = []
  for (const b of boxes) {
    const last = groups[groups.length - 1]
    if (last && b.lo <= last.hi + gap) {
      last.s.push(...b.s)
      last.hi = Math.max(last.hi, b.hi)
    } else {
      groups.push({ ...b })
    }
  }
  return groups.map(g => ({ strokes: g.s, lo: g.lo, hi: g.hi, cx: (g.lo + g.hi) / 2 }))
}
