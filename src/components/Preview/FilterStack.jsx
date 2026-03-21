import { GRAIN_SVG } from "../../constants/controls.js";
import styles from "./FilterStack.module.css";

/**
 * Renders the live Y2K Cyber Minimalism filter preview.
 * All effects are GPU-compositor-only — no pixel loops during interaction.
 *
 * Layer stack:
 *   base (CSS filter) → baseTint → lightWash → highlightLift
 *   → reflection → grain → shadowControl
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
	} = controls;

	// ── Base image CSS filter ──────────────────────────────────────
	// contrastSoft is negative by default — clamp to avoid inverting
	const contrastVal = Math.max(
		0.5,
		1 + midtoneContrast * 0.006 + contrastSoft * 0.004
	);
	// exposure is the primary brightness driver; shadowLift adds a smaller lift
	const brightnessVal = Math.max(
		0.5,
		1 + exposure * 0.008 + shadowLift * 0.004
	);
	// Mild desaturate at low bias; neutral at ~40; slight push above that.
	// Kept gentle — the overlay layers do the heavy blue/cyan work.
	const saturateVal = Math.max(0, 0.6 + blueDepth * 0.006);

	const baseFilter = [
		`contrast(${contrastVal})`,
		`brightness(${brightnessVal})`,
		`saturate(${saturateVal})`,
	].join(" ");

	// ── Layer style derivations ────────────────────────────────────
	const layerStyles = {
		// Steel-blue hue shift — 'hue' blend replaces only hue, not saturation,
		// so it reliably reads as blue-steel even over warm source images.
		// 'color' blend was causing orange artifacts on warm photos.
		// Deep navy/steel — multiply covers the full image, drives into shadows.
		// Flat solid fill so the slider controls intensity uniformly, not a gradient.
		blueBase: {
			background: "#0D2B6B",
			mixBlendMode: "multiply",
			opacity: Math.min(0.9, blueDepth * 0.009),
		},

		// Teal midtone push — color blend shifts overall hue toward teal.
		// Flat solid fill, slider controls how strongly it shifts.
		tealGrade: {
			background: "#0A7A8A",
			mixBlendMode: "color",
			opacity: Math.min(0.9, tealDepth * 0.009),
		},

		// Cyan lift — screen blend brightens into electric cyan across the whole frame.
		// Flat solid fill, slider controls luminance push intensity.
		cyanLift: {
			background: "#00C8E0",
			mixBlendMode: "screen",
			opacity: Math.min(0.8, cyanDepth * 0.008),
		},

		// Top-down structured architectural light wash
		lightWash: {
			background: `linear-gradient(180deg,
        rgba(230,247,255,${Math.min(1, 0.2 + lightWash * 0.008)}) 0%,
        rgba(207,239,255,${Math.min(1, 0.1 + lightWash * 0.006)}) 35%,
        rgba(111,186,217,${Math.min(1, 0.02 + lightWash * 0.002)}) 65%,
        transparent 100%)`,
			mixBlendMode: "screen",
			opacity: Math.min(1, 0.3 + lightWash * 0.005),
		},

		// Clean bright top-of-frame highlight band
		highlightLift: {
			background: `radial-gradient(
        ellipse 80% 45% at 50% 0%,
        rgba(255,255,255,${Math.min(1, highlightLift * 0.012)}) 0%,
        rgba(207,239,255,${Math.min(1, highlightLift * 0.007)}) 50%,
        transparent 100%)`,
			mixBlendMode: "screen",
			opacity: Math.min(1, 0.1 + highlightLift * 0.012),
		},

		// Diagonal glass shimmer overlay
		reflection: {
			background: `linear-gradient(135deg,
        rgba(255,255,255,${Math.min(0.9, 0.05 + reflection * 0.006)}) 0%,
        rgba(207,239,255,${Math.min(0.9, 0.03 + reflection * 0.004)}) 50%,
        rgba(255,255,255,${Math.min(0.9, 0.04 + reflection * 0.005)}) 100%)`,
			mixBlendMode: "overlay",
			opacity: Math.min(1, 0.1 + reflection * 0.007),
		},

		// Grain — multiplier raised to 0.009 so default 25 → opacity 0.225,
		// well above the ~0.08 threshold where overlay blend becomes visible.
		// Max at 100 → 0.9, clamped to 0.65 to stay tasteful.
		grain: {
			backgroundImage: GRAIN_SVG,
			backgroundSize: "200px 200px",
			backgroundRepeat: "repeat",
			mixBlendMode: "overlay",
			// 0 → 0  |  25 (default) → 0.225  |  100 → 0.65 (clamped)
			opacity: Math.min(0.65, grain * 0.009),
		},

		// Shadow control — edge vignette, lifts inversely with shadowLift
		shadowControl: {
			background: `radial-gradient(ellipse 110% 110% at 50% 50%,
        transparent 25%,
        rgba(10,26,47,${Math.min(
					0.8,
					0.05 + (100 - shadowLift) * 0.003
				)}) 100%)`,
			mixBlendMode: "multiply",
			opacity: 0.7,
		},
	};

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

			{/* Layer stack — order matters */}
			<div className={styles.overlay} style={layerStyles.blueBase} />
			<div className={styles.overlay} style={layerStyles.tealGrade} />
			<div className={styles.overlay} style={layerStyles.cyanLift} />
			<div className={styles.overlay} style={layerStyles.lightWash} />
			<div className={styles.overlay} style={layerStyles.highlightLift} />
			<div className={styles.overlay} style={layerStyles.reflection} />
			<div className={styles.overlay} style={layerStyles.grain} />
			<div className={styles.overlay} style={layerStyles.shadowControl} />
			<canvas
				ref={canvasRef}
				className={styles.overlay}
				style={{ opacity: 0 }}
			/>

			{/* Canvas kept for hook compatibility — not painted in this aesthetic */}
			<canvas
				ref={canvasRef}
				className={styles.overlay}
				style={{ opacity: 0 }}
			/>
		</div>
	);
}
