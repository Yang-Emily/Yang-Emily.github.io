import { useEffect, useRef, useState } from 'react'
import { Code, Palette, Brain, Zap } from 'lucide-react'

// 可视化技能图表
const SkillsVisualization = () => {
  const [hoveredSkill, setHoveredSkill] = useState(null)

  const skills = [
    { name: 'JavaScript/TypeScript', level: 90, icon: <Code size={20} />, color: '#F7DF1E' },
    { name: 'React & Frontend', level: 85, icon: <Palette size={20} />, color: '#61DAFB' },
    { name: 'Python', level: 80, icon: <Code size={20} />, color: '#3776AB' },
    { name: 'HCI Research', level: 88, icon: <Brain size={20} />, color: '#FF6B9D' },
    { name: 'Type Systems', level: 75, icon: <Zap size={20} />, color: '#6B5FFF' },
    { name: 'User Studies', level: 82, icon: <Brain size={20} />, color: '#10B981' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold font-handwriting text-center mb-8">
        Skills & Expertise
      </h3>
      
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => setHoveredSkill(skill.name)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            {/* Skill name and icon */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div style={{ color: skill.color }}>
                  {skill.icon}
                </div>
                <span className="font-semibold text-sm">{skill.name}</span>
              </div>
              <span className="text-sm text-sketch/60 font-mono">
                {skill.level}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="relative h-6 bg-gray-100 border-2 border-ink rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{
                  width: `${hoveredSkill === skill.name ? skill.level : 0}%`,
                  backgroundColor: skill.color,
                  opacity: 0.8,
                }}
              >
                {hoveredSkill === skill.name && (
                  <span className="text-xs font-bold text-white">
                    {skill.level}%
                  </span>
                )}
              </div>
              
              {/* Hand-drawn effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 10px,
                    rgba(0,0,0,0.05) 10px,
                    rgba(0,0,0,0.05) 11px
                  )`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive radar chart placeholder */}
      <div className="mt-8 p-6 sketch-card bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-center text-sm text-sketch/70 font-handwriting">
          💡 Hover over skills to see proficiency levels!
        </p>
      </div>
    </div>
  )
}

export default SkillsVisualization
