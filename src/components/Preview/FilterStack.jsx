import { GRAIN_SVG } from '../../constants/controls.js'
import styles from './FilterStack.module.css'

/**
 * FilterStack — the application's only rendering implementation.
 *
 * Renders the complete visual stack: base image + all CSS blend-mode overlays
 * + Polaroid imprint. Used in two modes:
 *
 * PREVIEW MODE (default)
 *   No width/height props. Sizes responsively via CSS.
 *   previewRef is attached to the root div so html-to-image can capture it.
 *
 * EXPORT MODE
 *   width + height supplied by renderToBlob.js (natural image dimensions).
 *   Renders off-screen at full resolution inside a hidden container.
 *   The exact same JSX, filters, overlays and imprint are used — no duplication.
 *
 * Layer order:
 *   base → blueBase → tealGrade → cyanLift → lightWash
 *   → highlightLift → reflection → grain → shadowControl → imprint
 */
export function FilterStack({
  imgSrc,
  controls,
  imgRef,
  canvasRef,
  onLoad,
  previewRef,   // ref attached to root div — used by html-to-image
  width,        // explicit px width  (export mode only)
  height,       // explicit px height (export mode only)
}) {
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

  const isExportMode = !!(width && height)

  // ── Base image CSS filter ──────────────────────────────────────
  const contrastVal   = Math.max(0.5, 1 + midtoneContrast * 0.006 + contrastSoft * 0.004)
  const brightnessVal = Math.max(0.5, 1 + exposure * 0.008 + shadowLift * 0.004)
  const saturateVal   = Math.max(0, 0.6 + blueDepth * 0.006)

  const baseFilter = [
    `contrast(${contrastVal})`,
    `brightness(${brightnessVal})`,
    `saturate(${saturateVal})`,
  ].join(' ')

  // ── Overlay layers ─────────────────────────────────────────────
  const layers = {
    blueBase: {
      background:   '#0D2B6B',
      mixBlendMode: 'multiply',
      opacity:      Math.min(0.9, blueDepth * 0.009),
    },
    tealGrade: {
      background:   '#5b848a',
      mixBlendMode: 'color',
      opacity:      Math.min(0.9, tealDepth * 0.009),
    },
    cyanLift: {
      background:   '#0e5398',
      mixBlendMode: 'screen',
      opacity:      Math.min(0.8, cyanDepth * 0.008),
    },
    lightWash: {
      background: `linear-gradient(180deg,
        rgba(230,247,255,${Math.min(1, 0.2 + lightWash * 0.008)}) 0%,
        rgba(207,239,255,${Math.min(1, 0.1 + lightWash * 0.006)}) 35%,
        rgba(111,186,217,${Math.min(1, 0.02 + lightWash * 0.002)}) 65%,
        transparent 100%)`,
      mixBlendMode: 'screen',
      opacity:      Math.min(1, 0.3 + lightWash * 0.005),
    },
    highlightLift: {
      background: `radial-gradient(
        ellipse 80% 45% at 50% 0%,
        rgba(255,255,255,${Math.min(1, highlightLift * 0.012)}) 0%,
        rgba(207,239,255,${Math.min(1, highlightLift * 0.007)}) 50%,
        transparent 100%)`,
      mixBlendMode: 'screen',
      opacity:      Math.min(1, 0.1 + highlightLift * 0.012),
    },
    reflection: {
      background: `linear-gradient(135deg,
        rgba(255,255,255,${Math.min(0.9, 0.05 + reflection * 0.006)}) 0%,
        rgba(207,239,255,${Math.min(0.9, 0.03 + reflection * 0.004)}) 50%,
        rgba(255,255,255,${Math.min(0.9, 0.04 + reflection * 0.005)}) 100%)`,
      mixBlendMode: 'overlay',
      opacity:      Math.min(1, 0.1 + reflection * 0.007),
    },
    grain: {
      backgroundImage:  GRAIN_SVG,
      backgroundSize:   '200px 200px',
      backgroundRepeat: 'repeat',
      mixBlendMode:     'overlay',
      opacity:          Math.min(0.65, grain * 0.009),
    },
    shadowControl: {
      background: `radial-gradient(ellipse 110% 110% at 50% 50%,
        transparent 25%,
        rgba(10,26,47,${Math.min(0.8, 0.05 + (100 - shadowLift) * 0.003)}) 100%)`,
      mixBlendMode: 'multiply',
      opacity:      0.7,
    },
  }

  // ── Polaroid imprint ───────────────────────────────────────────
  const now     = new Date()
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

  // ── Root sizing ────────────────────────────────────────────────
  // Export mode: explicit pixel dimensions so the off-screen render
  // matches the natural image size exactly.
  // Preview mode: CSS handles responsive sizing via FilterStack.module.css.
  const rootStyle = isExportMode
    ? { width: `${width}px`, height: `${height}px`, position: 'relative', display: 'inline-block', lineHeight: 0, flexShrink: 0 }
    : undefined

  const imgStyle = isExportMode
    ? { display: 'block', width: `${width}px`, height: `${height}px`, filter: baseFilter }
    : { filter: baseFilter }

  return (
    <div ref={previewRef} className={isExportMode ? undefined : styles.root} style={rootStyle}>
      <img
        ref={imgRef}
        src={imgSrc}
        alt="Preview"
        className={isExportMode ? undefined : styles.base}
        style={imgStyle}
        onLoad={onLoad}
        crossOrigin="anonymous"
      />

      {/* Colour/tone layers — identical in both modes */}
      <div className={styles.overlay} style={layers.blueBase}      />
      <div className={styles.overlay} style={layers.tealGrade}     />
      <div className={styles.overlay} style={layers.cyanLift}      />
      <div className={styles.overlay} style={layers.lightWash}     />
      <div className={styles.overlay} style={layers.highlightLift} />
      <div className={styles.overlay} style={layers.reflection}    />
      <div className={styles.overlay} style={layers.grain}         />
      <div className={styles.overlay} style={layers.shadowControl} />

      {/* Polaroid imprint — visible in both preview and export */}
      <div className={styles.polaroidStamp}>
        <div className={styles.atomWordmark}>AT&#9675;M</div>
        <div className={styles.atomDate}>{dateStr}</div>
      </div>

      {/* Canvas — kept for hook compatibility, not painted */}
      <canvas ref={canvasRef} className={styles.overlay} style={{ opacity: 0 }} />
    </div>
  )
}
