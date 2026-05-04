export const PIPELINE = [
  { id: "input",  name: "RAW Input",     cat: "source",  params: { file: "night_0042.dng" }, bypass: false },
  { id: "bl",     name: "Black Level",   cat: "correct", params: { offset: 64 }, bypass: false },
  { id: "dem",    name: "Demosaic",      cat: "correct", params: { method: "AHD" }, bypass: false },
  { id: "wb",     name: "White Balance", cat: "color",   params: { r: 1.82, g: 1.0, b: 1.64, temp: 5200, tint: 4 }, bypass: false },
  { id: "ccm",    name: "Color Matrix",  cat: "color",   params: { space: "sRGB D65" }, bypass: false },
  { id: "nr",     name: "Denoise",       cat: "detail",  params: { luma: 32, chroma: 48 }, bypass: false },
  { id: "tone",   name: "Tone Curve",    cat: "tone",    params: { shadows: -8, mids: 6, highs: -14 }, bypass: false },
  { id: "hsl",    name: "HSL Adjust",    cat: "color",   params: { active: 3 }, bypass: false },
  { id: "wheel",  name: "Color Wheels",  cat: "color",   params: { lift: "#f5f2ec", gamma: "#fff6e8", gain: "#eaf1ff" }, bypass: false },
  { id: "lut",    name: "Look LUT",      cat: "tone",    params: { lut: "Neutral-Night-v3.cube" }, bypass: false },
  { id: "sharp",  name: "Sharpen",       cat: "detail",  params: { amount: 22, radius: 0.8 }, bypass: true },
  { id: "gamma",  name: "Output Gamma",  cat: "output",  params: { curve: "Rec.709" }, bypass: false },
  { id: "output", name: "Output",        cat: "sink",    params: { fmt: "JPEG Q92" }, bypass: false },
];

export const CAT_COLOR = {
  source:  "oklch(0.70 0.09 260)",
  correct: "oklch(0.70 0.11 180)",
  color:   "oklch(0.72 0.13 30)",
  detail:  "oklch(0.72 0.12 140)",
  tone:    "oklch(0.72 0.13 65)",
  output:  "oklch(0.55 0.02 260)",
  sink:    "oklch(0.45 0.02 260)",
};
