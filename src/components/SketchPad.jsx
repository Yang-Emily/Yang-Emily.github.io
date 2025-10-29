import { useRef, useState, useEffect } from 'react'
import { Pencil, Eraser, Trash2, Download } from 'lucide-react'

// 交互式手绘涂鸦板
const SketchPad = () => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#FF6B9D')
  const [lineWidth, setLineWidth] = useState(3)
  const [isEraser, setIsEraser] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()

    ctx.strokeStyle = isEraser ? '#FFFEF9' : color
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'my-sketch.png'
    link.href = url
    link.click()
  }

  const colors = ['#FF6B9D', '#FF85A6', '#6B5FFF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#2D3748']

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 sketch-card p-4 bg-pink-500 text-white hover:bg-pink-600 transition-all group"
        title="Open Sketch Pad"
      >
        <Pencil size={24} className="group-hover:rotate-12 transition-transform" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper rounded-lg shadow-2xl max-w-4xl w-full">
        {/* Header */}
        <div className="border-b-2 border-ink/10 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold font-handwriting">✨ Sketch Your Ideas</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-sketch hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="border-b-2 border-ink/10 p-4 flex flex-wrap gap-4 items-center">
          {/* Colors */}
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c)
                  setIsEraser(false)
                }}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c && !isEraser ? 'border-ink scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Tools */}
          <div className="flex gap-2 border-l-2 border-ink/10 pl-4">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-2 rounded ${!isEraser ? 'bg-ink text-paper' : 'bg-gray-100'}`}
              title="Pencil"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-2 rounded ${isEraser ? 'bg-ink text-paper' : 'bg-gray-100'}`}
              title="Eraser"
            >
              <Eraser size={20} />
            </button>
          </div>

          {/* Line width */}
          <div className="flex items-center gap-2 border-l-2 border-ink/10 pl-4">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={clearCanvas}
              className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-600"
              title="Clear"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={downloadCanvas}
              className="p-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-600"
              title="Download"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full border-2 border-dashed border-ink/20 rounded cursor-crosshair bg-white"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Footer */}
        <div className="border-t-2 border-ink/10 p-4 text-center text-sm text-sketch/60 font-handwriting">
          Draw something creative! Your sketches won't be saved automatically.
        </div>
      </div>
    </div>
  )
}

export default SketchPad
