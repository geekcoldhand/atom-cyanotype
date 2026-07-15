/**
 * export/renderToBlob.js
 *
 * Thin export orchestrator. All rendering logic (filter config, layer
 * painting, stamp geometry) lives in src/rendering/ and is shared with
 * the live preview (components/Preview/FilterStack.jsx) — this file's
 * only job is: load the image, paint the shared layers onto an
 * off-screen canvas at full resolution, and produce a blob.
 */

import { blobURLToDataURL, loadImage } from "../utils/image.js";
import { buildFilterConfig } from "../rendering/filterConfig.js";
import { buildStampData } from "../rendering/layers/polaroidStamp.js";
import { GRAIN, GRAIN_SVG } from "../rendering/constants.js";
import {
	paintBaseImage,
	paintSolidOverlay,
	paintLinearGradient,
	paintRadialGradient,
	paintGrain,
	paintVerticals,
} from "../rendering/canvas/paintLayers.js";
import { paintStamp } from "../rendering/canvas/paintStamp.js";

async function loadGrainImage() {
	const svgUrl = GRAIN_SVG.replace(/^url\("|"\)$/g, "");
	return loadImage(svgUrl);
}

export async function renderToBlob({ imgSrc, controls, naturalWidth, naturalHeight }) {
	// ── 1. Resolve the image source (blob: URLs must become data: URLs
	//       to be readable across the async export pipeline) ──────────
	let imageSource = imgSrc;
	if (imgSrc && imgSrc.startsWith("blob:")) {
		imageSource = await blobURLToDataURL(imgSrc);
	}

	// ── 2. Load the source image and the grain texture ────────────────
	const [img, grainImage] = await Promise.all([loadImage(imageSource), loadGrainImage()]);

	// ── 3. Set up the export canvas at full resolution ─────────────────
	const canvas = document.createElement("canvas");
	canvas.width = naturalWidth;
	canvas.height = naturalHeight;
	const ctx = canvas.getContext("2d");

	// ── 4. Derive the shared layer config (same function the preview uses) ──
	const config = buildFilterConfig(controls);
	const { layers } = config;

	// ── 5. Paint every layer, in the same order as the live preview ────
	paintBaseImage(ctx, img, 0, 0, naturalWidth, naturalHeight, config.baseFilter);
	paintSolidOverlay(ctx, layers.blueBase, 0, 0, naturalWidth, naturalHeight);
	paintSolidOverlay(ctx, layers.tealGrade, 0, 0, naturalWidth, naturalHeight);
	paintSolidOverlay(ctx, layers.cyanLift, 0, 0, naturalWidth, naturalHeight);
	paintLinearGradient(ctx, layers.lightWash, 0, 0, naturalWidth, naturalHeight);
	paintRadialGradient(ctx, layers.highlightLift, 0, 0, naturalWidth, naturalHeight);
	paintLinearGradient(ctx, layers.reflection, 0, 0, naturalWidth, naturalHeight);
	paintGrain(ctx, grainImage, { ...layers.grain, blend: GRAIN.blend }, 0, 0, naturalWidth, naturalHeight);
	paintVerticals(ctx, layers.verticals, 0, 0, naturalWidth, naturalHeight);
	paintRadialGradient(ctx, layers.shadowControl, 0, 0, naturalWidth, naturalHeight);

	// ── 6. Stamp — same shared geometry the CSS renderer uses ──────────
	paintStamp(ctx, buildStampData(), naturalWidth, naturalHeight);

	// ── 7. Export ────────────────────────────────────────────────────
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Canvas toBlob returned null"));
			},
			"image/jpeg",
			0.92
		);
	});
}
