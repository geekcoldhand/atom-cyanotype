import { useState, useCallback } from 'react'
import { DEFAULTS } from '../constants/controls.js'


export function useControls() {
  const [controls, setControls] = useState({ ...DEFAULTS })

  /** update a single control key */
  const setControl = useCallback((key) => (value) => {
    setControls((prev) => ({ ...prev, [key]: value }))
  }, [])

  /** all controls to defaults */
  const resetControls = useCallback(() => {
    setControls({ ...DEFAULTS })
  }, [])

  return { controls, setControl, resetControls }
}
