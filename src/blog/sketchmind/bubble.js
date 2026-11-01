// Small, dependency-free model of the SketchMind bubble-sort world.
// A plan is a list of compare_and_swap steps on index pairs [i, i + 1].

export const PEN = {
  data: '#4a4a4a',
  compare: '#e8862a',
  swap: '#8e5bd6',
  user: '#2b8a3e',
  loop: '#1c7ed6',
  bad: '#e03131',
}

export const pass = (n, last = n - 1) =>
  Array.from({ length: last }, (_, i) => [i, i + 1])

export const PLANS = {
  one: { label: 'one pass', steps: n => pass(n) },
  two: { label: 'two passes', steps: n => [...pass(n), ...pass(n, n - 2)] },
  full: {
    label: 'full bubble sort',
    steps: n => Array.from({ length: n - 1 }, (_, k) => pass(n, n - 1 - k)).flat(),
  },
}

// Replays a plan; returns every intermediate array and each comparison outcome.
export function run(input, steps) {
  const arr = [...input]
  const outcomes = []
  const states = [[...arr]]
  for (const [i, j] of steps) {
    const bigger = arr[i] > arr[j]
    outcomes.push(bigger)
    if (bigger) [arr[i], arr[j]] = [arr[j], arr[i]]
    states.push([...arr])
  }
  return { result: arr, outcomes, states }
}

export const isSorted = a => a.every((v, i) => i === 0 || a[i - 1] <= v)

export const firstDisorder = a => a.findIndex((v, i) => i > 0 && a[i - 1] > v)

// Every array of distinct digits 1..9 with the given length.
function* distinctArrays(n, used = new Set(), prefix = []) {
  if (prefix.length === n) { yield prefix; return }
  for (let v = 1; v <= 9; v++) {
    if (used.has(v)) continue
    used.add(v)
    yield* distinctArrays(n, used, [...prefix, v])
    used.delete(v)
  }
}

export function describe(original, candidate, steps) {
  const before = run(original, steps)
  const after = run(candidate, steps)
  const changed = candidate.reduce((c, v, i) => c + (v !== original[i]), 0)
  const delta = candidate.reduce((c, v, i) => c + Math.abs(v - original[i]), 0)
  return {
    input: candidate,
    changed,
    delta,
    keepsSteps: after.outcomes.every((o, k) => o === before.outcomes[k]),
    breaksPlan: !isSorted(after.result),
    result: after.result,
    outcomes: after.outcomes,
  }
}

const byCloseness = (a, b) =>
  a.changed - b.changed ||
  a.delta - b.delta ||
  a.input.reduce((s, v) => s + v, 0) - b.input.reduce((s, v) => s + v, 0)

// Brute-force stand-in for the Z3 query: inputs that keep the learner's
// comparison outcomes, still break the plan, and change as little as possible.
export function findCounterexamples(original, steps, limit = 3, { keepSteps = true } = {}) {
  const found = []
  for (const candidate of distinctArrays(original.length)) {
    const d = describe(original, candidate, steps)
    if ((d.keepsSteps || !keepSteps) && d.breaksPlan) found.push(d)
  }
  return found.sort(byCloseness).slice(0, limit)
}

// A counterexample that ignores the requirements, for contrast.
export function randomCounterexample(original, steps, seed = 1) {
  const all = [...distinctArrays(original.length)]
    .map(c => describe(original, c, steps))
    .filter(d => d.breaksPlan && !d.keepsSteps && d.changed === original.length)
  if (!all.length) return null
  return all[(seed * 7919) % all.length]
}

// Alternative "nearest" counterexamples for the discussion figure.
export function alternatives(original, steps) {
  const change = findCounterexamples(original, steps, 1)[0] ?? null

  const perms = []
  const permute = (rest, acc) => {
    if (!rest.length) { perms.push(acc); return }
    rest.forEach((v, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, v]))
  }
  permute(original, [])
  const reorder = perms
    .map(p => describe(original, p, steps))
    .filter(d => d.keepsSteps && d.breaksPlan)
    .sort(byCloseness)[0] ?? null

  let add = null
  for (let v = 1; v <= 9 && !add; v++) {
    if (original.includes(v)) continue
    const longer = [...original, v]
    const r = run(longer, steps)
    if (!isSorted(r.result)) add = { input: longer, result: r.result, outcomes: r.outcomes, added: v }
  }
  return { change, reorder, add }
}
