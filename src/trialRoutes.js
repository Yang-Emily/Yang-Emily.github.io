export const TRIAL_ROUTES = {
  garden: '#/trial',
  weave: '#/trial/WeaveCamellia',
  code: '#/trial/ProgrammingWithKnots',
}
export function resolvePage(hash) {
  const path = hash.replace(/\/$/, '')
  if (path === TRIAL_ROUTES.garden) return 'trial'
  if (path === TRIAL_ROUTES.weave) return 'weave-camellia'
  if (path === TRIAL_ROUTES.code) return 'programming-knots'
  if (path === '#/sketchmind') return 'sketchmind'
  return 'home'
}
