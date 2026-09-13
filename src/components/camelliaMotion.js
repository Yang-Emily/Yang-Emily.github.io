// Autonomous lawn activity. Pointer coordinates deliberately never enter this model.
const activities = ['walk', 'idle', 'run', 'play', 'walk', 'roll', 'rest']
const durations = { walk: 5, idle: 2, run: 3, play: 2.4, roll: 6.2, rest: 4 }

export function createCamelliaMotion(random = Math.random) {
  let index = -1, remaining = 0, destination = { x: .3, y: .7 }
  let interaction = null, interactionTime = 0, paused = false, travelSpeed = 0
  const cat = { x: .3, y: .7, facing: 1, heading: -.2, activity: 'idle' }
  return {
    setPaused(value) { paused = value; if (value) travelSpeed = 0 },
    interact(action) {
      if (!['pet', 'feed', 'scratch'].includes(action)) return false
      travelSpeed = 0
      interaction = action
      interactionTime = action === 'feed' ? 5 : 3.5
      return true
    },
    step(dt, width, height, reduced = false) {
      if (interactionTime > 0) {
        interactionTime = Math.max(0, interactionTime - dt)
        return { ...cat, activity: interaction }
      }
      if (interaction) { interaction = null; remaining = 0 }
      if (paused) return { ...cat, activity: 'idle' }
      if (reduced) return { ...cat, activity: 'rest' }
      remaining -= dt
      if (remaining <= 0) {
        index = (index + 1) % activities.length
        cat.activity = activities[index]
        remaining = durations[cat.activity]
        // Stay on the broad lawn to the left of the pond, including the cat's paws.
        destination = { x: .18 + random() * .28, y: .60 + random() * .14 }
      }
      if (cat.activity === 'walk' || cat.activity === 'run') {
        const dx = (destination.x - cat.x) * width
        const dy = (destination.y - cat.y) * height
        const distance = Math.hypot(dx, dy)
        const facing = Math.abs(dx) > 2 ? (dx > 0 ? 1 : -1) : cat.facing
        const targetHeading = facing < 0 ? Math.PI - .3 : -.2
        const turn = Math.atan2(Math.sin(targetHeading - cat.heading), Math.cos(targetHeading - cat.heading))
        cat.heading += Math.max(-dt * 2.2, Math.min(dt * 2.2, turn))
        // Plant the paws while changing direction, then accelerate forward.
        const alignment = Math.max(0, Math.cos(turn)) ** 2
        const desiredSpeed = alignment * (cat.activity === 'run' ? 125 : 38) * Math.min(1, distance / 35)
        travelSpeed += (desiredSpeed - travelSpeed) * (1 - Math.exp(-dt * 6))
        const step = Math.min(distance, dt * travelSpeed)
        if (distance > 2) {
          cat.x += dx / distance * step / width
          cat.y += dy / distance * step / height
          if (Math.abs(dx) > 2) cat.facing = dx > 0 ? 1 : -1
        } else remaining = 0
      }
      return { ...cat }
    },
  }
}
