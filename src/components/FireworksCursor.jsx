import { useEffect } from 'react'

const FireworksCursor = () => {
  useEffect(() => {
    const createAzaleaBloom = (x, y) => {
      // 杜鹃花的颜色 - 粉色和红色系
      const azaleaColors = ['#FF6B9D', '#FF85A6', '#FF5C8D', '#FFA0B8', '#FF4D7D', '#FFB3C6']
      const flowerCount = 12 // 更多小花，更灵动
      
      for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div')
        flower.className = 'azalea-flower'
        
        const angle = (Math.PI * 2 * i) / flowerCount + (Math.random() - 0.5) * 0.3
        const distance = 40 + Math.random() * 50
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - Math.random() * 20 // 增加向上飘的感觉
        
        flower.style.left = x + 'px'
        flower.style.top = y + 'px'
        flower.style.setProperty('--tx', tx + 'px')
        flower.style.setProperty('--ty', ty + 'px')
        flower.style.setProperty('--rotation', (Math.random() * 720 - 360) + 'deg') // 更大的旋转角度
        flower.style.setProperty('--duration', (1 + Math.random() * 0.5) + 's') // 随机动画时长
        
        // 创建更小的花瓣
        const color = azaleaColors[Math.floor(Math.random() * azaleaColors.length)]
        flower.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 12 12" style="filter: drop-shadow(0 0.5px 1px rgba(0,0,0,0.15));">
            <g transform="translate(6,6)">
              ${[0, 72, 144, 216, 288].map(angle => `
                <ellipse cx="0" cy="-3" rx="1.8" ry="3" fill="${color}" 
                  transform="rotate(${angle})" opacity="0.85"/>
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
    
    const handleClick = (e) => {
      createAzaleaBloom(e.clientX, e.clientY)
    }
    
    document.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])
  
  return null
}

export default FireworksCursor
