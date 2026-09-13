import { useEffect, useRef, useState } from 'react'
import Camellia from './Camellia'

export default function CamelliaBody({ motionRef }) {
  const hostRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let disposed = false, renderer, frame, model, scene
    const host = hostRef.current
    const disposeScene = root => root?.traverse(object => {
      object.geometry?.dispose()
      object.skeleton?.dispose()
      const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []
      for (const material of materials) { material.map?.dispose(); material.dispose() }
    })
    const start = async () => {
      try {
        const [T, { GLTFLoader }, { createCatRig }, { softenHindquarters, shapeCatFace, addShortCoat }, { createWhiskers }] = await Promise.all([
          import('three'), import('three/addons/loaders/GLTFLoader.js'), import('./camelliaRig'), import('./camelliaCoat'), import('./camelliaWhiskers'),
        ])
        if (disposed) return
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
        // Supersample the small portrait so tapered whiskers remain continuous.
        renderer.setPixelRatio(2)
        renderer.setSize(180, 160)
        renderer.setClearColor(0x000000, 0)
        renderer.outputColorSpace = T.SRGBColorSpace
        renderer.toneMapping = T.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.3
        renderer.domElement.setAttribute('aria-hidden', 'true')
        host.appendChild(renderer.domElement)
        scene = new T.Scene()
        const camera = new T.OrthographicCamera(-2.9, 2.9, 2.58, -2.58, .1, 30)
        camera.position.set(4.2, 3.4, 9)
        camera.lookAt(0, 1.8, 0)
        scene.add(new T.HemisphereLight(0xfff9e9, 0x8e9685, 2.6))
        const sun = new T.DirectionalLight(0xfff1d5, 2)
        sun.position.set(-3, 6, 5); scene.add(sun)
        const fill = new T.DirectionalLight(0xbac9e0, 1.1)
        fill.position.set(3, 3, -4); scene.add(fill)
        const pivot = new T.Group(); scene.add(pivot)
        const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/camellia.glb`)
        if (disposed) { disposeScene(gltf.scene); return }
        model = gltf.scene
        pivot.add(model)
        model.updateMatrixWorld(true)
        model.traverse(object => {
          if (!object.isMesh) return
          object.frustumCulled = false
          if (object.isSkinnedMesh) { softenHindquarters(object); shapeCatFace(object) }
          // Share normals at coincident vertices, keeping UVs and skin weights intact.
          const normal = object.geometry.attributes.normal
          const position = object.geometry.attributes.position
          const sums = new Map()
          const keys = []
          for (let i = 0; i < position.count; i++) {
            const key = [position.getX(i), position.getY(i), position.getZ(i)].map(v => Math.round(v * 1e6)).join(',')
            keys.push(key)
            if (!sums.has(key)) sums.set(key, new T.Vector3())
            sums.get(key).add(new T.Vector3().fromBufferAttribute(normal, i))
          }
          for (const sum of sums.values()) sum.normalize()
          keys.forEach((key, i) => { const n = sums.get(key); normal.setXYZ(i, n.x, n.y, n.z) })
          normal.needsUpdate = true
          const material = object.material
          material.roughness = .95; material.metalness = 0
          // Rest-space colouring follows the skin through deformation: blue back,
          // gold flanks, cream bib, pink nose/ears and dark olive eyes.
          const positions = object.geometry.attributes.position
          const colors = []
          const point = new T.Vector3(), blue = new T.Color('#939fa6'), gold = new T.Color('#d9c39c'), cream = new T.Color('#f5e9d1')
          for (let i = 0; i < positions.count; i++) {
            point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld)
            const back = T.MathUtils.smoothstep(point.y, 1.45, 2.15) * (1 - T.MathUtils.smoothstep(point.x, .7, 1.5))
            const underside = 1 - T.MathUtils.smoothstep(point.y, .6, 1.45)
            const faceCream = T.MathUtils.smoothstep(point.x, 1, 1.7) * (1 - T.MathUtils.smoothstep(point.y, 2.5, 3.3))
            const color = gold.clone().lerp(blue, back).lerp(cream, Math.max(underside, faceCream) * .85)
            colors.push(color.r, color.g, color.b)
          }
          object.geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3))
          material.vertexColors = true
          material.needsUpdate = true
        })
        // Softer, rounder shorthair proportions for Camellia.
        const head = model.getObjectByName('Head')
        const neck = model.getObjectByName('Neck')
        if (head) head.scale.multiplyScalar(1.16)
        if (neck) neck.position.y *= .76
        model.updateMatrixWorld(true)
        const eyes = []
        const skin = []
        model.traverse(object => { if (object.isSkinnedMesh) { object.skeleton.update(); skin.push(object) } })
        // The source mesh has no eyes. Add Camellia's round eyes to the head bone.
        if (head) for (const side of [-1, 1]) {
          const ray = new T.Raycaster(new T.Vector3(3, 3.22, side * .38), new T.Vector3(-1, 0, 0))
          const hit = ray.intersectObjects(skin, false)[0]
          const eye = new T.Group()
          eye.position.copy(hit?.point || new T.Vector3(1.7, 3.22, side * .38))
          eye.position.x += .035
          eye.rotation.y = -side * .35
          const iris = new T.Mesh(new T.SphereGeometry(.16, 20, 14), new T.MeshStandardMaterial({ color: '#718780', roughness: .45 }))
          iris.scale.set(.38, 1.1, 1); eye.add(iris)
          const pupil = new T.Mesh(new T.SphereGeometry(.105, 16, 12), new T.MeshStandardMaterial({ color: '#202b2c', roughness: .25 }))
          pupil.position.x = .055; pupil.scale.set(.35, 1.15, 1); eye.add(pupil)
          const shine = new T.Mesh(new T.SphereGeometry(.032, 10, 8), new T.MeshBasicMaterial({ color: '#fffdf1' }))
          shine.position.set(.092, .055, -.035); eye.add(shine)
          scene.add(eye); head.attach(eye); eyes.push({ group: eye, scale: eye.scale.clone() })
        }
        const whiskers = head ? createWhiskers(head, skin, scene) : null
        for (const mesh of skin) addShortCoat(mesh)
        const rig = createCatRig(model)
        const shadow = new T.Mesh(new T.CircleGeometry(1, 40), new T.MeshBasicMaterial({ color: 0x5b6554, transparent: true, opacity: .12, depthWrite: false }))
        shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1.7, .55, 1); shadow.position.y = -.08; scene.add(shadow)
        const contactBounds = new T.Box3()
        const rollCenter = new T.Vector3(0, 1.05, 0)
        const rotatedCenter = new T.Vector3()
        const yawAxis = new T.Vector3(0, 1, 0), rollAxis = new T.Vector3(1, 0, 0)
        const rollRotation = new T.Quaternion()
        let last = 0, angle = 0, playTime = 0
        setStatus('ready')
        host.dataset.renderer = 'skinned-mesh'
        const render = now => {
          if (disposed) return
          const dt = Math.min((now - (last || now)) / 1000, .04); last = now
          const state = motionRef.current
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          pivot.rotation.set(0, 0, 0); pivot.position.set(0, 0, 0); pivot.updateMatrixWorld(true)
          const pose = rig.update(reduced ? 0 : dt, { ...state, speed: reduced ? 0 : state.speed })
          const targetAngle = state.heading ?? (state.facing < 0 ? Math.PI - .3 : -.2)
          const delta = Math.atan2(Math.sin(targetAngle - angle), Math.cos(targetAngle - angle))
          angle += delta * (1 - Math.exp(-dt * 5))
          pivot.rotation.y = angle
          if (state.activity === 'play') { playTime += dt; pivot.position.y = reduced ? 0 : Math.max(0, Math.sin(playTime * 4)) * .22 }
          else playTime = 0
          if (pose.rollCrouch > .001 && !reduced) {
            // Yaw first, then roll along the CAT's long axis (never the screen axis).
            pivot.quaternion.setFromAxisAngle(yawAxis, angle)
              .multiply(rollRotation.setFromAxisAngle(rollAxis, pose.rollAngle))
            rotatedCenter.copy(rollCenter).applyQuaternion(pivot.quaternion)
            pivot.position.copy(rollCenter).sub(rotatedCenter)
          }
          if (pose.rollCrouch > .001 && !reduced) {
            // Keep the deformed mesh on the lawn throughout the side-lying pose.
            pivot.updateMatrixWorld(true)
            for (const mesh of skin) mesh.skeleton.update()
            contactBounds.setFromObject(model, true)
            pivot.position.y += (-.08 - contactBounds.min.y) * Math.min(1, pose.rollCrouch * 8)
          }
          whiskers?.update(dt, state.activity, reduced)
          const blinkPhase = pose.elapsed % 4.7
          const blink = blinkPhase > 4.5 ? .18 + Math.abs(blinkPhase - 4.6) * 8.2 : 1
          const eyelid = ['pet', 'scratch', 'rest'].includes(state.activity) ? .25 : blink
          for (const eye of eyes) eye.group.scale.y = eye.scale.y * eyelid
          renderer.toneMappingExposure = state.night ? .85 : 1.1
          renderer.render(scene, camera)
          host.dataset.activity = state.activity
          frame = requestAnimationFrame(render)
        }
        frame = requestAnimationFrame(render)
      } catch (error) {
        if (!disposed) { setStatus('error'); host.dataset.renderer = 'fallback'; console.warn('Camellia 3D renderer unavailable:', error.message) }
      }
    }
    start()
    return () => { disposed = true; cancelAnimationFrame(frame); disposeScene(scene); renderer?.dispose(); renderer?.domElement.remove() }
  }, [motionRef])

  return <div ref={hostRef} className="camellia-body-3d" data-status={status}>
    {status !== 'ready' && <div className="camellia-body-fallback"><Camellia /></div>}
  </div>
}
