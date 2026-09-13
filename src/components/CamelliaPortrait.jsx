import { useEffect, useRef } from 'react'

const FRAME_COUNT = 12, COLUMNS = 4
// One gait cycle covers roughly 64 CSS pixels at the displayed cat size.
const WALK_STRIDE = 64
const sources = Object.fromEntries(['walk', 'pet', 'feed', 'scratch'].map(action => [action, `${action}-portrait-v1.webp`]))
export default function CamelliaPortrait({ motionRef }) {
  const hostRef = useRef(null), canvasRef = useRef(null)
  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current, ctx = canvas.getContext('2d')
    if (!ctx) return
    const atlases = {}, loaded = new Set(), reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame, disposed = false, phase = 0, last = 0, modeKey = ''
    for (const [action, file] of Object.entries(sources)) {
      const image = new Image(); atlases[action] = image
      image.onload = () => { if (!disposed) loaded.add(action) }
      image.src = `${import.meta.env.BASE_URL}camellia/${file}`
    }
    const render = now => {
      const dt = Math.min((now - (last || now)) / 1000, .05); last = now
      const state = motionRef.current
      const action = loaded.has(state.activity) ? state.activity : 'idle'
      const nextMode = `${action}:${state.interactionId || 0}`
      if (nextMode !== modeKey) { phase = 0; modeKey = nextMode }
      host.dataset.activity = action
      if (action !== 'idle') {
        const walking = action === 'walk'
        const walkFrameRate = Math.max(0, state.speed) / WALK_STRIDE * FRAME_COUNT
        if (!reduced.matches) phase += walking ? dt * walkFrameRate : dt
        const duration = action === 'feed' ? 5 : 3.5
        const position = reduced.matches ? (walking ? 0 : 5) : walking ? phase % FRAME_COUNT : Math.min(FRAME_COUNT - 1, phase / (duration - .2) * (FRAME_COUNT - 1))
        const index = Math.floor(position)
        // These twelve poses have larger changes; blending would show double outlines.
        const facing = walking ? state.facing : 1
        ctx.clearRect(0, 0, 384, 320); ctx.save()
        if (facing < 0) { ctx.translate(384, 0); ctx.scale(-1, 1) }
        ctx.drawImage(atlases[action], index % COLUMNS * 384, Math.floor(index / COLUMNS) * 320, 384, 320, 0, 0, 384, 320)
        ctx.restore(); canvas.dataset.frame = index; canvas.dataset.frameCount = FRAME_COUNT
      }
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => { disposed = true; cancelAnimationFrame(frame); for (const image of Object.values(atlases)) image.onload = null }
  }, [motionRef])
  return <div ref={hostRef} className="camellia-generated-pet" data-renderer="generated-poses" data-activity="idle">
    <img src={`${import.meta.env.BASE_URL}camellia/idle-portrait-v1.webp`}
      alt="Camellia, with her complete tail and paws visible" draggable="false" />
    <canvas ref={canvasRef} width="384" height="320" aria-hidden="true" />
  </div>
}
