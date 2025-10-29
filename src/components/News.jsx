import { Calendar, Award, Presentation, BookOpen, Star } from 'lucide-react'

const News = () => {
  const newsItems = [
    {
      date: 'Jul 2025',
      title: 'Paper accepted at IEEE TSE',
      description: 'Our paper on "Can Large Language Models Serve as Evaluators for Code Summarization?" has been accepted to IEEE Transactions on Software Engineering!',
      icon: <Award size={20} />,
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
      icon: <Award size={20} />,
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
      yellow: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      blue: 'bg-blue-50 border-blue-400 text-blue-800',
      purple: 'bg-purple-50 border-purple-400 text-purple-800',
      green: 'bg-green-50 border-green-400 text-green-800',
      orange: 'bg-orange-50 border-orange-400 text-orange-800',
    }
    return colors[color] || colors.blue
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-bold mb-3 text-gray-900">News</h2>
      </div>

      {/* News list */}
      <div className="space-y-3">
        {newsItems.map((item, index) => (
          <div
            key={index}
            className="pb-3 border-b border-gray-200 last:border-0"
          >
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium block">
                {item.date}
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
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
