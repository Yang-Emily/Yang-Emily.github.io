import { useId } from 'react'

export default function CamelliaWalking() {
  const id = useId()
  return <svg className="camellia-walking" viewBox="0 0 120 110" width="120" height="110" aria-hidden="true">
    <defs><linearGradient id={id} x2=".3" y2="1"><stop stopColor="#8d999e" /><stop offset=".5" stopColor="#c8c4ae" /><stop offset="1" stopColor="#f0dec0" /></linearGradient></defs>
    <ellipse cx="61" cy="100" rx="43" ry="4" fill="#596253" opacity=".13" />
    <g stroke="#8d897c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path className="walking-tail" d="M32 62C8 66 6 44 11 30Q14 25 17 30C13 45 19 51 35 50" fill={`url(#${id})`} />
      <g fill="#c9c6b4">
        <path className="cat-leg leg-back-far" d="M42 65Q35 78 43 88L44 96Q38 100 32 96L30 80 30 64Z" />
        <path className="cat-leg leg-front-far" d="M83 62 87 87 92 96Q88 100 81 97L76 85 73 64Z" />
      </g>
      <path d="M28 55Q38 43 64 48L87 50Q99 60 87 74Q68 82 44 76Q25 77 28 55Z" fill={`url(#${id})`} />
      <path d="M46 71Q64 77 83 68" stroke="#f4e6cc" strokeWidth="5" />
      <g fill="#e8dcc2">
        <path className="cat-leg leg-back-near" d="M43 64Q47 76 38 86L35 96Q29 100 25 96L28 81 30 66Z" />
        <path className="cat-leg leg-front-near" d="M88 65 84 86 84 97Q78 101 72 97L75 84 76 64Z" />
      </g>
      <g className="walking-head">
        <path d="M76 36 74 18Q76 14 88 28L98 28Q105 19 108 23L107 41Q118 46 115 54Q110 66 91 64Q74 62 74 48Z" fill={`url(#${id})`} />
        <path d="m79 22 2 13 7-4m16-3-5 7 6 2" fill="#d7b9b1" stroke="none" />
        <path d="M97 50Q109 45 115 51Q114 61 103 62L95 58Z" fill="#faf1dd" stroke="none" />
        <ellipse className="cat-open-eye" cx="99" cy="43" rx="5.2" ry="6" fill="#829088" stroke="#58584f" />
        <ellipse className="cat-open-eye" cx="100" cy="43" rx="3" ry="4.7" fill="#303b3c" stroke="none" />
        <circle className="cat-open-eye" cx="97.5" cy="41" r="1.3" fill="#fffdf2" stroke="none" />
        <path className="cat-happy-eye" d="M94 44q5-5 10 0" fill="none" stroke="#58584f" strokeWidth="2" />
        <path d="m111 50 5 1-3 4Z" fill="#c58e85" stroke="#a87a70" />
        <path d="m105 56 14-1m-14 4 13 3" stroke="#fff9e9" strokeWidth="1" />
        <path d="m85 32 3 5m4-5 1 5" stroke="#969b90" />
      </g>
    </g>
  </svg>
}
