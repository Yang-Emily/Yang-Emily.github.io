import { Calendar, Award, Presentation, BookOpen, Star, FileText, GraduationCap } from 'lucide-react'

const News = () => {
  const newsItems = [
    {
      date: 'Jan 2026',
      title: 'Paper accepted at IUI 2026',
      description: 'Our paper "StepMIND: A Visual Framework for Stepwise, Multimodal, and Bidirectional Explanations of AI-Generated Data Analysis Pipeline" has been accepted to IUI 2026! Looking forward to seeing you in Cyprus!',
      icon: <FileText size={20} />,
      type: 'publication',
      color: 'yellow',
    },
    {
      date: 'Nov 2025',
      title: 'Started PhD',
      description: "Started my PhD journey in the ETH Zurich – EPFL Joint Doctoral Program in Learning Sciences! I'm grateful for the support from my advisors and the research community.",
      icon: <GraduationCap size={20} />,
      type: 'milestone',
      color: 'green',
    },
    {
      date: 'Jul 2025',
      title: 'Paper accepted at IEEE TSE',
      description: 'Our paper on "Can Large Language Models Serve as Evaluators for Code Summarization?" has been accepted to IEEE Transactions on Software Engineering!',
      icon: <FileText size={20} />,
      type: 'publication',
      color: 'yellow',
    },
    {
      date: 'Jul 2025',
      title: 'Attending SPLV Summer School',
      description: 'Attending the Scottish Programming Languages and Verification Summer School in Edinburgh.',
      icon: <BookOpen size={20} />,
      type: 'conference',
      color: 'blue',
    },
    {
      date: 'May 2025',
      title: 'Paper accepted at ACL 2025',
      description: 'Our paper on "Sign2Vis: Automated Data Visualization from Sign Language" has been accepted to ACL 2025!',
      icon: <FileText size={20} />,
      type: 'publication',
      color: 'yellow',
    },
    {
      date: 'Jun 2024',
      title: 'Presented at SIGMOD 2024',
      description: 'Presented our work on automated data visualization from natural language at SIGMOD 2024 in Santiago, Chile.',
      icon: <Presentation size={20} />,
      type: 'talk',
      color: 'purple',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
    }
    return colors[color] || colors.blue
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-bold mb-3 text-gray-900">News</h2>
      </div>

      {/* Timeline list */}
      <div className="relative space-y-8 left-1">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

        {newsItems.map((item, index) => (
          <div
            key={index}
            className="relative pl-10 group"
          >
            {/* Timeline Icon */}
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110">
              {item.icon && (
                <div className="scale-[0.6] text-gray-900">
                  {item.icon}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                {item.date}
              </span>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default News
