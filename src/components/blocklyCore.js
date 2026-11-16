import * as Core from 'blockly/core'
// Blockly exposes a CommonJS default in Node and named exports in browser builds.
export const Blockly = Core.Workspace ? Core : Object.values(Core)[0]
