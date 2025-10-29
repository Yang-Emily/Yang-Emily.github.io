import { useEffect, useRef } from 'react'
import { annotate } from 'rough-notation'
import { Code, Users, Lightbulb, BookOpen } from 'lucide-react'
import SkillsVisualization from './SkillsVisualization'
import Timeline from './Timeline'
import Azalea from './Azalea'

const About = () => {
  const highlightRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && highlightRef.current) {
            const annotation = annotate(highlightRef.current, {
              type: 'highlight',
              color: '#FDE68A',
              strokeWidth: 2,
            })
            annotation.show()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (highlightRef.current) {
      observer.observe(highlightRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const interests = [
    {
      icon: <Code size={32} />,
      title: 'Programming Languages',
      description: 'Type systems, language design, and developer tools',
    },
    {
      icon: <Users size={32} />,
      title: 'Human-Computer Interaction',
      description: 'User experience, interaction design, and usability',
    },
    {
      icon: <Lightbulb size={32} />,
      title: 'Creative Coding',
      description: 'End-user programming and computational thinking',
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Education Technology',
      description: 'Learning environments and educational tools',
    },
  ]

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative azaleas */}
      <div className="absolute top-10 right-10 opacity-20">
        <Azalea size={120} color="#FF6B9D" animate={false} />
      </div>
      <div className="absolute bottom-10 left-10 opacity-20">
        <Azalea size={100} color="#FF85A6" animate={false} />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-handwriting">
            About Me
          </h2>
          <div className="w-24 h-1 bg-ink mx-auto" style={{ transform: 'rotate(-1deg)' }}></div>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Left column - Bio */}
          <div className="sketch-card p-8">
            <h3 className="text-2xl font-bold mb-4 font-handwriting">My Journey</h3>
            <div className="space-y-4 text-sketch/90">
              <p>
                I'm currently pursuing my PhD, where I explore how we can make
                programming more <span ref={highlightRef} className="font-semibold">human-centered and accessible</span>.
              </p>
              <p>
                My work sits at the fascinating intersection of HCI and PL, combining
                insights from both fields to create better programming experiences.
              </p>
              <p>
                I believe that the future of programming lies in tools that understand
                human cognition and adapt to how people naturally think and work.
              </p>
            </div>
          </div>

          {/* Right column - Quick facts */}
          <div className="space-y-6">
            <div className="sketch-card p-6 bg-blue-50">
              <h4 className="font-bold text-lg mb-2">🎓 Education</h4>
              <p className="text-sketch/90">PhD in Computer Science (In Progress)</p>
            </div>
            <div className="sketch-card p-6 bg-purple-50">
              <h4 className="font-bold text-lg mb-2">🔬 Research Focus</h4>
              <p className="text-sketch/90">HCI × Programming Languages</p>
            </div>
            <div className="sketch-card p-6 bg-yellow-50">
              <h4 className="font-bold text-lg mb-2">💻 Skills</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {['JavaScript', 'Python', 'React', 'TypeScript', 'User Research'].map((skill) => (
                  <span key={skill} className="research-tag text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Research interests grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center font-handwriting">
            Research Interests
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {interests.map((interest, index) => (
              <div
                key={index}
                className="sketch-card p-6 text-center hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 transition-all group"
                style={{
                  animation: `scaleIn 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="flex justify-center mb-4 text-blue-600 group-hover:scale-125 group-hover:rotate-12 transition-transform">
                  {interest.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{interest.title}</h4>
                <p className="text-sm text-sketch/80">{interest.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Visualization */}
        <div className="mb-16">
          <div className="sketch-card p-8 bg-white">
            <SkillsVisualization />
          </div>
        </div>

        {/* Timeline */}
        <div>
          <Timeline />
        </div>
      </div>
    </section>
  )
}

export default About
