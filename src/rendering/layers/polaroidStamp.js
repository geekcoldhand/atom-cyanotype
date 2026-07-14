import { STAMP } from "../constants.js";
import { formatStampDate } from "../../utils/date.js";

/**
 * Builds the data needed to render the Polaroid "AT0M" stamp, shared by
 * both the CSS renderer (components/Preview/PolaroidStamp.jsx) and the
 * canvas renderer (rendering/canvas/paintStamp.js). Previously this
 * geometry (position, rotation, font, color) had to be kept in sync by
 * hand across a CSS module and a hand-derived canvas trigonometry
 * function — this is the single source of truth for that data now.
 */
export function buildStampData(date = new Date()) {
	return {
		text1: STAMP.text1,
		text2: formatStampDate(date),
		color: STAMP.color,
		fontFamily: STAMP.fontFamily,
		rightPct: STAMP.rightPct,
		bottomPct: STAMP.bottomPct,
		rotationDeg: STAMP.rotationDeg,
		fontSizeFactor: STAMP.fontSizeFactor,
		dateFontSizeFactor: STAMP.dateFontSizeFactor,
		gapFactor: STAMP.gapFactor,
		shadow: STAMP.shadow,
	};
}
