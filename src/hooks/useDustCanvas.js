import { useRef, useCallback, useEffect } from 'react'

/**
 * Manages a canvas overlay that renders analog dust particles and hair scratches.
 * Syncs canvas dimensions to the base image via ResizeObserver.
 *
 * @param {number} dustLevel - 0–100 intensity value from controls
 * @param {boolean} hasImage  - whether an image is currently loaded
 */
export function useDustCanvas(dustLevel, hasImage) {
  const canvasRef = useRef(null)
  const ctxRef    = useRef(null)
  const imgRef    = useRef(null)  // ref to the base <img> element

  const renderDust = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx) return
    const { width: w, height: h } = ctx.canvas
    if (!w || !h) return

    ctx.clearRect(0, 0, w, h)

    const count = Math.floor(dustLevel * 1.2)
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const r = Math.random() * 1.5 + 0.3
      const a = Math.random() * 0.6 + 0.2

      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180,220,255,${a})`
      ctx.fill()

      // Occasional hair-scratch line
      if (Math.random() < 0.04) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 4)
        ctx.strokeStyle = `rgba(160,210,255,${a * 0.5})`
        ctx.lineWidth = 0.4
        ctx.stroke()
      }
    }
  }, [dustLevel])

  /** Call after the image has loaded to size the canvas and paint initial dust */
  const initDust = useCallback(() => {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img) return
    canvas.width  = img.offsetWidth
    canvas.height = img.offsetHeight
    ctxRef.current = canvas.getContext('2d')
    renderDust()
  }, [renderDust])

  // Re-render dust whenever dustLevel changes
  useEffect(() => {
    renderDust()
  }, [renderDust])

  // Keep canvas dimensions in sync with the image element
  useEffect(() => {
    const img = imgRef.current
    if (!img || !hasImage) return

    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width  = img.offsetWidth
      canvas.height = img.offsetHeight
      ctxRef.current = canvas.getContext('2d')
      renderDust()
    })
    ro.observe(img)
    return () => ro.disconnect()
  }, [hasImage, renderDust])

  return { canvasRef, imgRef, initDust }
}
