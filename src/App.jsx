import { useState, useCallback, useRef } from "react";

import { Header } from "./components/Header/Header.jsx";
import { Preview } from "./components/Preview/Preview.jsx";
import { Controls } from "./components/Controls/Controls.jsx";
import { ProcessingOverlay } from "./components/ProcessingOverlay/ProcessingOverlay.jsx";

import { useControls } from "./hooks/useControls.js";
import { useDustCanvas } from "./hooks/useDustCanvas.js";

import { renderToBlob } from "./export/renderToBlob.js";
import { saveBlob } from "./export/saveBlob.js";

import styles from "./App.module.css";

export default function App() {
	const [imgSrc, setImgSrc] = useState(null);
	const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
	const [processing, setProcessing] = useState(false);
	const [controlsVisible, setControlsVisible] = useState(true);

	const { controls, setControl } = useControls();
	const { canvasRef, imgRef, initDust } = useDustCanvas(0, !!imgSrc);
	// Add state for original file
	const [originalFile, setOriginalFile] = useState(null);

	// previewRef is attached to the FilterStack root div.
	// renderToBlob no longer uses it — it mounts its own off-screen instance.
	const previewRef = useRef(null);

	const fileToDataURL = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = (e) => reject(e.target.error);
			reader.readAsDataURL(file);
		});
	};
	// ── File loading ───────────────────────────────────────────────
	// Update handleFile to use data URLs instead of blob URLs
	// In App.jsx, update the handleFile function
	const handleFile = useCallback((file) => {
		if (!file || !file.type.startsWith("image/")) return;

		// Store the file object for potential re-fetching
		const reader = new FileReader();
		reader.onload = (e) => {
			// Set the data URL directly instead of using blob URL
			const dataUrl = e.target.result;
			setImgSrc(dataUrl);

			// Also store the original file for potential fallback
			setOriginalFile(file);
		};
		reader.readAsDataURL(file);
	}, []);

	// Capture natural dimensions when the image loads
	const handleImageLoad = useCallback(() => {
		const img = imgRef.current;
		if (img) {
			setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
		}
		initDust();
	}, [initDust, imgRef]);

	// ── Controls toggle ────────────────────────────────────────────
	const handlePreviewTap = useCallback(() => {
		if (imgSrc) setControlsVisible((v) => !v);
	}, [imgSrc]);

	const handleTabChange = useCallback(() => {
		setControlsVisible(true);
	}, []);

	// ── Export ─────────────────────────────────────────────────────
	// renderToBlob receives imgSrc + controls + natural dimensions.
	// It mounts its own off-screen FilterStack — App owns no export DOM.
	//
	// NOTE: navigator.share() on iOS must be called within the user-gesture
	// call stack. renderToBlob is async but triggered directly by the tap,
	// so the gesture chain is preserved as long as no setTimeout is used.
	const handleSave = useCallback(async () => {
		if (!imgSrc || processing) return;
		setProcessing(true);

		try {
			const blob = await renderToBlob({
				imgSrc,
				controls,
				naturalWidth: naturalSize.width,
				naturalHeight: naturalSize.height,
			});
			await saveBlob(blob);
		} catch (err) {
			console.error("Export failed:", err);
			alert("Export failed: " + err.message);
		}

		setProcessing(false);
	}, [imgSrc, controls, naturalSize, processing]);

	return (
		<div className={styles.app}>
			<Header hasImage={!!imgSrc} processing={processing} onSave={handleSave} />

			<Preview
				previewRef={previewRef}
				imgSrc={imgSrc}
				controls={controls}
				imgRef={imgRef}
				canvasRef={canvasRef}
				onFile={handleFile}
				onImageLoad={handleImageLoad}
				onPreviewTap={handlePreviewTap}
				controlsVisible={controlsVisible}
			/>

			<Controls
				controls={controls}
				setControl={setControl}
				visible={controlsVisible}
				onTabChange={handleTabChange}
			/>

			<ProcessingOverlay visible={processing} />
		</div>
	);
}
