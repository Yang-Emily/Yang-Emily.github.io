import { Group, Mesh, MeshStandardMaterial, BufferGeometry, Float32BufferAttribute, Vector3, Quaternion, Raycaster, MathUtils } from 'three'

// Tapered fibres with anchored roots and damped tip motion, in the head's bind frame.
export function createWhiskers(head, skin, scene) {
  const group = new Group()
  group.name = 'Camellia flexible whiskers'
  const material = new MeshStandardMaterial({ color: '#e5dece', roughness: .72 })
  const strands = []
  const segments = 22, sides = 5
  const tangent = new Vector3(), normal = new Vector3(), binormal = new Vector3()
  const axis = new Vector3(1, 0, 0), sample = new Vector3(), center = new Vector3()
  const cubic = (out, a, b, c, d, t) => {
    const u = 1 - t
    return out.copy(a).multiplyScalar(u ** 3).addScaledVector(b, 3 * u * u * t).addScaledVector(c, 3 * u * t * t).addScaledVector(d, t ** 3)
  }
  const attach = (root, side, index, brow = false) => {
    const length = brow ? .28 : .79 + .09 * Math.sin(index * 2.1 + side * .4)
    const spread = brow ? .22 : (index - 2) * .075
    const control = root.clone().add(new Vector3(.07, spread * .18, side * length * .3))
    const middle = root.clone().add(new Vector3(.09, spread * .65, side * length * .72))
    const end = root.clone().add(new Vector3(-.06, spread - (brow ? 0 : .035), side * length))
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array((segments + 1) * sides * 3), 3))
    geometry.setAttribute('normal', new Float32BufferAttribute(new Float32Array((segments + 1) * sides * 3), 3))
    const indices = []
    for (let i = 0; i < segments; i++) for (let j = 0; j < sides; j++) {
      const a = i * sides + j, b = i * sides + (j + 1) % sides
      indices.push(a, b, b + sides, a, b + sides, a + sides)
    }
    geometry.setIndex(indices)
    const mesh = new Mesh(geometry, material)
    mesh.frustumCulled = false
    group.add(mesh)
    strands.push({ geometry, root, control, middle, end, bend: new Vector3(), velocity: new Vector3(), tip: end.clone(), mid: middle.clone(), side, index, brow })
  }
  for (const side of [-1, 1]) {
    const ray = new Raycaster(new Vector3(3, 2.98, side * .25), new Vector3(-1, 0, 0))
    const base = (ray.intersectObjects(skin, false)[0]?.point || new Vector3(1.65, 2.98, side * .25)).clone()
    base.x += .055
    for (let i = 0; i < 5; i++) attach(base.clone().add(new Vector3(0, (i - 2) * .018, side * .012 * i)), side, i)
    ray.ray.origin.set(3, 3.42, side * .38)
    const brow = ray.intersectObjects(skin, false)[0]
    if (brow) attach(brow.point.clone().add(new Vector3(.04, 0, 0)), side, 0, true)
  }
  scene.add(group); head.attach(group)
  group.updateWorldMatrix(true, false)
  const previous = group.getWorldQuaternion(new Quaternion()), current = new Quaternion(), delta = new Quaternion()
  const target = new Vector3()
  let elapsed = 0
  function update(dt, activity, reduced = false) {
    group.updateWorldMatrix(true, false)
    group.getWorldQuaternion(current)
    delta.copy(previous).invert().multiply(current)
    if (delta.w < 0) { delta.x *= -1; delta.y *= -1; delta.z *= -1; delta.w *= -1 }
    previous.copy(current)
    const turn = dt > 0 ? MathUtils.clamp(2 * delta.y / dt, -5, 5) : 0
    const nod = dt > 0 ? MathUtils.clamp(2 * delta.z / dt, -5, 5) : 0
    if (!reduced) elapsed += dt
    for (const strand of strands) {
      const { geometry, root, control, middle, end, bend, velocity, side, index, brow } = strand
      // Small asymmetric movement; no constant broad waving. Forward during attention,
      // gently relaxed during rest. The last two control points carry the spring lag.
      const attention = ['play', 'feed'].includes(activity) ? .045 : activity === 'rest' ? -.025 : 0
      target.set(attention - turn * side * .035, -nod * .025, 0)
      target.y += Math.sin(elapsed * 1.4 + index * .9 + side) * .004
      target.multiplyScalar(brow ? .35 : 1)
      if (reduced) { bend.set(0, 0, 0); velocity.set(0, 0, 0) }
      else {
        // Substeps keep the spring stable through frame-rate changes.
        const steps = Math.max(1, Math.ceil(dt / .008)), h = dt / steps
        for (let i = 0; i < steps; i++) {
          velocity.addScaledVector(sample.copy(target).sub(bend), h * 85)
          velocity.multiplyScalar(Math.exp(-h * 13))
          bend.addScaledVector(velocity, h)
        }
        bend.clampLength(0, .16)
      }
      strand.tip.copy(end).add(bend)
      strand.mid.copy(middle).addScaledVector(bend, .35)
      const positions = geometry.attributes.position, normals = geometry.attributes.normal
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        cubic(center, root, control, strand.mid, strand.tip, t)
        const u = 1 - t
        tangent.copy(control).sub(root).multiplyScalar(3 * u * u)
          .addScaledVector(sample.copy(strand.mid).sub(control), 6 * u * t)
          .addScaledVector(sample.copy(strand.tip).sub(strand.mid), 3 * t * t).normalize()
        normal.crossVectors(tangent, axis).normalize()
        binormal.crossVectors(tangent, normal).normalize()
        const radius = (brow ? .005 : .0075) * (1 - t) ** .8 + .0006
        for (let j = 0; j < sides; j++) {
          const theta = j / sides * Math.PI * 2
          sample.copy(normal).multiplyScalar(Math.cos(theta)).addScaledVector(binormal, Math.sin(theta))
          const n = i * sides + j
          normals.setXYZ(n, sample.x, sample.y, sample.z)
          sample.multiplyScalar(radius).add(center)
          positions.setXYZ(n, sample.x, sample.y, sample.z)
        }
      }
      positions.needsUpdate = true; normals.needsUpdate = true
    }
  }
  update(0, 'idle')
  return { update, strands }
}
