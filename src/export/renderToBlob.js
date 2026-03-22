/**
 * Replicates all CSS filter layers onto an offscreen canvas at full natural
 * image resolution, then exports as a JPEG blob.
 *
 * Layer order mirrors FilterStack.jsx exactly:
 *   1. base image (CSS filter equiv)
 *   2. blueBase    — navy multiply            (blueDepth)
 *   3. tealGrade   — teal color + screen      (tealDepth)
 *   4. cyanLift    — cyan screen              (cyanDepth)
 *   5. lightWash   — top-down linear screen   (lightWash)
 *   6. highlightLift — top radial screen      (highlightLift)
 *   7. reflection  — diagonal overlay         (reflection)
 *   8. grain       — noise overlay            (grain)
 *   9. shadowControl — edge multiply          (shadowLift)
 *
 * @param {HTMLImageElement} img
 * @param {object}           s    - controls from useControls()
 * @returns {Promise<Blob>}
 */
export function renderToBlob(img, s) {
	return new Promise((resolve, reject) => {
		const naturalW = img.naturalWidth;
		const naturalH = img.naturalHeight;

		// ── Mobile Safari canvas size guard ───────────────────────────
		// iOS Safari silently returns null from toBlob when the canvas
		// pixel count exceeds ~16.7MP (4096×4096). We scale down to fit
		// within a safe limit while preserving aspect ratio.
		const MAX_PIXELS = 16_000_000;
		let W = naturalW;
		let H = naturalH;
		if (W * H > MAX_PIXELS) {
			const scale = Math.sqrt(MAX_PIXELS / (W * H));
			W = Math.floor(W * scale);
			H = Math.floor(H * scale);
		}

		const canvas = document.createElement("canvas");
		canvas.width = W;
		canvas.height = H;
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			reject(new Error("Could not get 2D canvas context"));
			return;
		}

		// Destructure with fallbacks matching DEFAULTS in controls.js.
		// Every key gets a fallback so a missing/renamed key never produces NaN.
		const blueDepth = s.blueDepth ?? 40;
		const tealDepth = s.tealDepth ?? 30;
		const cyanDepth = s.cyanDepth ?? 25;
		const exposure = s.exposure ?? 30;
		const highlightLift = s.highlightLift ?? 20;
		const shadowLift = s.shadowLift ?? 15;
		const midtoneContrast = s.midtoneContrast ?? 20;
		const contrastSoft = s.contrastSoft ?? -10;
		const grain = s.grain ?? 25;
		const lightWash = s.lightWash ?? 40;
		const reflection = s.reflection ?? 25;

		// ── 1. Base image — tonal filter ──────────────────────────────
		const contrastVal = Math.max(
			0.5,
			1 + midtoneContrast * 0.006 + contrastSoft * 0.004
		);
		const brightnessVal = Math.max(
			0.5,
			1 + exposure * 0.008 + shadowLift * 0.004
		);
		const saturateVal = Math.max(0, 0.6 + blueDepth * 0.006);

		ctx.filter = `contrast(${contrastVal}) brightness(${brightnessVal}) saturate(${saturateVal})`;
		ctx.drawImage(img, 0, 0, W, H);
		ctx.filter = "none";

		// ── 2. blueBase — deep navy multiply, full frame ───────────────
		ctx.globalCompositeOperation = "multiply";
		ctx.globalAlpha = Math.min(0.9, blueDepth * 0.009);
		ctx.fillStyle = "#0D2B6B";
		ctx.fillRect(0, 0, W, H);
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";

		// ── 3. tealGrade — teal color shift, full frame ────────────────
		// Canvas 2D has no 'color' blend — approximate with multiply pass
		// (shifts shadows toward teal) + screen pass (lifts midtones to teal).
		{
			ctx.globalCompositeOperation = "multiply";
			ctx.globalAlpha = Math.min(0.6, tealDepth * 0.006);
			ctx.fillStyle = "#0A7A8A";
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";

			ctx.globalCompositeOperation = "screen";
			ctx.globalAlpha = Math.min(0.4, tealDepth * 0.004);
			ctx.fillStyle = "#0A7A8A";
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 4. cyanLift — electric cyan screen, full frame ─────────────
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = Math.min(0.8, cyanDepth * 0.008);
		ctx.fillStyle = "#00C8E0";
		ctx.fillRect(0, 0, W, H);
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";

		// ── 5. lightWash — top-down architectural gradient (screen) ───
		{
			const g = ctx.createLinearGradient(0, 0, 0, H);
			g.addColorStop(
				0,
				`rgba(230,247,255,${Math.min(1, 0.2 + lightWash * 0.008)})`
			);
			g.addColorStop(
				0.35,
				`rgba(207,239,255,${Math.min(1, 0.1 + lightWash * 0.006)})`
			);
			g.addColorStop(
				0.65,
				`rgba(111,186,217,${Math.min(1, 0.02 + lightWash * 0.002)})`
			);
			g.addColorStop(1, "rgba(0,0,0,0)");
			ctx.globalCompositeOperation = "screen";
			ctx.globalAlpha = Math.min(1, 0.3 + lightWash * 0.005);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 6. highlightLift — top-of-frame radial screen ─────────────
		{
			const r = Math.max(W, H) * 0.6;
			const g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, r);
			g.addColorStop(
				0,
				`rgba(255,255,255,${Math.min(1, highlightLift * 0.012)})`
			);
			g.addColorStop(
				0.5,
				`rgba(207,239,255,${Math.min(1, highlightLift * 0.007)})`
			);
			g.addColorStop(1, "rgba(0,0,0,0)");
			ctx.globalCompositeOperation = "screen";
			ctx.globalAlpha = Math.min(1, 0.1 + highlightLift * 0.012);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 7. reflection — diagonal glass shimmer (overlay) ──────────
		{
			const g = ctx.createLinearGradient(0, 0, W, H);
			g.addColorStop(
				0,
				`rgba(255,255,255,${Math.min(0.9, 0.05 + reflection * 0.006)})`
			);
			g.addColorStop(
				0.5,
				`rgba(207,239,255,${Math.min(0.9, 0.03 + reflection * 0.004)})`
			);
			g.addColorStop(
				1,
				`rgba(255,255,255,${Math.min(0.9, 0.04 + reflection * 0.005)})`
			);
			ctx.globalCompositeOperation = "overlay";
			ctx.globalAlpha = Math.min(1, 0.1 + reflection * 0.007);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 8. grain — random noise overlay ───────────────────────────
		// default 25 → opacity 0.225, above the ~0.08 overlay visibility threshold
		{
			const gc = document.createElement("canvas");
			gc.width = W;
			gc.height = H;
			const gctx = gc.getContext("2d");
			const id = gctx.createImageData(W, H);
			for (let i = 0; i < id.data.length; i += 4) {
				const v = (Math.random() * 255) | 0;
				id.data[i] = v;
				id.data[i + 1] = v;
				id.data[i + 2] = v;
				id.data[i + 3] = 255;
			}
			gctx.putImageData(id, 0, 0);
			ctx.globalCompositeOperation = "overlay";
			ctx.globalAlpha = Math.min(0.65, grain * 0.009);
			ctx.drawImage(gc, 0, 0);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 9. shadowControl — edge vignette (multiply) ────────────────
		{
			const g = ctx.createRadialGradient(
				W / 2,
				H / 2,
				Math.min(W, H) * 0.25,
				W / 2,
				H / 2,
				Math.max(W, H) * 0.75
			);
			g.addColorStop(0, "rgba(0,0,0,0)");
			g.addColorStop(
				1,
				`rgba(10,26,47,${Math.min(0.8, 0.05 + (100 - shadowLift) * 0.003)})`
			);
			ctx.globalCompositeOperation = "multiply";
			ctx.globalAlpha = 0.7;
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 10. Polaroid imprint — date + ATOM wordmark ────────────────
		// Burned into the export only, not visible in live preview.
		// Simulates the chemical date-stamp etched into integral film.
		// ── 10. Polaroid imprint — date + ATOM wordmark ────────────────
		// ── 10. Polaroid imprint — ATOM wordmark then date ─────────────
		// Burned into export only. Mimics early 2000s digital camera
		// date stamp — LCD character style, high contrast, etched into frame.
		{
			const base = Math.min(W, H);
			const dateSize = Math.round(base * 0.032); // slightly chunkier for LCD feel
			const markSize = Math.round(base * 0.022);
			const padX = Math.round(base * 0.035); // distance from right edge
			const padY = Math.round(base * 0.2); // distance from bottom — adjust to taste

			const now = new Date();
			const yyyy = now.getFullYear();
			const mm = String(now.getMonth() + 1).padStart(2, "0");
			const dateStr = `${yyyy}/${mm}`; // e.g. 2025/03 — matches digital camera format

			ctx.save();

			// Translate to right edge at chosen height, rotate so text reads upward
			ctx.translate(W - padX, H - padY);
			ctx.rotate(-Math.PI / 2);

			ctx.textBaseline = "bottom";

			// ── Both lines anchored right — reads upward from bottom ──────
			// After -90° rotation: right = toward bottom of image, left = toward top.
			// 'right' at x=0 means both lines end flush at the same point,
			// stacked cleanly with the gap between them.
			ctx.textAlign = "right";

			// Measure date width so the wordmark matches the same anchor point
			ctx.font = `bold ${dateSize}px 'Courier New', Courier, monospace`;
			const dateWidth = ctx.measureText(dateStr).width;
			const lineGap = Math.round(base * 0.004); // tight gap between ATOM and date

			// ── Line 1: ATOM wordmark (sits above date, toward top of image) ──
			const markY = -(dateWidth + lineGap); // negative = further left in rotated space = higher up image

			ctx.font = `bold ${markSize}px 'Courier New', Courier, monospace`;
			ctx.globalCompositeOperation = "source-over";

			// Warm amber primary — high contrast LCD feel
			ctx.globalAlpha = 0.82;
			ctx.fillStyle = "rgba(210, 120, 40, 1)";
			ctx.fillText("AT\u25CBM", markY, 0);

			// Slight glow pass underneath for the LCD bloom effect
			ctx.globalAlpha = 0.22;
			ctx.fillStyle = "rgba(255, 180, 60, 1)";
			ctx.fillText("AT\u25CBM", markY - 1, -1);

			// ── Line 2: Date (sits below wordmark, toward bottom of image) ──
			ctx.font = `bold ${dateSize}px 'Courier New', Courier, monospace`;

			// Primary — warm amber, solid
			ctx.globalAlpha = 0.88;
			ctx.fillStyle = "rgba(210, 120, 40, 1)";
			ctx.fillText(dateStr, 0, 0);

			// Glow pass
			ctx.globalAlpha = 0.25;
			ctx.fillStyle = "rgba(255, 180, 60, 1)";
			ctx.fillText(dateStr, -1, -1);

			ctx.restore();
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── Export ────────────────────────────────────────────────────
		// quality 0.92 — slightly reduced from 0.93 to stay under iOS
		// memory limits on large images while remaining visually lossless.
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(
						new Error(
							"canvas.toBlob returned null — image may be too large for this device"
						)
					);
				}
			},
			"image/jpeg",
			0.92
		);
	});
}
