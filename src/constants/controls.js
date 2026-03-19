export const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export const DEFAULTS = {
	blueDepth: 60, // starts in cyan-navy mid range
	crush: 20, // mild shadow crush
	midtoneFade: 35, // some flatness but not completely dissolved
	bloom: 30, // gentle highlight overexposure
	grain: 67, // prominent film grain
	dust: 15, // subtle dust particles
	bloomSpread: 50, // medium bloom radius
	backlightHaze: 25, // backlit edge atmosphere
	lightLeak: 0, // off by default
};

export const TABS = ["Color", "Texture", "Lighting"];

export const SLIDER_CONFIG = {
	Color: [
		{ key: "blueDepth", label: "Blue Depth" },
		{ key: "crush", label: "Shadow Crush" },
		{ key: "midtoneFade", label: "Midtone Fade" },
		{ key: "bloom", label: "Bloom" },
	],
	Texture: [
		{ key: "grain", label: "Film Grain" },
		{ key: "dust", label: "Dust" },
	],
	Lighting: [
		{ key: "bloomSpread", label: "Bloom Spread" },
		{ key: "backlightHaze", label: "Backlight Haze" },
		{ key: "lightLeak", label: "Light Leak" },
	],
};
