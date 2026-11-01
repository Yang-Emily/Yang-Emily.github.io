const SYSTEM_URL = 'https://sketchmind.peachhub-cntr1.inf.ethz.ch/'

// Run the real application: the blog must not substitute its own recognizer or
// gesture interpreter for SketchMind's implementation.
export default function RealSystem() {
  return (
    <div className="sk-live-system">
      <iframe
        src={SYSTEM_URL}
        title="SketchMind: the full system"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <p className="sk-system-fallback">
        <a href={SYSTEM_URL} target="_blank" rel="noopener noreferrer">Open SketchMind in a full window ↗</a>
      </p>
    </div>
  )
}
