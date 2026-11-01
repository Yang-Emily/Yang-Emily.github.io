// Small replicas of the SketchMind interface, styled after the real tool.
import { PenLine } from 'lucide-react'

export const TOOL = {
  data: '#3e445b',
  compare: '#bc7d35',
  swap: '#8a2be2',
  cas: '#6366f1',
  bubble: '#4b7a6a',
  ok: '#2f9e44',
  bad: '#e03131',
}

export function Window({ children, className = '' }) {
  return <div className={`smw ${className}`}>{children}</div>
}

export function Toolbar({ children, right }) {
  return (
    <div className="smw-bar">
      <div className="smw-groups">{children}</div>
      {right && <div className="smw-right">{right}</div>}
    </div>
  )
}

export function PenGroup({ label, children, divider }) {
  return (
    <>
      {divider && <div className="smw-divider" />}
      <div className="smw-group">
        <div className="smw-group-label">{label}</div>
        <div className="smw-pens">{children}</div>
      </div>
    </>
  )
}

export function PenPill({ color, active, disabled, onClick, children, pop }) {
  return (
    <button
      type="button"
      className={`smw-pill ${active ? 'on' : ''} ${pop ? 'pop' : ''}`}
      style={{ '--c': color }}
      disabled={disabled}
      aria-pressed={Boolean(active)}
      onClick={onClick}
    >
      <PenLine size={14} color={disabled ? '#d1d5db' : color} fill={disabled ? 'none' : `${color}22`} />
      {children}
    </button>
  )
}

export function ExampleLabel({ values, changed = [] }) {
  return (
    <span className="smw-example">
      Example <span className="arr">[{values.map((v, i) => (
        <span key={i} style={changed.includes(i) ? { color: TOOL.bad } : null}>{i ? ' ' : ''}{v}</span>
      ))}]</span>
    </span>
  )
}

// A step thumbnail from the trace column: the compared or swapped pair is tinted.
export function StepThumb({ values, pair, color, active, badge }) {
  return (
    <div className={`smw-thumb ${active ? 'on' : ''}`} style={{ '--c': color ?? '#d6d3dc' }}>
      {values.map((v, i) => (
        <span key={i} style={pair?.includes(i) ? { color } : null}>{v}</span>
      ))}
      {color && <i className="dot" />}
      {badge}
    </div>
  )
}

export function Block({ kind, children, right, badge, className = '', ...rest }) {
  return (
    <div className={`smw-block ${kind} ${className}`} {...rest}>
      {badge && <span className="smw-badge">{badge}</span>}
      <code>{children}</code>
      {right}
    </div>
  )
}

export const Chips = ({ value }) => (
  <span className="smw-chips">
    <span className={value === true ? 't' : ''}>True</span>
    <span className={value === false ? 'f' : ''}>False</span>
  </span>
)

export function Segmented({ options, value, onChange }) {
  return (
    <div className="smw-seg">
      {options.map(o => (
        <button key={o} type="button" className={value === o ? 'on' : ''} aria-pressed={value === o} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  )
}

export function ArrayCard({ values, labels, kind = 'arr', mark = [] }) {
  return (
    <div className={`smw-block ${kind}`}>
      <code className="smw-arraycard">
        {labels ? 'a = ' : ''}[
        {values.map((v, i) => (
          <span key={i} className="cell" style={mark.includes(i) ? { color: TOOL.bad } : null}>
            {labels && <span className="lab">a[{i}]</span>}
            {v}{i < values.length - 1 ? ',' : ''}
          </span>
        ))}
        ]
      </code>
    </div>
  )
}

// A block card that opens like the tool's: the chevron reveals what runs inside.
export function ExpandBlock({ kind, badge, head, children, open, onToggle }) {
  return (
    <div className={`smw-block ${kind} ${open ? 'expanded' : ''}`}>
      {badge && <span className="smw-badge">{badge}</span>}
      <div className="head">
        <code>{head}</code>
        <button type="button" className={`smw-round chev ${open ? 'open' : ''}`} onClick={onToggle} aria-expanded={open} title={open ? 'Collapse' : 'Expand'}>
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6l4 4 4-4" /></svg>
        </button>
      </div>
      {open && <div className="inner">{children}</div>}
    </div>
  )
}

// The inside of a compare_and_swap: which branch ran is ticked.
export function CasInner({ a, b, taken }) {
  return (
    <>
      <code className="if">if <span style={{ color: TOOL.compare }}>is_bigger({a},{b})</span></code>
      <div className={`branch ${taken ? 'yes' : 'idle'}`}>{taken && <span className="tick">✓</span>}<code style={{ color: TOOL.swap }}>swap({a},{b})</code></div>
      <div className={`branch ${taken ? 'no' : 'yes'}`}>{!taken && <span className="tick">✓</span>}<code>do nothing</code></div>
    </>
  )
}
