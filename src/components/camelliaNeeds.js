const clamp = value => Math.max(0, Math.min(100, value))

export function createCamelliaNeeds() {
  const values = { mood: 72, food: 65, energy: 80 }
  let cooldown = 0, lastAction = null
  return {
    snapshot: () => ({ ...values }),
    care(action) {
      if ((cooldown > 0 && lastAction === action) || !['pet', 'feed', 'scratch'].includes(action)) return false
      cooldown = 1
      lastAction = action
      values.mood = clamp(values.mood + (action === 'scratch' ? 12 : action === 'pet' ? 9 : 4))
      if (action === 'feed') { values.food = clamp(values.food + 22); values.energy = clamp(values.energy + 4) }
      return true
    },
    step(dt, activity) {
      cooldown = Math.max(0, cooldown - dt)
      values.food = clamp(values.food - dt * .07)
      values.mood = clamp(values.mood - dt * (values.food < 20 ? .12 : .02))
      values.energy = clamp(values.energy + dt * (activity === 'rest' ? 1.6 : ['run', 'play', 'roll'].includes(activity) ? -.6 : activity === 'walk' ? -.15 : .08))
      return { ...values }
    },
  }
}
