import { Quaternion, Vector3, MathUtils } from 'three'

const Y = new Vector3(0, 1, 0)
const Z = new Vector3(0, 0, 1)
const point = bone => bone.getWorldPosition(new Vector3())

// Solve a bent upper/lower limb, then keep the paw level with the lawn.
export function solveLeg(leg, target, bend) {
  const hip = point(leg.upper)
  const delta = target.clone().sub(hip)
  const distance = MathUtils.clamp(delta.length(), .05, leg.a + leg.b - .002)
  const direction = delta.normalize()
  const pole = new Vector3(bend, 0, 0).addScaledVector(direction, -bend * direction.x).normalize()
  const along = (leg.a * leg.a - leg.b * leg.b + distance * distance) / (2 * distance)
  const knee = hip.clone().addScaledVector(direction, along).addScaledVector(pole, Math.sqrt(Math.max(0, leg.a * leg.a - along * along)))
  const aim = (bone, end, destination) => {
    const origin = point(bone)
    const rotation = new Quaternion().setFromUnitVectors(point(end).sub(origin).normalize(), destination.clone().sub(origin).normalize())
    const world = bone.getWorldQuaternion(new Quaternion()).premultiply(rotation)
    bone.quaternion.copy(bone.parent.getWorldQuaternion(new Quaternion()).invert().multiply(world))
    bone.updateWorldMatrix(false, true)
  }
  aim(leg.upper, leg.lower, knee)
  aim(leg.lower, leg.foot, target)
  leg.foot.quaternion.copy(leg.foot.parent.getWorldQuaternion(new Quaternion()).invert().multiply(leg.pawRotation))
}

export function createCatRig(model) {
  model.updateMatrixWorld(true)
  const bones = {}
  const rest = []
  model.traverse(node => { if (node.isBone) { bones[node.name] = node; rest.push({ node, position: node.position.clone(), quaternion: node.quaternion.clone() }) } })
  const legs = ['L_B', 'R_B', 'L_', 'R_'].map((prefix, index) => {
    const back = index < 2
    const upper = bones[`${prefix}Leg_Upper`], lower = bones[`${prefix}Leg_Lower`], foot = bones[`${prefix}Foot`]
    return { upper, lower, foot, back, a: point(upper).distanceTo(point(lower)), b: point(lower).distanceTo(point(foot)), ankle: point(foot), pawRotation: foot.getWorldQuaternion(new Quaternion()), phase: [0, .5, .75, .25][index] }
  })
  let phase = 0, blend = 0, elapsed = 0, rollTime = 0, rollAngle = 0, rollCrouch = 0
  const poses = { sit: 0, sleep: 0, eat: 0, love: 0, roll: 0 }
  const rotate = (name, axis, angle) => bones[name]?.quaternion.multiply(new Quaternion().setFromAxisAngle(axis, angle))
  return {
    bones,
    update(dt, state) {
      elapsed += dt
      rollTime = state.activity === 'roll' ? rollTime + dt : 0
      // A single authored phrase: crouch, lie on one side, rub the back, recover.
      const smooth = (a, b) => MathUtils.smoothstep(rollTime, a, b)
      const crouchTarget = state.activity === 'roll' ? smooth(0, .8) * (1 - smooth(4.7, 5.8)) : 0
      const side = smooth(.8, 1.7) * (1 - smooth(3.8, 4.8))
      const back = smooth(1.8, 2.5) * (1 - smooth(3, 3.7))
      const angleTarget = state.activity === 'roll' ? side * 1.3 + back * .35 : 0
      const settle = 1 - Math.exp(-dt * 9)
      rollAngle += (angleTarget - rollAngle) * settle
      rollCrouch += (crouchTarget - rollCrouch) * settle
      for (const item of rest) { item.node.position.copy(item.position); item.node.quaternion.copy(item.quaternion) }
      const moving = ['walk', 'run'].includes(state.activity) && state.speed > 1
      const run = state.activity === 'run'
      const ease = 1 - Math.exp(-dt * 8)
      blend += ((moving ? 1 : 0) - blend) * ease
      const wantSit = ['idle', 'pet', 'scratch'].includes(state.activity)
      const targets = { sit: wantSit ? 1 : 0, sleep: state.activity === 'rest' ? 1 : 0, eat: state.activity === 'feed' ? 1 : 0, love: ['pet', 'scratch'].includes(state.activity) ? 1 : 0, roll: state.activity === 'roll' ? 1 : 0 }
      for (const key of Object.keys(poses)) poses[key] += (targets[key] - poses[key]) * ease
      // Stride advances with actual travel, so changing speed does not slide the paws.
      const stride = run ? .62 : .44
      const modelUnitsPerPixel = 5.8 / 180
      phase += state.speed * modelUnitsPerPixel * dt / (2 * stride) * .68
      const cycle = phase * Math.PI * 2
      const bounce = (run ? .06 : .018) * Math.cos(cycle * 2) * blend
      const locomotionDrop = blend * (run ? .18 : .08)
      const hipsDrop = poses.sit * .55 + poses.sleep * .7 + rollCrouch * .6 + locomotionDrop
      const chestDrop = poses.sleep * .7 + poses.eat * .22 + rollCrouch * .6 + locomotionDrop
      for (const leg of legs) leg.upper.position.z -= (leg.back ? hipsDrop : chestDrop) / 33.38965
      bones.butt.position.z -= hipsDrop / 33.38965
      bones.chest.position.z -= chestDrop / 33.38965
      bones.belly.position.z -= (hipsDrop + chestDrop) * .5 / 33.38965
      bones.root.position.z += (bounce - locomotionDrop - rollCrouch * .6) / 33.38965
      // The tail root follows the pelvis; otherwise sitting stretches a rump ridge.
      bones.tail1.position.y -= (hipsDrop - locomotionDrop - rollCrouch * .6) / 33.38965
      // Spine, shoulder and neck move separately instead of bouncing the entire cutout.
      rotate('root', Z, -.13 * poses.sit + Math.sin(cycle) * .025 * blend)
      rotate('belly', Z, Math.sin(cycle + .6) * .025 * blend)
      bones.Neck.position.y -= .032 * poses.eat
      rotate('Neck', Z, -.85 * poses.eat + .13 * poses.sit)
      rotate('Head', Z, -.48 * poses.eat + Math.sin(elapsed * 1.8) * .045 * (1 - blend))
      bones.Neck.position.y -= .018 * rollCrouch
      rotate('Neck', Z, -.55 * rollCrouch)
      rotate('Head', Z, -.18 * rollCrouch)
      rotate('Head', Y, Math.sin(elapsed * 2) * .13 * poses.love)
      for (let i = 1; i <= 4; i++) rotate(`tail${i}`, Z, Math.sin(elapsed * 1.7 - i * .55) * .10 + poses.sit * -.14)
      model.updateMatrixWorld(true)
      for (const leg of legs) {
        const offset = run ? (leg.back ? (leg.phase === 0 ? 0 : .5) : (leg.phase === .75 ? .5 : 0)) : leg.phase
        const p = (phase + offset) % 1
        const stance = .68
        let x, lift
        if (p < stance) { x = stride * (1 - 2 * p / stance); lift = 0 }
        else { const t = (p - stance) / (1 - stance); x = stride * (-1 + 2 * (t * t * (3 - 2 * t))); lift = Math.sin(t * Math.PI) * (run ? .32 : .18) }
        const target = leg.ankle.clone()
        target.x += x * blend
        target.y += lift * blend
        if (leg.back) { target.x += poses.sit * .12; target.y += poses.sleep * .04 }
        else target.x -= poses.sleep * .35
        // Tuck the paws toward the belly before lying on the side.
        target.x += (leg.back ? .2 : -.28) * rollCrouch
        target.y += .26 * rollCrouch
        target.z *= 1 - .2 * rollCrouch
        // A small standing crouch leaves room for elbow and hock flexion.
        leg.upper.position.z -= .055 / 33.38965
        leg.upper.updateWorldMatrix(true, true)
        solveLeg(leg, target, leg.back ? 1 : -1)
      }
      model.updateMatrixWorld(true)
      return { ...poses, elapsed, rollAngle, rollCrouch }
    },
  }
}
