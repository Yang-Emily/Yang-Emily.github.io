import { Float32BufferAttribute, Vector3, SkinnedMesh, MathUtils } from 'three'

// Soften the pelvis and upper thighs while preserving the paw and tail anchors.
export function softenHindquarters(mesh) {
  const positions = mesh.geometry.attributes.position
  const indices = mesh.geometry.attributes.skinIndex
  const weights = mesh.geometry.attributes.skinWeight
  const inverse = mesh.matrixWorld.clone().invert()
  const point = new Vector3()
  for (let i = 0; i < positions.count; i++) {
    let pelvis = 0
    for (let k = 0; k < 4; k++) {
      const bone = mesh.skeleton.bones[indices.getComponent(i, k)].name
      if (bone === 'butt') pelvis += weights.getComponent(i, k)
      else if (bone === 'L_BLeg_Upper' || bone === 'R_BLeg_Upper') pelvis += .65 * weights.getComponent(i, k)
    }
    point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld)
    const amount = pelvis * MathUtils.smoothstep(point.y, .85, 1.5)
    point.z *= 1 - .23 * amount
    if (point.x < -.8) point.x += (-.8 - point.x) * .23 * amount
    point.applyMatrix4(inverse)
    positions.setXYZ(i, point.x, point.y, point.z)
  }
  positions.needsUpdate = true
  mesh.geometry.computeVertexNormals()
  mesh.geometry.computeBoundingBox()
  mesh.geometry.computeBoundingSphere()
}

// Keep a short muzzle and broad cheeks instead of the source model's long profile.
export function shapeCatFace(mesh) {
  const { position, skinIndex, skinWeight } = mesh.geometry.attributes
  const inverse = mesh.matrixWorld.clone().invert(), point = new Vector3()
  for (let i = 0; i < position.count; i++) {
    let head = 0
    for (let k = 0; k < 4; k++) {
      if (mesh.skeleton.bones[skinIndex.getComponent(i, k)].name === 'Head') head += skinWeight.getComponent(i, k)
    }
    point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld)
    if (point.x > 1.2) point.x -= (point.x - 1.2) * .35 * head
    const cheek = (1 - MathUtils.smoothstep(point.y, 3.35, 3.65)) * head
    point.z *= 1 + .15 * cheek
    point.applyMatrix4(inverse)
    position.setXYZ(i, point.x, point.y, point.z)
  }
  position.needsUpdate = true
  mesh.geometry.computeVertexNormals()
  mesh.geometry.computeBoundingBox()
  mesh.geometry.computeBoundingSphere()
}

// Fine coat grain stays in bind space so it moves with the skinned surface.
const noise = `
  varying vec3 vCoatPosition;
  float coatHash(vec3 p) {
    p = fract(p * .1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
`

function shaderForCoat(layer, localLength) {
  return shader => {
    shader.vertexShader = 'attribute vec3 coatPosition; varying vec3 vCoatPosition;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vCoatPosition = coatPosition;
      transformed += normal * ${localLength.toFixed(8)} * ${layer.toFixed(4)};
    `)
    shader.fragmentShader = noise + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      float strand = coatHash(floor(vCoatPosition * vec3(85., 150., 150.)));
      bool bareSkin = false;
      #ifdef USE_MAP
        vec4 texel = texture2D(map, vMapUv);
        bareSkin = texel.r > texel.g * 1.3 && texel.b > texel.g * 1.3;
        if (bareSkin) diffuseColor.rgb = vec3(.64, .36, .34);
      #endif
      ${layer > 0 ? `
        if (bareSkin || strand < ${(.28 + layer * .62).toFixed(4)}) discard;
        diffuseColor.rgb *= ${(.86 + layer * .14).toFixed(4)};
      ` : `
        if (!bareSkin) diffuseColor.rgb *= .76 + .24 * strand;
      `}
    `)
  }
}

export function addShortCoat(mesh) {
  const points = [], point = new Vector3()
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    point.fromBufferAttribute(mesh.geometry.attributes.position, i).applyMatrix4(mesh.matrixWorld)
    points.push(point.x, point.y, point.z)
  }
  mesh.geometry.setAttribute('coatPosition', new Float32BufferAttribute(points, 3))
  const localLength = .065 / mesh.getWorldScale(new Vector3()).x
  mesh.material.roughness = 1
  mesh.material.onBeforeCompile = shaderForCoat(0, localLength)
  mesh.material.customProgramCacheKey = () => 'camellia-short-coat-base-v1'
  mesh.material.needsUpdate = true
  // Sparse shells form actual short fibres at the silhouette, using the same skin.
  // Seven lightweight passes, no independent hair physics or external texture load.
  for (let i = 1; i <= 7; i++) {
    const material = mesh.material.clone()
    material.onBeforeCompile = shaderForCoat(i / 7, localLength)
    material.customProgramCacheKey = () => `camellia-short-coat-shell-${i}-v1`
    const shell = new SkinnedMesh(mesh.geometry, material)
    shell.name = `Camellia short coat ${i}`
    shell.position.copy(mesh.position); shell.quaternion.copy(mesh.quaternion); shell.scale.copy(mesh.scale)
    shell.bindMode = mesh.bindMode
    shell.bind(mesh.skeleton, mesh.bindMatrix)
    shell.frustumCulled = false
    mesh.parent.add(shell)
  }
}
