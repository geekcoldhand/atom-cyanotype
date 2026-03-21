import { useRef, useCallback } from 'react'

/**
 * Dust removed for Y2K Cyber Minimalism aesthetic.
 * Returns inert refs so App.jsx and FilterStack call sites need no changes.
 */
export function useDustCanvas(_dustLevel, _hasImage) {
  const canvasRef = useRef(null)
  const imgRef    = useRef(null)
  const initDust  = useCallback(() => {}, [])
  return { canvasRef, imgRef, initDust }
}
