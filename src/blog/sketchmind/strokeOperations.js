export const STROKE_SLOTS = [95, 200, 305, 410]

// Like the real canvas, use spatial bands around each array position rather
// than treating a stroke's entire horizontal bounding box as a selection.
export function strokeOperands(points, slots = STROKE_SLOTS) {
  const touched = []
  const visit = ({ x, y }) => {
    if (y < 32 || y > 170) return
    const i = slots.findIndex((center, index) => {
      const left = index === 0 ? center - 45 : (slots[index - 1] + center) / 2
      const right = index === slots.length - 1 ? center + 45 : (center + slots[index + 1]) / 2
      return x >= left && x <= right
    })
    if (i >= 0 && !touched.includes(i) && touched.length < 2) touched.push(i)
  }
  points.forEach((point, index) => {
    if (index) {
      const previous = points[index - 1]
      const samples = Math.max(1, Math.ceil(Math.hypot(point.x - previous.x, point.y - previous.y) / 5))
      for (let k = 1; k < samples; k++) visit({ x: previous.x + (point.x - previous.x) * k / samples, y: previous.y + (point.y - previous.y) * k / samples })
    }
    visit(point)
  })
  return touched.length === 2 ? touched.sort((a, b) => a - b) : null
}

export function executeStroke(values, pen, pair) {
  const [i, j] = pair
  const result = [...values]
  const comparison = values[i] > values[j]
  if (pen === 'swap') [result[i], result[j]] = [result[j], result[i]]
  return { values: result, comparison, label: pen === 'compare' ? `is_bigger(${values[i]},${values[j]}) → ${comparison ? 'True' : 'False'}` : `swap(${values[i]},${values[j]})` }
}
