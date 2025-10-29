import { Calendar, Award, BookOpen, Briefcase } from 'lucide-react'
import Azalea from './Azalea'

// 研究时间线
const Timeline = () => {
  const events = [
    {
      year: '2024',
      title: 'CHI Conference Paper',
      description: 'Published research on intuitive programming interfaces',
      icon: <Award size={24} />,
      color: 'yellow',
    },
    {
      year: '2023',
      title: 'PhD Candidacy',
      description: 'Advanced to PhD candidacy, focusing on HCI × PL',
      icon: <BookOpen size={24} />,
      color: 'blue',
    },
    {
      year: '2023',
      title: 'VL/HCC Presentation',
      description: 'Presented empirical study on visual feedback',
      icon: <Calendar size={24} />,
      color: 'purple',
    },
    {
      year: '2022',
      title: 'Research Internship',
      description: 'Worked on developer tools at tech company',
      icon: <Briefcase size={24} />,
      color: 'green',
    },
    {
      year: '2021',
      title: 'Started PhD',
      description: 'Began doctoral studies in Computer Science',
      icon: <BookOpen size={24} />,
      color: 'pink',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      blue: 'bg-blue-100 border-blue-400 text-blue-700',
      purple: 'bg-purple-100 border-purple-400 text-purple-700',
      green: 'bg-green-100 border-green-400 text-green-700',
      pink: 'bg-pink-100 border-pink-400 text-pink-700',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="relative">
      <h3 className="text-3xl font-bold font-handwriting text-center mb-12">
        My Journey 🌸
      </h3>

      {/* Timeline line */}
      <div className="absolute left-8 top-20 bottom-0 w-1 bg-gradient-to-b from-pink-300 via-purple-300 to-blue-300 rounded-full" />

      <div className="space-y-8 relative">
        {events.map((event, index) => (
          <div
            key={index}
            className="relative pl-20 group"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
            }}
          >
            {/* Timeline dot */}
            <div className="absolute left-5 top-0 w-8 h-8 rounded-full bg-paper border-4 border-pink-400 flex items-center justify-center group-hover:scale-125 transition-transform">
              <div className="w-3 h-3 rounded-full bg-pink-400 animate-pulse" />
            </div>

            {/* Azalea decoration */}
            <div className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Azalea size={50} color="#FF6B9D" />
            </div>

            {/* Content card */}
            <div className="sketch-card p-6 bg-white hover:bg-gray-50 transition-all">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg ${getColorClasses(event.color)}`}>
                  {event.icon}
                </div>

                {/* Text content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold font-handwriting text-pink-600">
                      {event.year}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-pink-300 to-transparent" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">{event.title}</h4>
                  <p className="text-sketch/80 text-sm">{event.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom decoration */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 sketch-card px-6 py-3 bg-gradient-to-r from-pink-50 to-purple-50">
          <span className="text-2xl">🚀</span>
          <span className="font-handwriting text-lg">More exciting things to come!</span>
        </div>
      </div>
    </div>
  )
}

export default Timeline
