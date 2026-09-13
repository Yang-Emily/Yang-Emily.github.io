import Azalea from './Azalea'

export const POND_PATH = 'M866 607C958 572 1155 578 1240 640S1323 746 1191 789S862 785 800 723S788 644 866 607Z'

// The site's hand-drawn azaleas, planted into a continuous landscape.
export default function GardenLandscape({ night }) {
  return <div className="garden-landscape" aria-hidden="true">
    <svg className="garden-terrain" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
      <path className="distant-grass" d="M-20 440Q170 375 395 445T850 420T1460 450V920H-20Z" />
      <path className="near-grass" d="M-20 550Q235 410 510 540T980 500T1460 550V920H-20Z" />
      <path className="grass-contour" d="M-20 555Q235 415 510 545M910 520Q1160 425 1460 550" />
      <path className="pond-bank" d="M850 595C935 556 1175 565 1258 630S1350 760 1200 807S845 798 783 729S760 636 850 595Z" />
      <path className="pond-water" d={POND_PATH} />
      <g className="water-lines" strokeWidth="2" strokeLinecap="round">
        <path d="M903 631q90-15 158-3m47 26 83 9M839 697q61-9 107 0m123 55q83 14 130-6M955 771l59 3" />
        <ellipse cx="1145" cy="688" rx="44" ry="8" /><ellipse cx="921" cy="738" rx="31" ry="5" />
      </g>
      <g className="lily-pads"><path d="M1094 686q45-31 76 0q-25 18-61 5l22-6Z" /><path d="M902 734q20-18 43 1l-18 0 10 7q-26 9-35-8Z" /></g>
      <g className="grass-blades" strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 34 }, (_, i) => { const x = 25 + (i * 137) % 1390, y = 555 + (i * 71) % 300; if (((x - 1040) / 280) ** 2 + ((y - 695) / 115) ** 2 < 1.2) return null; return <path key={i} d={`M${x} ${y}q-3-13-9-18m9 18q0-24 7-28m-7 28q8-14 16-14`} /> })}
      </g>
      <g className="reeds" strokeWidth="3" strokeLinecap="round"><path d="M1270 651q-8-60 4-100m-4 100q15-40 31-51m-27 43q-15-40-25-45M798 730q-4-43-21-64m21 64q12-53 25-64" /></g>
    </svg>
    <div className="garden-celestial">{night ? <svg viewBox="0 0 100 100"><path d="M73 14C21-2 5 64 41 83C65 99 91 81 94 61C55 78 36 33 73 14Z" fill="#f6e8b5" stroke="#d5cba8" strokeWidth="1.5" /></svg> : <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="28" fill="#f6dda0" stroke="#cfb477" strokeWidth="1.5" />{Array.from({ length: 8 }, (_, i) => <path key={i} d="M50 8v7" transform={`rotate(${i * 45} 50 50)`} stroke="#cfb477" strokeWidth="2" strokeLinecap="round" />)}</svg>}</div>
    {night ? <><div className="moon-reflection" />{Array.from({ length: 19 }, (_, i) => <span key={i} className="garden-star" style={{ left: `${5 + i * 4.9}%`, top: `${14 + (i * 17) % 30}%`, animationDelay: `${i * .3}s` }}>✧</span>)}</> : [0, 1, 2, 3, 4].map(i => <div className="garden-butterfly" key={i} style={{ left: `${16 + i * 16}%`, top: `${40 + (i * 13) % 29}%`, animationDelay: `${-i * 1.7}s` }}><svg viewBox="0 0 50 40"><path d="M25 24C-5-10 0 35 21 28C3 48 25 43 25 27C27 44 48 44 30 28C53 31 48-8 25 24Z" fill={i % 2 ? '#e7bb83' : '#d5acd2'} stroke="#967b8b" strokeWidth="1.3" /><path d="M25 29V18m0 2-4-7m4 7 4-7" stroke="#756777" strokeWidth="1.5" /></svg></div>)}
    {[{ left: '-3%', bottom: '5%', size: 170 }, { left: '6%', bottom: '-2%', size: 130 }, { left: '1%', bottom: '25%', size: 100 }, { left: '88%', bottom: '1%', size: 155 }, { left: '94%', bottom: '20%', size: 125 }, { left: '79%', bottom: '-6%', size: 125 }].map((flower, i) => <div key={i} className="landscape-azalea" style={{ left: flower.left, bottom: flower.bottom, '--flower-size': `${flower.size}px`, transform: `rotate(${i % 2 ? 18 : -16}deg)` }}><svg className="azalea-leaves" viewBox="0 0 150 150"><path d="M75 145Q95 86 68 45M79 111Q19 107 26 73Q68 65 79 111M81 92Q132 97 140 59Q96 51 81 92" fill="#94ae81" stroke="#708965" strokeWidth="1.4" /><path d="m30 79 49 32m3-19 52-29" fill="none" stroke="#708965" /></svg><Azalea size={flower.size} color={i % 2 ? '#e9b4c6' : '#e4a3ba'} animate={false} /></div>)}
  </div>
}
