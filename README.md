# ATOM — Cyanotype Film Filter

A mobile-first React app that applies a real-time cyanotype / analog film aesthetic to photos. Upload an image, dial in the look with sliders, and save the processed result to your camera roll or downloads.

---

## Features

- **Zero pixel-loop preview** — all live effects run through the browser's GPU compositor via CSS `mix-blend-mode`, `filter`, and layered div overlays. No `ImageData` manipulation during interaction.
- **Canvas export only at save time** — full-resolution JPEG compositing via `globalCompositeOperation`.
- **Mobile-native save** — uses `navigator.share({ files })` on iOS/Android (native share sheet → Photos), falls back to `<a download>` on desktop.
- **9 adjustable parameters** across Color, Texture, and Lighting tabs.
- **Animated film grain** — SVG `feTurbulence` tile randomised at 8 fps.
- **Dust & hair scratches** — live canvas overlay with screen blend.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & run locally

```bash
git clone
cd atom-cyanotype
npm install
npm run dev
```

Open [http://localhost:5173/atom-cyanotype/](http://localhost:5173/atom-cyanotype/)

### Build for production

```bash
npm run build
# output goes to /dist
```

---

## Deploy to GitHub Pages

### Option A — GitHub Actions (recommended, automatic)

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source** and select **GitHub Actions**.
3. Every push to `main` automatically builds and deploys via `.github/workflows/deploy.yml`.

Your app will be live at:

```
https://geekcoldhand.github.io/atom-cyanotype/
```

### Option B — Manual deploy via gh-pages CLI

```bash
npm run deploy
```

This runs `npm run build` then pushes `/dist` to the `gh-pages` branch.



## Controls

| Tab      | Slider         | Effect                                 |
| -------- | -------------- | -------------------------------------- |
| Color    | Blue Depth     | Intensity of navy→cyan color cast      |
| Color    | Shadow Crush   | Contrast boost in shadows              |
| Color    | Midtone Fade   | Flatness / memory-like dissolution     |
| Color    | Bloom          | Highlight overexposure glow            |
| Texture  | Film Grain     | SVG feTurbulence noise intensity       |
| Texture  | Dust           | Analog dust particles & hair scratches |
| Lighting | Bloom Spread   | Radius of highlight bloom              |
| Lighting | Backlight Haze | Edge atmospheric darkening             |
| Lighting | Light Leak     | Warm orange/crimson film leak          |

**Default preset:** `blueDepth: 60 · grain: 67 · backlightHaze: 25 · midtoneFade: 35`

---

## Tree

```
atom-cyanotype/
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
├── public/
│ └── favicon.svg
├── .github/
│ └── workflows/
│ └── deploy.yml
└── src/
├── main.jsx
├── App.jsx
├── App.module.css
├── constants/
│ └── controls.js # DEFAULTS, TABS, SLIDER_CONFIG, GRAIN_SVG
├── hooks/
│ ├── useControls.js # filter state
│ └── useDustCanvas.js # canvas lifecycle + ResizeObserver
├── components/
│ ├── Header/
│ ├── Preview/ # UploadZone, FilterStack, Preview
│ ├── Controls/ # TabBar, SliderRow, SliderPanel, Controls
│ └── ProcessingOverlay/
├── export/
│ ├── renderToBlob.js # canvas compositing pipeline
│ └── saveBlob.js # navigator.share / download fallback
└── styles/
├── global.css
└── tokens.css
```

---

