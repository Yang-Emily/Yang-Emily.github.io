import { useEffect, useRef } from 'react'
import { Blockly } from './blocklyCore'
import { toolbox, theme, exampleWorkspace } from './knittingBlockConfig'
import { runBlockWorkspace } from './blockKnittingRuntime'

export default function KnittingBlockEditor({ cols, rows, active, onResult }) {
  const host = useRef(null), workspace = useRef(null), latest = useRef({ cols, rows, onResult })
  latest.current = { cols, rows, onResult }
  const publish = () => { const p = latest.current; p.onResult(runBlockWorkspace(workspace.current, p.cols, p.rows)) }
  const load = name => { Blockly.serialization.workspaces.load(exampleWorkspace(name), workspace.current); publish(); workspace.current.scrollCenter() }
  useEffect(() => {
    const ws = Blockly.inject(host.current, { toolbox, theme, renderer: 'zelos', sounds: false, trashcan: true, grid: { spacing: 24, length: 2, colour: '#c5dfeb', snap: false }, zoom: { controls: true, wheel: true, startScale: .75, maxScale: 1.4, minScale: .35 }, move: { scrollbars: true, drag: true, wheel: true }, media: `${import.meta.env.BASE_URL}blockly-media/` })
    workspace.current = ws
    // Keep functions statement-only so every toolbox block has executable semantics.
    ws.registerToolboxCategoryCallback('PROCEDURE', current => Blockly.Procedures.flyoutCategory(current).filter(node => !['procedures_defreturn', 'procedures_callreturn', 'procedures_ifreturn'].includes(node.type ?? node.getAttribute?.('type'))))
    Blockly.serialization.workspaces.load(exampleWorkspace('heart'), ws)
    let timer
    const listener = event => {
      if (event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) return
      clearTimeout(timer); timer = setTimeout(publish, 120)
    }
    ws.addChangeListener(listener)
    const observer = new ResizeObserver(() => Blockly.svgResize(ws)); observer.observe(host.current)
    publish()
    return () => { clearTimeout(timer); observer.disconnect(); ws.removeChangeListener(listener); ws.dispose(); workspace.current = null }
  }, [])
  useEffect(() => { if (workspace.current) publish() }, [cols, rows])
  useEffect(() => { workspace.current?.highlightBlock(active ? String(active) : null) }, [active])
  return <><div className="bk-presets"><button onClick={() => load('heart')}>♡ Heart</button><button onClick={() => load('stripes')}>≋ Stripes</button><button onClick={() => load('empty')}>Clear</button><button onClick={() => workspace.current?.zoomToFit()}>Fit blocks</button></div><p className="bk-hint">Choose a category, then drag blocks into the “when we begin” stack. Drop number and condition blocks into matching sockets.</p><div className="bk-blockly" ref={host} aria-label="Knitting block editor"/></>
}
