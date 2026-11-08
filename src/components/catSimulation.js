import catPattern from './catPattern.json'

// Pixel chart sampled from the supplied orange walking cat, not a substitute motif.
export const CAT = catPattern
export const SETUP = 6
export const KNOT_TIME = 16
export const FINISH = 6
export const TOTAL_KNOTS = CAT.W * CAT.H
export const DURATION = SETUP + TOTAL_KNOTS * KNOT_TIME + FINISH
export const knotIndex = (r, c, chart = CAT) => r * chart.W + (r % 2 ? chart.W - 1 - c : c)
export function simulationAt(time, chart = CAT) {
  const total = chart.W * chart.H
  const duration = SETUP + total * KNOT_TIME + FINISH
  const safe = Math.max(0, Math.min(duration, time))
  const count = Math.min(total, Math.max(0, Math.floor((safe - SETUP) / KNOT_TIME)))
  const index = Math.min(total - 1, count)
  const row = Math.floor(index / chart.W), offset = index % chart.W
  const col = row % 2 ? chart.W - 1 - offset : offset
  const prev = Math.max(0, index - 1), pr = Math.floor(prev / chart.W), pc = pr % 2 ? chart.W - 1 - prev % chart.W : prev % chart.W
  const color = chart.grid[row][col], oldColor = chart.grid[pr][pc]
  const phase = safe < SETUP ? 'setup' : count === total ? (safe === duration ? 'done' : 'finish') : 'knot'
  const p = phase === 'knot' ? ((safe - SETUP) / KNOT_TIME) % 1 : 0
  const change = index > 0 && color !== oldColor
  let title = 'Secure the base strings', detail = `Clip ${chart.W} base strings side by side. Prepare working threads in ${chart.palette.length} colors.`
  if (phase === 'knot') {
    if (p < .15) { title = change ? 'Change the working thread' : offset === 0 && row > 0 ? 'Turn and start the next row' : 'Move to the next base string'; detail = change ? 'Leave the old color behind the work. Pick up the new color shown in this chart cell.' : `Row ${row + 1}: ${row % 2 ? 'right to left, using backward knots.' : 'left to right, using forward knots.'}` }
    else if (p < .45) { title = 'Make the first loop'; detail = 'Cross the working thread in front, pass behind the base string, then come through the loop.' }
    else if (p < .55) { title = 'Tighten the first half-hitch'; detail = 'Keep the base string taut with your other hand and slide the loop upward.' }
    else if (p < .85) { title = 'Make the second loop'; detail = 'Repeat in the same direction. Two half-hitches make one pixel.' }
    else { title = 'Tighten to finish one pixel'; detail = 'Snug the second half-hitch against the first to finish the pixel, then move to the next base string.' }
  } else if (phase === 'finish') { title = 'Finish and tidy the fringe'; detail = 'The pattern is finished. Secure the base strings in groups, tidy the ends, then release the clip.' }
  else if (phase === 'done') { title = 'Your pattern is finished'; detail = `${total} knots, from the first string to the final row. Scrub the timeline to revisit any part.` }
  return { time: safe, count, index, row, col, color, oldColor, phase, p, change, title, detail }
}

// SVG chart coordinates: circles are centred at (15 + col*10, 12 + row*10).
export function chartCellAt(x, y, chart = CAT) {
  const col = Math.max(0, Math.min(chart.W - 1, Math.floor((x - 10) / 10)))
  const row = Math.max(0, Math.min(chart.H - 1, Math.floor((y - 7) / 10)))
  return { row, col, index: knotIndex(row, col, chart) }
}
