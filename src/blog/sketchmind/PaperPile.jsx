import { useState } from 'react'
import { PLANS, run } from './bubble'
import { Ink, wobbleLine, rng } from './ink'

const START = [5, 2, 4, 3, 1]
const STEPS = PLANS.full.steps(START.length)
const { outcomes, states } = run(START, STEPS)
const ROW = 46

// Rebuild what the page looks like after `done` steps of tracing by hand.
function page(done) {
  const rows = [{ values: START, notes: [] }]
  for (let k = 0; k < done; k++) {
    const [i, j] = STEPS[k]
    const row = rows[rows.length - 1]
    const a = row.values[i]
    const b = row.values[j]
    row.notes.push({ i, j, text: outcomes[k] ? `${a}>${b} swap` : `${a}<${b}` })
    if (outcomes[k]) rows.push({ values: states[k + 1], notes: [] })
  }
  return rows
}

export default function PaperPile() {
  const [done, setDone] = useState(0)
  const finished = done === STEPS.length
  const rows = page(done)
  const height = 40 + rows.length * ROW + 30

  const next = () => setDone(d => (d === STEPS.length ? 0 : d + 1))

  return (
    <figure className="sk-widget sk-paper" onClick={next}>
      <svg viewBox={`0 0 440 ${height}`} style={{ maxWidth: 440 }} role="button" aria-label="Trace the next step by hand">
        {rows.map((row, r) => {
          const jitter = rng(r + 7)
          const x0 = 26 + (jitter() - 0.5) * 10
          const y = 50 + r * ROW
          const last = row.notes[row.notes.length - 1]
          return (
            <g key={r} transform={`rotate(${(jitter() - 0.5) * 1.6} 120 ${y})`}>
              {row.values.map((v, i) => (
                <text key={i} x={x0 + i * 34} y={y} className="sk-hand" fontSize="32">{v}</text>
              ))}
              {last && (
                <>
                  <Ink d={wobbleLine(x0 + last.i * 34 - 4, y + 8, x0 + last.j * 34 + 20, y + 8, r * 13 + row.notes.length)} color="#6d6a63" width={1.6} />
                  <text x={x0 + 186} y={y - 2} className="sk-hand" fontSize="21" fill="#8a857a">
                    {row.notes.map(n => n.text).join(',  ')}
                  </text>
                </>
              )}
            </g>
          )
        })}
        <text x="26" y={height - 12} className="sk-hand sk-hint" fontSize="20">
          {finished
            ? `sorted. ${rows.length} copies of five numbers. (tap to start over)`
            : done === 0 ? 'tap to trace the next step →' : `step ${done} of ${STEPS.length} · tap again`}
        </text>
      </svg>
    </figure>
  )
}
