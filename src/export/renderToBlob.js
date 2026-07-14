/**
 * Canvas-based export that replicates FilterStack exactly
 * All filters and overlays are applied using canvas operations
 */

// Helper to convert blob URL to data URL
const blobURLToDataURL = async (blobURL) => {
	try {
		const response = await fetch(blobURL);
		if (!response.ok) {
			throw new Error(`Failed to fetch blob: ${response.status}`);
		}
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = (e) =>
				reject(new Error("Failed to read blob as data URL"));
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("Error converting blob URL to data URL:", error);
		throw error;
	}
};

// Helper to load image from data URL
const loadImage = (src) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load image`));
		img.src = src;
	});
};

// ── GRAIN_SVG - Same as in controls.js ──────────────────────────
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export async function renderToBlob({
	imgSrc,
	controls,
	naturalWidth,
	naturalHeight,
}) {
	console.log(
		"🎨 Starting canvas export with controls:",
		JSON.stringify(controls, null, 2)
	);

	// ── 1. Get image as data URL ──────────────────────────────────
	let imageSource = imgSrc;
	if (imgSrc && imgSrc.startsWith("blob:")) {
		try {
			imageSource = await blobURLToDataURL(imgSrc);
			console.log("✅ Converted blob URL to data URL");
		} catch (error) {
			console.error("❌ Failed to convert blob URL:", error);
			throw new Error("Failed to load image for export");
		}
	}

	// ── 2. Load the image ──────────────────────────────────────────
	let img;
	try {
		img = await loadImage(imageSource);
		console.log("✅ Image loaded:", img.width, "x", img.height);
	} catch (error) {
		console.error("❌ Failed to load image:", error);
		throw new Error("Failed to load image for export");
	}

	// ── 3. Create main canvas ──────────────────────────────────────
	const canvas = document.createElement("canvas");
	canvas.width = naturalWidth;
	canvas.height = naturalHeight;
	const ctx = canvas.getContext("2d");

	// ── 4. Draw the original image ─────────────────────────────────
	ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

	// ── 5. Build filter config from controls ──────────────────────
	const config = buildFilterConfig(controls);
	console.log("📊 Config built:", JSON.stringify(config, null, 2));

	const { contrastVal, brightnessVal, saturateVal } = config.baseFilter;

	// ── 6. Apply base filters ─────────────────────────────────────
	if (contrastVal !== 1) {
		applyContrast(ctx, contrastVal, 0, 0, naturalWidth, naturalHeight);
		console.log("✅ Applied contrast:", contrastVal);
	}

	if (brightnessVal !== 1) {
		applyBrightness(ctx, brightnessVal, 0, 0, naturalWidth, naturalHeight);
		console.log("✅ Applied brightness:", brightnessVal);
	}

	if (saturateVal !== 1) {
		applySaturation(ctx, saturateVal, 0, 0, naturalWidth, naturalHeight);
		console.log("✅ Applied saturation:", saturateVal);
	}

	// ── 7. Apply solid color overlays ─────────────────────────────

	// 7.1 blueBase (multiply blend)
	const blueLayer = config.layers.blueBase;
	if (blueLayer.opacity > 0.001) {
		applySolidColorOverlay(
			ctx,
			blueLayer.color,
			blueLayer.opacity,
			blueLayer.blend,
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied blueBase:", blueLayer.opacity);
	}

	// 7.2 tealGrade (color blend)
	const tealLayer = config.layers.tealGrade;
	if (tealLayer.opacity > 0.001) {
		applySolidColorOverlay(
			ctx,
			tealLayer.color,
			tealLayer.opacity,
			tealLayer.blend,
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied tealGrade:", tealLayer.opacity);
	}

	// 7.3 cyanLift (screen blend)
	const cyanLayer = config.layers.cyanLift;
	if (cyanLayer.opacity > 0.001) {
		applySolidColorOverlay(
			ctx,
			cyanLayer.color,
			cyanLayer.opacity,
			cyanLayer.blend,
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied cyanLift:", cyanLayer.opacity);
	}

	// ── 8. Apply gradient overlays ────────────────────────────────

	// 8.1 lightWash (screen blend)
	const lightWashLayer = config.layers.lightWash;
	if (lightWashLayer.opacity > 0.001) {
		applyGradientOverlay(
			ctx,
			{
				gradient: lightWashLayer.gradient,
				colors: lightWashLayer.colors,
				blendMode: lightWashLayer.blend,
				opacity: lightWashLayer.opacity,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied lightWash:", lightWashLayer.opacity);
	}

	// 8.2 highlightLift (screen blend)
	const highlightLayer = config.layers.highlightLift;
	if (highlightLayer.opacity > 0.001) {
		applyGradientOverlay(
			ctx,
			{
				gradient: highlightLayer.gradient,
				colors: highlightLayer.colors,
				blendMode: highlightLayer.blend,
				opacity: highlightLayer.opacity,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied highlightLift:", highlightLayer.opacity);
	}

	// 8.3 reflection (overlay blend)
	const reflectionLayer = config.layers.reflection;
	if (reflectionLayer.opacity > 0.001) {
		applyGradientOverlay(
			ctx,
			{
				gradient: reflectionLayer.gradient,
				angle: reflectionLayer.angle || 135,
				colors: reflectionLayer.colors,
				blendMode: reflectionLayer.blend,
				opacity: reflectionLayer.opacity,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied reflection:", reflectionLayer.opacity);
	}

	// ── 9. Apply grain using SVG (matches FilterStack CSS) ──────
	const grainOpacity = Math.min(0.65, (controls.grain || 0) * 0.009);
	if (grainOpacity > 0.001) {
		await applyGrainOverlaySVG(
			ctx,
			grainOpacity,
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied grain (SVG):", grainOpacity);
	}

	// ── 10. Apply verticals ───────────────────────────────────────
	const verticalsValue = controls.verticals || 0;
	if (verticalsValue > 0) {
		const vOpacity = Math.min(0.8, verticalsValue * 0.008);
		const lineOpacity1 = Math.min(0.9, verticalsValue * 0.009);
		const lineOpacity2 = Math.min(0.7, verticalsValue * 0.007);

		applyVerticalsOverlay(
			ctx,
			vOpacity,
			lineOpacity1,
			lineOpacity2,
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied verticals:", vOpacity);
	}

	// ── 11. Apply shadowControl (multiply blend) ──────────────────
	const shadowLayer = config.layers.shadowControl;
	if (shadowLayer.opacity > 0.001) {
		applyGradientOverlay(
			ctx,
			{
				gradient: shadowLayer.gradient,
				colors: shadowLayer.colors,
				blendMode: shadowLayer.blend,
				opacity: shadowLayer.opacity,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied shadowControl");
	}

	// ── 12. Add Polaroid stamp ────────────────────────────────────
	const now = new Date();
	const dateStr = `${String(now.getMonth() + 1).padStart(
		2,
		"0"
	)}/${now.getFullYear()}`;
	applyPolaroidStamp(ctx, dateStr, naturalWidth, naturalHeight);
	console.log("✅ Applied Polaroid stamp");

	// ── 13. Convert to blob ──────────────────────────────────────
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					console.log("✅ Canvas exported, size:", blob.size, "bytes");
					resolve(blob);
				} else {
					reject(new Error("Canvas toBlob returned null"));
				}
			},
			"image/jpeg",
			0.92
		);
	});
}

// ── Import buildFilterConfig from FilterStack ──────────────────
import { buildFilterConfig } from "../components/Preview/FilterStack.jsx";

// ── Filter Implementation Functions ──────────────────────────────

function applyBrightness(ctx, factor, x, y, width, height) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		data[i] = Math.min(255, Math.max(0, data[i] * factor));
		data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor));
		data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor));
	}

	ctx.putImageData(imageData, x, y);
}

function applyContrast(ctx, factor, x, y, width, height) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		data[i] = Math.min(
			255,
			Math.max(0, ((data[i] / 255 - 0.5) * factor + 0.5) * 255)
		);
		data[i + 1] = Math.min(
			255,
			Math.max(0, ((data[i + 1] / 255 - 0.5) * factor + 0.5) * 255)
		);
		data[i + 2] = Math.min(
			255,
			Math.max(0, ((data[i + 2] / 255 - 0.5) * factor + 0.5) * 255)
		);
	}

	ctx.putImageData(imageData, x, y);
}

function applySaturation(ctx, factor, x, y, width, height) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const gray = 0.2989 * r + 0.587 * g + 0.114 * b;

		data[i] = Math.min(255, Math.max(0, gray + (r - gray) * factor));
		data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * factor));
		data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * factor));
	}

	ctx.putImageData(imageData, x, y);
}

function applySolidColorOverlay(
	ctx,
	color,
	opacity,
	blendMode,
	x,
	y,
	width,
	height
) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;

	// Parse color
	const hex = color.replace("#", "");
	const overlayR = parseInt(hex.substring(0, 2), 16);
	const overlayG = parseInt(hex.substring(2, 4), 16);
	const overlayB = parseInt(hex.substring(4, 6), 16);

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		let resultR, resultG, resultB;

		switch (blendMode) {
			case "multiply":
				resultR = (r / 255) * (overlayR / 255) * 255;
				resultG = (g / 255) * (overlayG / 255) * 255;
				resultB = (b / 255) * (overlayB / 255) * 255;
				break;
			case "screen":
				resultR = 255 - ((255 - r) * (255 - overlayR)) / 255;
				resultG = 255 - ((255 - g) * (255 - overlayG)) / 255;
				resultB = 255 - ((255 - b) * (255 - overlayB)) / 255;
				break;
			case "color":
				const luminance = 0.2989 * r + 0.587 * g + 0.114 * b;
				resultR = luminance * (overlayR / 255);
				resultG = luminance * (overlayG / 255);
				resultB = luminance * (overlayB / 255);
				break;
			default:
				resultR = r;
				resultG = g;
				resultB = b;
		}

		data[i] = Math.min(255, Math.max(0, r + (resultR - r) * opacity));
		data[i + 1] = Math.min(255, Math.max(0, g + (resultG - g) * opacity));
		data[i + 2] = Math.min(255, Math.max(0, b + (resultB - b) * opacity));
	}

	ctx.putImageData(imageData, x, y);
}

function applyGradientOverlay(ctx, config, x, y, width, height) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;

	// Create a temporary canvas for the gradient
	const tempCanvas = document.createElement("canvas");
	tempCanvas.width = width;
	tempCanvas.height = height;
	const tempCtx = tempCanvas.getContext("2d");

	// Create the gradient
	let gradient;
	const centerX = width / 2;
	const centerY = height / 2;
	const radius = Math.max(width, height) * 0.7;

	if (config.gradient === "linear") {
		const angle = ((config.angle || 90) * Math.PI) / 180;
		const x1 = centerX - Math.cos(angle) * radius;
		const y1 = centerY - Math.sin(angle) * radius;
		const x2 = centerX + Math.cos(angle) * radius;
		const y2 = centerY + Math.sin(angle) * radius;
		gradient = tempCtx.createLinearGradient(x1, y1, x2, y2);
	} else {
		gradient = tempCtx.createRadialGradient(
			centerX,
			centerY,
			0,
			centerX,
			centerY,
			radius
		);
	}

	config.colors.forEach((c) => {
		gradient.addColorStop(c.pos, c.color);
	});

	tempCtx.fillStyle = gradient;
	tempCtx.fillRect(0, 0, width, height);

	// Get gradient pixel data
	const gradData = tempCtx.getImageData(0, 0, width, height).data;

	// Apply blend mode
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const gr = gradData[i];
		const gg = gradData[i + 1];
		const gb = gradData[i + 2];
		const ga = gradData[i + 3] / 255;

		let resultR, resultG, resultB;
		const opacity = config.opacity * ga;

		switch (config.blendMode) {
			case "multiply":
				resultR = (r / 255) * (gr / 255) * 255;
				resultG = (g / 255) * (gg / 255) * 255;
				resultB = (b / 255) * (gb / 255) * 255;
				break;
			case "screen":
				resultR = 255 - ((255 - r) * (255 - gr)) / 255;
				resultG = 255 - ((255 - g) * (255 - gg)) / 255;
				resultB = 255 - ((255 - b) * (255 - gb)) / 255;
				break;
			case "overlay":
				resultR =
					r < 128
						? (2 * r * gr) / 255
						: 255 - (2 * (255 - r) * (255 - gr)) / 255;
				resultG =
					g < 128
						? (2 * g * gg) / 255
						: 255 - (2 * (255 - g) * (255 - gg)) / 255;
				resultB =
					b < 128
						? (2 * b * gb) / 255
						: 255 - (2 * (255 - b) * (255 - gb)) / 255;
				break;
			default:
				resultR = r;
				resultG = g;
				resultB = b;
		}

		data[i] = Math.min(255, Math.max(0, r + (resultR - r) * opacity));
		data[i + 1] = Math.min(255, Math.max(0, g + (resultG - g) * opacity));
		data[i + 2] = Math.min(255, Math.max(0, b + (resultB - b) * opacity));
	}

	ctx.putImageData(imageData, x, y);
}

/**
 * Apply grain using SVG texture (matches CSS approach)
 * This renders the GRAIN_SVG to a canvas and composites it with overlay blend mode
 */
async function applyGrainOverlaySVG(ctx, opacity, x, y, width, height) {
	// Create a temporary canvas for the grain
	const grainCanvas = document.createElement("canvas");
	grainCanvas.width = width;
	grainCanvas.height = height;
	const grainCtx = grainCanvas.getContext("2d");

	// Load and draw the SVG grain pattern
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			// Draw the grain SVG pattern tiled across the canvas
			// The SVG is 256x256, so we tile it
			const patternWidth = 256;
			const patternHeight = 256;

			for (let ty = 0; ty < height; ty += patternHeight) {
				for (let tx = 0; tx < width; tx += patternWidth) {
					grainCtx.drawImage(img, tx, ty, patternWidth, patternHeight);
				}
			}

			// Now apply the grain with overlay blend mode
			const imageData = ctx.getImageData(x, y, width, height);
			const data = imageData.data;
			const grainData = grainCtx.getImageData(0, 0, width, height).data;

			for (let i = 0; i < data.length; i += 4) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];

				// Grain is grayscale, use R channel
				const gr = grainData[i];
				const gg = grainData[i + 1];
				const gb = grainData[i + 2];

				// Overlay blend mode
				const resultR =
					r < 128
						? (2 * r * gr) / 255
						: 255 - (2 * (255 - r) * (255 - gr)) / 255;
				const resultG =
					g < 128
						? (2 * g * gg) / 255
						: 255 - (2 * (255 - g) * (255 - gg)) / 255;
				const resultB =
					b < 128
						? (2 * b * gb) / 255
						: 255 - (2 * (255 - b) * (255 - gb)) / 255;

				data[i] = Math.min(255, Math.max(0, r + (resultR - r) * opacity));
				data[i + 1] = Math.min(255, Math.max(0, g + (resultG - g) * opacity));
				data[i + 2] = Math.min(255, Math.max(0, b + (resultB - b) * opacity));
			}

			ctx.putImageData(imageData, x, y);
			resolve();
		};

		// Load the SVG as an image
		// The GRAIN_SVG constant has 'url("...")' wrapper, we need to extract the URL
		const svgUrl = GRAIN_SVG.replace(/^url\("|"\)$/g, "");
		img.crossOrigin = "anonymous";
		img.src = svgUrl;
	});
}

function applyVerticalsOverlay(
	ctx,
	opacity,
	lineOpacity1,
	lineOpacity2,
	x,
	y,
	width,
	height
) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;

	// Create vertical line pattern
	const patternCanvas = document.createElement("canvas");
	patternCanvas.width = width;
	patternCanvas.height = height;
	const patternCtx = patternCanvas.getContext("2d");

	// Draw vertical lines with repeating pattern
	const stripeWidth = 4;
	for (let xPos = 0; xPos < width; xPos += stripeWidth) {
		// Semi-transparent stripe
		patternCtx.fillStyle = `rgba(222,222,222,${lineOpacity1})`;
		patternCtx.fillRect(xPos, 0, 1, height);
		// White 1px line
		patternCtx.fillStyle = `rgba(255,255,255,${lineOpacity2})`;
		patternCtx.fillRect(xPos + 1, 0, 1, height);
	}

	const patternData = patternCtx.getImageData(0, 0, width, height).data;

	// Apply with overlay blend mode
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const pr = patternData[i];
		const pg = patternData[i + 1];
		const pb = patternData[i + 2];
		const pa = patternData[i + 3] / 255;

		if (pa === 0) continue;

		const resultR =
			r < 128 ? (2 * r * pr) / 255 : 255 - (2 * (255 - r) * (255 - pr)) / 255;
		const resultG =
			g < 128 ? (2 * g * pg) / 255 : 255 - (2 * (255 - g) * (255 - pg)) / 255;
		const resultB =
			b < 128 ? (2 * b * pb) / 255 : 255 - (2 * (255 - b) * (255 - pb)) / 255;

		data[i] = Math.min(255, Math.max(0, r + (resultR - r) * opacity * pa));
		data[i + 1] = Math.min(255, Math.max(0, g + (resultG - g) * opacity * pa));
		data[i + 2] = Math.min(255, Math.max(0, b + (resultB - b) * opacity * pa));
	}

	ctx.putImageData(imageData, x, y);
}

function applyPolaroidStamp(ctx, dateStr, width, height) {
	// ── Match CSS positioning ──────────────────────────────────────
	// CSS: right: 1%, bottom: 15%, transform: rotate(270deg)
	// transform-origin: bottom right
	
	// Calculate position (bottom right, rotated 270deg)
	const paddingRight = width * 0.01;  // 1% from right
	const paddingBottom = height * 0.18; // 15% from bottom
	
	// Font sizing - match CSS proportions
	const fontSize = Math.min(width, height) * 0.035;
	const gap = fontSize * 0.6; // 0.6rem gap
	
	// ── Text measurements ──────────────────────────────────────────
	ctx.save();
	
	// Use the same font as CSS
	ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
	const text1 = "AT0M";
	const text2 = dateStr;
	
	const metrics1 = ctx.measureText(text1);
	const metrics2 = ctx.measureText(text2);
	const textHeight = fontSize * 1.2; // Approximate line height
	
	// ── Position calculation for rotated text ────────────────────
	// CSS: transform: rotate(270deg) with transform-origin: bottom right
	// This means the text is rotated 270deg (or -90deg) around bottom-right corner
	// So the text reads from bottom to top, aligned to the right edge
	
	// The origin point (bottom-right corner of the text block)
	const originX = width - paddingRight;
	const originY = height - paddingBottom;
	
	// Translate to origin, rotate, then draw
	ctx.translate(originX, originY);
	ctx.rotate(-Math.PI / 2); // 270deg = -90deg
	
	// ── Text styling ──────────────────────────────────────────────
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	
	// Shadow for readability (matches CSS shadow)
	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = 4;
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	
	// ── Draw text in row (flex-direction: row, gap: 0.6rem) ──────
	// Since we're rotated, "row" means horizontal in the rotated space
	// We draw text1 then text2 with a gap between them
	
	const totalWidth = metrics1.width + gap + metrics2.width;
	
	// Position text1 (right-aligned, so it's at the right edge)
	const text1X = 0;
	const text1Y = 0;
	
	// Position text2 (to the left of text1 with gap)
	const text2X = -(metrics1.width + gap);
	const text2Y = 0;
	
	// Draw first text (AT0M) - larger and bolder
	ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
	ctx.fillStyle = "#945925"; // Match CSS color
	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = 4;
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.fillText(text1, text1X, text1Y);
	
	// Draw second text (date) - regular weight
	ctx.font = `${fontSize * 0.8}px "Courier New", Courier, monospace`;
	ctx.fillStyle = "#945925";
	ctx.fillText(text2, text2X, text2Y);
	
	ctx.restore();
}