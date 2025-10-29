import { Mail, Github, Linkedin, Twitter, MapPin, Calendar } from 'lucide-react'

const Contact = () => {
  const contactMethods = [
    {
      icon: <Mail size={24} />,
      label: 'Email',
      value: 'yangwu@example.edu',
      link: 'mailto:yangwu@example.edu',
      color: 'blue',
    },
    {
      icon: <Github size={24} />,
      label: 'GitHub',
      value: '@yangwu',
      link: 'https://github.com',
      color: 'gray',
    },
    {
      icon: <Linkedin size={24} />,
      label: 'LinkedIn',
      value: 'Yang Wu',
      link: 'https://linkedin.com',
      color: 'blue',
    },
    {
      icon: <Twitter size={24} />,
      label: 'Twitter',
      value: '@yangwu_research',
      link: 'https://twitter.com',
      color: 'sky',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200',
      sky: 'bg-sky-50 text-sky-600 border-sky-200',
    }
    return colors[color] || colors.blue
  }

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-handwriting">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-ink mx-auto" style={{ transform: 'rotate(1deg)' }}></div>
          <p className="mt-6 text-lg text-sketch/80 max-w-2xl mx-auto">
            I'm always excited to discuss research collaborations, speaking opportunities,
            or just chat about HCI and programming languages!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact methods */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-6 font-handwriting">
              Connect With Me
            </h3>
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                target={method.link.startsWith('mailto:') ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className={`sketch-card p-4 flex items-center gap-4 hover:bg-white transition-all group ${getColorClasses(method.color)}`}
              >
                <div className="flex-shrink-0">
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sketch/60">
                    {method.label}
                  </p>
                  <p className="font-mono text-sm truncate group-hover:text-blue-600 transition-colors">
                    {method.value}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Additional info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6 font-handwriting">
              Let's Collaborate
            </h3>

            <div className="sketch-card p-6 bg-white">
              <div className="flex items-start gap-3 mb-4">
                <MapPin size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Location</p>
                  <p className="text-sketch/80 text-sm">
                    University Campus, City, Country
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Office Hours</p>
                  <p className="text-sketch/80 text-sm">
                    By appointment · Email me to schedule
                  </p>
                </div>
              </div>
            </div>

            <div className="sketch-border bg-yellow-50 rounded-lg">
              <div className="relative z-10">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  Open to Discuss
                </h4>
                <ul className="space-y-2 text-sm text-sketch/90">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    Research collaborations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    Speaking at conferences/workshops
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    Mentoring opportunities
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    Open source contributions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Fun closing note */}
        <div className="mt-16 text-center">
          <div className="inline-block sketch-card p-6 bg-white">
            <p className="text-lg font-handwriting">
              "The best way to predict the future is to invent it." - Alan Kay
            </p>
            <p className="text-sm text-sketch/60 mt-2">
              Let's build the future of programming together! ✨
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
