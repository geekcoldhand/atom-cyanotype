/**
 * UI/control metadata only. Rendering-specific constants (grain texture,
 * opacity curves, gradient/stamp geometry) live in src/rendering/constants.js —
 * see the architectural review, Section 9, for why these were split.
 */

/** Default slider values — Y2K Cyber Minimalism preset */
export const DEFAULTS = {
	blueDepth: 5, // deep navy/steel blue — shadows and base
	tealDepth: 3, // teal midtone push
	cyanDepth: 41, // electric cyan highlight lift
	exposure: 8, // overall brightness lift
	highlightLift: 20, // clean bright highlight control
	shadowLift: 50, // lifts blacks — avoids crushed shadows
	midtoneContrast: 20, // tonal separation, not flatness
	contrastSoft: 10, // negative softens overall contrast
	grain: 25, // must exceed overlay blend threshold (~0.08 opacity)
	lightWash: 20, // structured architectural light gradient
	reflection: 4, // glass overlay shimmer
	verticals: 10, // vertical lines overlay
};

/** Tab labels in display order */
export const TABS = ["Color", "Light", "Texture"];

/**
 * Sliders per tab — key must match a key in DEFAULTS.
 * `min` defaults to 0 when omitted (see SliderRow.jsx); only sliders that
 * need a non-zero minimum (like `contrastSoft`, which can go negative to
 * soften contrast) specify it here, instead of SliderRow special-casing
 * a hardcoded key name.
 */
export const SLIDER_CONFIG = {
	Color: [
		{ key: "blueDepth", label: "Blue Depth" },
		{ key: "tealDepth", label: "Teal Depth" },
		{ key: "cyanDepth", label: "Cyan Depth" },
	],
	Light: [
		{ key: "exposure", label: "Exposure" },
		{ key: "midtoneContrast", label: "Midtone" },
		{ key: "contrastSoft", label: "Soften", min: -50 },
	],
	Texture: [
		{ key: "lightWash", label: "Light Wash" },
		{ key: "verticals", label: "Verticals" },
		{ key: "grain", label: "Grain" },
	],
};
