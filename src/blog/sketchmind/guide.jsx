// A one-line hint for a small demo: a pulsing dot on the thing to try and a short
// label beside it. With `draw` (a path in the target svg's viewBox), a ghost hand
// draws that stroke on a loop instead of the dot. It disappears as soon as the
// reader touches the demo.
import { useEffect, useLayoutEffect, useState } from 'react'

// A ghost hand drawing `d` on a loop, in the coordinates of the svg it sits in.
export function GhostStroke({ d, color }) {
  return (
    <g className="smw-ghost-stroke" aria-hidden="true">
      <path d={d} pathLength="1" className="ink" style={{ stroke: color }} />
      <g className="hand">
        <animateMotion dur="3.6s" repeatCount="indefinite" path={d} keyPoints="0;0;1;1" keyTimes="0;0.15;0.6;1" calcMode="linear" />
        <circle r="11" className="touch" />
        <path className="palm" transform="translate(-8 -4) scale(1.5)" d="M18 11V6a2 2 0 0 0-4 0v0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </g>
    </g>
  )
}

export function useHint(hint) {
  const [root, setRoot] = useState(null)
  const [shown, setShown] = useState(Boolean(hint))
  const [spot, setSpot] = useState(null)
  const [labelWidth, setLabelWidth] = useState(0)

  useEffect(() => {
    if (!root || !shown) return
    const hide = () => setShown(false)
    root.addEventListener('pointerdown', hide, true)
    return () => root.removeEventListener('pointerdown', hide, true)
  }, [root, shown])

  useLayoutEffect(() => {
    if (!root || !shown) return
    const measure = () => {
      const box = root.getBoundingClientRect()
      const el = root.querySelector(hint.target)
      const r = el?.getBoundingClientRect()
      if (!r) return setSpot(null)
      const [fx, fy] = hint.at ?? [0.5, 0.5]
      // The label goes under what the reader should touch: under the ghost stroke and
      // the hand that draws it, or under the target element.
      let under = { x: r.left + r.width / 2, y: r.bottom }
      if (hint.draw) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', hint.draw)
        el.appendChild(path)
        const p = path.getBoundingClientRect()
        path.remove()
        const scale = r.width / Number(el.getAttribute('viewBox').split(' ')[2])
        under = { x: p.left + p.width / 2, y: p.bottom + 30 * scale }
      }
      setSpot({
        x: r.left - box.left + r.width * fx, y: r.top - box.top + r.height * fy, width: box.width,
        under: { x: under.x - box.left, y: under.y - box.top },
        frame: { left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height },
        viewBox: el.getAttribute('viewBox'),
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [root, shown, hint])

  const label = <><b>Try:</b> {hint?.text}</>
  const visible = shown && spot
  const overlay = visible ? (
    <div className="smw-hint-layer" aria-hidden="true">
      {hint.draw ? (
        <svg className="smw-hint-draw" style={spot.frame} viewBox={spot.viewBox}>
          <GhostStroke d={hint.draw} color={hint.color} />
        </svg>
      ) : <span className="smw-hint-dot" style={{ left: spot.x, top: spot.y }} />}
      {hint.text && (
        <span
          ref={el => { if (el && el.offsetWidth !== labelWidth) setLabelWidth(el.offsetWidth) }}
          className="smw-hint-label below"
          style={{ left: Math.min(Math.max(spot.under.x, labelWidth / 2 + 6), spot.width - labelWidth / 2 - 6), top: spot.under.y + 6 }}
        >{label}</span>
      )}
    </div>
  ) : null
  return { ref: setRoot, overlay }
}
