import assert from 'node:assert/strict'
import Blockly from 'blockly/core'
import { exampleWorkspace } from '../src/components/knittingBlockConfig.js'
import { runBlockWorkspace } from '../src/components/blockKnittingRuntime.js'
const workspace = new Blockly.Workspace()
const run = (state, cols = 12, rows = 8) => {
  Blockly.serialization.workspaces.load(state, workspace)
  return runBlockWorkspace(workspace, cols, rows)
}
const number = n => ({ block: { type: 'math_number', fields: { NUM: n } } })
const chain = items => items.reduceRight((next, item) => ({ ...item, ...(next ? { next: { block: next } } : {}) }), null)
const program = items => ({ blocks: { languageVersion: 0, blocks: [chain([{ type: 'bk_start' }, ...items])] } })
const stitch = n => ({ type: 'bk_knit', inputs: { COUNT: number(n) } })
const heart = run(exampleWorkspace('heart'))
assert.equal(heart.error, null)
assert.equal(heart.cells.length, 96)
assert.deepEqual(heart.cells.slice(12, 24).map(cell => cell.x), [11,10,9,8,7,6,5,4,3,2,1,0])
assert.equal(run(exampleWorkspace('stripes')).cells.length, 96)
assert.equal(run(exampleWorkspace('empty')).cells.length, 0)
assert.equal(run(exampleWorkspace('heart'), 4, 2).overflow, true)
const nested = run(program([{ type: 'controls_repeat_ext', inputs: { TIMES: number(2), DO: { block: { type: 'controls_repeat_ext', inputs: { TIMES: number(3), DO: { block: stitch(2) } } } } } }]))
assert.equal(nested.cells.length, 12)
const conditional = run(program([{ type: 'controls_if', inputs: { IF0: { block: { type: 'logic_compare', fields: { OP: 'GT' }, inputs: { A: number(3), B: number(2) } } }, DO0: { block: stitch(4) } } }]))
assert.equal(conditional.cells.length, 4)
assert.match(run(program([{ type: 'bk_forever' }])).error, /12,000/)
const forever = run(program([{ type: 'bk_forever', inputs: { DO: { block: stitch(1) } } }]), 2, 2)
assert.equal(forever.cells.length, 4)
const func = program([{ type: 'procedures_callnoreturn', extraState: { name: 'row' } }])
func.blocks.blocks.push({ type: 'procedures_defnoreturn', fields: { NAME: 'row' }, inputs: { STACK: { block: stitch(5) } } })
assert.equal(run(func).error, null)
assert.equal(run(func).cells.length, 5)
const vars = program([{ type: 'variables_set', fields: { VAR: { id: 'count' } }, inputs: { VALUE: number(3) } }, { type: 'bk_knit', inputs: { COUNT: { block: { type: 'variables_get', fields: { VAR: { id: 'count' } } } } } }])
vars.variables = [{ id: 'count', name: 'count' }]
assert.equal(run(vars).cells.length, 3)
workspace.dispose()
console.log('Knitting blocks: presets, row directions, nested loops, conditions, functions, variables, and execution limits passed.')
