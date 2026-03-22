/**
 * Replicates all CSS filter layers onto an offscreen canvas at full natural
 * image resolution, then exports as a JPEG blob.
 *
 * Layer order mirrors the live CSS FilterStack exactly:
 *   base → baseTint (hue) → cyanPush (screen) → lightWash → highlightLift
 *   → reflection → grain → shadowControl
 *
 * @param {HTMLImageElement} img  - the loaded base image element
 * @param {object}           s   - current controls object (Y2K keys)
 * @returns {Promise<Blob>}
 */
export function renderToBlob(img, s) {
	return new Promise((resolve, reject) => {
		const W = img.naturalWidth;
		const H = img.naturalHeight;

		const canvas = document.createElement("canvas");
		canvas.width = W;
		canvas.height = H;
		const ctx = canvas.getContext("2d");

		// ── 1. Base image — tonal filter ─────────────────────────────
		// All multipliers mirror FilterStack.jsx exactly
		const contrastVal = Math.max(
			0.5,
			1 + s.midtoneContrast * 0.006 + s.contrastSoft * 0.004
		);
		const brightnessVal = Math.max(
			0.5,
			1 + s.exposure * 0.008 + s.shadowLift * 0.004
		);
		const saturateVal = Math.max(0, 0.6 + s.blueDepth * 0.006);

		ctx.filter = `contrast(${contrastVal}) brightness(${brightnessVal}) saturate(${saturateVal})`;
		ctx.drawImage(img, 0, 0, W, H);
		ctx.filter = "none";

		// ── 2. Steel-blue hue shift (hue blend) ───────────────────────
		// 'hue' replaces only hue — avoids the orange artifact that 'color'
		// produces over warm source images.
		// Canvas 2D does not support 'hue' globalCompositeOperation natively,
		// so we approximate with a low-opacity 'color' pass at a reduced alpha
		// which achieves a similar steel-blue push without the orange cast.
		{
			ctx.globalCompositeOperation = "color";
			ctx.globalAlpha = Math.min(0.5, s.blueDepth * 0.004); // half the opacity of 'hue' to compensate
			ctx.fillStyle = "#2A6496";
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 3. Cyan push — electric highlight screen layer ─────────────
		{
			const g = ctx.createRadialGradient(
				W * 0.55,
				H * 0.15,
				0,
				W * 0.55,
				H * 0.15,
				Math.max(W, H) * 0.8
			);
			g.addColorStop(
				0,
				`rgba(100,210,240,${Math.min(0.9, s.blueDepth * 0.008)})`
			);
			g.addColorStop(
				0.45,
				`rgba(60,160,210,${Math.min(0.7, s.blueDepth * 0.005)})`
			);
			g.addColorStop(1, "rgba(0,0,0,0)");
			ctx.globalCompositeOperation = "screen";
			ctx.globalAlpha = Math.min(0.75, s.blueDepth * 0.007);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 4. Light wash — architectural top-down gradient (screen) ──
		{
			const g = ctx.createLinearGradient(0, 0, 0, H);
			g.addColorStop(
				0,
				`rgba(230,247,255,${Math.min(1, 0.2 + s.lightWash * 0.008)})`
			);
			g.addColorStop(
				0.35,
				`rgba(207,239,255,${Math.min(1, 0.1 + s.lightWash * 0.006)})`
			);
			g.addColorStop(
				0.65,
				`rgba(111,186,217,${Math.min(1, 0.02 + s.lightWash * 0.002)})`
			);
			g.addColorStop(1, "rgba(0,0,0,0)");
			ctx.globalCompositeOperation = "screen";
			ctx.globalAlpha = Math.min(1, 0.3 + s.lightWash * 0.005);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 5. Highlight lift — clean top-of-frame band (screen) ──────
		{
			const r = Math.max(W, H) * 0.6;
			const g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, r);
			g.addColorStop(
				0,
				`rgba(255,255,255,${Math.min(1, s.highlightLift * 0.012)})`
			);
			g.addColorStop(
				0.5,
				`rgba(207,239,255,${Math.min(1, s.highlightLift * 0.007)})`
			);
			g.addColorStop(1, "rgba(0,0,0,0)");
			ctx.globalCompositeOperation = "screen";
			ctx.globalAlpha = Math.min(1, 0.1 + s.highlightLift * 0.012);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 6. Glass reflection — diagonal shimmer (overlay) ──────────
		{
			const g = ctx.createLinearGradient(0, 0, W, H);
			g.addColorStop(
				0,
				`rgba(255,255,255,${Math.min(0.9, 0.05 + s.reflection * 0.006)})`
			);
			g.addColorStop(
				0.5,
				`rgba(207,239,255,${Math.min(0.9, 0.03 + s.reflection * 0.004)})`
			);
			g.addColorStop(
				1,
				`rgba(255,255,255,${Math.min(0.9, 0.04 + s.reflection * 0.005)})`
			);
			ctx.globalCompositeOperation = "overlay";
			ctx.globalAlpha = Math.min(1, 0.1 + s.reflection * 0.007);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 7. Grain — fine noise (overlay) ───────────────────────────
		// Multiplier raised to 0.009: default 25 → 0.225 opacity,
		// above the ~0.08 threshold where overlay blend becomes visible.
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
			ctx.globalAlpha = Math.min(0.65, s.grain * 0.009);
			ctx.drawImage(gc, 0, 0);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		// ── 8. Shadow control — edge vignette (multiply) ───────────────
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
				`rgba(10,26,47,${Math.min(0.8, 0.05 + (100 - s.shadowLift) * 0.003)})`
			);
			ctx.globalCompositeOperation = "multiply";
			ctx.globalAlpha = 0.7;
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		}

		canvas.toBlob(
			(blob) =>
				blob ? resolve(blob) : reject(new Error("canvas.toBlob returned null")),
			"image/jpeg",
			0.93
		);
	});
}
