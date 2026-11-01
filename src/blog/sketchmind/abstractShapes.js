export function parseShapeValue(text) {
  if (!/^[+-]?\d+$/.test(text.trim())) return null
  const value = Number(text)
  return Number.isSafeInteger(value) ? value : null
}

const boundsOf = points => ({
  minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)),
  minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)),
})
const distanceSquared = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2
const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
function pointSegmentDistance(p, a, b) {
  const length = distanceSquared(a, b)
  if (!length) return Math.sqrt(distanceSquared(p, a))
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / length))
  return Math.hypot(p.x - a.x - t * (b.x - a.x), p.y - a.y - t * (b.y - a.y))
}
function segmentDistance(a, b, c, d) {
  const abC = cross(a, b, c), abD = cross(a, b, d)
  const cdA = cross(c, d, a), cdB = cross(c, d, b)
  if (((abC > 0 && abD < 0) || (abC < 0 && abD > 0)) &&
      ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0))) return 0
  return Math.min(pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b))
}

export function strokesTouch(first, second, tolerance = 2) {
  if (!first.length || !second.length) return false
  const a = boundsOf(first), b = boundsOf(second)
  if (a.maxX + tolerance < b.minX || b.maxX + tolerance < a.minX || a.maxY + tolerance < b.minY || b.maxY + tolerance < a.minY) return false
  for (let i = 0; i < Math.max(1, first.length - 1); i++) {
    for (let j = 0; j < Math.max(1, second.length - 1); j++) {
      if (segmentDistance(first[i], first[Math.min(i + 1, first.length - 1)], second[j], second[Math.min(j + 1, second.length - 1)]) <= tolerance) return true
    }
  }
  return false
}

function closedContours(strokes) {
  const remaining = strokes.filter(stroke => stroke.length >= 2).map(stroke => [...stroke])
  const contours = []
  while (remaining.length) {
    const chain = remaining.shift()
    while (distanceSquared(chain[0], chain[chain.length - 1]) > 64) {
      const end = chain[chain.length - 1]
      const next = remaining.findIndex(stroke => distanceSquared(end, stroke[0]) <= 64 || distanceSquared(end, stroke[stroke.length - 1]) <= 64)
      if (next < 0) break
      let continuation = remaining.splice(next, 1)[0]
      if (distanceSquared(end, continuation[0]) > distanceSquared(end, continuation[continuation.length - 1])) continuation = continuation.reverse()
      chain.push(...continuation)
    }
    const area = Math.abs(chain.reduce((sum, point, index) => {
      const next = chain[(index + 1) % chain.length]
      return sum + point.x * next.y - next.x * point.y
    }, 0)) / 2
    if (chain.length >= 3 && distanceSquared(chain[0], chain[chain.length - 1]) <= 64 && area >= 16) contours.push(chain)
  }
  return contours
}

function pointInside(point, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j]
    if (pointSegmentDistance(point, a, b) <= 1) return true
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

function containsStrokes(outer, inner) {
  return closedContours(outer).some(polygon => inner.every(stroke => stroke.every(point => pointInside(point, polygon))))
}

export function shapeFromStrokes(strokes, id) {
  const bounds = boundsOf(strokes.flat())
  const w = bounds.maxX - bounds.minX, h = bounds.maxY - bounds.minY
  return {
    id, strokes, bounds,
    cx: bounds.minX + w / 2, cy: bounds.minY + h / 2, size: Math.max(w, h),
    v: Math.min(9, Math.max(1, Math.round(Math.sqrt(w * h) / 13))),
    valueSource: 'size',
  }
}

export function addConnectedStroke(shapes, points, id, maxShapes = 6) {
  if (!points.length) return shapes
  const group = new Set()
  let strokes = [points]
  // Repeat after each merge: the new stroke can complete a contour that now
  // contains other elements, such as eyes drawn before the outline of a face.
  let changed
  do {
    changed = false
    for (const shape of shapes) {
      if (group.has(shape)) continue
      // Two completed outlines must actually meet, rather than merging because
      // their edges happen to be nearby. Open strokes retain a small pen-width tolerance.
      const tolerance = closedContours(shape.strokes).length && closedContours(strokes).length ? .25 : 2
      if (shape.strokes.some(first => strokes.some(second => strokesTouch(first, second, tolerance))) ||
          containsStrokes(strokes, shape.strokes) || containsStrokes(shape.strokes, strokes)) {
        group.add(shape)
        strokes = [...shapes.filter(item => group.has(item)).flatMap(item => item.strokes), points]
        changed = true
      }
    }
  } while (changed)
  const connected = shapes.filter(shape => group.has(shape))
  if (!connected.length) return shapes.length >= maxShapes ? shapes : [...shapes, shapeFromStrokes([points], id)]
  const combined = shapeFromStrokes(strokes, connected[0].id)
  const edited = connected.find(shape => shape.manualValue)
  if (edited) { combined.v = edited.v; combined.manualValue = true }
  // A new stroke may join two previously independent elements into one.
  return shapes.flatMap(shape => shape === connected[0] ? [combined] : connected.includes(shape) ? [] : [shape])
}
