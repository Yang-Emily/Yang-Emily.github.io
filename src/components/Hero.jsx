import { Mail, Github, Linkedin, GraduationCap } from 'lucide-react'

const Hero = () => {
  return (
    <section className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[200px_1fr] gap-10 items-start">
          {/* 左侧：照片和联系信息 */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-sm mx-auto md:mx-0 mb-4">
              <img 
                src={`${import.meta.env.BASE_URL}me.png`}
                alt="Yang Wu" 
                className="w-full h-full object-cover scale-125"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
            
            {/* 位置和机构 */}
            {/* <div className="text-center md:text-left mb-4 text-sm text-gray-600">
              <p>Zurich, Switzerland</p>
              <p className="font-medium text-gray-900">ETH Zurich</p>
            </div> */}
            
            {/* 联系方式图标 */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <a href="mailto:yangwu@ethz.ch" className="text-gray-700 hover:text-blue-700 transition-colors" title="Email">
                <Mail size={18} />
              </a>
              <a href="https://scholar.google.com/citations?user=2RdXwUwAAAAJ" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 transition-colors" title="Google Scholar">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z"/>
                </svg>
              </a>
              {/* <a href="https://www.researchgate.net" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 transition-colors" title="ResearchGate">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 8.365 8.365 0 0 0-.078.53 9 9 0 0 0-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.121 0 0 0 .014 1.017 9 9 0 0 0 .05.727 7.946 7.946 0 0 0 .077.53h-.005a3.334 3.334 0 0 0 .113.438c.245.743.65 1.303 1.214 1.68.565.376 1.256.564 2.075.564.8 0 1.536-.213 2.105-.603.57-.39.94-.916 1.175-1.65.076-.235.135-.558.177-.93a10.9 10.9 0 0 0 .043-1.207v-.82a10.9 10.9 0 0 0-.043-1.207 6.61 6.61 0 0 0-.177-.929c-.236-.735-.605-1.26-1.175-1.65-.57-.39-1.305-.603-2.105-.603zm-3.21 2.024c.589-.825 1.46-1.24 2.617-1.24.777 0 1.472.213 2.084.64.611.426 1.069.995 1.373 1.707.304.712.456 1.511.456 2.396v.842c0 .885-.152 1.684-.456 2.396-.304.712-.762 1.281-1.373 1.707-.612.427-1.307.64-2.084.64-1.157 0-2.028-.415-2.617-1.24-.589-.825-.883-1.92-.883-3.283v-.842c0-1.363.294-2.458.883-3.283zm-2.24 9.442c-.58 0-1.09.206-1.53.618-.44.412-.66.91-.66 1.494 0 .584.22 1.082.66 1.494.44.412.95.618 1.53.618.58 0 1.09-.206 1.53-.618.44-.412.66-.91.66-1.494 0-.584-.22-1.082-.66-1.494-.44-.412-.95-.618-1.53-.618zm-8.24 0c-.58 0-1.09.206-1.53.618-.44.412-.66.91-.66 1.494 0 .584.22 1.082.66 1.494.44.412.95.618 1.53.618.58 0 1.09-.206 1.53-.618.44-.412.66-.91.66-1.494 0-.584-.22-1.082-.66-1.494-.44-.412-.95-.618-1.53-.618z"/>
                </svg>
              </a> */}
              <a href="https://github.com/Yang-Emily" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 transition-colors" title="Github">
                <Github size={18} />
              </a>
              <a href="https://www.linkedin.com/in/yangwu-emily/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 transition-colors" title="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
            
            {/* Collaboration section */}
            <div className="mt-12">
              <h3 className="text-base font-semibold text-pink-600 mb-2">Get in Touch</h3>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                Always happy to connect with <span className="font-medium text-gray-900">PL + X</span> researchers.
              </p>
            </div>
          </div>

          {/* 右侧：个人信息 */}
          <div>
            {/* 名字 */}
            {/* <h1 className="text-4xl font-serif font-bold mb-4 text-gray-900">
              Yang Wu 
            </h1> */}

            {/* 学术身份与研究简介 */}
            <div className="mb-5 space-y-4">
              <p className="text-base text-gray-700 leading-relaxed">
                Hi! I'm Yang Wu, a first-year PhD student in the <a href="https://lse.ethz.ch/doctoral-program-in-learning-sciences.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-gray-600 transition-colors">ETH Zurich – EPFL Joint Doctoral Program in Learning Sciences</a>. 
                I'm deeply grateful to be advised by <a href="https://aprilwang.me/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">Prof. April Wang</a> and <a href="https://pit-claudel.fr/clement/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">Prof. Clément Pit-Claudel</a>, 
                and to learn from the wonderful communities in the <a href="https://peachlab.inf.ethz.ch/#/home" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">PEACH</a> and <a href="https://systemf.epfl.ch/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">SystemF</a> labs.
              </p>
              
              <p className="text-base text-gray-700 leading-relaxed">
                I completed my master's degree at the <a href="http://english.cs.hust.edu.cn/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">School of Computer Science and Technology, Huazhong University of Science and Technology (HUST)</a>, 
                advised by <a href="https://wanyao.me/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">Prof. Yao Wan</a>. 
                I would also like to thank <a href="https://hongyujohn.github.io/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">Prof. Hongyu Zhang</a>, <a href="https://yuleisui.github.io/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">Prof. Yulei Sui</a>, and <a href="https://cs.uic.edu/profiles/philip-yu/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors font-medium">Prof. Philip S. Yu</a> for their invaluable guidance and support.
              </p>
              
              <p className="text-base text-gray-700 leading-relaxed">
                My research lies at the intersection of <span className="font-semibold text-gray-900">Human–Computer Interaction</span> and <span className="font-semibold text-gray-900">Programming Languages</span>, 
                where I explore how programming can be made more <strong>inclusive</strong>, <strong>engaging</strong>, and <strong>accessible</strong> for diverse learners.
              </p>
              
              <p className="text-sm text-gray-600 leading-relaxed italic">
                I'm currently exploring sketching interfaces, AR/VR, and multimodal interaction in HCI, 
                as well as program verification, program analysis, and bidirectional model transformation in PL. 
                If you'd like to chat, collaborate, or just share ideas, feel free to <a href="mailto:yangwu@ethz.ch" className="text-pink-600 hover:text-pink-800 transition-colors font-medium">drop me an email</a>!
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
