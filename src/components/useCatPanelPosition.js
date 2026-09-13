import { useLayoutEffect } from 'react'

// Both panels anchor to the visible cat, including the widest walking pose.
export default function useCatPanelPosition(panelRef, open, preferredWidth) {
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!open || !panel) return
    const cat = panel.closest('.garden-cat')
    const stage = cat.closest('.garden-stage')
    const place = () => {
      const r = cat.getBoundingClientRect(), bounds = stage.getBoundingClientRect()
      const margin = 12, gap = 12
      const leftEdge = Math.max(margin, bounds.left + margin)
      const rightEdge = Math.min(window.innerWidth - margin, bounds.right - margin)
      const catLeft = r.left + 30, catRight = r.left + 170
      const rightSpace = rightEdge - catRight - gap
      const leftSpace = catLeft - gap - leftEdge
      const right = rightSpace >= preferredWidth || rightSpace >= leftSpace
      const width = Math.min(preferredWidth, Math.max(0, right ? rightSpace : leftSpace))
      const topEdge = Math.max(margin, bounds.top + margin)
      const bottomEdge = Math.min(window.innerHeight - margin, bounds.bottom - margin)
      panel.style.width = `${width}px`
      panel.dataset.compact = String(width < 220)
      panel.dataset.stacked = String(width < 520)
      panel.style.maxHeight = `${Math.max(100, bottomEdge - topEdge)}px`
      const x = right ? catRight + gap : catLeft - gap - width
      const y = Math.max(topEdge, Math.min(r.top + 83 - panel.offsetHeight / 2, bottomEdge - panel.offsetHeight))
      panel.style.left = `${x - r.left}px`
      panel.style.top = `${y - r.top}px`
      panel.dataset.side = right ? 'right' : 'left'
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(panel); observer.observe(stage)
    // The garden moves the cat with transforms, which ResizeObserver cannot see.
    let frame, lastPosition = ''
    const follow = () => {
      const r = cat.getBoundingClientRect()
      const position = `${r.left}:${r.top}`
      if (position !== lastPosition) { lastPosition = position; place() }
      frame = requestAnimationFrame(follow)
    }
    frame = requestAnimationFrame(follow)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [panelRef, open, preferredWidth])
}
