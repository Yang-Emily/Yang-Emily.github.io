// Code → alpha knot chart, and the checks a knotter would make before starting.
//
// The program runs in a throwaway Web Worker, so a slow or endless loop can be stopped
// without freezing the page. It must define `width`, `height` and `colors`, plus either
// `pixel(x, y)` (returns a color key) or `rows` (one character per knot).

const WORKER = `
const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2)
onmessage = event => {
  const started = performance.now()
  try {
    const run = new Function('dist', event.data + '\\n;return {' +
      'width: typeof width === "undefined" ? undefined : width,' +
      'height: typeof height === "undefined" ? undefined : height,' +
      'colors: typeof colors === "undefined" ? undefined : colors,' +
      'rows: typeof rows === "undefined" ? undefined : rows,' +
      'pixel: typeof pixel === "function" ? pixel : undefined }')
    const out = run(dist)
    if (!out.colors || typeof out.colors !== 'object') throw new Error('Define colors, for example const colors = { bg: "#f3eee2", red: "#c54e45" }')
    let { width, height } = out, grid
    if (Array.isArray(out.rows)) {
      height ??= out.rows.length
      width ??= Math.max(0, ...out.rows.map(line => String(line).length))
      grid = out.rows.map(line => [...String(line)])
    } else if (out.pixel) {
      if (!Number.isInteger(width) || !Number.isInteger(height)) throw new Error('Set width and height to whole numbers, for example const width = 16')
      if (width * height > 9000) throw new Error('That is more than 9000 knots. Keep width × height under 9000.')
      grid = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => { const v = out.pixel(x, y); return v == null ? '' : String(v) }))
    } else throw new Error('Define either a function pixel(x, y) or an array rows.')
    const colors = Object.fromEntries(Object.entries(out.colors).map(([k, v]) => [k, String(v)]))
    postMessage({ width, height, colors, grid, ms: performance.now() - started })
  } catch (error) {
    const line = /<anonymous>:(\\d+)/.exec(error.stack || '')
    postMessage({ error: error.message, line: line ? Number(line[1]) - 2 : null })
  }
}`

let workerUrl
export function runPattern(code, timeout = 1000) {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER], { type: 'text/javascript' }))
  const worker = new Worker(workerUrl)
  let timer
  const promise = new Promise(resolve => {
    timer = setTimeout(() => { worker.terminate(); resolve({ error: `Stopped after ${timeout / 1000} s. Is there a loop that never ends?` }) }, timeout)
    worker.onmessage = event => { clearTimeout(timer); worker.terminate(); resolve(event.data) }
    worker.onerror = event => { clearTimeout(timer); worker.terminate(); event.preventDefault(); resolve({ error: event.message?.replace(/^Uncaught /, '') || 'The program could not run.' }) }
    worker.postMessage(code)
  })
  promise.cancel = () => { clearTimeout(timer); worker.terminate() }
  return promise
}

// Rough numbers for embroidery floss on a clip. They are only there to give a feel.
export const MATERIAL = { knotHeight: 0.3, knotWidth: 0.35, perKnot: 1.6, tails: 30 }
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const full = hex => hex.length === 4 ? '#' + [...hex.slice(1)].map(c => c + c).join('') : hex.toLowerCase()

// Each row is worked as runs of one color, in the order the hands meet them.
export const forward = r => r % 2 === 0
export function runsOf(line, r) {
  const order = forward(r) ? line : [...line].reverse()
  const runs = []
  for (const key of order) { const last = runs[runs.length - 1]; if (last && last.key === key) last.n++; else runs.push({ key, n: 1 }) }
  return runs
}

const plural = (n, word, many = word + 's') => `${n} ${n === 1 ? word : many}`
const rowList = rows => rows.length > 4 ? `rows ${rows.slice(0, 3).map(r => r + 1).join(', ')} and ${rows.length - 3} more` : `${rows.length > 1 ? 'rows' : 'row'} ${rows.map(r => r + 1).join(', ')}`

// Returns { chart, checks, verdict, stats }. Each check is { level: ok | warn | fail | note,
// title, text, fix?, cells?: [row, col][], rows?: number[] }.
export function checkPattern(result) {
  const checks = []
  const add = (level, title, text, extra = {}) => checks.push({ level, title, text, ...extra })
  const { width, height, colors, grid } = result
  const keys = Object.keys(colors)
  if (!keys.length) return { checks: [{ level: 'fail', title: 'No colors', text: 'colors is empty, so there is no thread to knot with.' }], verdict: 'fail' }

  // Size: every string needs a knot in every row, so the grid must be a full rectangle.
  const short = grid.map((line, r) => line.length !== width ? r : -1).filter(r => r >= 0)
  if (!Number.isInteger(width) || width < 2 || !Number.isInteger(height) || height < 1) add('fail', 'Size', `width ${width} × height ${height} is not a pattern. You need at least 2 strings and 1 row.`)
  else if (width > 60) add('fail', 'Size', `${width} base strings. A clip or board holds about 60 at most, and the strings tangle long before that.`, { fix: 'Split it into two panels, or lower width.' })
  else if (short.length) add('fail', 'Every row is full', `In alpha knotting each base string gets one knot in every row, so every row must be ${width} long. ${rowList(short)} ${short.length > 1 ? 'are' : 'is'} a different length.`, { rows: short, fix: 'Pad the short rows with the background color.' })
  else if (width > 36) add('warn', 'Size', `${width} strings × ${height} rows. Wider than about 36 strings, a clip gets crowded; pin the strings to a board instead.`)
  else add('ok', 'Size', `${width} strings × ${height} rows, ${width * height} knots.`)

  const bad = Object.entries(colors).filter(([, v]) => !HEX.test(v))
  if (bad.length) add('fail', 'Colors are hex', `${bad.map(([k, v]) => `${k}: "${v}"`).join(', ')} ${bad.length > 1 ? 'are' : 'is'} not a hex color like "#c54e45".`)

  const empty = [], unknown = new Map()
  grid.forEach((line, r) => line.forEach((key, c) => {
    if (key === '' || key === ' ') empty.push([r, c])
    else if (!(key in colors)) { if (!unknown.has(key)) unknown.set(key, []); unknown.get(key).push([r, c]) }
  }))
  if (empty.length) add('fail', 'No gaps', `${plural(empty.length, 'cell')} ${empty.length > 1 ? 'are' : 'is'} empty. There is no "skip" in alpha knotting: the base string would show bare.`, { cells: empty, fix: `Return the background color (${keys[0]}) instead of nothing.` })
  for (const [key, cells] of unknown) add('fail', 'Every color exists', `"${key}" is used ${plural(cells.length, 'time')} but is not in colors, so there is no thread for it.`, { cells, fix: `Add ${/^\w+$/.test(key) ? key : `'${key}'`}: '#…' to colors, or use one of ${keys.join(', ')}.` })
  if (!checks.some(c => c.level === 'fail') && !unknown.size && !empty.length) add('ok', 'Every cell has a thread', `Each cell names one of ${plural(keys.length, 'color')}.`)
  if (checks.some(c => c.level === 'fail')) return { checks, verdict: 'fail' }

  // Threads per row: the colors not in use ride inside the knots, so each extra color
  // makes the row thicker and harder to cover.
  const perRow = grid.map(line => new Set(line).size)
  const heavy = perRow.map((n, r) => n >= 5 ? r : -1).filter(r => r >= 0)
  const bulky = perRow.map((n, r) => n === 4 ? r : -1).filter(r => r >= 0)
  const most = Math.max(...perRow)
  if (heavy.length) add('fail', 'Threads per row', `${rowList(heavy)} ${heavy.length > 1 ? 'use' : 'uses'} ${Math.max(...heavy.map(r => perRow[r]))} colors. The threads you aren't knotting with ride inside every knot, and with 4 or more inside, the knots can't cover them.`, { rows: heavy, fix: 'Keep each row to 3 colors, ideally. If you have stripes, try running them across the rows instead.' })
  else if (bulky.length) add('warn', 'Threads per row', `${rowList(bulky)} ${bulky.length > 1 ? 'use' : 'uses'} 4 colors, so 3 threads ride inside each knot there. It works, but those rows come out thick and stiff.`, { rows: bulky, fix: 'Try to keep each row to 3 colors.' })
  else add('ok', 'Threads per row', most === 1 ? 'One color per row, so nothing rides inside the knots.' : `At most ${plural(most, 'color')} in a row, so no more than ${plural(most - 1, 'thread')} ${most - 1 === 1 ? 'rides' : 'ride'} inside a knot.`)

  // Switching: every change of color is a pause to swap threads.
  const switches = grid.map((line, r) => runsOf(line, r).length - 1)
  const busy = switches.map((n, r) => n > width * 0.6 ? r : -1).filter(r => r >= 0)
  if (busy.length) add('warn', 'Color changes', `${rowList(busy)} ${busy.length > 1 ? 'switch' : 'switches'} thread more than every other knot. That is slow, and the carried threads tend to peek through.`, { rows: busy, fix: 'Bigger blocks of one color knot faster and look cleaner.' })
  else add('ok', 'Color changes', Math.max(...switches) === 0 ? 'No color changes inside a row.' : `At most ${plural(Math.max(...switches), 'switch', 'switches')} in a row.`)

  // Long breaks: a color that disappears for many rows is either carried (bulk) or cut and tied in again.
  const gaps = []
  keys.forEach((key, i) => {
    if (i === 0) return
    const used = grid.map(line => line.includes(key))
    let last = -1
    used.forEach((u, r) => { if (u) { if (last >= 0 && r - last - 1 >= 8) gaps.push({ key, from: last + 1, to: r - 1 }); last = r } })
  })
  if (gaps.length) add('note', 'Long breaks', gaps.map(g => `${g.key} is not used in rows ${g.from + 1}–${g.to + 1}`).join('; ') + '. Either carry it inside the knots for those rows, or cut it and tie it in again later.', { rows: gaps.flatMap(g => Array.from({ length: g.to - g.from + 1 }, (_, i) => g.from + i)) })

  // Lone knots: a single knot of a color reads as a dot. Fine for an eye, easy to lose otherwise.
  const lone = []
  grid.forEach((line, r) => line.forEach((key, c) => {
    if (key === keys[0]) return
    const same = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([y, x]) => grid[y]?.[x] === key)
    if (!same) lone.push([r, c])
  }))
  if (lone.length) add('note', 'Lone knots', `${plural(lone.length, 'knot')} ${lone.length > 1 ? 'stand' : 'stands'} alone in ${lone.length > 1 ? 'their' : 'its'} color. One knot shows as a small dot, which is right for an eye and easy to lose anywhere else.`, { cells: lone })

  const used = new Set(grid.flat())
  const unused = keys.filter(k => !used.has(k))
  if (unused.length) add('note', 'Unused colors', `${unused.join(', ')} ${unused.length > 1 ? 'are' : 'is'} defined but never knotted. You don't need ${unused.length > 1 ? 'those threads' : 'that thread'}.`)
  if (used.size === 1) add('warn', 'One color', 'Every knot is the same color, so there is no picture yet.')
  add('note', 'Knots are wider than tall', 'A knot is a little wider than it is tall, so a round shape comes out slightly wide. "As knotted" shows the real proportions.')

  // Materials, for the shopping list.
  const order = keys.filter(k => used.has(k))
  const knots = Object.fromEntries(order.map(k => [k, 0]))
  grid.flat().forEach(k => { knots[k]++ })
  const thread = Object.fromEntries(order.map(k => [k, Math.round((knots[k] * MATERIAL.perKnot + MATERIAL.tails) / 10) * 10]))
  const base = Math.round(height * MATERIAL.knotHeight + MATERIAL.tails * 2)
  const stats = { knots, thread, base, size: [+(width * MATERIAL.knotWidth).toFixed(1), +(height * MATERIAL.knotHeight).toFixed(1)] }

  const index = Object.fromEntries(order.map((k, i) => [k, i]))
  const chart = { W: width, H: height, palette: order.map(k => full(colors[k])), names: order, grid: grid.map(line => line.map(k => index[k])) }
  const verdict = checks.some(c => c.level === 'fail') ? 'fail' : checks.some(c => c.level === 'warn') ? 'warn' : 'ok'
  return { chart, checks, verdict, stats }
}

export const EXAMPLES = [
  { id: 'heart', name: 'Heart', code: `// 15 base strings, 13 rows of knots.
const width = 15
const height = 13

// The first color is the background.
const colors = {
  bg:  '#f3eee2',
  red: '#c54e45',
}

// Runs once for every knot.
// x: base string, 0 is the left.
// y: row, 0 is the top.
function pixel(x, y) {
  const u = (x - 7) / 6
  const v = 1.25 - y * 0.19
  const a = u*u + v*v - 1
  const inside = a**3 - u*u * v**3 < 0
  return inside ? 'red' : 'bg'
}
` },
  { id: 'text', name: 'Draw with text', code: `// Or draw the chart as text:
// one character per knot,
// one string per row.
const colors = {
  '.': '#f3eee2',   // background
  'o': '#5c7a9c',   // blue
  'y': '#e0b14a',   // yellow
}

const rows = [
  'ooooooooooooooooo',
  '.................',
  '..yyy..yyy..y.y..',
  '..y....y.y..y.y..',
  '..y....yyy...y...',
  '..y....y.y...y...',
  '..yyy..y.y...y...',
  '.................',
  'ooooooooooooooooo',
]
` },
  { id: 'checks', name: 'Checkerboard', code: `const width = 12
const height = 12

const colors = {
  cream: '#f3eee2',
  green: '#526c46',
}

// A color change on every knot.
// It can be knotted, but read
// what the checker says.
function pixel(x, y) {
  return (x + y) % 2 === 0 ? 'green' : 'cream'
}
` },
  { id: 'rainbow', name: 'Rainbow (fails)', code: `const width = 12
const height = 12

const colors = {
  bg:     '#f3eee2',
  red:    '#c54e45',
  orange: '#e08a3c',
  yellow: '#e0b14a',
  green:  '#6f8f55',
  blue:   '#5c7a9c',
}

// Vertical stripes put all six
// colors in every row.
// Try y instead of x below.
function pixel(x, y) {
  const band = Math.floor(x / 2)
  return Object.keys(colors)[band]
}
` },
]
