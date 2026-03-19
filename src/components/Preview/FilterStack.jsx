import { GRAIN_SVG } from "../../constants/controls.js";
import styles from "./FilterStack.module.css";

/**
 * Renders the live filter preview:
 *   <img> base with CSS filter  +  overlay divs using mix-blend-mode
 *   +  dust <canvas> (screen blend)
 * @note
 * The <canvas> is only rendered when an image is loaded, and
 * canvas is only used for dust particles (updated on dust value change).
 */
export function FilterStack({ imgSrc, controls, imgRef, canvasRef, onLoad }) {
	const {
		blueDepth,
		crush,
		midtoneFade,
		bloom,
		grain,
		dust,
		bloomSpread,
		backlightHaze,
		lightLeak,
	} = controls;

	//base filter
	const baseFilter = [
		`contrast(${1 + crush * 0.004})`,
		`saturate(${0.25 + blueDepth * 0.005})`,
		`brightness(${1.0 + midtoneFade * 0.002})`,
	].join(" ");

	// layer styles
	const midAlpha = 0.2 + midtoneFade * 0.006;

	const layerStyles = {
		mid: {
			background: `radial-gradient(ellipse 90% 90% at 50% 50%,
        rgba(20,60,120,${midtoneFade * 0.005 * midAlpha}) 0%,
        rgba(0,20,70,${midtoneFade * 0.008 * midAlpha}) 100%)`,
			mixBlendMode: "multiply",
			opacity: midAlpha,
		},
		blue: {
			background: `radial-gradient(ellipse 120% 120% at 50% 40%,
        rgba(0,80,200,${blueDepth * 0.006}) 0%,
        rgba(0,30,100,${blueDepth * 0.008}) 60%,
        rgba(0,10,60,${blueDepth * 0.009}) 100%)`,
			mixBlendMode: "multiply",
			opacity: 0.4 + blueDepth * 0.005,
		},
		cyan: {
			background: `linear-gradient(160deg,
        rgba(0,180,255,${blueDepth * 0.003}) 0%,
        rgba(0,60,160,${blueDepth * 0.005}) 50%,
        rgba(0,20,90,${blueDepth * 0.004}) 100%)`,
			mixBlendMode: "color",
			opacity: blueDepth * 0.008,
		},
		grain: {
			backgroundImage: GRAIN_SVG,
			backgroundSize: "200px 200px",
			backgroundRepeat: "repeat",
			mixBlendMode: "overlay",
			opacity: grain * 0.011,
			animation: "grain-shift 0.12s steps(1) infinite",
		},
		bloom: {
			background: `radial-gradient(
        ellipse ${40 + bloomSpread * 0.5}% ${
				40 + bloomSpread * 0.4
			}% at 50% 30%,
        rgba(180,230,255,${bloom * 0.007}) 0%,
        rgba(100,180,255,${bloom * 0.004}) 40%,
        transparent 70%)`,
			mixBlendMode: "screen",
			opacity: bloom * 0.012,
		},
		haze: {
			background: `radial-gradient(ellipse 100% 100% at 50% 50%,
        transparent 30%,
        rgba(0,60,140,${backlightHaze * 0.012}) 70%,
        rgba(0,20,80,${backlightHaze * 0.018}) 100%)`,
			mixBlendMode: "overlay",
			opacity: backlightHaze * 0.014,
		},
		leak: {
			background: `
        radial-gradient(ellipse 60% 40% at 0% 0%,
          rgba(255,120,20,${lightLeak * 0.008}) 0%, transparent 60%),
        radial-gradient(ellipse 40% 60% at 100% 100%,
          rgba(255,60,100,${lightLeak * 0.006}) 0%, transparent 60%)`,
			mixBlendMode: "screen",
			opacity: lightLeak * 0.013,
		},
	};

	return (
		<div className={styles.root}>
			<img
				ref={imgRef}
				src={imgSrc}
				alt="Preview"
				className={styles.base}
				style={{ filter: baseFilter }}
				onLoad={onLoad}
			/>

			{/* layer stack...order matters */}
			<div className={styles.overlay} style={layerStyles.mid} />
			<div className={styles.overlay} style={layerStyles.blue} />
			<div className={styles.overlay} style={layerStyles.cyan} />
			<div className={styles.overlay} style={layerStyles.grain} />
			<div className={styles.overlay} style={layerStyles.bloom} />
			<div className={styles.overlay} style={layerStyles.haze} />
			<div className={styles.overlay} style={layerStyles.leak} />

			{/* Dust canvas.. see top note */}
			<canvas
				ref={canvasRef}
				className={styles.overlay}
				style={{ mixBlendMode: "screen", opacity: dust * 0.008 }}
			/>
		</div>
	);
}
