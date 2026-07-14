import { GRAIN_SVG, GRAIN, VERTICALS } from "../constants.js";

const gradientStopsCss = (colors) =>
	colors.map((c) => `${c.color} ${c.pos * 100}%`).join(", ");

/**
 * Converts a shared layer config (from rendering/filterConfig.js) into a
 * React style object for the CSS/DOM renderer. One function per layer
 * "kind" (solid, linear gradient, radial gradient, texture) — the layer
 * data itself is the same data the canvas renderer consumes, only the
 * interpretation differs, which is the intended shape of a single
 * rendering source of truth.
 */

export function solidOverlayStyle(layer) {
	return {
		background: layer.color,
		mixBlendMode: layer.blend,
		opacity: layer.opacity,
	};
}

export function linearGradientStyle(layer) {
	return {
		background: `linear-gradient(${layer.angle}deg, ${gradientStopsCss(layer.colors)})`,
		mixBlendMode: layer.blend,
		opacity: layer.opacity,
	};
}

export function radialGradientStyle(layer) {
	const { rx, ry, cx, cy } = layer.ellipse;
	return {
		background: `radial-gradient(ellipse ${rx * 100}% ${ry * 100}% at ${cx * 100}% ${cy * 100}%, ${gradientStopsCss(
			layer.colors
		)})`,
		mixBlendMode: layer.blend,
		opacity: layer.opacity,
	};
}

export function grainStyle(layer) {
	return {
		backgroundImage: GRAIN_SVG,
		backgroundSize: GRAIN.cssBackgroundSize,
		backgroundRepeat: "repeat",
		mixBlendMode: GRAIN.blend,
		opacity: layer.opacity,
	};
}

export function verticalsStyle(layer) {
	return {
		backgroundImage: `
repeating-linear-gradient(
    to left,
    rgba(0,0,0,0.22) 0px,
    rgba(0,0,0,0.12) 1px,
    transparent 1px,
    transparent 2px
)
`,
		mixBlendMode: VERTICALS.blend,
		opacity: layer.opacity,
	};
}

/** Builds the full set of layer style objects for FilterStack to render. */
export function buildLayerStyles(config) {
	return {
		blueBase: solidOverlayStyle(config.layers.blueBase),
		tealGrade: solidOverlayStyle(config.layers.tealGrade),
		cyanLift: solidOverlayStyle(config.layers.cyanLift),
		lightWash: linearGradientStyle(config.layers.lightWash),
		highlightLift: radialGradientStyle(config.layers.highlightLift),
		reflection: linearGradientStyle(config.layers.reflection),
		grain: grainStyle(config.layers.grain),
		verticals: verticalsStyle(config.layers.verticals),
		shadowControl: radialGradientStyle(config.layers.shadowControl),
	};
}

/** Base `<img>` CSS filter string (contrast/brightness/saturate). */
export function baseFilterCss(baseFilter) {
	return [
		`contrast(${baseFilter.contrastVal})`,
		`brightness(${baseFilter.brightnessVal})`,
		`saturate(${baseFilter.saturateVal})`,
	].join(" ");
}
