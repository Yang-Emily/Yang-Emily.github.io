import { useEffect, useRef, useState } from 'react'
import './CatGarden.css'
import GardenLandscape, { POND_PATH } from './GardenLandscape'
import { createCamelliaFootageMotion } from './camelliaFootageMotion'
import { createCamelliaNeeds } from './camelliaNeeds'
import CamelliaPortrait from './CamelliaPortrait'
import CamelliaCard from './CamelliaCard'
import useCatPanelPosition from './useCatPanelPosition'

const scenes = [
  { id: 'meadow', icon: '☀', name: 'Daylight', colors: ['#ed93b1', '#dfad53', '#9aad72'] },
  { id: 'night', icon: '☾', name: 'Moonlight', colors: ['#efcb79', '#b4a2ed', '#e7c4e0'] },
]

// The second photo on the string: a small heart chart under the line of code that drew it.
const HEART = Array.from({ length: 13 }, (_, y) => Array.from({ length: 15 }, (_, x) => {
  const u = (x - 7) / 6, v = 1.25 - y * 0.19
  return (u * u + v * v - 1) ** 3 - u * u * v ** 3 < 0
}))

export default function CatGarden({ onOpenKnit, onOpenCode }) {
  const needs = useRef(null)
  if (!needs.current) needs.current = createCamelliaNeeds()
  const [stats, setStats] = useState(() => needs.current.snapshot())
  const [menuOpen, setMenuOpen] = useState(false)
  const menuOpenRef = useRef(false)
  const menuPinned = useRef(false)
  const closeTimer = useRef(null)
  const [sceneIndex, setSceneIndex] = useState(() => {
    const hour = new Date().getHours()
    return hour >= 7 && hour < 19 ? 0 : 1
  })
  const [cardOpen, setCardOpen] = useState(false)
  const [petMessage, setPetMessage] = useState('Camellia is exploring the garden.')
  const [letterOpen, setLetterOpen] = useState(false)
  const envelopeRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const catRef = useRef(null)
  const careRef = useRef(null)
  useCatPanelPosition(careRef, menuOpen, cardOpen ? 612 : 320)
  const toyRef = useRef(null)
  const engine = useRef(null)
  const bodyMotion = useRef({ activity: 'idle', facing: 1, speed: 0, night: false })
  const scene = scenes[sceneIndex]

  const openMenu = (pin = false) => {
    clearTimeout(closeTimer.current)
    if (pin) menuPinned.current = true
    menuOpenRef.current = true
    setMenuOpen(true)
    engine.current?.pause(true)
    engine.current?.leave()
  }
  const closeMenu = () => {
    clearTimeout(closeTimer.current)
    menuPinned.current = false
    menuOpenRef.current = false
    setMenuOpen(false)
    setCardOpen(false)
    engine.current?.pause(false)
  }
  useEffect(() => {
    const outside = event => {
      if (!catRef.current?.contains(event.target) && !event.target.closest('.camellia-card')) closeMenu()
    }
    document.addEventListener('pointerdown', outside)
    return () => { document.removeEventListener('pointerdown', outside); clearTimeout(closeTimer.current) }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0, height = 0, frame, last = 0, lastTrail = 0, burstUntil = 0
    let particles = []
    let active = false
    let pointerSample = null, pointerSpeed = 0, cursorScale = 1
    const motion = createCamelliaFootageMotion()
    motion.setPaused(menuOpenRef.current)
    let previousActivity = '', statsElapsed = 0, previousPosition = null
    const pondPath = new Path2D(POND_PATH)
    const inPond = () => {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      const water = ctx.isPointInPath(pondPath, target.x / width * 1440, target.y / height * 900)
      ctx.restore()
      return water
    }
    const target = { x: 240, y: 210 }
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
    const resize = () => {
      width = stage.clientWidth
      height = stage.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      target.x = clamp(target.x, 24, width - 24)
      target.y = clamp(target.y, 24, height - 24)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    resize()
    function emit(burst) {
      const count = reduced.matches ? (burst ? 6 : 0) : (burst ? 44 : 2)
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = burst ? 65 + Math.random() * 170 : 10 + Math.random() * 25
        particles.push({ x: target.x, y: target.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          age: 0, life: burst ? 1.2 : .7, size: burst ? 4 + Math.random() * 9 : 3 + Math.random() * 4,
          color: inPond() ? '#b0e5ec' : scene.colors[Math.floor(Math.random() * scene.colors.length)], burst,
          water: inPond() })
      }
      particles = particles.slice(-240)
    }
    engine.current = {
      pause(value) { motion.setPaused(value) },
      interact(action) {
        if (needs.current.care(action)) {
          motion.interact(action)
          setStats(needs.current.snapshot())
        }
        this.leave()
      },
      move(x, y) {
        const now = performance.now()
        if (pointerSample) {
          const elapsed = now - pointerSample.time
          if (elapsed > 0) {
            const speed = Math.hypot(x - pointerSample.x, y - pointerSample.y) / Math.max(elapsed, 8) * 1000
            pointerSpeed = Math.min(speed, 2400)
          }
        }
        pointerSample = { x, y, time: now }
        target.x = clamp(x, 15, width - 15)
        target.y = clamp(y, 20, height - 20)
        active = true
      },
      leave() { active = false; pointerSample = null; pointerSpeed = 0; cursorScale = 1 },
      burst() { emit(true); burstUntil = performance.now() + 650 },
      key(key) {
        const offsets = { ArrowLeft: [-32, 0], ArrowRight: [32, 0], ArrowUp: [0, -32], ArrowDown: [0, 32] }
        if (offsets[key]) this.move(target.x + offsets[key][0], target.y + offsets[key][1])
        else if (key === 'Enter' || key === ' ') { active = true; this.burst() }
      },
    }
    const draw = (now) => {
      const dt = Math.min((now - (last || now)) / 1000, .04)
      last = now
      const cat = motion.step(dt, width, height, reduced.matches)
      const distance = previousPosition ? Math.hypot((cat.x - previousPosition.x) * width, (cat.y - previousPosition.y) * height) : 0
      bodyMotion.current = { activity: cat.activity, interactionId: cat.interactionId, facing: cat.facing, heading: cat.heading, speed: dt > 0 ? distance / dt : 0, night: scene.id === 'night' }
      previousPosition = cat
      const catLeft = clamp(cat.x * width, 100, width - 100) - 100
      catRef.current.style.transform = `translate(${catLeft}px, ${cat.y * height - 55}px)`
      const currentStats = needs.current.step(dt, cat.activity)
      statsElapsed += dt
      if (statsElapsed > .25) { setStats(currentStats); statsElapsed = 0 }
      catRef.current.dataset.activity = cat.activity
      if (cat.activity !== previousActivity) {
        previousActivity = cat.activity
        setPetMessage(({ pet: 'A gentle stroke for Camellia.', feed: 'A little snack for Camellia.', scratch: 'That’s the spot! Happy little paws.', walk: 'Camellia is taking a stroll.', run: 'A little burst of energy!', play: 'A little stretch in the garden.', roll: 'A happy roll in the grass.', idle: 'Camellia is watching the garden.', rest: 'Camellia is relaxing in the grass.' })[cat.activity])
      }
      catRef.current.style.setProperty('--cat-facing', cat.facing)
      const water = active && inPond()
      stage.dataset.water = water ? 'true' : 'false'
      toyRef.current.dataset.water = water ? 'true' : 'false'
      // Decay after movement stops; smooth scale changes independently of event frequency.
      if (!pointerSample || now - pointerSample.time > 70) pointerSpeed *= Math.exp(-dt * 10)
      const speedScale = 1 + Math.min(pointerSpeed / 1400, 1) * 1.2
      const desiredScale = Math.max(speedScale, now < burstUntil ? 1.5 : 1)
      cursorScale += (desiredScale - cursorScale) * (1 - Math.exp(-dt * 12))
      toyRef.current.style.transform = `translate(${target.x - 17}px, ${target.y - 17}px) scale(${cursorScale})`
      toyRef.current.style.opacity = active ? '1' : '0'
      if (active && now - lastTrail > 80) { emit(false); lastTrail = now }
      ctx.clearRect(0, 0, width, height)
      particles = particles.filter(p => p.age < p.life)
      for (const p of particles) {
        p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt
        ctx.globalAlpha = Math.max(0, 1 - p.age / p.life)
        ctx.strokeStyle = p.color; ctx.fillStyle = p.color; ctx.lineWidth = 1.5
        ctx.beginPath()
        if (p.water) {
          ctx.arc(p.x, p.y, p.size + p.age * 9, 0, Math.PI * 2); ctx.stroke()
          ctx.beginPath(); ctx.arc(p.x - 2, p.y - 3, 1.5, 0, Math.PI * 2); ctx.fill()
        } else if (scene.id === 'night') {
          for (let j = 0; j < 8; j++) {
            const a = j * Math.PI / 4 + p.age
            const r = j % 2 ? p.size * .3 : p.size
            ctx.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r)
          }
          ctx.closePath(); ctx.fill()
        } else {
          ctx.ellipse(p.x, p.y, p.size * .55, p.size, p.age * 3, 0, Math.PI * 2); ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); engine.current = null }
  }, [sceneIndex])

  const movePointer = (event) => {
    const rect = stageRef.current.getBoundingClientRect()
    engine.current?.move(event.clientX - rect.left, event.clientY - rect.top)
  }

  return <section className={`cat-garden garden-${scene.id}`} aria-labelledby="cat-garden-title">
    <h1 id="cat-garden-title" className="sr-only">Camellia’s garden</h1>
    <div className="garden-scenes" role="group" aria-label="Choose time of day">
      {scenes.map((item, index) => <button type="button" key={item.id} aria-pressed={sceneIndex === index} onClick={() => setSceneIndex(index)}><span aria-hidden="true">{item.icon}</span>{item.name}</button>)}
    </div>
    {onOpenKnit && <div className="garden-photo-line">
      <svg className="garden-holiday-string" viewBox="0 0 900 240" fill="none" aria-hidden="true">
        <defs><radialGradient id="garden-lamp-warmth"><stop stopColor="#ffe5a3" stopOpacity=".65"/><stop offset="1" stopColor="#f6c677" stopOpacity="0"/></radialGradient></defs>
        <path d="M5 16 Q450 111 895 16" stroke="#a08a68" strokeWidth="1.8"/>
        <circle cx="5" cy="16" r="3" fill="#b6a58b"/><circle cx="895" cy="16" r="3" fill="#b6a58b"/>
        {(onOpenCode ? [.05,.13,.21,.28,.505,.74,.82,.9,.97] : [.05,.14,.23,.32,.4,.59,.68,.77,.86,.95]).map((u,i) => <g key={u} transform={`translate(${5 + 890*u} ${16 + 190*u*(1-u)})`}>
          <path d="M0 0 V9" stroke="#94856e" strokeWidth="1.3"/>
          <circle className="garden-lamp-halo" cy="13" r="24" fill="url(#garden-lamp-warmth)"/>
          <ellipse className="garden-fairy-light" cx="0" cy="13" rx="3.5" ry="5" fill={i % 3 ? '#f4d69a' : '#e7bd9d'} style={{ animationDelay: `${i*.6}s` }}/>
        </g>)}
        {[{ x: 36, y: 22, flip: 1 }, { x: 864, y: 23, flip: -1 }].map(({ x, y, flip }) => <g key={x} transform={`translate(${x} ${y}) scale(${flip} 1)`}>
          <path d="M0 0 Q35 15 82 16" stroke="#8b997b" strokeWidth="2"/>
          {[10,25,40,55,70].map((v,i) => <g key={v} transform={`translate(${v} ${v*.2})`}><path d="M0 0q-6-17 7-15Q12-4 0 0" fill={i%2 ? '#a6b295' : '#bac4a6'}/><path d="M0 0q4 16 14 10Q14 1 0 0" fill="#a5b291"/></g>)}
          <circle cx="27" cy="8" r="3.5" fill="#bf8b7e"/><circle cx="33" cy="12" r="3" fill="#ce9d8c"/>
        </g>)}
        <g transform="translate(818 32) rotate(-7)">
          <path d="M0 0 V57" stroke="#b69a75" strokeWidth="1.2"/>
          <path d="M0 91C-40 69-17 47 0 64C17 47 40 69 0 91Z" fill="#cca196" stroke="#b7847b" strokeWidth="1.5"/>
          <path d="M0 84C-28 67-15 56 0 71C15 56 28 67 0 84Z" stroke="#f2d8cb" strokeWidth="1" strokeDasharray="2 3"/>
        </g>
        <g className="garden-hanging-star" transform="translate(133 40)">
          <path d="M0 0 V42" stroke="#ae9874" strokeWidth="1.2"/>
          <path d="m0 35 7 16 18 2-14 12 4 18-15-9-15 9 4-18-14-12 18-2Z" fill="#e7cc92" stroke="#b99d65" strokeWidth="1.4"/>
          <path d="m0 43 4 13 13 1-10 7 3 12-10-7" stroke="#fff1cb" strokeWidth="1.2"/>
        </g>
        <g transform="translate(714 47) rotate(7)">
          <path d="M0 -5 V46" stroke="#aa9779" strokeWidth="1.2"/>
          <path d="m0 37-17 24h9l-18 25h15l-18 25h58l-18-25h15L8 61h9Z" fill="#9ca98b" stroke="#78876d" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M-4 112v12h8v-12" fill="#ae8d69"/>
          <path d="M-13 74q15 11 28 0M-19 95q20 12 39 0" stroke="#e9d3a5" strokeWidth="1.7"/>
          <circle cx="-8" cy="86" r="2.8" fill="#bd8378"/><circle cx="10" cy="104" r="2.8" fill="#bd8378"/>
        </g>
        <g transform="translate(278 57) rotate(-9)">
          <path d="M0 -5 V26" stroke="#aa9779" strokeWidth="1.2"/>
          <rect x="-7" y="22" width="14" height="8" rx="2" fill="#b59b72"/>
          <circle cy="48" r="19" fill="#c89b94" stroke="#a67873" strokeWidth="1.2"/>
          <path d="M-14 39q14 10 28 0M-17 51q17 10 34 0" stroke="#f8e9d3" strokeWidth="2"/>
        </g>
        <g transform="translate(594 61) rotate(8)">
          <path d="M0 0 V21" stroke="#aa9779" strokeWidth="1.2"/>
          <rect x="-30" y="21" width="60" height="73" rx="2" fill="#fff9ed" stroke="#d1c2a8"/>
          <rect x="-24" y="27" width="48" height="48" fill="#e3e7d6"/>
          <path d="M0 67V35m0 10-9-7m9 16 11-8m-11 15-10-8" stroke="#8c9c79" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="8" cy="39" r="3" fill="#c48c80"/><path d="M-11 84h22" stroke="#cbbba0"/>
          <rect x="-3" y="14" width="6" height="17" rx="1" fill="#b6a17e"/>
        </g>
      </svg>
      <a className="garden-knit-card" href="#/trial/WeaveCamellia" aria-label="Open Camellia pixel knotting">
        <span className="garden-photo-clip" aria-hidden="true"/>
        <svg className="garden-photo-bow" viewBox="0 0 48 27" fill="none" aria-hidden="true"><path d="M23 13C8-7 0 9 7 15c5 4 11 0 16-2Zm2 0C40-7 48 9 41 15c-5 4-11 0-16-2Z" fill="#c79b8a" stroke="#af806f"/><path d="m22 13-9 12 8-2 3-9 4 10 7 2-10-13" fill="#c79b8a"/><ellipse cx="24" cy="13" rx="4" ry="4" fill="#d8b09a"/></svg>
        <img src={`${import.meta.env.BASE_URL}trial/pixel-cat-icon.png`} alt="" width="94" height="94"/>
        <span><b>Pixel knotting</b></span>
      </a>
      {onOpenCode && <a className="garden-knit-card garden-code-card" href="#/trial/ProgrammingWithKnots" aria-label="Open Programming Threads">
        <span className="garden-photo-clip" aria-hidden="true"/>
        <svg className="garden-code-photo" viewBox="0 0 105 98" aria-hidden="true">
          <text x="8" y="17" fontFamily="ui-monospace, Menlo, monospace" fontSize="9.5" fill="#8a6d55">pixel(x, y)</text>
          {HEART.map((line, y) => line.map((on, x) => <circle key={`${x}-${y}`} cx={17 + x * 5} cy={30 + y * 5} r="2.1" fill={on ? '#c54e45' : '#e6d9c2'}/>))}
        </svg>
        <span><b>Programming Threads</b></span>
      </a>}
    </div>}
    <div className="garden-mail">
      <button ref={envelopeRef} className="garden-envelope" type="button" aria-expanded={letterOpen} aria-controls="witch-letter" aria-label={letterOpen ? 'Close the witch’s letter' : 'Open the witch’s letter'} onClick={() => setLetterOpen(value => !value)}>
        <svg className="garden-mailbox" viewBox="0 0 160 230" fill="none" aria-hidden="true">
          <ellipse cx="82" cy="212" rx="43" ry="8" fill="#718363" opacity=".12" />
          <path d="m71 107-2 104 17 1 2-105" fill="#c5a47c" stroke="#907b60" strokeWidth="1.8" />
          <path d="m76 126-1 72m8-80-2 52" stroke="#a48c69" strokeWidth="1.2" />
          <path d="M28 104V59c0-22 15-37 34-37l43 2c20 1 32 17 32 38l-1 43Z" fill="#a5b29a" stroke="#78866e" strokeWidth="2" />
          <path d="m72 25 31 2c18 1 28 14 30 31" stroke="#c8d0b9" strokeWidth="3" strokeLinecap="round" />
          <path d="M27 105V60c0-21 13-35 30-35s31 14 32 35v46Z" fill="#606e5c" stroke="#78866e" strokeWidth="2" />
          <path d="M32 101V61c0-18 10-29 25-29 16 0 26 12 27 30v40" stroke="#485a49" strokeWidth="2" />
          <g className="mailbox-visible-letter">
            <path d="m33 67 49-6 5 44-51 5Z" fill="#fcf1d8" stroke="#ae9678" strokeWidth="1.5" />
            <path d="m34 69 27 18 20-24m-43 44 15-24m32 19L68 81" stroke="#ae9678" strokeWidth="1.3" strokeLinejoin="round" />
            <circle cx="62" cy="85" r="7" fill="#b994bd" />
            <path d="m62 80 1.4 3.4 3.6 1-3 2 .4 3.6-2.4-2.1-3 1 .9-3.1-2.4-2.1 3.3-.5Z" fill="#f8e9ee" />
          </g>
          <path d="m25 106 65-1 7 19-72 1c-7 0-11-4-8-9Z" fill="#b8c2a9" stroke="#78866e" strokeWidth="1.8" />
          <path d="m31 111 53-1 4 8-58 1" stroke="#d4dac7" strokeWidth="1.5" />
          <path d="m113 82 1-43 23 1-1 17-21-1" stroke="#a27c81" strokeWidth="3" strokeLinejoin="round" />
          <path d="m116 41 19 1-1 12-18-1Z" fill="#c89b9f" />
          <circle cx="113" cy="84" r="3" fill="#ddd8bf" />
          <path d="m55 214-5-14m7 15 5-19m34 20 7-18m-5 18 13-9" stroke="#96a77e" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="sr-only">A note for you</span>
      </button>
      {letterOpen && <div id="witch-letter" className="garden-letter" role="region" aria-label="A letter from the witch" onKeyDown={event => { if (event.key === 'Escape') { setLetterOpen(false); envelopeRef.current?.focus() } }}>
        <button className="letter-close" type="button" aria-label="Close letter" onClick={() => { setLetterOpen(false); envelopeRef.current?.focus() }}>×</button>
        <span className="letter-mark" aria-hidden="true">✧</span>
        <h2>The witch is away for now.</h2>
        <p>Hi dear friend,<br />I’ve stepped out for a little while. Please feel free to wander around and keep Camellia company. I’ll be back with more magic soon.</p>
        <p className="letter-signature">With a little magic ♡</p>
      </div>}
    </div>
    <div ref={stageRef} className="garden-stage" role="application" tabIndex={0}
      aria-label={`${scene.name}. Camellia plays independently on the lawn. Move the pointer or use arrow keys to explore; the pond cursor becomes a fish. Click, press Enter or Space for a magic burst.`}
      aria-describedby="garden-instructions"
      onPointerMove={movePointer} onPointerLeave={() => engine.current?.leave()}
      onPointerDown={event => { if (event.target.closest('.garden-cat')) return; if (event.button !== 0) return; movePointer(event); stageRef.current.focus({ preventScroll: true }); engine.current?.burst() }}
      onPointerUp={event => { if (event.pointerType !== 'mouse') engine.current?.leave() }}
      onPointerCancel={() => engine.current?.leave()} onBlur={() => engine.current?.leave()}
      onKeyDown={event => { if (event.target !== event.currentTarget) return; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) { event.preventDefault(); engine.current?.key(event.key) } }}>
      <GardenLandscape night={scene.id === 'night'} />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="garden-cat garden-cat-real" ref={catRef}
        onPointerEnter={event => { if (event.pointerType !== 'touch') openMenu() }}
        onPointerLeave={() => { if (!menuPinned.current) closeTimer.current = setTimeout(closeMenu, 280) }}
        onFocus={() => openMenu()}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && !event.relatedTarget?.closest('.camellia-card')) closeMenu() }}
        onPointerMove={event => { event.stopPropagation(); engine.current?.leave() }}
        onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); closeMenu(); stageRef.current?.focus({ preventScroll: true }) } }}>

        <button className="camellia-touch" type="button" aria-label="Care for Camellia" aria-expanded={menuOpen} aria-controls="camellia-care-panel"
          onPointerDown={event => { event.stopPropagation(); openMenu(event.pointerType === 'touch') }}
          onClick={() => openMenu()}>
          <CamelliaPortrait motionRef={bodyMotion} />
          <span className="camellia-name" aria-hidden="true">Camellia</span>
        </button>
    {menuOpen && <div ref={careRef} className={`camellia-care-sidebar${cardOpen ? ' is-expanded' : ''}`}>
    <div id="camellia-care-panel" className="pet-care" role="region" aria-label="Care for Camellia">
      <div className="pet-panel-heading"><span>Camellia</span><button type="button" aria-label="Close care menu" onClick={closeMenu}>×</button></div>
      <div className="pet-needs">{[['mood', 'Mood', '♡'], ['food', 'Food', '♧'], ['energy', 'Energy', '☀']].map(([key, label, icon]) => <div className={`pet-need pet-need-${key}`} key={key}>
        <label htmlFor={`camellia-${key}`}>{icon} {label}<span>{Math.round(stats[key])}%</span></label>
        <progress id={`camellia-${key}`} max="100" value={Math.round(stats[key])} />
      </div>)}</div>
      <p className="pet-feedback" role="status">{petMessage}</p>
      <div className="pet-care-buttons">
        <button type="button" onClick={() => engine.current?.interact('pet')}>♡ <span>Pet</span></button>
        <button type="button" onClick={() => engine.current?.interact('feed')}>♧ <span>Feed</span></button>
        <button type="button" onClick={() => engine.current?.interact('scratch')}>✧ <span>Scratch</span></button>
        <button type="button" aria-expanded={cardOpen} aria-controls="camellia-profile" onClick={() => { openMenu(true); setCardOpen(value => !value) }}>▧ <span>Meet Camellia</span></button>
      </div>
        </div>
      {cardOpen && <CamelliaCard onClose={() => setCardOpen(false)} />}
    </div>}
        <span className="cat-affection" aria-hidden="true">♡ ♡</span>

      </div>
      <div className="garden-toy" ref={toyRef} aria-hidden="true">
        <span className="garden-land-toy">{scene.id === 'night' ? '✦' : '🦋'}</span>
        <svg className="garden-fish" viewBox="0 0 40 34" fill="none"><path d="M27 17 37 8v18Z" fill="#dba776" stroke="#827d73" strokeWidth="1.2" /><path d="M3 17Q15-2 29 17Q15 36 3 17Z" fill="#edcda0" stroke="#827d73" strokeWidth="1.2" /><path d="m15 11 6 6-6 6" stroke="#c19b70" strokeWidth="1.2" /><circle cx="10" cy="15" r="2" fill="#455b61" /><circle cx="9.5" cy="14.4" r=".6" fill="white" /></svg>
      </div>
    </div>
    <div id="garden-instructions" className="garden-instructions"><span>Hover or tap Camellia to open her side card · Move your mouse to play with your cat</span><span>Touch to play · Arrow keys + Enter work too</span></div>
  </section>
}
