import { useEffect, useRef } from 'react'

// 大型素描风格杜鹃花背景 - 真实绘制动画
const LargeAzaleaBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 素描风格设置
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // 杜鹃花的路径点 - 精细的素描线条
    const drawSketchLine = (points, delay, duration, strokeWidth = 2, color = '#2D3748') => {
      return new Promise((resolve) => {
        setTimeout(() => {
          let progress = 0
          const totalPoints = points.length
          const interval = duration / totalPoints

          const drawInterval = setInterval(() => {
            if (progress >= totalPoints - 1) {
              clearInterval(drawInterval)
              resolve()
              return
            }

            const point1 = points[progress]
            const point2 = points[progress + 1]

            // 添加素描的抖动效果
            const jitter = 0.5
            const x1 = point1.x + (Math.random() - 0.5) * jitter
            const y1 = point1.y + (Math.random() - 0.5) * jitter
            const x2 = point2.x + (Math.random() - 0.5) * jitter
            const y2 = point2.y + (Math.random() - 0.5) * jitter

            ctx.strokeStyle = color
            ctx.lineWidth = strokeWidth + Math.random() * 0.5
            ctx.globalAlpha = 0.15 + Math.random() * 0.1

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()

            progress++
          }, interval)
        }, delay)
      })
    }

    // 绘制素描阴影线
    const drawHatchingLines = (centerX, centerY, radius, angle, density, delay) => {
      setTimeout(() => {
        for (let i = 0; i < density; i++) {
          setTimeout(() => {
            const startAngle = angle + (Math.random() - 0.5) * 0.3
            const length = radius * (0.5 + Math.random() * 0.5)
            const x1 = centerX + Math.cos(startAngle) * (radius * 0.3)
            const y1 = centerY + Math.sin(startAngle) * (radius * 0.3)
            const x2 = x1 + Math.cos(startAngle) * length
            const y2 = y1 + Math.sin(startAngle) * length

            ctx.strokeStyle = '#4A5568'
            ctx.lineWidth = 0.5 + Math.random() * 0.5
            ctx.globalAlpha = 0.08 + Math.random() * 0.05

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }, i * 30)
        }
      }, delay)
    }

    // 生成花瓣路径
    const generatePetalPath = (centerX, centerY, angle, size) => {
      const points = []
      const steps = 40
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const petalAngle = angle + (t - 0.5) * 0.8
        const distance = size * Math.sin(t * Math.PI) * 1.2
        
        const x = centerX + Math.cos(petalAngle) * distance
        const y = centerY + Math.sin(petalAngle) * distance
        
        points.push({ x, y })
      }
      
      return points
    }

    // 生成花瓣轮廓
    const generatePetalOutline = (centerX, centerY, angle, size) => {
      const points = []
      const steps = 50
      
      // 外轮廓
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const a = angle - 0.4 + t * 0.8
        const r = size * (0.3 + 0.7 * Math.sin(t * Math.PI))
        
        points.push({
          x: centerX + Math.cos(a) * r,
          y: centerY + Math.sin(a) * r
        })
      }
      
      return points
    }

    // 开始绘制动画
    const animate = async () => {
      // 右上角大花
      const flower1 = {
        x: canvas.width * 0.85,
        y: canvas.height * 0.15,
        size: 200
      }

      // 左下角大花
      const flower2 = {
        x: canvas.width * 0.15,
        y: canvas.height * 0.85,
        size: 250
      }

      // 绘制第一朵花
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
        
        // 花瓣轮廓
        const outline = generatePetalOutline(flower1.x, flower1.y, angle, flower1.size)
        await drawSketchLine(outline, i * 400, 800, 1.5, '#3D3D3D')
        
        // 花瓣纹理线
        const vein = generatePetalPath(flower1.x, flower1.y, angle, flower1.size * 0.8)
        await drawSketchLine(vein, i * 400 + 200, 600, 1, '#4A5568')
        
        // 阴影线
        drawHatchingLines(flower1.x, flower1.y, flower1.size, angle, 15, i * 400 + 400)
      }

      // 绘制花蕊
      setTimeout(() => {
        const stamenSteps = 30
        for (let i = 0; i < stamenSteps; i++) {
          setTimeout(() => {
            const angle = (i / stamenSteps) * Math.PI * 2
            const radius = 15 + Math.random() * 10
            const x = flower1.x + Math.cos(angle) * radius
            const y = flower1.y + Math.sin(angle) * radius

            ctx.fillStyle = '#2D3748'
            ctx.globalAlpha = 0.2 + Math.random() * 0.1
            ctx.beginPath()
            ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2)
            ctx.fill()
          }, i * 50)
        }
      }, 2500)

      // 绘制第二朵花
      setTimeout(async () => {
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5
          
          const outline = generatePetalOutline(flower2.x, flower2.y, angle, flower2.size)
          await drawSketchLine(outline, i * 450, 900, 1.8, '#3D3D3D')
          
          const vein = generatePetalPath(flower2.x, flower2.y, angle, flower2.size * 0.85)
          await drawSketchLine(vein, i * 450 + 250, 700, 1.2, '#4A5568')
          
          drawHatchingLines(flower2.x, flower2.y, flower2.size, angle, 20, i * 450 + 500)
        }

        // 第二朵花的花蕊
        setTimeout(() => {
          const stamenSteps = 40
          for (let i = 0; i < stamenSteps; i++) {
            setTimeout(() => {
              const angle = (i / stamenSteps) * Math.PI * 2
              const radius = 18 + Math.random() * 12
              const x = flower2.x + Math.cos(angle) * radius
              const y = flower2.y + Math.sin(angle) * radius

              ctx.fillStyle = '#2D3748'
              ctx.globalAlpha = 0.2 + Math.random() * 0.1
              ctx.beginPath()
              ctx.arc(x, y, 1.2 + Math.random(), 0, Math.PI * 2)
              ctx.fill()
            }, i * 60)
          }
        }, 2800)
      }, 1000)

      // 添加一些装饰性的素描线条
      setTimeout(() => {
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height
            const length = 20 + Math.random() * 40
            const angle = Math.random() * Math.PI * 2

            ctx.strokeStyle = '#E5E7EB'
            ctx.lineWidth = 0.5
            ctx.globalAlpha = 0.03 + Math.random() * 0.02

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
            ctx.stroke()
          }, i * 100)
        }
      }, 4000)
    }

    animate()

    // 窗口大小改变时重新绘制
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      animate()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          opacity: 1,
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  )
}

export default LargeAzaleaBackground
