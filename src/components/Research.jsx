import { ExternalLink, ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Azalea from './Azalea'

const Research = () => {
  const [selectedTag, setSelectedTag] = useState(null)
  const projects = [
    {
      title: 'Visual Programming for Beginners',
      description: 'Designing intuitive visual programming interfaces that lower the barrier to entry for novice programmers.',
      tags: ['HCI', 'Education', 'Visual Design'],
      status: 'Ongoing',
      color: 'blue',
    },
    {
      title: 'Type-Driven Development Tools',
      description: 'Building IDE tools that leverage type systems to provide better code suggestions and error messages.',
      tags: ['PL', 'Developer Tools', 'Type Systems'],
      status: 'Ongoing',
      color: 'purple',
    },
    {
      title: 'End-User Programming Environments',
      description: 'Creating programming environments that enable non-programmers to automate tasks and build custom tools.',
      tags: ['HCI', 'End-User Programming'],
      status: 'Published',
      color: 'green',
    },
    {
      title: 'Collaborative Code Editing',
      description: 'Investigating how real-time collaboration features can improve pair programming and code review processes.',
      tags: ['HCI', 'CSCW', 'Developer Tools'],
      status: 'In Progress',
      color: 'orange',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-300 text-blue-700',
      purple: 'bg-purple-50 border-purple-300 text-purple-700',
      green: 'bg-green-50 border-green-300 text-green-700',
      orange: 'bg-orange-50 border-orange-300 text-orange-700',
    }
    return colors[color] || colors.blue
  }

  // 获取所有唯一的标签
  const allTags = [...new Set(projects.flatMap(p => p.tags))]
  
  // 过滤项目
  const filteredProjects = selectedTag
    ? projects.filter(p => p.tags.includes(selectedTag))
    : projects

  return (
    <section id="research" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 opacity-10">
        <Azalea size={150} color="#6B5FFF" animate={false} />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10">
        <Azalea size={130} color="#3B82F6" animate={false} />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-purple-500" size={32} />
            <h2 className="text-4xl sm:text-5xl font-bold font-handwriting">
              Research Projects
            </h2>
            <Sparkles className="text-blue-500" size={32} />
          </div>
          <div className="w-24 h-1 bg-ink mx-auto" style={{ transform: 'rotate(1deg)' }}></div>
          <p className="mt-6 text-lg text-sketch/80 max-w-2xl mx-auto">
            Exploring innovative approaches to make programming more accessible,
            expressive, and human-centered.
          </p>
        </div>

        {/* Tag filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedTag(null)}
            className={`research-tag ${!selectedTag ? 'bg-pink-500 text-white border-pink-500' : 'bg-white'}`}
          >
            All Projects
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`research-tag transition-all ${
                selectedTag === tag
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white hover:bg-purple-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              className="sketch-card p-6 bg-white hover:bg-gradient-to-br hover:from-white hover:to-purple-50 transition-all group"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Status badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`research-tag text-xs ${getColorClasses(project.color)}`}>
                  {project.status}
                </span>
                <ChevronRight
                  size={20}
                  className="text-sketch/40 group-hover:text-sketch group-hover:translate-x-1 transition-all"
                />
              </div>

              {/* Project title */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sketch/80 mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-3 py-1 text-xs border-2 border-ink/20 rounded-full bg-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Research philosophy */}
        <div className="sketch-border bg-white rounded-lg max-w-3xl mx-auto">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4 font-handwriting text-center">
              Research Philosophy
            </h3>
            <div className="space-y-4 text-sketch/90">
              <p className="flex items-start">
                <span className="text-2xl mr-3">🎯</span>
                <span>
                  <strong>Human-Centered:</strong> Technology should adapt to people,
                  not the other way around.
                </span>
              </p>
              <p className="flex items-start">
                <span className="text-2xl mr-3">🔬</span>
                <span>
                  <strong>Evidence-Based:</strong> Research grounded in empirical
                  studies and user feedback.
                </span>
              </p>
              <p className="flex items-start">
                <span className="text-2xl mr-3">🌉</span>
                <span>
                  <strong>Interdisciplinary:</strong> Bridging HCI and PL to create
                  holistic solutions.
                </span>
              </p>
              <p className="flex items-start">
                <span className="text-2xl mr-3">🚀</span>
                <span>
                  <strong>Impact-Driven:</strong> Building tools that make a real
                  difference in people's lives.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Research
