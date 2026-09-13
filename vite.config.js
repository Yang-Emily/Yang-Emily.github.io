import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync } from 'node:fs'
import { resolve } from 'node:path'

// Keep the large editing reference local; publish only the extracted cat footage.
function copyGardenAssets() {
  let config
  return {
    name: 'copy-garden-assets',
    apply: 'build',
    configResolved(value) { config = value },
    writeBundle() {
      cpSync(config.publicDir, resolve(config.root, config.build.outDir), {
        recursive: true,
        filter: source => !['IMG_2124.MOV', 'e3da5fccb35a4ee5a8970b436a597f05.MOV'].some(name => source === resolve(config.publicDir, name)),
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyGardenAssets()],
  build: { copyPublicDir: false },
  base: '/', // 开发时使用根路径，部署时改回 '/personal-website/'
})
