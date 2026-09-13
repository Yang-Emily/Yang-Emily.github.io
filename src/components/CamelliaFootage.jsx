import { useEffect, useRef, useState } from 'react'

const base = `${import.meta.env.BASE_URL}camellia/`
const frameCount = 36, fps = 12, cellSize = 384

export default function CamelliaFootage({ motionRef }) {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const canvas = canvasRef.current, context = canvas.getContext('2d')
    if (!context) return
    const atlas = new Image(), reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false, frame, last = 0, elapsed = 0, lastIndex = -1
    atlas.onload = () => {
      if (disposed) return
      setReady(true)
      const render = now => {
        const dt = Math.min((now - (last || now)) / 1000, .1); last = now
        const activity = motionRef.current.activity
        if (!document.hidden) elapsed += dt
        // Play only original forward frames. No mirroring, reverse playback or warping.
        const index = reduced.matches ? 10 : Math.min(frameCount - 1, Math.floor(elapsed * fps))
        if (index !== lastIndex) {
          context.clearRect(0, 0, cellSize, cellSize)
          context.drawImage(atlas, index % 6 * cellSize, Math.floor(index / 6) * cellSize, cellSize, cellSize, 0, 0, cellSize, cellSize)
          lastIndex = index
          canvas.dataset.frame = index
        }
        // Rest a moment at the end before the next real recorded gesture.
        if (elapsed > frameCount / fps + .6) elapsed = 0
        canvas.dataset.activity = activity
        frame = requestAnimationFrame(render)
      }
      frame = requestAnimationFrame(render)
    }
    atlas.src = `${base}front-moments.webp`
    return () => { disposed = true; cancelAnimationFrame(frame); atlas.onload = null }
  }, [motionRef])
  return <div className="camellia-footage" data-renderer="real-footage" data-status={ready ? 'ready' : 'poster'}>
    <img src={`${base}front-poster.webp`} alt="Camellia, filmed sitting and looking toward the camera" hidden={ready} />
    <canvas ref={canvasRef} width="384" height="384" hidden={!ready} aria-hidden="true" />
  </div>
}
