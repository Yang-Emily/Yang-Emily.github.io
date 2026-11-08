// Picture → pixel chart, done in the browser: the image is sampled 4 × 4 per cell, its
// colors are clustered into a small palette, and each cell takes the color most of its
// samples agree on.

export const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = src
})

const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
const nearest = (p, palette) => {
  let best = 0, d = Infinity
  palette.forEach((c, i) => { const e = dist(p, c); if (e < d) { d = e; best = i } })
  return best
}

// Colors are clustered from a histogram, each bin weighted by the square root of its
// count, so a small detail (an eye, a bell) can win its own yarn instead of being
// swallowed by the background. Farthest-point seeds help with the same thing.
function kmeans(pixels, k) {
  const bins = new Map()
  for (const p of pixels) {
    const key = (p[0] >> 3) << 10 | (p[1] >> 3) << 5 | (p[2] >> 3)
    const b = bins.get(key) ?? [0, 0, 0, 0]
    b[0] += p[0]; b[1] += p[1]; b[2] += p[2]; b[3]++
    bins.set(key, b)
  }
  const points = [...bins.values()].map(b => ({ c: [b[0] / b[3], b[1] / b[3], b[2] / b[3]], w: Math.sqrt(b[3]) }))
  const heaviest = points.reduce((a, b) => (b.w > a.w ? b : a))
  const centers = [[...heaviest.c]]
  while (centers.length < Math.min(k, points.length)) {
    let far = points[0], d = -1
    for (const p of points) { const e = Math.min(...centers.map(c => dist(p.c, c))) * p.w; if (e > d) { d = e; far = p } }
    centers.push([...far.c])
  }
  for (let it = 0; it < 12; it++) {
    const sum = centers.map(() => [0, 0, 0, 0])
    for (const p of points) { const s = sum[nearest(p.c, centers)]; s[0] += p.c[0] * p.w; s[1] += p.c[1] * p.w; s[2] += p.c[2] * p.w; s[3] += p.w }
    sum.forEach((s, i) => { if (s[3]) centers[i] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]] })
  }
  return centers.map(c => c.map(Math.round))
}

export const hex = c => `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`
export const light = c => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]

export function makeChart(img, width, colors) {
  const W = width
  const H = Math.min(64, Math.max(4, Math.round((width * img.naturalHeight) / img.naturalWidth)))
  const S = 4 // sample each cell 4 × 4 and let the samples vote
  const canvas = document.createElement('canvas')
  canvas.width = W * S; canvas.height = H * S
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Pixel art scaled up stays crisp; photos scaled down are averaged.
  ctx.imageSmoothingEnabled = img.naturalWidth > canvas.width
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const at = (x, y) => { const i = (y * canvas.width + x) * 4; return [data[i], data[i + 1], data[i + 2]] }
  const sample = []
  for (let y = 0; y < canvas.height; y += 2) for (let x = 0; x < canvas.width; x += 2) sample.push(at(x, y))
  let palette = kmeans(sample, colors)
  const grid = Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, c) => {
    const votes = new Array(palette.length).fill(0)
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) votes[nearest(at(c * S + x, r * S + y), palette)]++
    return votes.indexOf(Math.max(...votes))
  }))
  // Keep only colors that ended up in the chart, lightest first.
  const used = [...new Set(grid.flat())].sort((a, b) => light(palette[b]) - light(palette[a]))
  const remap = new Map(used.map((old, i) => [old, i]))
  palette = used.map(i => hex(palette[i]))
  return { W, H, palette, grid: grid.map(row => row.map(i => remap.get(i))) }
}
