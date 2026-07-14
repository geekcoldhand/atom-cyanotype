import {
	BASE_FILTER,
	COLOR_GRADE,
	GRADIENTS,
	GRAIN,
	VERTICALS,
} from "./constants.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${clamp(a, 0, 1)})`;

/**
 * Builds gradient color stops from a constants-driven stop descriptor list.
 * Shared by every gradient layer (lightWash, highlightLift, reflection) so
 * the "base color + alpha ramps with a control value" pattern is expressed
 * once instead of once per layer.
 */
function buildStops(stopDescriptors, controlValue) {
	return stopDescriptors.map((s) => {
		const alphaMax = s.alphaMax ?? 1;
		const alpha = clamp(s.alphaBase + s.alphaFactor * controlValue, 0, alphaMax);
		return { pos: s.pos, color: rgba(s.base, alpha) };
	});
}

/**
 * Pure, framework-agnostic derivation of every rendering layer's config
 * from raw slider control values. No DOM, no Canvas, no JSX — this is the
 * single source of truth consumed by both the CSS renderer
 * (rendering/css/layerStyles.js) and the canvas renderer
 * (rendering/canvas/paintLayers.js).
 */
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
		BASE_FILTER.contrast.floor,
		BASE_FILTER.contrast.base +
			midtoneContrast * BASE_FILTER.contrast.midtoneFactor +
			contrastSoft * BASE_FILTER.contrast.softFactor
	);

	const brightnessVal = Math.max(
		BASE_FILTER.brightness.floor,
		BASE_FILTER.brightness.base +
			exposure * BASE_FILTER.brightness.exposureFactor +
			shadowLift * BASE_FILTER.brightness.shadowFactor
	);

	const saturateVal = Math.max(
		BASE_FILTER.saturate.floor,
		BASE_FILTER.saturate.base + blueDepth * BASE_FILTER.saturate.blueFactor
	);

	const lw = GRADIENTS.lightWash;
	const hl = GRADIENTS.highlightLift;
	const rf = GRADIENTS.reflection;
	const sc = GRADIENTS.shadowControl;

	return {
		baseFilter: { contrastVal, brightnessVal, saturateVal },

		layers: {
			blueBase: {
				color: COLOR_GRADE.blueBase.color,
				blend: COLOR_GRADE.blueBase.blend,
				opacity: clamp(blueDepth * COLOR_GRADE.blueBase.factor, 0, COLOR_GRADE.blueBase.maxOpacity),
			},

			tealGrade: {
				color: COLOR_GRADE.tealGrade.color,
				blend: COLOR_GRADE.tealGrade.blend,
				opacity: clamp(tealDepth * COLOR_GRADE.tealGrade.factor, 0, COLOR_GRADE.tealGrade.maxOpacity),
			},

			cyanLift: {
				color: COLOR_GRADE.cyanLift.color,
				blend: COLOR_GRADE.cyanLift.blend,
				opacity: clamp(cyanDepth * COLOR_GRADE.cyanLift.factor, 0, COLOR_GRADE.cyanLift.maxOpacity),
			},

			lightWash: {
				gradient: lw.gradient,
				angle: lw.angle,
				blend: lw.blend,
				opacity: clamp(lw.opacity.base + lightWash * lw.opacity.factor, 0, lw.opacity.max),
				colors: buildStops(lw.stops, lightWash),
			},

			highlightLift: {
				gradient: hl.gradient,
				ellipse: hl.ellipse,
				blend: hl.blend,
				opacity: clamp(hl.opacity.base + highlightLift * hl.opacity.factor, 0, hl.opacity.max),
				colors: buildStops(hl.stops, highlightLift),
			},

			reflection: {
				gradient: rf.gradient,
				angle: rf.angle,
				blend: rf.blend,
				opacity: clamp(rf.opacity.base + reflection * rf.opacity.factor, 0, rf.opacity.max),
				colors: buildStops(rf.stops, reflection),
			},

			grain: {
				value: grain,
				blend: GRAIN.blend,
				opacity: clamp(grain * GRAIN.factor, 0, GRAIN.maxOpacity),
			},

			verticals: {
				value: verticals,
				blend: VERTICALS.blend,
				opacity: clamp(verticals * VERTICALS.factor, 0, VERTICALS.maxOpacity),
				lineOpacity1: clamp(verticals * VERTICALS.lineOpacity1.factor, 0, VERTICALS.lineOpacity1.max),
				lineOpacity2: clamp(verticals * VERTICALS.lineOpacity2.factor, 0, VERTICALS.lineOpacity2.max),
			},

			shadowControl: {
				gradient: sc.gradient,
				ellipse: sc.ellipse,
				blend: sc.blend,
				opacity: sc.opacity,
				colors: sc.stops.map((s) => {
					if (s.alphaFromShadowLift) {
						const alpha = clamp(
							s.alphaBase + (100 - shadowLift) * s.alphaFactor,
							0,
							s.alphaMax ?? 1
						);
						return { pos: s.pos, color: rgba(s.base, alpha) };
					}
					return { pos: s.pos, color: rgba(s.base, s.alpha) };
				}),
			},
		},
	};
}
