import { useEffect, useRef, useState } from 'react'
import abstraction from './challenge-abstraction.svg?raw'
import overfitting from './challenge-overfitting.svg?raw'

const asset = name => `${import.meta.env.BASE_URL}blog/sketchmind/${name}`
const notes = [
  { tag: 'a', title: 'Trace explosion', text: 'Each swap changes two positions, but on paper the learner redraws the whole row. The copies accumulate, along with opportunities to transpose or misread a digit.' },
  { tag: 'b', title: 'The abstraction leap', text: 'The circled groups repeat a similar operation. The drawing records each occurrence, but does not specify a conditional, a loop variable, or an iteration range.' },
  { tag: 'c', title: 'Instance overfitting', text: 'The orange input needs its own execution. A completed trace of the black input cannot be run again to test whether the same procedure still sorts it.' },
]
const frames = [[130, 7, 480, 526], [165, 15, 405, 490], [100, 7, 650, 526]]

// Retain the slide's original marks while putting both overlays into the same
// coordinate system. The underlying paper never changes between annotations.
const inkLayer = source => source.slice(source.indexOf('<g class="challenge-ink"')).replace(/<\/svg>\s*$/, '')
const layers = [
  '<g class="challenge-ink" fill="none" stroke="#c66a38" stroke-width="3" stroke-linecap="round"><path d="M440 37 Q454 36 453 54 L454 444 Q455 464 440 465"/></g>',
  inkLayer(abstraction),
  `<g transform="translate(99 -21.5) scale(1.1)">${inkLayer(overfitting)}</g>`,
]

export default function PaperChallenges() {
  const [active, setActive] = useState(0)
  const drawing = useRef(null)
  const viewport = useRef(null)
  useEffect(() => {
    const target = frames[active]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      viewport.current.setAttribute('viewBox', target.join(' '))
      return
    }
    const from = viewport.current.getAttribute('viewBox').split(/\s+/).map(Number)
    const started = performance.now()
    let frame
    const zoom = now => {
      const progress = Math.min(1, (now - started) / 450)
      const eased = 1 - (1 - progress) ** 3
      viewport.current.setAttribute('viewBox', target.map((value, i) => from[i] + (value - from[i]) * eased).join(' '))
      if (progress < 1) frame = requestAnimationFrame(zoom)
    }
    frame = requestAnimationFrame(zoom)
    const paths = [...drawing.current.querySelectorAll('.challenge-ink path')]
    const animations = paths.map((path, index) => {
      const length = path.getTotalLength()
      return path.animate([
        { opacity: 0, strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
        { opacity: 1, strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 },
      ], { duration: 280, delay: index * 65, fill: 'backwards', easing: 'ease-out' })
    })
    return () => { cancelAnimationFrame(frame); animations.forEach(animation => animation.cancel()) }
  }, [active])

  return (
    <div className="sk-essay-section sk-paper-carousel">
    <figure className="sk-notebook sk-challenge-notebook">
      <div className="tabs">
        {notes.map((note, index) => (
          <div key={note.tag} className="sk-challenge-tab">
            <button type="button" className={active === index ? 'on' : ''} aria-pressed={active === index} onClick={() => setActive(index)}>
              <b>({note.tag})</b> {note.title}
            </button>
          </div>
        ))}
      </div>
      <div className="page">
        <div className="sk-paper-view" ref={drawing}>
        <svg ref={viewport} viewBox="130 7 480 526" role="img" aria-label={`${notes[active].title}: annotated sorting trace`}>
          <svg x="100" y="15" width="350" height="510" viewBox="210 80 220 340">
            <image href={asset(active === 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'challenge-trace-explosion.gif' : 'challenge-abstraction-fragment.jpg')} width="640" height="540" />
          </svg>
          <g dangerouslySetInnerHTML={{ __html: layers[active] }} />
        </svg>
        </div>
      </div>
    </figure>
    <aside className="sk-margin" aria-live="polite"><p>{notes[active].text}</p></aside>
    </div>
  )
}
