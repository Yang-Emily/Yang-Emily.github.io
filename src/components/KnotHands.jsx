// The generated hand's thumb/index pinch is anchored at the thread contact point.
const HAND = `${import.meta.env.BASE_URL}trial/weaving-hand-v2.png`
export function Hand({ x, y, mirror = false, angle = 0 }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${mirror ? -1 : 1} 1)`} pointerEvents="none" aria-hidden="true">
    <image href={HAND} x="-220" y="-43" width="240" height="240" preserveAspectRatio="xMidYMid meet" />
  </g>
}
export function HandsShadow() {
  return <filter id="hands-shadow" x="-40%" y="-30%" width="190%" height="190%"><feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#50321d" floodOpacity=".13"/></filter>
}
