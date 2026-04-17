import { useState } from 'react'

const TrialPage = () => {
  const [isUnrolled, setIsUnrolled] = useState(true)

  return (
    <main className="trial-page relative overflow-hidden pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div
        className="pointer-events-none absolute left-[8%] top-36 text-3xl opacity-70"
        style={{ animation: 'float 5.2s ease-in-out infinite' }}
        aria-hidden="true"
      >
        ✦
      </div>
      <div
        className="pointer-events-none absolute right-[12%] top-44 text-4xl opacity-80"
        style={{ animation: 'float 6.4s ease-in-out infinite 0.6s' }}
        aria-hidden="true"
      >
        🔮
      </div>
      <div
        className="pointer-events-none absolute left-[16%] bottom-24 text-3xl opacity-75"
        style={{ animation: 'wiggle 4.8s ease-in-out infinite' }}
        aria-hidden="true"
      >
        🧙
      </div>

      <section className="max-w-5xl mx-auto relative min-h-[70vh] flex items-center justify-center">
        <div className="max-w-2xl text-center magic-wand-cursor">
          <p className="font-handwriting text-4xl sm:text-5xl text-[#A78BFA] mb-4 leading-tight">A Small Trial Garden</p>
          <div className="font-handwriting text-[#5B556B]">
            <p className="text-3xl sm:text-4xl leading-relaxed text-[#7C6BCF]">
              The wizard is away for now.
            </p>
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => setIsUnrolled((value) => !value)}
                className="relative max-w-md px-6 py-7 rotate-[-1.2deg] text-left transition-transform duration-500 hover:scale-[1.01]"
                aria-expanded={isUnrolled}
                aria-label={isUnrolled ? 'Roll the letter back up' : 'Unroll the letter'}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-[10px]"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,249,235,0.98) 0%, rgba(251,241,217,0.98) 100%)',
                    boxShadow: '0 20px 40px rgba(120, 95, 50, 0.14)',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-[1px] rounded-[9px] opacity-80"
                  style={{
                    background:
                      'repeating-linear-gradient(180deg, rgba(140,110,72,0.035), rgba(140,110,72,0.035) 1px, transparent 1px, transparent 32px)',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute left-5 right-5 top-5 bottom-5 rounded-[6px] border border-[#C9B184]/45"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute left-0 top-8 h-10 w-3 rounded-r-full opacity-35"
                  style={{ background: 'rgba(153, 121, 74, 0.24)' }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute right-0 bottom-10 h-10 w-3 rounded-l-full opacity-25"
                  style={{ background: 'rgba(153, 121, 74, 0.18)' }}
                  aria-hidden="true"
                />
                <div
                  className={`pointer-events-none absolute left-3 right-3 top-2 z-10 h-5 rounded-full border border-[#C9B184]/60 bg-gradient-to-b from-[#F6E8C6] to-[#E7D0A2] shadow-sm transition-all duration-500 ${
                    isUnrolled ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
                  }`}
                  aria-hidden="true"
                />
                <div
                  className={`pointer-events-none absolute left-3 right-3 bottom-2 z-10 h-5 rounded-full border border-[#C9B184]/60 bg-gradient-to-b from-[#E7D0A2] to-[#D7BE8A] shadow-sm transition-all duration-500 ${
                    isUnrolled ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                  }`}
                  aria-hidden="true"
                />

                <div
                  className={`relative overflow-hidden transition-all duration-700 ease-out ${
                    isUnrolled ? 'max-h-72 opacity-100 py-2' : 'max-h-0 opacity-0 py-0'
                  }`}
                >
                  <p className="text-left text-xl sm:text-2xl leading-relaxed text-[#6B5B3E]">
                    Hi dear friend,
                    <br />
                    I&apos;ve stepped out for a little while.
                    <br />
                    Please feel free to wander around,
                    and I&apos;ll be back with more magic soon.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <svg
              width="270"
              height="18"
              viewBox="0 0 270 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 9C18 2 33 16 48 9C63 2 78 16 93 9C108 2 123 16 138 9C153 2 168 16 183 9C198 2 213 16 228 9C243 2 255 14 267 9"
                stroke="#A78BFA"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>
    </main>
  )
}

export default TrialPage
