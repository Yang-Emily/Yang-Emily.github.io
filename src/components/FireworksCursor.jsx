import { useEffect } from 'react'

const FireworksCursor = () => {
  useEffect(() => {
    const createAzaleaBloom = (x, y) => {
      const azaleaColors = ['#FF6B9D', '#FF85A6', '#FF5C8D', '#FFA0B8', '#FF4D7D', '#FFB3C6']
      const flowerCount = 12

      for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div')
        flower.className = 'azalea-flower'

        const angle = (Math.PI * 2 * i) / flowerCount + (Math.random() - 0.5) * 0.3
        const distance = 40 + Math.random() * 50
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - Math.random() * 20

        flower.style.left = x + 'px'
        flower.style.top = y + 'px'
        flower.style.setProperty('--tx', tx + 'px')
        flower.style.setProperty('--ty', ty + 'px')
        flower.style.setProperty('--rotation', (Math.random() * 720 - 360) + 'deg')
        flower.style.setProperty('--duration', (1 + Math.random() * 0.5) + 's')

        const color = azaleaColors[Math.floor(Math.random() * azaleaColors.length)]
        flower.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 12 12" style="filter: drop-shadow(0 0.5px 1px rgba(0,0,0,0.15));">
            <g transform="translate(6,6)">
              ${[0, 72, 144, 216, 288].map((petalAngle) => `
                <ellipse cx="0" cy="-3" rx="1.8" ry="3" fill="${color}"
                  transform="rotate(${petalAngle})" opacity="0.85"/>
              `).join('')}
              <circle cx="0" cy="0" r="1.2" fill="#FFD700"/>
            </g>
          </svg>
        `

        document.body.appendChild(flower)

        setTimeout(() => {
          flower.remove()
        }, 1500)
      }
    }

    const createMagicBurst = (x, y) => {
      const magicColors = ['#A78BFA', '#8B5CF6', '#C4B5FD', '#F5D0FE', '#FDE68A', '#E9D5FF']
      const magicSymbols = ['✦', '✧', '⋆', '☾', '⟡']
      const particleCount = 14

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'azalea-flower'

        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3
        const distance = 40 + Math.random() * 50
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - Math.random() * 28

        particle.style.left = x + 'px'
        particle.style.top = y + 'px'
        particle.style.setProperty('--tx', tx + 'px')
        particle.style.setProperty('--ty', ty + 'px')
        particle.style.setProperty('--rotation', (Math.random() * 720 - 360) + 'deg')
        particle.style.setProperty('--duration', (1 + Math.random() * 0.5) + 's')

        const color = magicColors[Math.floor(Math.random() * magicColors.length)]
        const symbol = magicSymbols[Math.floor(Math.random() * magicSymbols.length)]
        const size = 14 + Math.floor(Math.random() * 8)

        particle.innerHTML = `
          <div style="
            color: ${color};
            font-size: ${size}px;
            line-height: 1;
            text-shadow: 0 0 10px rgba(167, 139, 250, 0.28);
            transform: rotate(${Math.random() * 30 - 15}deg);
          ">${symbol}</div>
        `

        document.body.appendChild(particle)

        setTimeout(() => {
          particle.remove()
        }, 1500)
      }
    }

    const handleClick = (e) => {
      if (window.location.hash === '#/trial') {
        createMagicBurst(e.clientX, e.clientY)
      } else {
        createAzaleaBloom(e.clientX, e.clientY)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return null
}

export default FireworksCursor
