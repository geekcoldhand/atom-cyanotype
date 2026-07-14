/**
 * Formats a date as MM/YYYY for the Polaroid stamp.
 * Previously duplicated verbatim in FilterStack.jsx and renderToBlob.js.
 */
export function formatStampDate(date = new Date()) {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${month}/${date.getFullYear()}`;
}
