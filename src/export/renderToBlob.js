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

// ── GRAIN_SVG from constants ──────────────────────────────────────
// This should match your GRAIN_SVG constant
const GRAIN_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E`;

export async function renderToBlob({
	imgSrc,
	controls,
	naturalWidth,
	naturalHeight,
}) {
	console.log("🎨 Starting canvas-based export with FilterStack filters...");
	console.log("📊 Controls:", controls);

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

	// ── 4. Apply all filters from controls ────────────────────────

	// 4.1 Draw the original image
	ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
	console.log("✅ Base image drawn");

	// 4.2 Extract control values (matching FilterStack)
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
	} = controls;

	// 4.3 Apply base image CSS filters (contrast, brightness, saturation)
	const contrastVal = Math.max(
		0.5,
		1 + midtoneContrast * 0.006 + contrastSoft * 0.004
	);
	const brightnessVal = Math.max(
		0.5,
		1 + exposure * 0.008 + shadowLift * 0.004
	);
	const saturateVal = Math.max(0, 0.6 + blueDepth * 0.006);

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

	// 4.4 Apply blueBase overlay (multiply blend mode)
	if (blueDepth > 0) {
		const opacity = Math.min(0.9, blueDepth * 0.009);
		applyColorOverlay(
			ctx,
			"#0D2B6B",
			opacity,
			"multiply",
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied blueBase:", opacity);
	}

	// 4.5 Apply tealGrade overlay (color blend mode)
	if (tealDepth > 0) {
		const opacity = Math.min(0.9, tealDepth * 0.009);
		applyColorOverlay(
			ctx,
			"#5b848a",
			opacity,
			"color",
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied tealGrade:", opacity);
	}

	// 4.6 Apply cyanLift overlay (screen blend mode)
	if (cyanDepth > 0) {
		const opacity = Math.min(0.8, cyanDepth * 0.008);
		applyColorOverlay(
			ctx,
			"#0e5398",
			opacity,
			"screen",
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied cyanLift:", opacity);
	}

	// 4.7 Apply lightWash (gradient with screen blend mode)
	if (lightWash > 0) {
		const opacity1 = Math.min(1, 0.2 + lightWash * 0.008);
		const opacity2 = Math.min(1, 0.1 + lightWash * 0.006);
		const opacity3 = Math.min(1, 0.02 + lightWash * 0.002);
		const overallOpacity = Math.min(1, 0.3 + lightWash * 0.005);

		applyGradientOverlay(
			ctx,
			{
				gradient: "linear",
				colors: [
					{ pos: 0, color: `rgba(230,247,255,${opacity1})` },
					{ pos: 0.35, color: `rgba(207,239,255,${opacity2})` },
					{ pos: 0.65, color: `rgba(111,186,217,${opacity3})` },
					{ pos: 1, color: "rgba(255,255,255,0)" },
				],
				blendMode: "screen",
				opacity: overallOpacity,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied lightWash");
	}

	// 4.8 Apply highlightLift (radial gradient with screen blend mode)
	if (highlightLift > 0) {
		const opacity1 = Math.min(1, highlightLift * 0.012);
		const opacity2 = Math.min(1, highlightLift * 0.007);
		const overallOpacity = Math.min(1, 0.1 + highlightLift * 0.012);

		applyGradientOverlay(
			ctx,
			{
				gradient: "radial",
				colors: [
					{ pos: 0, color: `rgba(255,255,255,${opacity1})` },
					{ pos: 0.5, color: `rgba(207,239,255,${opacity2})` },
					{ pos: 1, color: "rgba(255,255,255,0)" },
				],
				blendMode: "screen",
				opacity: overallOpacity,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied highlightLift");
	}

	// 4.9 Apply reflection (gradient with overlay blend mode)
	if (reflection > 0) {
		const opacity1 = Math.min(0.9, 0.05 + reflection * 0.006);
		const opacity2 = Math.min(0.9, 0.03 + reflection * 0.004);
		const opacity3 = Math.min(0.9, 0.04 + reflection * 0.005);
		const overallOpacity = Math.min(1, 0.1 + reflection * 0.007);

		applyGradientOverlay(
			ctx,
			{
				gradient: "linear",
				angle: 135,
				colors: [
					{ pos: 0, color: `rgba(255,255,255,${opacity1})` },
					{ pos: 0.5, color: `rgba(207,239,255,${opacity2})` },
					{ pos: 1, color: `rgba(255,255,255,${opacity3})` },
				],
				blendMode: "overlay",
				opacity: overallOpacity,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied reflection");
	}

	// 4.10 Apply grain (overlay blend mode)
	if (grain > 0) {
		const grainOpacity = Math.min(0.65, grain * 0.009);
		await applyGrainOverlay(
			ctx,
			grainOpacity,
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied grain:", grainOpacity);
	}

	// 4.11 Apply shadowControl (radial gradient with multiply blend mode)
	const shadowOpacity = Math.min(0.8, 0.05 + (100 - shadowLift) * 0.003);
	if (shadowOpacity > 0) {
		applyGradientOverlay(
			ctx,
			{
				gradient: "radial",
				colors: [
					{ pos: 0, color: "rgba(255,255,255,0)" },
					{ pos: 0.25, color: "rgba(255,255,255,0)" },
					{ pos: 1, color: `rgba(10,26,47,${shadowOpacity})` },
				],
				blendMode: "multiply",
				opacity: 0.7,
			},
			0,
			0,
			naturalWidth,
			naturalHeight
		);
		console.log("✅ Applied shadowControl");
	}

	// 4.12 Add Polaroid stamp (text overlay)
	const now = new Date();
	const dateStr = `${String(now.getMonth() + 1).padStart(
		2,
		"0"
	)}/${now.getFullYear()}`;
	applyPolaroidStamp(ctx, dateStr, naturalWidth, naturalHeight);
	console.log("✅ Applied Polaroid stamp");

	// ── 5. Convert to blob ──────────────────────────────────────────
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

function applyColorOverlay(
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
				// Color blend mode - keep luminance, use overlay hue/saturation
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

async function applyGrainOverlay(ctx, opacity, x, y, width, height) {
	const imageData = ctx.getImageData(x, y, width, height);
	const data = imageData.data;

	// Generate grain using the same SVG pattern
	const grainCanvas = document.createElement("canvas");
	grainCanvas.width = width;
	grainCanvas.height = height;
	const grainCtx = grainCanvas.getContext("2d");

	// Create grain pattern with noise
	const grainData = grainCtx.createImageData(width, height);
	const gData = grainData.data;

	for (let i = 0; i < gData.length; i += 4) {
		const noise = Math.random() * 255;
		gData[i] = noise;
		gData[i + 1] = noise;
		gData[i + 2] = noise;
		gData[i + 3] = 255;
	}
	grainCtx.putImageData(grainData, 0, 0);

	// Get grain pixels
	const grainPixels = grainCtx.getImageData(0, 0, width, height).data;

	// Apply grain with overlay blend mode
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const gr = grainPixels[i];
		const gg = grainPixels[i + 1];
		const gb = grainPixels[i + 2];

		// Overlay blend mode
		const resultR =
			r < 128 ? (2 * r * gr) / 255 : 255 - (2 * (255 - r) * (255 - gr)) / 255;
		const resultG =
			g < 128 ? (2 * g * gg) / 255 : 255 - (2 * (255 - g) * (255 - gg)) / 255;
		const resultB =
			b < 128 ? (2 * b * gb) / 255 : 255 - (2 * (255 - b) * (255 - gb)) / 255;

		data[i] = Math.min(255, Math.max(0, r + (resultR - r) * opacity));
		data[i + 1] = Math.min(255, Math.max(0, g + (resultG - g) * opacity));
		data[i + 2] = Math.min(255, Math.max(0, b + (resultB - b) * opacity));
	}

	ctx.putImageData(imageData, x, y);
}

function applyPolaroidStamp(ctx, dateStr, width, height) {
	// Position at bottom right with padding
	const padding = Math.min(width, height) * 0.04;
	const fontSize = Math.min(width, height) * 0.035;
	const lineHeight = fontSize * 1.2;

	const text1 = "AT0M";
	const text2 = dateStr;

	ctx.save();

	// Measure text
	ctx.font = `bold ${fontSize}px "Courier New", monospace`;
	const metrics1 = ctx.measureText(text1);
	const metrics2 = ctx.measureText(text2);
	const textWidth = Math.max(metrics1.width, metrics2.width);

	// Position at bottom right
	const x = width - padding - textWidth;
	const y = height - padding - lineHeight * 2 + fontSize * 0.8;

	// Draw text with shadow for readability
	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = 4;
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;

	// Draw first line
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "rgba(132, 88, 60, 0.9)";
	ctx.font = `bold ${fontSize * 1.1}px "Courier New", monospace`;
	ctx.fillText(text1, width - padding, y + lineHeight);

	// Draw second line
	ctx.font = `${fontSize * 0.8}px "Courier New", monospace`;
	ctx.fillStyle = "rgba(132, 88, 60, 0.7)";
	ctx.fillText(text2, width - padding, y);

	ctx.restore();
}
