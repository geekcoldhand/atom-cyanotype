import { useState, useCallback } from 'react'

import { Header }            from './components/Header/Header.jsx'
import { Preview }           from './components/Preview/Preview.jsx'
import { Controls }          from './components/Controls/Controls.jsx'
import { ProcessingOverlay } from './components/ProcessingOverlay/ProcessingOverlay.jsx'

import { useControls }   from './hooks/useControls.js'
import { useDustCanvas } from './hooks/useDustCanvas.js'

import { renderToBlob } from './export/renderToBlob.js'
import { saveBlob }     from './export/saveBlob.js'

import styles from './App.module.css'

export default function App() {
  const [imgSrc,     setImgSrc]     = useState(null)
  const [processing, setProcessing] = useState(false)

  const { controls, setControl } = useControls()

  // Dust canvas hook — no-op in Y2K aesthetic, kept for structural compatibility
  const { canvasRef, imgRef, initDust } = useDustCanvas(0, !!imgSrc)

  // ── File loading ────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    // Revoke previous object URL to avoid memory leaks
    setImgSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }, [])

  // Called when the <img> fires onLoad — sizes & paints the dust canvas
  const handleImageLoad = useCallback(() => {
    initDust()
  }, [initDust])

  // ── Export ──────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const img = imgRef.current
    if (!img) return

    setProcessing(true)
    // Yield one frame so the processing overlay can paint
    await new Promise((r) => setTimeout(r, 80))

    try {
      const blob = await renderToBlob(img, controls)
      await saveBlob(blob)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed: ' + err.message)
    }

    setProcessing(false)
  }, [controls, imgRef])

  return (
    <div className={styles.app}>
      <Header
        hasImage={!!imgSrc}
        processing={processing}
        onSave={handleSave}
      />

      <Preview
        imgSrc={imgSrc}
        controls={controls}
        imgRef={imgRef}
        canvasRef={canvasRef}
        onFile={handleFile}
        onImageLoad={handleImageLoad}
      />

      <Controls
        controls={controls}
        setControl={setControl}
      />

      <ProcessingOverlay visible={processing} />
    </div>
  )
}
