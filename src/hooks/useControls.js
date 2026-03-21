import { useState, useCallback } from 'react'
import { DEFAULTS } from '../constants/controls.js'

/**
 * Manages all cyanotype filter control values.
 * Returns the current controls object and a stable setter.
 */
export function useControls() {
  const [controls, setControls] = useState({ ...DEFAULTS })

  /** Update a single control key */
  const setControl = useCallback((key) => (value) => {
    setControls((prev) => ({ ...prev, [key]: value }))
  }, [])

  /** Reset all controls to defaults */
  const resetControls = useCallback(() => {
    setControls({ ...DEFAULTS })
  }, [])

  return { controls, setControl, resetControls }
}
