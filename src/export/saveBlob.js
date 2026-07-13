/**
 * Saves a blob to the user's device.
 */
function isMobileDevice() {
	return typeof navigator !== "undefined" && navigator.maxTouchPoints >= 2;
}

export async function saveBlob(blob, filename = "atom-cyanotype.jpg") {
	// Validate blob
	if (!blob) {
		throw new Error("No blob provided");
	}

	if (blob.size === 0) {
		throw new Error("Blob is empty");
	}

	console.log("Saving blob, size:", blob.size, "bytes");

	const file = new File([blob], filename, { type: "image/jpeg" });

	// Mobile share sheet
	if (
		isMobileDevice() &&
		typeof navigator.share === "function" &&
		typeof navigator.canShare === "function" &&
		navigator.canShare({ files: [file] })
	) {
		try {
			console.log("Using native share sheet");
			await navigator.share({
				files: [file],
				title: "ATOM — Cyanotype Film",
			});
			return;
		} catch (err) {
			if (err.name === "AbortError") {
				console.log("Share cancelled by user");
				return;
			}
			console.warn("navigator.share failed, falling back to download:", err);
		}
	}

	// Desktop + fallback download
	console.log("Using download fallback");
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	// Clean up the URL after download
	setTimeout(() => {
		URL.revokeObjectURL(url);
		console.log("Revoked object URL");
	}, 2000);
}

