import { useEffect, useRef } from 'react'

// 手绘风格的杜鹃花组件
const Azalea = ({ size = 100, color = '#FF6B9D', className = '', animate = true }) => {
  const flowerRef = useRef(null)

  useEffect(() => {
    if (animate && flowerRef.current) {
      const petals = flowerRef.current.querySelectorAll('.petal')
      petals.forEach((petal, index) => {
        setTimeout(() => {
          petal.style.opacity = '1'
          petal.style.transform = 'scale(1) rotate(0deg)'
        }, index * 100)
      })
    }
  }, [animate])

  return (
    <svg
      ref={flowerRef}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}
    >
      {/* 花瓣 - 手绘风格 */}
      {[0, 72, 144, 216, 288].map((rotation, index) => (
        <ellipse
          key={index}
          className="petal"
          cx="50"
          cy="30"
          rx="15"
          ry="25"
          fill={color}
          opacity="0.85"
          transform={`rotate(${rotation} 50 50)`}
          style={{
            opacity: animate ? '0' : '0.85',
            transform: animate ? 'scale(0) rotate(-45deg)' : 'scale(1) rotate(0deg)',
            transformOrigin: '50px 50px',
            transition: 'all 0.5s ease-out',
            stroke: '#FF4081',
            strokeWidth: '1',
            strokeDasharray: '2,2',
          }}
        />
      ))}
      
      {/* 花蕊 */}
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="#FFD700"
        opacity="0.9"
        style={{
          stroke: '#FFA500',
          strokeWidth: '1.5',
          strokeDasharray: '1,1',
        }}
      />
      
      {/* 花蕊细节 */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
        const x = 50 + Math.cos((angle * Math.PI) / 180) * 4
        const y = 50 + Math.sin((angle * Math.PI) / 180) * 4
        return (
          <circle
            key={`stamen-${index}`}
            cx={x}
            cy={y}
            r="1.5"
            fill="#FF6B00"
          />
        )
      })}
    </svg>
  )
}

// 漂浮的杜鹃花装饰
export const FloatingAzalea = ({ delay = 0, duration = 20 }) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <Azalea size={60} animate={false} />
    </div>
  )
}

// 杜鹃花边框装饰
export const AzaleaBorder = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-4 left-4">
        <Azalea size={40} color="#FF6B9D" />
      </div>
      <div className="absolute top-4 right-4">
        <Azalea size={40} color="#FF85A6" />
      </div>
      <div className="absolute bottom-4 left-4">
        <Azalea size={40} color="#FF9FB8" />
      </div>
      <div className="absolute bottom-4 right-4">
        <Azalea size={40} color="#FFB3C6" />
      </div>
    </div>
  )
}

export default Azalea
