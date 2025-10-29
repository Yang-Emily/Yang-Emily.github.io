import { useEffect, useState } from 'react'

// 鼠标跟随轨迹效果
const CursorTrail = () => {
  const [trails, setTrails] = useState([])

  useEffect(() => {
    let trailId = 0

    const handleMouseMove = (e) => {
      const newTrail = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
      }

      setTrails((prev) => [...prev.slice(-15), newTrail])
    }

    window.addEventListener('mousemove', handleMouseMove)

    // 清理旧轨迹
    const interval = setInterval(() => {
      setTrails((prev) => prev.slice(1))
    }, 50)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {trails.map((trail, index) => (
        <div
          key={trail.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: trail.x,
            top: trail.y,
            backgroundColor: `hsla(${330 + index * 5}, 70%, 60%, ${0.6 - index * 0.04})`,
            transform: `translate(-50%, -50%) scale(${1 - index * 0.05})`,
            transition: 'all 0.1s ease-out',
          }}
        />
      ))}
    </div>
  )
}

export default CursorTrail
