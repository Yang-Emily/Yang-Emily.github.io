// Runs in a disposable worker. Commands emit the exact steps used by the simulator.
export function compileKnotProgram(code) {
  const SETUP = 6, KNOT = 16, FINISH = 6
  const moves = [0, .15, .29, .4, .48, .56, .69, .87]
  const labels = ['Hold the base string', 'Cross in front', 'Pass behind', 'Through the loop', 'Tighten first half-hitch', 'Cross again', 'Behind and through again', 'Tighten second half-hitch']
  let width = 0, row = 0, offset = 0, count = 0, current = null, finished = false
  const colors = {}, grid = [], frames = []
  const line = () => {
    const match = /<anonymous>:(\d+):\d+/.exec(new Error().stack || '')
    return match ? Math.max(1, +match[1] - 2) : null
  }
  const emit = (title, time, source, extra = {}) => {
    if (frames.length >= 72000) throw new Error('Keep the program under 9000 knots.')
    frames.push({ title, time, line: source, ...extra })
  }
  const ready = () => { if (!width) throw new Error('Call setup(numberOfBaseStrings) first.'); if (finished) throw new Error('The piece is already finished.') }
  const api = {
    setup(n) {
      if (width) throw new Error('Call setup() only once.')
      if (!Number.isInteger(n) || n < 2 || n > 40) throw new Error('setup() needs 2–40 base strings.')
      width = n; grid.push(Array(width).fill(null)); emit(`Clip ${n} base strings`, 0, line())
    },
    thread(name, color) {
      ready()
      if (typeof name !== 'string' || !name.trim()) throw new Error('Give the thread a name.')
      if (color !== undefined) {
        if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Use a six-digit hex color, such as #c54e45.')
        if (colors[name] && colors[name] !== color) throw new Error(`Thread "${name}" already has a different color.`)
        colors[name] = color
      }
      if (!colors[name]) throw new Error(`Define thread "${name}" with thread("${name}", "#c54e45") first.`)
      const old = current; current = name
      emit(old && old !== name ? `Change thread: ${old} → ${name}` : `Pick up ${name}`, SETUP + count * KNOT + .0001, line())
    },
    forwardKnot() { knot(1, line()) },
    backwardKnot() { knot(-1, line()) },
    turn() {
      ready()
      if (offset !== width) throw new Error(`Finish row ${row + 1} before turning: ${width - offset} base strings still need a knot.`)
      row++; offset = 0; grid.push(Array(width).fill(null))
      emit(`Turn: row ${row + 1}, ${row % 2 ? 'right to left' : 'left to right'}`, SETUP + count * KNOT + .0001, line())
    },
    finish() {
      ready()
      if (offset !== width) throw new Error(`Complete the final row before finish(): ${width - offset} knots missing.`)
      finished = true
      emit('Secure the ends and release the clip', SETUP + count * KNOT + FINISH, line())
    },
  }
  function knot(direction, source) {
    ready()
    if (!current) throw new Error('Pick up a working thread with thread(name, color) before knotting.')
    if (offset >= width) throw new Error('This row is full. Call turn() before the next knot.')
    if (direction !== (row % 2 ? -1 : 1)) throw new Error(`Row ${row + 1} needs ${row % 2 ? 'backwardKnot()' : 'forwardKnot()'}. Mirror both half-hitches after turning.`)
    if (count >= 9000) throw new Error('Keep the program under 9000 knots.')
    const col = row % 2 ? width - 1 - offset : offset
    grid[row][col] = current
    moves.forEach((p, move) => emit(labels[move], SETUP + (count + p) * KNOT + .0001, source, { move, row, col, thread: current }))
    count++; offset++
  }
  try {
    new Function(...Object.keys(api), code)(...Object.values(api))
    if (!width) throw new Error('Start with setup(numberOfBaseStrings).')
    const names = Object.keys(colors)
    if (!names.length) throw new Error('Add at least one thread(name, color).')
    const chart = { W: width, H: grid.length, names, palette: names.map(k => colors[k]), grid: grid.map(r => r.map(k => k === null ? 0 : names.indexOf(k))) }
    return { chart, frames, complete: finished, knots: count, message: finished ? `${count} knots executed. Both half-hitches are recorded for every knot.` : `Program stopped after ${count} knots. Complete each row and call finish() to see a finished piece.` }
  } catch (error) {
    const match = /<anonymous>:(\d+):\d+/.exec(error.stack || '')
    return { error: error.message, line: match ? Math.max(1, +match[1] - 2) : null }
  }
}
let workerUrl
export function runKnotProgram(code) {
  workerUrl ??= URL.createObjectURL(new Blob([`const compile = ${compileKnotProgram.toString()}; onmessage = e => postMessage(compile(e.data));`], { type: 'text/javascript' }))
  const worker = new Worker(workerUrl)
  let timer, resolveResult
  const promise = new Promise(resolve => {
    resolveResult = resolve
    timer = setTimeout(() => { worker.terminate(); resolve({ error: 'Stopped after one second. Check for an endless loop.' }) }, 1000)
    worker.onmessage = e => { clearTimeout(timer); worker.terminate(); resolve(e.data) }
    worker.onerror = e => { clearTimeout(timer); worker.terminate(); e.preventDefault(); resolve({ error: 'The program could not run.' }) }
    worker.postMessage(code)
  })
  promise.cancel = () => { clearTimeout(timer); worker.terminate(); resolveResult({ cancelled: true }) }
  return promise
}
export const KNOT_EXAMPLES = [
  { id: 'heart', name: 'Weave a heart', code: `setup(9)
thread("cream", "#f3eee2")
thread("red", "#c54e45")

// Read the picture, then execute actual knotting moves.
const heart = [
  ".........",
  "..rr.rr..",
  ".rrrrrrr.",
  ".rrrrrrr.",
  "..rrrrr..",
  "...rrr...",
  "....r....",
  ".........",

]
for (let row = 0; row < heart.length; row++) {
  if (row > 0) turn()
  for (let step = 0; step < 9; step++) {
    const col = row % 2 ? 8 - step : step
    thread(heart[row][col] === "r" ? "red" : "cream")
    if (row % 2) backwardKnot()
    else forwardKnot()
  }
}
finish()` },
  { id: 'first', name: 'Two rows', code: `// Each command moves the thread, not just a pixel.
setup(6)
thread("cream", "#f3eee2")

// Six forward double knots: left → right.
for (let string = 0; string < 6; string++) {
  forwardKnot()
}

turn()
thread("orange", "#eea464")

// Same base strings, mirrored knots: right → left.
for (let string = 0; string < 6; string++) {
  backwardKnot()
}
finish()` },
  { id: 'change', name: 'Change color', code: `setup(8)
thread("cream", "#f3eee2")
forwardKnot()
forwardKnot()

// Drop cream behind the work and pick up red.
thread("red", "#c54e45")
for (let i = 0; i < 4; i++) forwardKnot()

thread("cream")
forwardKnot()
forwardKnot()
turn()

for (let i = 0; i < 8; i++) backwardKnot()
finish()` },

]

// Hovering a loop line keeps the current iteration; otherwise use its nearest execution.
export function frameForLine(frames, line, current = 0) {
  if (frames[current]?.line === line) return current
  const candidates = frames.map((f, i) => ({ f, i })).filter(({ f }) => f.line === line && (f.move === undefined || f.move === 0))
  if (!candidates.length) return -1
  return candidates.reduce((best, next) => Math.abs(next.i - current) < Math.abs(best.i - current) ? next : best).i
}
export function frameForKnot(frames, index, width) {
  return frames.findIndex(f => f.move === 0 && f.row * width + (f.row % 2 ? width - 1 - f.col : f.col) === index)
}
