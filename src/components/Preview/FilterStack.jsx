import { buildFilterConfig } from "../../rendering/filterConfig.js";
import { buildLayerStyles, baseFilterCss } from "../../rendering/css/layerStyles.js";
import { PolaroidStamp } from "./PolaroidStamp.jsx";
import styles from "./FilterStack.module.css";

/**
 * FilterStack — the application's CSS/DOM rendering implementation.
 *
 * Renders the complete visual stack: base image + all CSS blend-mode
 * overlays + Polaroid imprint. Used in two modes:
 *
 * PREVIEW MODE (default)
 *   No width/height props. Sizes responsively via CSS.
 *
 * EXPORT MODE
 *   width + height supplied by a caller rendering off-screen at full
 *   resolution (currently unused — export is produced by the canvas
 *   renderer in rendering/canvas/, which shares the same
 *   rendering/filterConfig.js data as this component; see the
 *   architectural review for the rationale).
 *
 * All layer *config* (opacity curves, gradient stops, blend modes) comes
 * from rendering/filterConfig.js, and all layer *styling* comes from
 * rendering/css/layerStyles.js — this component's only remaining
 * responsibility is composition: given a config, render this list of
 * layers in this order.
 *
 * Layer order:
 *   base → blueBase → tealGrade → cyanLift → lightWash
 *   → highlightLift → reflection → grain → verticals → shadowControl → stamp
 */
export function FilterStack({
	imgSrc,
	controls,
	imgRef,
	onLoad,
	previewRef,
	width, // explicit px width  (export mode only)
	height, // explicit px height (export mode only)
}) {
	const config = buildFilterConfig(controls);
	const layerStyles = buildLayerStyles(config);
	const baseFilter = baseFilterCss(config.baseFilter);

	const isExportMode = !!(width && height);

	const rootStyle = isExportMode
		? {
				width: `${width}px`,
				height: `${height}px`,
				position: "relative",
				display: "inline-block",
				lineHeight: 0,
				flexShrink: 0,
		  }
		: undefined;

	const imgStyle = isExportMode
		? {
				display: "block",
				width: `${width}px`,
				height: `${height}px`,
				filter: baseFilter,
		  }
		: { filter: baseFilter };

	return (
		<div ref={previewRef} className={isExportMode ? undefined : styles.root} style={rootStyle}>
			<img
				ref={imgRef}
				src={imgSrc}
				alt="Preview"
				className={isExportMode ? undefined : styles.base}
				style={imgStyle}
				onLoad={onLoad}
				crossOrigin="anonymous"
			/>

			{/* Colour/tone layers — identical config in both preview and export */}
			<div className={styles.overlay} style={layerStyles.blueBase} />
			<div className={styles.overlay} style={layerStyles.tealGrade} />
			<div className={styles.overlay} style={layerStyles.cyanLift} />
			<div className={styles.overlay} style={layerStyles.lightWash} />
			<div className={styles.overlay} style={layerStyles.highlightLift} />
			<div className={styles.overlay} style={layerStyles.reflection} />
			<div className={styles.overlay} style={layerStyles.grain} />
			<div className={styles.overlay} style={layerStyles.verticals} />
			<div className={styles.overlay} style={layerStyles.shadowControl} />

			<PolaroidStamp />
		</div>
	);
}
