import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import News from './components/News'
import Publications from './components/Publications'
import FireworksCursor from './components/FireworksCursor'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'news', 'publications']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* 烟花特效 */}
      <FireworksCursor />
      
      {/* 导航栏 */}
      <Navigation activeSection={activeSection} />
      
      {/* 主要内容 - 单页布局 */}
      <main>
        <div id="home">
          <Hero />
        </div>
        
        {/* News 和 Publications 两栏布局 */}
        <section className="py-4 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-[200px_1fr] gap-10">
              {/* 左侧：News */}
              <div id="news">
                <News />
              </div>
              
              {/* 右侧：Publications */}
              <div id="publications">
                <Publications />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* 页脚 - 紧凑 */}
      <footer className="py-6 text-center text-sm text-gray-600 border-t border-gray-200">
        <p>© 2025 Yang Wu · Last updated: October 2024</p>
      </footer>
    </div>
  )
}

export default App
