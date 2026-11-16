import { Blockly } from './blocklyCore.js'
import 'blockly/blocks'
import * as En from 'blockly/msg/en'

Blockly.setLocale(En)
const yarnIcon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="15" r="12" fill="none" stroke="#999fe8" stroke-width="2"/><path d="M5 10q17-4 21 12M9 5q-2 16 13 21M4 16q16-8 24-2M9 25Q7 11 21 4M14 27Q13 14 27 9M5 23Q0 29 5 30" fill="none" stroke="#999fe8" stroke-width="2"/></svg>')}`
const statement = (type, message, args = [], style = 'knitting_blocks', extra = {}) => ({ type, message0: message, args0: args, previousStatement: null, nextStatement: null, style, inputsInline: true, ...extra })
const numeric = name => ({ type: 'input_value', name, check: 'Number' })
const icon = { type: 'field_image', src: yarnIcon, width: 26, height: 26, alt: 'yarn' }
Blockly.common.defineBlocksWithJsonArray([
  { type: 'bk_start', message0: 'when we begin', nextStatement: null, style: 'start_blocks' },
  statement('bk_knit', '%1 knit %2 stitches', [icon, numeric('COUNT')]),
  statement('bk_until', '%1 knit until end of row', [icon]),
  statement('bk_color', '%1 change color to %2', [icon, { type: 'field_dropdown', name: 'COLOR', options: [['rose', '#ef4974'], ['cream', '#fffaf2'], ['lavender', '#9278cc'], ['blue', '#648dd3'], ['sage', '#89ad91'], ['gold', '#e4b955']].map(([name, color]) => [{ src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="24"><rect x="1" y="1" width="34" height="22" rx="11" fill="${color}" stroke="#999fe8"/></svg>`)}`, width: 36, height: 24, alt: name }, color]) }]),
  statement('bk_cast', '%1 cast on %2 rows', [icon, numeric('COUNT')], 'knitting_blocks', { tooltip: 'Fill this many rows with stitches in the current color.' }),
  statement('bk_row', '%1 next row', [icon], 'knitting_blocks', { tooltip: 'Leave remaining cells empty and start the next row. A full row already advances automatically.' }),
  statement('bk_bind', '%1 bind off', [icon], 'knitting_blocks', { nextStatement: undefined }),
  statement('bk_forever', 'forever %1 %2', [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], 'loop_blocks', { tooltip: 'Repeat until the canvas is full. Empty loops stop at the execution limit.' }),
  statement('bk_stop', 'stop all', [], 'loop_blocks', { nextStatement: undefined }),
  { type: 'bk_position', message0: 'current %1', args0: [{ type: 'field_dropdown', name: 'AXIS', options: [['row', 'ROW'], ['column', 'COL']] }], output: 'Number', style: 'math_blocks' },
  { type: 'bk_edge', message0: 'at end of row?', output: 'Boolean', style: 'logic_blocks' },
])
const number = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } })
const tool = (type, inputs) => ({ kind: 'block', type, ...(inputs ? { inputs } : {}) })
export const toolbox = { kind: 'categoryToolbox', contents: [
  { kind: 'category', name: 'Knitting', colour: '#999fe8', contents: [tool('bk_start'), tool('bk_knit', { COUNT: number(1) }), tool('bk_until'), tool('bk_color'), tool('bk_cast', { COUNT: number(1) }), tool('bk_row'), tool('bk_bind')] },
  { kind: 'category', name: 'Logic', colour: '#65c7c3', contents: [tool('controls_repeat_ext', { TIMES: number(10) }), tool('controls_whileUntil'), tool('bk_forever'), tool('controls_if'), tool('logic_compare'), tool('logic_operation'), tool('logic_negate'), tool('logic_boolean'), tool('bk_edge'), tool('bk_stop')] },
  { kind: 'category', name: 'Math', colour: '#87d775', contents: [tool('math_number'), tool('math_arithmetic', { A: number(1), B: number(1) }), tool('math_modulo'), tool('math_random_int', { FROM: number(1), TO: number(10) }), tool('math_round'), tool('math_single'), tool('bk_position')] },
  { kind: 'category', name: 'Variables', colour: '#e8aa65', custom: 'VARIABLE' },
  { kind: 'category', name: 'Functions', colour: '#efa849', custom: 'PROCEDURE' },
] }
export const theme = Blockly.Theme.defineTheme('knitting', {
  base: Blockly.Themes.Classic,
  blockStyles: {
    knitting_blocks: { colourPrimary: '#ffffff', colourSecondary: '#e6e7ff', colourTertiary: '#999fe8' },
    start_blocks: { colourPrimary: '#f6d788', colourSecondary: '#edd088', colourTertiary: '#d3af53' },
    loop_blocks: { colourPrimary: '#87dedd', colourSecondary: '#a6eeea', colourTertiary: '#65bdbb' },
    logic_blocks: { colourPrimary: '#c6ffbf', colourSecondary: '#acffa2', colourTertiary: '#7ed571' },
    math_blocks: { colourPrimary: '#c6ffbf', colourSecondary: '#acffa2', colourTertiary: '#7ed571' },
    variable_blocks: { colourPrimary: '#ffd09a', colourSecondary: '#f7bd7a', colourTertiary: '#d99b59' },
    procedure_blocks: { colourPrimary: '#f9b452', colourSecondary: '#ffc77e', colourTertiary: '#e49628' },
  },
  componentStyles: { workspaceBackgroundColour: '#e5f2fa', toolboxBackgroundColour: '#cde7f6', toolboxForegroundColour: '#526178', flyoutBackgroundColour: '#cde7f6', flyoutForegroundColour: '#6f7481', flyoutOpacity: 1, insertionMarkerColour: '#e7bf49', insertionMarkerOpacity: .5 },
  fontStyle: { family: 'ui-monospace, SFMono-Regular, Menlo, monospace', size: 13 },
})
function chain(items) { return items.reduceRight((next, item) => ({ ...item, ...(next ? { next: { block: next } } : {}) }), null) }
const knit = n => ({ type: 'bk_knit', inputs: { COUNT: number(n) } })
const color = value => ({ type: 'bk_color', fields: { COLOR: value } })
export function exampleWorkspace(name) {
  let items = []
  if (name === 'heart') {
    const picture = ['000000000000','000110011000','001111111100','001111111100','000111111000','000011110000','000001100000','000000000000']
    picture.forEach((line, row) => {
      const text = row % 2 ? [...line].reverse().join('') : line
      for (const run of text.match(/0+|1+/g)) items.push(color(run[0] === '1' ? '#ef4974' : '#fffaf2'), knit(run.length))
    })
  } else if (name === 'stripes') items = [{ type: 'controls_repeat_ext', inputs: { TIMES: number(4), DO: { block: chain([color('#9278cc'), { type: 'bk_until' }, color('#fffaf2'), { type: 'bk_until' }]) } } }]
  return { blocks: { languageVersion: 0, blocks: [{ ...chain([{ type: 'bk_start' }, ...items, { type: 'bk_bind' }]), x: 22, y: 24 }] } }
}
