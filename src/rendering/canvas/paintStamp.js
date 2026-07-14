/**
 * Paints the Polaroid "AT0M" stamp onto a canvas using the same shared
 * geometry data (rendering/layers/polaroidStamp.js) that the CSS
 * component (components/Preview/PolaroidStamp.jsx) renders — so a single
 * set of numbers drives both the preview and the export stamp.
 */
export function paintStamp(ctx, stamp, width, height) {
	const paddingRight = width * stamp.rightPct;
	const paddingBottom = height * stamp.bottomPct;
	const fontSize = Math.min(width, height) * stamp.fontSizeFactor;
	const gap = fontSize * stamp.gapFactor;

	ctx.save();

	ctx.font = `bold ${fontSize}px ${stamp.fontFamily}`;
	const metrics1 = ctx.measureText(stamp.text1);

	const originX = width - paddingRight;
	const originY = height - paddingBottom;

	// CSS `rotate(270deg)` is equivalent to a -90deg canvas rotation.
	const canvasRotationRad = -((360 - stamp.rotationDeg) * Math.PI) / 180;
	ctx.translate(originX, originY);
	ctx.rotate(canvasRotationRad);
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	ctx.shadowColor = stamp.shadow.color;
	ctx.shadowBlur = stamp.shadow.blur;
	ctx.shadowOffsetX = stamp.shadow.offsetX;
	ctx.shadowOffsetY = stamp.shadow.offsetY;
	ctx.fillStyle = stamp.color;

	// text1 ("AT0M") — bold, at the origin.
	ctx.font = `bold ${fontSize}px ${stamp.fontFamily}`;
	ctx.fillText(stamp.text1, 0, 0);

	// text2 (date) — regular weight, positioned to the left with a gap.
	ctx.font = `${fontSize * stamp.dateFontSizeFactor}px ${stamp.fontFamily}`;
	ctx.fillText(stamp.text2, -(metrics1.width + gap), 0);

	ctx.restore();
}
