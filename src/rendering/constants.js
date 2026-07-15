/**
 * rendering/constants.js
 *
 * Single source of truth for every rendering magic number: opacity caps,
 * intensity multipliers, gradient geometry, and stamp geometry.
 *
 * Both the CSS renderer (rendering/css/layerStyles.js) and the canvas
 * renderer (rendering/canvas/paintLayers.js, paintStamp.js) import from
 * here instead of re-deriving these values independently. This is what
 * prevents the two render targets from silently drifting apart (see the
 * architectural review, Section 10 — the Polaroid stamp position was
 * previously 15% in CSS vs 18% in canvas because these numbers lived in
 * two places).
 */

/** Encoded SVG grain texture — finer baseFrequency for clean Y2K texture. */
export const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/** Base image CSS filter curve (contrast / brightness / saturation). */
export const BASE_FILTER = {
	contrast: { floor: 0.5, base: 1, midtoneFactor: 0.006, softFactor: 0.004 },
	brightness: { floor: 0.5, base: 1, exposureFactor: 0.008, shadowFactor: 0.004 },
	saturate: { floor: 0, base: 0.6, blueFactor: 0.006 },
};

/** Solid color-grade overlays (blueBase / tealGrade / cyanLift). */
export const COLOR_GRADE = {
	blueBase: { color: "#0D2B6B", blend: "multiply", maxOpacity: 0.9, factor: 0.009 },
	tealGrade: { color: "#5b848a", blend: "color", maxOpacity: 0.9, factor: 0.009 },
	cyanLift: { color: "#0e5398", blend: "screen", maxOpacity: 0.8, factor: 0.008 },
};

/** Gradient overlays: light wash, highlight lift, reflection, shadow vignette. */
export const GRADIENTS = {
	lightWash: {
		blend: "screen",
		gradient: "linear",
		angle: 180,
		opacity: { base: 0.3, factor: 0.005, max: 1 },
		stops: [
			{ pos: 0, base: [230, 247, 255], alphaBase: 0.2, alphaFactor: 0.008 },
			{ pos: 0.35, base: [207, 239, 255], alphaBase: 0.1, alphaFactor: 0.006 },
			{ pos: 0.65, base: [111, 186, 217], alphaBase: 0.02, alphaFactor: 0.002 },
			{ pos: 1, base: [255, 255, 255], alphaBase: 0, alphaFactor: 0 },
		],
	},
	highlightLift: {
		blend: "screen",
		gradient: "radial",
		ellipse: { rx: 0.8, ry: 0.45, cx: 0.5, cy: 0 },
		opacity: { base: 0.1, factor: 0.012, max: 1 },
		stops: [
			{ pos: 0, base: [255, 255, 255], alphaBase: 0, alphaFactor: 0.012 },
			{ pos: 0.5, base: [207, 239, 255], alphaBase: 0, alphaFactor: 0.007 },
			{ pos: 1, base: [255, 255, 255], alphaBase: 0, alphaFactor: 0 },
		],
	},
	reflection: {
		blend: "overlay",
		gradient: "linear",
		angle: 135,
		opacity: { base: 0.1, factor: 0.007, max: 1 },
		stops: [
			{ pos: 0, base: [255, 255, 255], alphaBase: 0.05, alphaFactor: 0.006, alphaMax: 0.9 },
			{ pos: 0.5, base: [207, 239, 255], alphaBase: 0.03, alphaFactor: 0.004, alphaMax: 0.9 },
			{ pos: 1, base: [255, 255, 255], alphaBase: 0.04, alphaFactor: 0.005, alphaMax: 0.9 },
		],
	},
	shadowControl: {
		blend: "multiply",
		gradient: "radial",
		ellipse: { rx: 1.1, ry: 1.1, cx: 0.5, cy: 0.5 },
		opacity: 0.7,
		stops: [
			{ pos: 0, base: [255, 255, 255], alpha: 0 },
			{ pos: 0.25, base: [255, 255, 255], alpha: 0 },
			// Shadow color/alpha computed from shadowLift control — see filterConfig.js
			{ pos: 1, base: [10, 26, 47], alphaFromShadowLift: true, alphaBase: 0.05, alphaFactor: 0.003, alphaMax: 0.8 },
		],
	},
};

/** Grain texture overlay. */
export const GRAIN = {
	blend: "overlay",
	maxOpacity: 0.65,
	factor: 0.009,
	tileSize: 256,
	cssBackgroundSize: "200px 200px",
};

/** Vertical scan-line overlay. */
export const VERTICALS = {
	blend: "multiply",
	maxOpacity: 0.8,
	factor: 0.008,
	stripeWidth: 4,
	lineOpacity1: { max: 0.9, factor: 0.009, color: [222, 222, 222] },
	lineOpacity2: { max: 0.7, factor: 0.007, color: [255, 255, 255] },
};

/** Polaroid "AT0M" stamp geometry, shared verbatim by CSS and canvas renderers. */
export const STAMP = {
	text1: "AT0M",
	color: "#945925",
	fontFamily: `"Courier New", Courier, monospace`,
	rightPct: 0.01, // 1% from right
	bottomPct: 0.15, // 15% from bottom
	rotationDeg: 270,
	fontSizeFactor: 0.035, // relative to min(width, height)
	dateFontSizeFactor: 0.8, // relative to title font size
	gapFactor: 0.6, // relative to title font size
	shadow: { color: "rgba(0,0,0,0.3)", blur: 4, offsetX: 1, offsetY: 1 },
};
