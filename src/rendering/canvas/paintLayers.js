import { GRAIN, VERTICALS } from "../constants.js";

/**
 * Canvas-target layer painter.
 *
 * This module replaces the previous hand-derived per-pixel blend-mode
 * math (getImageData/putImageData loops manually re-implementing
 * "multiply"/"screen"/"overlay"/"color" formulas). Canvas 2D natively
 * supports the same blend modes as CSS `mix-blend-mode` through
 * `ctx.globalCompositeOperation`, and the same filter functions as CSS
 * `filter` through `ctx.filter` — both implement the CSS Compositing and
 * Blending spec, so using them here (instead of reimplementing the
 * formulas by hand) is what actually keeps preview and export in sync,
 * rather than merely keeping the *numbers* in sync while the *technique*
 * silently diverges.
 */

/** Paints the base image with the CSS-equivalent contrast/brightness/saturate filter. */
export function paintBaseImage(ctx, img, x, y, width, height, baseFilter) {
	ctx.save();
	ctx.filter = [
		`contrast(${baseFilter.contrastVal})`,
		`brightness(${baseFilter.brightnessVal})`,
		`saturate(${baseFilter.saturateVal})`,
	].join(" ");
	ctx.drawImage(img, x, y, width, height);
	ctx.restore();
}

function withCompositing(ctx, blend, opacity, paint) {
	ctx.save();
	ctx.globalCompositeOperation = blend;
	ctx.globalAlpha = opacity;
	paint();
	ctx.restore();
}

/** Converts a CSS-style gradient angle (0deg = up, clockwise) to a line covering the box. */
function angleToLine(angleDeg, width, height) {
	const rad = (angleDeg * Math.PI) / 180;
	const ux = Math.sin(rad);
	const uy = -Math.cos(rad);
	const cx = width / 2;
	const cy = height / 2;
	const half = (Math.abs(ux) * width + Math.abs(uy) * height) / 2;
	return {
		x1: cx - ux * half,
		y1: cy - uy * half,
		x2: cx + ux * half,
		y2: cy + uy * half,
	};
}

export function paintSolidOverlay(ctx, layer, x, y, width, height) {
	if (layer.opacity <= 0.001) return;
	withCompositing(ctx, layer.blend, layer.opacity, () => {
		ctx.fillStyle = layer.color;
		ctx.fillRect(x, y, width, height);
	});
}

export function paintLinearGradient(ctx, layer, x, y, width, height) {
	if (layer.opacity <= 0.001) return;
	withCompositing(ctx, layer.blend, layer.opacity, () => {
		const { x1, y1, x2, y2 } = angleToLine(layer.angle, width, height);
		const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
		layer.colors.forEach((c) => gradient.addColorStop(c.pos, c.color));
		ctx.fillStyle = gradient;
		ctx.fillRect(x, y, width, height);
	});
}

export function paintRadialGradient(ctx, layer, x, y, width, height) {
	if (layer.opacity <= 0.001) return;
	withCompositing(ctx, layer.blend, layer.opacity, () => {
		const { rx, ry, cx, cy } = layer.ellipse;
		const centerX = x + width * cx;
		const centerY = y + height * cy;
		const radius = Math.max(width, height) * 0.7;

		ctx.save();
		ctx.translate(centerX, centerY);
		ctx.scale(Math.max(rx, 0.001), Math.max(ry, 0.001));
		const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
		layer.colors.forEach((c) => gradient.addColorStop(c.pos, c.color));
		ctx.fillStyle = gradient;
		// Fill in the pre-scale coordinate space, oversized to cover the box post-scale.
		ctx.fillRect(-radius / Math.max(rx, 0.001), -radius / Math.max(ry, 0.001), (2 * radius) / Math.max(rx, 0.001), (2 * radius) / Math.max(ry, 0.001));
		ctx.restore();
	});
}

/** Paints the grain texture, tiling a pre-loaded grain image. */
export function paintGrain(ctx, grainImage, layer, x, y, width, height) {
	if (layer.opacity <= 0.001) return;
	withCompositing(ctx, GRAIN.blend, layer.opacity, () => {
		const pattern = ctx.createPattern(grainImage, "repeat");
		ctx.fillStyle = pattern;
		ctx.translate(x, y);
		ctx.fillRect(0, 0, width, height);
	});
}

/** Paints the vertical scan-line texture using a small repeating tile. */
export function paintVerticals(ctx, layer, x, y, width, height) {
	if (layer.opacity <= 0.001) return;

	const tile = document.createElement("canvas");
	tile.width = VERTICALS.stripeWidth;
	tile.height = 1;
	const tileCtx = tile.getContext("2d");
	const [r1, g1, b1] = VERTICALS.lineOpacity1.color;
	const [r2, g2, b2] = VERTICALS.lineOpacity2.color;
	tileCtx.fillStyle = `rgba(${r1},${g1},${b1},${layer.lineOpacity1})`;
	tileCtx.fillRect(0, 0, 1, 1);
	tileCtx.fillStyle = `rgba(${r2},${g2},${b2},${layer.lineOpacity2})`;
	tileCtx.fillRect(1, 0, 1, 1);

	withCompositing(ctx, layer.blend, layer.opacity, () => {
		const pattern = ctx.createPattern(tile, "repeat");
		ctx.fillStyle = pattern;
		ctx.translate(x, y);
		ctx.fillRect(0, 0, width, height);
	});
}
