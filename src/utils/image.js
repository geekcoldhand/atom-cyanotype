/**
 * Generic image/blob loading helpers. Previously embedded inside
 * export/renderToBlob.js even though they have nothing export-specific
 * about them.
 */

/** Converts a blob: URL into a data: URL. */
export async function blobURLToDataURL(blobURL) {
	try {
		const response = await fetch(blobURL);
		if (!response.ok) {
			throw new Error(`Failed to fetch blob: ${response.status}`);
		}
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = () => reject(new Error("Failed to read blob as data URL"));
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("Error converting blob URL to data URL:", error);
		throw error;
	}
}

/** Loads an <img> element from a URL/data URL, resolving once decoded. */
export function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = src;
	});
}
