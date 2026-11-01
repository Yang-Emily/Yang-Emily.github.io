import { useEffect, useState } from 'react'
import { DOODLES } from './doodles'
import { TOOL } from './ui'

const asset = name => `${import.meta.env.BASE_URL}blog/sketchmind/${name}`

// Ticks every `ms` while mounted; used for the small looping demos.
function useTick(ms, n) {
  const [k, setK] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setK(v => (v + 1) % n), ms)
    return () => clearInterval(id)
  }, [ms, n])
  return k
}

const PAGES = [
  { tag: 'a', title: 'Unnoticed errors', shots: [
    ['a1.jpg', 'P01', 'P01 marked 8 < 5 as a comparison result.'],
    ['a2.jpg', 'P04', 'P04 wrote the pair 1,5 where the adjacent values were 4,5.'],
    ['a3.jpg', 'P15', 'P15 rewrote 214 as 421 after a flip. The error remained in the trace.'],
  ] },
  { tag: 'b', title: 'Skipped steps', note: 'P08 used an arrow for the rounds left undrawn; E04 marked omissions with a vertical bar.', shots: [['b.jpg', 'P08, E04']] },
  { tag: 'c', title: 'Drawing a flip', note: 'P08 connected values with lines to track a flip. P14 used geometric shapes to distinguish parts of the segment.', shots: [['c.jpg', 'P08, P14']] },
  { tag: 'd', title: 'Unspecified loops', note: 'P07 wrote “for” without iteration bounds. P10 mostly recorded value sequences, with few marks explaining their structure.', shots: [['d.jpg', 'P07, P10']] },
  { tag: 'e', title: 'Different notations', note: 'E01 drew array positions without concrete values. P11 wrote several rounds; P03 drew one swap. P13 used bubbles whose sizes represented values.', shots: [['e.jpg', 'P11, E01, P13, P03']] },
]

// A small notebook of participants' paper sketches; it flips by itself until you pick a page.
export function PaperNotebook({ onNoteChange }) {
  const [page, setPage] = useState(0)
  const [held, setHeld] = useState(false)
  const [shot, setShot] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => {
      if (shot + 1 < PAGES[page].shots.length) setShot(shot + 1)
      else {
        setShot(0)
        if (!held) setPage((page + 1) % PAGES.length)
      }
    }, 2600)
    return () => clearTimeout(id)
  }, [page, shot, held])

  const p = PAGES[page]
  const [src, who, detail] = p.shots[shot] ?? p.shots[0]
  const note = detail ?? p.note
  useEffect(() => { onNoteChange?.({ text: note, who }) }, [note, who, onNoteChange])
  return (
    <figure className="sk-notebook">
      <div className="tabs">
        {PAGES.map((q, k) => (
          <button key={q.tag} type="button" className={k === page ? 'on' : ''} onClick={() => { setPage(k); setShot(0); setHeld(true) }}>
            <b>({q.tag})</b> {q.title}
          </button>
        ))}
      </div>
      <div className="page" key={`${page}-${shot}`}>
        <img src={asset(src)} alt={`${p.title}, a paper sketch by ${who}`} />
      </div>
    </figure>
  )
}

function MergeLoop() {
  return (
    <div className="sk-vis merge">
      <span className="chip cmp">compare</span>
      <span className="plus">+</span>
      <span className="chip swp">swap</span>
      <span className="chip usr">✎ compare_and_swap</span>
    </div>
  )
}

function LevelsLoop() {
  const k = useTick(1400, 3)
  const rows = [['value', '3 1 7 4'], ['index', 'a0 a1 a2 a3'], ['parameter', 'a[i], a[i+1]']]
  return (
    <div className="sk-vis levels">
      {rows.map(([l, v], i) => (
        <span key={l} className={i === k ? 'on' : ''}><i>{l}</i><code>{v}</code></span>
      ))}
    </div>
  )
}

function CounterLoop() {
  const k = useTick(1600, 2)
  return (
    <div className="sk-vis cex">
      <span className="rw"><code>[3,1,4,2]</code><em style={{ color: TOOL.ok }}>✓ plan succeeds</em></span>
      <span className="ar">↓</span>
      <span className={`rw ${k ? 'flash' : ''}`}><code>[3,<b>2</b>,4,<b>1</b>]</code><em style={{ color: TOOL.bad }}>✗ plan fails</em></span>
    </div>
  )
}

const THEMES = [
  { title: 'Following a flip', vis: <img className="sk-vis gif" src={asset('flip-max.gif')} alt="SketchMind reverses the whole array during a pancake-sort operation." />, note: 'P9 described needing less mental simulation: the animation showed the reversal they would otherwise have to work out.', quote: '“figure out how to flip the array in my mind”', who: 'P9' },
  { title: 'Reusing a sequence', vis: <MergeLoop />, note: 'P4 and P7 described a reusable pen as a function. They could apply the same sequence again without drawing every operation separately.', quote: '“a function”', who: 'P4, P7' },
  { title: 'Reading the trace', mixed: true, vis: <LevelsLoop />, note: 'P10 found values most intuitive and compared the parameter view to coding. Other participants used indices to describe how a procedure would work on another input.', quote: '“more like coding”', who: 'P10' },
  { title: 'Finding a missing step', vis: <CounterLoop />, note: 'P11’s trace worked on [3,1,4,2] but failed on [3,2,4,1]. Replaying the failure led P11 to add an omitted comparison. P5 described the change in perspective:', quote: '“encourages you to think in the opposite direction”', who: 'P5' },
]

export function LearnerThemes({ summary }) {
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setActive(index => (index + 1) % THEMES.length), 5000)
    return () => clearInterval(timer)
  }, [held])
  const theme = THEMES[active]
  return (
    <section className="sk-essay-section sk-learner-carousel" aria-label="Learner feedback" id="study-learners">
      <div className="sk-main">
      <p><strong className="sk-run-in">Learning with SketchMind.</strong> Participants used the animations to follow operations, the pens to reuse steps, and counterexamples to revisit a plan. Their reactions to the abstraction views were less consistent.</p>
      <div className="sk-notebook sk-challenge-notebook sk-learner-notebook">
        <div className="tabs">
          {THEMES.map((item, index) => (
            <div key={item.title} className="sk-challenge-tab">
              <button type="button" className={active === index ? 'on' : ''} aria-pressed={active === index} onClick={() => { setActive(index); setHeld(true) }}>
                <b>({String.fromCharCode(97 + index)})</b> {item.title}
              </button>
            </div>
          ))}
        </div>
        <div className="page" key={active}>{theme.vis}</div>
      </div>
      {summary && <div className="sk-learner-summary">{summary}</div>}
      </div>
      <aside className="sk-margin" aria-live="polite">
        <p>{theme.note}</p>
        <blockquote>{theme.quote}<cite>{theme.who}</cite></blockquote>
        {theme.mixed && <small>Mixed responses</small>}
      </aside>
    </section>
  )
}

const SCENES = [
  { title: 'In class', text: 'E3 suggested inviting students to the front to draw together, then inspecting the result as a class.', tag: 'Active learning (ICAP)', references: [
    { label: 'Freeman et al. (2014)', title: 'Active Learning Increases Student Performance in Science, Engineering, and Mathematics', url: 'https://doi.org/10.1073/pnas.1319030111' },
    { label: 'Chi & Wylie (2014)', title: 'The ICAP Framework: Linking Cognitive Engagement to Active Learning Outcomes', url: 'https://doi.org/10.1080/00461520.2014.965823' },
  ] },
  { title: 'After a lecture', text: 'E4 wanted learners to understand the algorithm first. The tool would then let them check their procedure, replay its steps, and locate errors.', tag: 'Formative feedback', references: [
    { label: 'Hattie & Timperley (2007)', title: 'The Power of Feedback', url: 'https://doi.org/10.3102/003465430298487' },
  ] },
  { title: 'As homework', text: 'E1 and E2 favored independent construction after a short class introduction. E3 added that students would need further tasks or input variations: many might otherwise stop after one success.', tag: 'Conceptual change', references: [
    { label: 'Posner et al. (1982)', title: 'Accommodation of a Scientific Conception: Toward a Theory of Conceptual Change', url: 'https://doi.org/10.1002/sce.3730660207' },
  ] },
]

export function InstructorScenes() {
  return (
    <div className="sk-instructor-settings">
      {SCENES.map((scene, index) => (
        <div className="sk-instructor-setting" key={scene.title}>
          <h3>{scene.title}</h3>
          <svg viewBox="0 0 200 165" className="sk-doodle" role="img" aria-label={scene.title} dangerouslySetInnerHTML={{ __html: DOODLES[index] }} />
          <p>{scene.text}</p>
          <p className="sk-theory-label">{scene.tag}</p>
          {scene.references.map(reference => (
            <cite key={reference.url} className="sk-theory-reference">
              <a href={reference.url} target="_blank" rel="noopener noreferrer" title={reference.title}>{reference.label}</a>
            </cite>
          ))}
        </div>
      ))}
    </div>
  )
}
