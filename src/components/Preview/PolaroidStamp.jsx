import { buildStampData } from "../../rendering/layers/polaroidStamp.js";
import styles from "./PolaroidStamp.module.css";

/**
 * The "AT0M" Polaroid imprint. Its geometry (position, rotation, font,
 * color) comes from rendering/layers/polaroidStamp.js — the same data
 * consumed by the canvas stamp renderer used during export
 * (rendering/canvas/paintStamp.js) — so preview and export can no longer
 * silently disagree on where the stamp sits.
 */
export function PolaroidStamp() {
	const stamp = buildStampData();

	// Position, rotation, color, and shadow come from the shared stamp
	// data (inline) rather than being re-typed as static CSS values, so
	// this can never drift from the canvas export's stamp geometry.
	const rootStyle = {
		right: `${stamp.rightPct * 100}%`,
		bottom: `${stamp.bottomPct * 100}%`,
		transform: `rotate(${stamp.rotationDeg}deg)`,
		color: stamp.color,
		fontFamily: stamp.fontFamily,
		textShadow: `${stamp.shadow.offsetX}px ${stamp.shadow.offsetY}px ${stamp.shadow.blur}px ${stamp.shadow.color}`,
		gap: `${stamp.gapFactor}em`,
	};

	return (
		<div className={styles.stamp} style={rootStyle}>
			<div className={styles.wordmark}>{stamp.text1}</div>
			<div className={styles.date} style={{ fontSize: `${stamp.dateFontSizeFactor}em` }}>
				{stamp.text2}
			</div>
		</div>
	);
}
