// Interpret connected Blockly blocks without evaluating generated JavaScript.
export function runBlockWorkspace(workspace, cols, rows) {
  const cells = [], variables = new Map(), procedures = new Map()
  let seed = 123456789
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  let offset = 0, row = 0, color = '#ef4974', operations = 0, stopped = false, overflow = false
  const tick = () => { if (++operations > 12000) throw new Error('Execution stopped after 12,000 operations. Check loops and recursive functions.') }
  const value = (b, input, fallback = 0) => b.getInputTargetBlock(input) ? expression(b.getInputTargetBlock(input)) : fallback
  const finite = v => { const n = Number(v); if (!Number.isFinite(n)) throw new Error('A number is invalid. Check divisions and numeric inputs.'); return n }
  const count = v => Math.max(0, Math.min(2304, Math.floor(finite(v))))
  function expression(b) {
    tick()
    if (!b || !b.isEnabled()) return 0
    const field = name => b.getFieldValue(name)
    switch (b.type) {
      case 'math_number': return finite(field('NUM'))
      case 'logic_boolean': return field('BOOL') === 'TRUE'
      case 'variables_get': return variables.get(field('VAR')) ?? 0
      case 'bk_position': return field('AXIS') === 'ROW' ? row + 1 : (row % 2 ? cols - offset : offset + 1)
      case 'bk_edge': return offset === 0 && cells.length > 0
      case 'math_arithmetic': { const a = finite(value(b, 'A')), c = finite(value(b, 'B')); return finite(({ ADD: () => a + c, MINUS: () => a - c, MULTIPLY: () => a * c, DIVIDE: () => a / c, POWER: () => a ** c })[field('OP')]()) }
      case 'math_random_int': { const a = Math.ceil(finite(value(b, 'FROM'))), c = Math.floor(finite(value(b, 'TO', 10))); const low = Math.min(a, c), high = Math.max(a, c); return low + Math.floor(random() * (high - low + 1)) }
      case 'math_modulo': return finite(finite(value(b, 'DIVIDEND')) % finite(value(b, 'DIVISOR', 1)))
      case 'math_round': return ({ ROUND: Math.round, ROUNDUP: Math.ceil, ROUNDDOWN: Math.floor })[field('OP')](finite(value(b, 'NUM')))
      case 'math_single': { const n = finite(value(b, 'NUM')); return finite(({ ROOT: Math.sqrt, ABS: Math.abs, NEG: n => -n, LN: Math.log, LOG10: Math.log10, EXP: Math.exp, POW10: n => 10 ** n })[field('OP')](n)) }
      case 'logic_compare': { const a = value(b, 'A'), c = value(b, 'B'); return ({ EQ: () => a === c, NEQ: () => a !== c, LT: () => a < c, LTE: () => a <= c, GT: () => a > c, GTE: () => a >= c })[field('OP')]() }
      case 'logic_operation': return field('OP') === 'AND' ? !!value(b, 'A') && !!value(b, 'B') : !!value(b, 'A') || !!value(b, 'B')
      case 'logic_negate': return !value(b, 'BOOL')
      case 'logic_ternary': return value(b, 'IF') ? value(b, 'THEN') : value(b, 'ELSE')
      default: throw new Error(`This expression is not supported: ${b.type}`)
    }
  }
  function knit(n, id) {
    for (let i = 0; i < count(n); i++) {
      tick()
      if (row >= rows) { overflow = true; stopped = true; return }
      cells.push({ x: row % 2 ? cols - offset - 1 : offset, y: row, color, id })
      if (++offset === cols) { offset = 0; row++ }
    }
  }
  function run(first, depth = 0) {
    if (depth > 40) throw new Error('Too many nested function calls.')
    for (let b = first; b && !stopped; b = b.getNextBlock()) {
      tick()
      if (!b.isEnabled()) continue
      const input = name => b.getInputTargetBlock(name)
      switch (b.type) {
        case 'bk_start': break
        case 'bk_knit': knit(value(b, 'COUNT', 1), b.id); break
        case 'bk_until': knit(cols - offset, b.id); break
        case 'bk_color': color = b.getFieldValue('COLOR'); break
        case 'bk_row': if (offset) { offset = 0; row++ } break
        case 'bk_cast': knit(count(value(b, 'COUNT', 1)) * cols, b.id); break
        case 'bk_bind': case 'bk_stop': stopped = true; break
        case 'controls_repeat_ext': { const n = count(value(b, 'TIMES')); for (let i = 0; i < n && !stopped; i++) { tick(); run(input('DO'), depth) } break }
        case 'controls_whileUntil': case 'bk_forever': {
          while (!stopped && (b.type === 'bk_forever' || (b.getFieldValue('MODE') === 'UNTIL' ? !value(b, 'BOOL') : !!value(b, 'BOOL')))) { tick(); run(input('DO'), depth) }
          break
        }
        case 'controls_if': { let matched = false; for (let i = 0; b.getInput(`IF${i}`); i++) if (value(b, `IF${i}`)) { run(input(`DO${i}`), depth); matched = true; break } if (!matched) run(input('ELSE'), depth); break }
        case 'variables_set': variables.set(b.getFieldValue('VAR'), value(b, 'VALUE')); break
        case 'math_change': { const id = b.getFieldValue('VAR'); variables.set(id, finite(variables.get(id) ?? 0) + finite(value(b, 'DELTA'))); break }
        case 'procedures_callnoreturn': {
          const definition = procedures.get(b.getFieldValue('NAME')?.toLowerCase())
          if (!definition) throw new Error('Define this function before calling it.')
          const args = b.arguments_ ?? [], ids = definition.getVarModels().map(model => model.getId())
          const saved = ids.map(id => [id, variables.has(id), variables.get(id)])
          args.forEach((_, i) => variables.set(ids[i], value(b, `ARG${i}`)))
          run(definition.getInputTargetBlock('STACK'), depth + 1)
          saved.forEach(([id, existed, v]) => existed ? variables.set(id, v) : variables.delete(id))
          break
        }
        default: throw new Error(`This statement is not supported: ${b.type}`)
      }
    }
  }
  try {
    const tops = workspace.getTopBlocks(true)
    for (const b of tops) if (b.type === 'procedures_defnoreturn') procedures.set(b.getFieldValue('NAME').toLowerCase(), b)
    const starts = tops.filter(b => b.type === 'bk_start' && b.isEnabled())
    if (starts.length > 1) throw new Error('Use one “when we begin” stack. Connect your blocks below it.')
    run(starts[0])
    return { cells, frames: cells.map(c => c.id), overflow, error: null }
  } catch (error) { return { cells, frames: cells.map(c => c.id), overflow, error: error.message } }
}
