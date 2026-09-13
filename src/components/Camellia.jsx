import { useId } from 'react'

// A small hand-drawn portrait of Camellia: blue-gold shading and a cream bib.
export default function Camellia() {
  const id = useId()
  const coat = `${id}-coat`
  const face = `${id}-face`
  const tail = `${id}-tail`

  return <svg className="camellia-sitting" viewBox="0 0 120 110" width="120" height="110" aria-hidden="true">
    <defs>
      <linearGradient id={coat} x1="0" y1="0" x2="1" y2=".6">
        <stop stopColor="#899398" /><stop offset=".38" stopColor="#b9b9ac" /><stop offset=".75" stopColor="#dfcda9" /><stop offset="1" stopColor="#eee0c5" />
      </linearGradient>
      <radialGradient id={face} cx=".5" cy=".82" r=".8">
        <stop stopColor="#fff3d9" /><stop offset=".5" stopColor="#ead8b6" /><stop offset=".78" stopColor="#c1bda9" /><stop offset="1" stopColor="#8e999d" />
      </radialGradient>
      <linearGradient id={tail} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#839095" /><stop offset=".6" stopColor="#b6b9ad" /><stop offset="1" stopColor="#ded0b4" />
      </linearGradient>
    </defs>
    <ellipse cx="62" cy="100" rx="36" ry="5" fill="#596253" opacity=".15" />
    <g className="cat-body" stroke="#8d897c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path className="cat-tail" d="M39 88C13 92 5 77 12 66C16 60 23 64 21 69C15 80 29 80 39 77" fill={`url(#${tail})`} />
      <path d="M40 58Q28 74 34 91Q37 99 61 99Q89 100 91 86Q92 68 80 57Z" fill={`url(#${coat})`} />
      <path d="M48 61Q60 56 75 62L78 85Q63 96 46 85Z" fill="#f7ecd6" stroke="none" />
      <path d="M44 77 41 95Q44 103 55 98L59 80M66 80 66 97Q74 103 82 97L79 76" fill="#ede2cb" />
      <path d="m45 95 1 3m5-3v3m21-2v3m5-3v2" stroke="#b6a891" strokeWidth=".9" />
      <path d="M31 42Q24 28 30 10Q35 5 50 27Q62 23 75 27Q91 8 96 13Q100 28 93 42C103 64 84 76 63 76C41 76 23 65 31 42Z" fill={`url(#${face})`} />
      <path d="M33 16Q32 31 37 37L45 29Q39 19 33 16ZM91 19Q94 28 88 37L80 30Z" fill="#d7b9b1" stroke="#b6a99a" strokeWidth=".8" />
      <path d="M35 24 40 32m49-7-4 7" stroke="#f3dfce" strokeWidth="1" />
      <path d="m54 29 4 12m6-13v11m10-9-4 11" stroke="#969b90" strokeWidth="2.7" opacity=".55" />
      <ellipse cx="45" cy="50" rx="10" ry="11" fill="#e8dbbc" stroke="none" />
      <ellipse cx="80" cy="50" rx="10" ry="11" fill="#e8dbbc" stroke="none" />
      {[45, 80].map(x => <g className="cat-open-eye" key={x}>
        <ellipse cx={x} cy="50" rx="8.3" ry="9" fill="#829088" stroke="#58584f" strokeWidth="1.8" />
        <ellipse cx={x + .6} cy="50" rx="5.1" ry="6.8" fill="#303b3c" stroke="none" />
        <ellipse cx={x - 2} cy="47" rx="2" ry="2.5" fill="#fffdf2" stroke="none" opacity=".85" />
        <circle cx={x + 3} cy="54" r=".9" fill="#d6e2d2" stroke="none" />
      </g>)}
      <path className="cat-happy-eye" d="M37 51q8-8 16 0m19 0q8-8 16 0" fill="none" stroke="#58584f" strokeWidth="2" />
      <path d="M42 64Q44 55 61 58Q78 55 85 64Q79 76 63 73Q48 76 42 64Z" fill="#faf1dd" stroke="none" />
      <path d="M57 60Q63 57 69 60L63 65Z" fill="#c58e85" stroke="#a87a70" strokeWidth="1" />
      <path d="M63 65v3m0 0q-4 4-8 0m8 0q4 4 8 0" fill="none" stroke="#a28c7c" strokeWidth="1" />
      <path d="M48 62 23 58m25 8-26 1m27 2-21 7m49-14 26-4m-26 8 26 1m-27 2 22 7" fill="none" stroke="#fff9e9" strokeWidth="1.1" />
      <path d="m35 55 5 2m46-2-4 2" stroke="#b4aa91" strokeWidth="1" />
    </g>
  </svg>
}
