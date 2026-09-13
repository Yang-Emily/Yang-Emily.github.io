// Alternate short strolls with seated pauses; care always stops travel immediately.
export function createCamelliaFootageMotion(random = Math.random) {
  let paused = false, interaction = null, remaining = 0, timer = 2.5, speed = 0
  let destination = { x: .4, y: .66 }
  const cat = { x: .30, y: .66, facing: 1, activity: 'idle', interactionId: 0 }
  const sit = () => { cat.activity = 'idle'; speed = 0; timer = 3 + random() * 3 }
  return {
    setPaused(value) { paused = value; if (value) sit() },
    interact(action) {
      if (!['pet', 'feed', 'scratch'].includes(action)) return false
      sit(); cat.interactionId += 1; interaction = action; remaining = action === 'feed' ? 5 : 3.5
      return true
    },
    step(dt, width, height, reduced) {
      const left = Math.max(.16, 100 / width), right = Math.min(.46, 1 - 100 / width)
      cat.x = Math.max(left, Math.min(right, cat.x))
      if (remaining > 0) { remaining = Math.max(0, remaining - dt); return { ...cat, activity: interaction } }
      if (paused || reduced) { if (cat.activity === 'walk') sit(); return { ...cat, activity: 'idle' } }
      timer -= dt
      if (cat.activity === 'idle' && timer <= 0) {
        cat.facing = cat.x > (left + right) / 2 ? -1 : 1
        const end = cat.facing > 0 ? right : left
        destination = { x: cat.x + (end - cat.x) * (.65 + random() * .35), y: .63 + random() * .055 }
        cat.activity = 'walk'; timer = 4 + random() * 3
      }
      if (cat.activity === 'walk') {
        const dx = (destination.x - cat.x) * width, dy = (destination.y - cat.y) * height
        const distance = Math.hypot(dx, dy)
        if (distance < 2 || timer <= 0) sit()
        else {
          const desired = Math.min(26, Math.max(12, width * .035)) * Math.min(1, distance / 18, Math.max(0, timer) / .5)
          speed += (desired - speed) * (1 - Math.exp(-dt * 7))
          const step = Math.min(distance, speed * dt)
          cat.x += dx / distance * step / width; cat.y += dy / distance * step / height
        }
      }
      return { ...cat }
    },
  }
}
