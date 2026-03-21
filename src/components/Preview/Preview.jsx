import { FilterStack } from "./FilterStack.jsx";
import { UploadZone } from "./UploadZone.jsx";
import styles from "./Preview.module.css";

export function Preview({
	imgSrc,
	controls,
	imgRef,
	canvasRef,
	onFile,
	onImageLoad,
	onPreviewTap,
	controlsVisible,
}) {
	const handleDragOver = (e) => e.preventDefault();

	const handleDrop = (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) onFile(file);
	};

	return (
		<div
			className={styles.wrap}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{!imgSrc && <UploadZone onFile={onFile} />}

			{imgSrc && (
				// Tap anywhere on the image/preview to toggle controls
				<div className={styles.tapTarget} onClick={onPreviewTap}>
					<FilterStack
						imgSrc={imgSrc}
						controls={controls}
						imgRef={imgRef}
						canvasRef={canvasRef}
						onLoad={onImageLoad}
					/>

					{/* Hint pill — only visible when controls are hidden */}
					{!controlsVisible && (
						<div className={styles.hint}>tap to show controls</div>
					)}
				</div>
			)}
		</div>
	);
}
