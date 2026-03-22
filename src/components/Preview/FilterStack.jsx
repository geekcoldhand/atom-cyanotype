import { GRAIN_SVG } from '../../constants/controls.js'
import styles from './FilterStack.module.css'

/**
 * Renders the live Y2K Cyber Minimalism filter preview.
 * All effects are GPU-compositor-only — no pixel loops during interaction.
 *
 * Layer stack (mirrors renderToBlob.js exactly):
 *   base (CSS filter) → blueBase → tealGrade → cyanLift
 *   → lightWash → highlightLift → reflection → grain → shadowControl
 *
 * Control keys: blueDepth, tealDepth, cyanDepth, exposure, highlightLift,
 *   shadowLift, midtoneContrast, contrastSoft, grain, lightWash, reflection
 */
export function FilterStack({ imgSrc, controls, imgRef, canvasRef, onLoad }) {
  const {
    blueDepth,
    tealDepth,
    cyanDepth,
    exposure,
    highlightLift,
    shadowLift,
    midtoneContrast,
    contrastSoft,
    grain,
    lightWash,
    reflection,
  } = controls

  // ── Base image CSS filter ──────────────────────────────────────
  const contrastVal   = Math.max(0.5, 1 + (midtoneContrast * 0.006) + (contrastSoft * 0.004))
  const brightnessVal = Math.max(0.5, 1 + (exposure * 0.008) + (shadowLift * 0.004))
  const saturateVal   = Math.max(0, 0.6 + (blueDepth * 0.006))

  const baseFilter = [
    `contrast(${contrastVal})`,
    `brightness(${brightnessVal})`,
    `saturate(${saturateVal})`,
  ].join(' ')

  const layerStyles = {

    // Deep navy/steel — multiply drives the whole image toward blue shadows
    blueBase: {
      background: '#0D2B6B',
      mixBlendMode: 'multiply',
      opacity: Math.min(0.9, blueDepth * 0.009),
    },

    // Teal midtone push — color blend shifts overall hue toward teal
    tealGrade: {
      background: '#0A7A8A',
      mixBlendMode: 'color',
      opacity: Math.min(0.9, tealDepth * 0.009),
    },

    // Cyan lift — screen brightens into electric cyan across the whole frame
    cyanLift: {
      background: '#00C8E0',
      mixBlendMode: 'screen',
      opacity: Math.min(0.8, cyanDepth * 0.008),
    },

    // Top-down structured architectural light wash
    lightWash: {
      background: `linear-gradient(180deg,
        rgba(230,247,255,${Math.min(1, 0.2 + lightWash * 0.008)}) 0%,
        rgba(207,239,255,${Math.min(1, 0.1 + lightWash * 0.006)}) 35%,
        rgba(111,186,217,${Math.min(1, 0.02 + lightWash * 0.002)}) 65%,
        transparent 100%)`,
      mixBlendMode: 'screen',
      opacity: Math.min(1, 0.3 + lightWash * 0.005),
    },

    // Clean bright top-of-frame highlight band
    highlightLift: {
      background: `radial-gradient(
        ellipse 80% 45% at 50% 0%,
        rgba(255,255,255,${Math.min(1, highlightLift * 0.012)}) 0%,
        rgba(207,239,255,${Math.min(1, highlightLift * 0.007)}) 50%,
        transparent 100%)`,
      mixBlendMode: 'screen',
      opacity: Math.min(1, 0.1 + highlightLift * 0.012),
    },

    // Diagonal glass shimmer
    reflection: {
      background: `linear-gradient(135deg,
        rgba(255,255,255,${Math.min(0.9, 0.05 + reflection * 0.006)}) 0%,
        rgba(207,239,255,${Math.min(0.9, 0.03 + reflection * 0.004)}) 50%,
        rgba(255,255,255,${Math.min(0.9, 0.04 + reflection * 0.005)}) 100%)`,
      mixBlendMode: 'overlay',
      opacity: Math.min(1, 0.1 + reflection * 0.007),
    },

    // Fine grain — default 25 → opacity 0.225, above overlay visibility threshold
    grain: {
      backgroundImage: GRAIN_SVG,
      backgroundSize: '200px 200px',
      backgroundRepeat: 'repeat',
      mixBlendMode: 'overlay',
      opacity: Math.min(0.65, grain * 0.009),
    },

    // Edge vignette — intensity driven inversely by shadowLift
    shadowControl: {
      background: `radial-gradient(ellipse 110% 110% at 50% 50%,
        transparent 25%,
        rgba(10,26,47,${Math.min(0.8, 0.05 + (100 - shadowLift) * 0.003)}) 100%)`,
      mixBlendMode: 'multiply',
      opacity: 0.7,
    },
  }

  return (
    <div className={styles.root}>
      <img
        ref={imgRef}
        src={imgSrc}
        alt="Preview"
        className={styles.base}
        style={{ filter: baseFilter }}
        onLoad={onLoad}
      />

      {/* Layer stack — order mirrors renderToBlob.js */}
      <div className={styles.overlay} style={layerStyles.blueBase}      />
      <div className={styles.overlay} style={layerStyles.tealGrade}     />
      <div className={styles.overlay} style={layerStyles.cyanLift}      />
      <div className={styles.overlay} style={layerStyles.lightWash}     />
      <div className={styles.overlay} style={layerStyles.highlightLift} />
      <div className={styles.overlay} style={layerStyles.reflection}    />
      <div className={styles.overlay} style={layerStyles.grain}         />
      <div className={styles.overlay} style={layerStyles.shadowControl} />

      {/* Single canvas — kept for hook compatibility, not painted */}
      <canvas ref={canvasRef} className={styles.overlay} style={{ opacity: 0 }} />
    </div>
  )
}
