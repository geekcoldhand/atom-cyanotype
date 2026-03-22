/** Encoded SVG grain texture — finer baseFrequency for clean Y2K texture */
export const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

/** Default slider values — Y2K Cyber Minimalism preset */
export const DEFAULTS = {
  blueDepth:       40,  // deep navy/steel blue — shadows and base
  tealDepth:       30,  // teal midtone push
  cyanDepth:       25,  // electric cyan highlight lift
  exposure:        30,  // overall brightness lift
  highlightLift:   20,  // clean bright highlight control
  shadowLift:      15,  // lifts blacks — avoids crushed shadows
  midtoneContrast: 20,  // tonal separation, not flatness
  contrastSoft:   -10,  // negative softens overall contrast
  grain:           25,  // must exceed overlay blend threshold (~0.08 opacity)
  lightWash:       40,  // structured architectural light gradient
  reflection:      25,  // glass overlay shimmer
}

/** Tab labels in display order */
export const TABS = ['Color', 'Tone', 'Light']

/** Sliders per tab — key must match a key in DEFAULTS */
export const SLIDER_CONFIG = {
  Color: [
    { key: 'blueDepth',  label: 'Blue Depth'  },
    { key: 'tealDepth',  label: 'Teal Depth'  },
    { key: 'cyanDepth',  label: 'Cyan Depth'  },
    { key: 'reflection', label: 'Reflection'  },
    { key: 'grain',      label: 'Grain'       },
  ],
  Tone: [
    { key: 'exposure',        label: 'Exposure'    },
    { key: 'highlightLift',   label: 'Highlight'   },
    { key: 'shadowLift',      label: 'Shadow Lift' },
    { key: 'midtoneContrast', label: 'Midtone'     },
    { key: 'contrastSoft',    label: 'Soften'      },
  ],
  Light: [
    { key: 'lightWash', label: 'Light Wash' },
  ],
}
