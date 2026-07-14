import { GRAIN_SVG } from "../../constants/controls.js";
import styles from "./FilterStack.module.css";

export function buildFilterConfig(controls) {
	const {
		blueDepth = 0,
		tealDepth = 0,
		cyanDepth = 0,
		exposure = 0,
		highlightLift = 0,
		shadowLift = 0,
		midtoneContrast = 0,
		contrastSoft = 0,
		grain = 0,
		lightWash = 0,
		reflection = 0,
		verticals = 0,
	} = controls;

	const contrastVal = Math.max(
		0.5,
		1 + midtoneContrast * 0.006 + contrastSoft * 0.004
	);

	const brightnessVal = Math.max(
		0.5,
		1 + exposure * 0.008 + shadowLift * 0.004
	);

	const saturateVal = Math.max(0, 0.6 + blueDepth * 0.006);

	return {
		baseFilter: {
			contrastVal,
			brightnessVal,
			saturateVal,
		},

		layers: {
			blueBase: {
				color: "#0D2B6B",
				opacity: Math.min(0.9, blueDepth * 0.009),
				blend: "multiply",
			},

			tealGrade: {
				color: "#5b848a",
				opacity: Math.min(0.9, tealDepth * 0.009),
				blend: "color",
			},

			cyanLift: {
				color: "#0e5398",
				opacity: Math.min(0.8, cyanDepth * 0.008),
				blend: "screen",
			},

			lightWash: {
				gradient: "linear",
				blend: "screen",
				opacity: Math.min(1, 0.3 + lightWash * 0.005),
				colors: [
					{
						pos: 0,
						color: `rgba(230,247,255,${Math.min(1, 0.2 + lightWash * 0.008)})`,
					},
					{
						pos: 0.35,
						color: `rgba(207,239,255,${Math.min(1, 0.1 + lightWash * 0.006)})`,
					},
					{
						pos: 0.65,
						color: `rgba(111,186,217,${Math.min(1, 0.02 + lightWash * 0.002)})`,
					},
					{
						pos: 1,
						color: "rgba(255,255,255,0)",
					},
				],
			},

			highlightLift: {
				gradient: "radial",
				blend: "screen",
				opacity: Math.min(1, 0.1 + highlightLift * 0.012),
				colors: [
					{
						pos: 0,
						color: `rgba(255,255,255,${Math.min(1, highlightLift * 0.012)})`,
					},
					{
						pos: 0.5,
						color: `rgba(207,239,255,${Math.min(1, highlightLift * 0.007)})`,
					},
					{
						pos: 1,
						color: "rgba(255,255,255,0)",
					},
				],
			},

			reflection: {
				gradient: "linear",
				angle: 135,
				blend: "overlay",
				opacity: Math.min(1, 0.1 + reflection * 0.007),
				colors: [
					{
						pos: 0,
						color: `rgba(255,255,255,${Math.min(
							0.9,
							0.05 + reflection * 0.006
						)})`,
					},
					{
						pos: 0.5,
						color: `rgba(207,239,255,${Math.min(
							0.9,
							0.03 + reflection * 0.004
						)})`,
					},
					{
						pos: 1,
						color: `rgba(255,255,255,${Math.min(
							0.9,
							0.04 + reflection * 0.005
						)})`,
					},
				],
			},

			grain: {
				value: grain,
			},

			verticals: {
				value: verticals,
				pitch: 5,
			},

			shadowControl: {
				gradient: "radial",
				blend: "multiply",
				opacity: 0.7,
				colors: [
					{
						pos: 0,
						color: "rgba(255,255,255,0)",
					},
					{
						pos: 0.25,
						color: "rgba(255,255,255,0)",
					},
					{
						pos: 1,
						color: `rgba(
                10,
                26,
                47,
                ${Math.min(0.8, 0.05 + (100 - shadowLift) * 0.003)}
            )`,
					},
				],
			},
		},
	};
}

/**
 * FilterStack — the application's only rendering implementation.
 *
 * Renders the complete visual stack: base image + all CSS blend-mode overlays
 * + Polaroid imprint. Used in two modes:
 *
 * PREVIEW MODE (default)
 *   No width/height props. Sizes responsively via CSS.
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
	previewRef,
	width, // explicit px width  (export mode only)
	height, // explicit px height (export mode only)
}) {
	// ── Get config from buildFilterConfig ─────────────────────────
	const config = buildFilterConfig(controls);
	const { contrastVal, brightnessVal, saturateVal } = config.baseFilter;

	const isExportMode = !!(width && height);

	// ── Base image CSS filter ──────────────────────────────────────
	const baseFilter = [
		`contrast(${contrastVal})`,
		`brightness(${brightnessVal})`,
		`saturate(${saturateVal})`,
	].join(" ");

	// ── Overlay layers ─────────────────────────────────────────────
	const layers = {
		blueBase: {
			background: config.layers.blueBase.color,
			mixBlendMode: config.layers.blueBase.blend,
			opacity: config.layers.blueBase.opacity,
		},
		tealGrade: {
			background: config.layers.tealGrade.color,
			mixBlendMode: config.layers.tealGrade.blend,
			opacity: config.layers.tealGrade.opacity,
		},
		cyanLift: {
			background: config.layers.cyanLift.color,
			mixBlendMode: config.layers.cyanLift.blend,
			opacity: config.layers.cyanLift.opacity,
		},
		lightWash: {
			background: `linear-gradient(180deg, ${config.layers.lightWash.colors
				.map((c) => `${c.color} ${c.pos * 100}%`)
				.join(", ")})`,
			mixBlendMode: config.layers.lightWash.blend,
			opacity: config.layers.lightWash.opacity,
		},
		highlightLift: {
			background: `radial-gradient(ellipse 80% 45% at 50% 0%, ${config.layers.highlightLift.colors
				.map((c) => `${c.color} ${c.pos * 100}%`)
				.join(", ")})`,
			mixBlendMode: config.layers.highlightLift.blend,
			opacity: config.layers.highlightLift.opacity,
		},
		reflection: {
			background: `linear-gradient(135deg, ${config.layers.reflection.colors
				.map((c) => `${c.color} ${c.pos * 100}%`)
				.join(", ")})`,
			mixBlendMode: config.layers.reflection.blend,
			opacity: config.layers.reflection.opacity,
		},
		grain: {
			backgroundImage: GRAIN_SVG,
			backgroundSize: "200px 200px",
			backgroundRepeat: "repeat",
			mixBlendMode: "overlay",
			opacity: Math.min(0.65, (controls.grain || 0) * 0.009),
		},
		verticals: {
			backgroundImage: `
repeating-linear-gradient(
    to left,
    rgba(0,0,0,0.22) 0px,
    rgba(0,0,0,0.12) 1px,
    transparent 1px,
    transparent 2px
)
`,
			mixBlendMode: "multiply",
			opacity: Math.min(0.8, (controls.verticals || 0) * 0.008),
		},
		shadowControl: {
			background: `radial-gradient(ellipse 110% 110% at 50% 50%, ${config.layers.shadowControl.colors
				.map((c) => `${c.color} ${c.pos * 100}%`)
				.join(", ")})`,
			mixBlendMode: config.layers.shadowControl.blend,
			opacity: config.layers.shadowControl.opacity,
		},
	};

	// ── Polaroid imprint ───────────────────────────────────────────
	const now = new Date();
	const dateStr = `${String(now.getMonth() + 1).padStart(
		2,
		"0"
	)}/${now.getFullYear()}`;

	// ── Root sizing ────────────────────────────────────────────────
	const rootStyle = isExportMode
		? {
				width: `${width}px`,
				height: `${height}px`,
				position: "relative",
				display: "inline-block",
				lineHeight: 0,
				flexShrink: 0,
		  }
		: undefined;

	const imgStyle = isExportMode
		? {
				display: "block",
				width: `${width}px`,
				height: `${height}px`,
				filter: baseFilter,
		  }
		: { filter: baseFilter };

	return (
		<div
			ref={previewRef}
			className={isExportMode ? undefined : styles.root}
			style={rootStyle}
		>
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
			<div className={styles.overlay} style={layers.blueBase} />
			<div className={styles.overlay} style={layers.tealGrade} />
			<div className={styles.overlay} style={layers.cyanLift} />
			<div className={styles.overlay} style={layers.lightWash} />
			<div className={styles.overlay} style={layers.highlightLift} />
			<div className={styles.overlay} style={layers.reflection} />
			<div className={styles.overlay} style={layers.grain} />
			<div className={styles.overlay} style={layers.verticals} />
			<div className={styles.overlay} style={layers.shadowControl} />

			{/* Polaroid imprint — visible in both preview and export */}
			<div className={styles.polaroidStamp}>
				<div className={styles.atomWordmark}>AT&#9675;M</div>
				<div className={styles.atomDate}>{dateStr}</div>
			</div>

			{/* Canvas — kept for hook compatibility, not painted */}
			<canvas
				ref={canvasRef}
				className={styles.overlay}
				style={{ opacity: 0 }}
			/>
		</div>
	);
}
