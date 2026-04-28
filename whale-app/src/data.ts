import type { PipelineBlock, LibraryItem, Collection, Session, Tag, BlockCategory } from './types'

export const PIPELINE: PipelineBlock[] = [
  { id: "input",  name: "RAW Input",     cat: "source",  params: { file: "night_0042.dng" }, bypass: false },
  { id: "bl",     name: "Black Level",   cat: "correct", params: { offset: 64 }, bypass: false },
  { id: "dem",    name: "Demosaic",      cat: "correct", params: { method: "AHD" }, bypass: false },
  { id: "wb",     name: "White Balance", cat: "color",   params: { r: 1.82, g: 1.00, b: 1.64, temp: 5200, tint: 4 }, bypass: false },
  { id: "ccm",    name: "Color Matrix",  cat: "color",   params: { space: "sRGB D65" }, bypass: false },
  { id: "nr",     name: "Denoise",       cat: "detail",  params: { luma: 32, chroma: 48 }, bypass: false },
  { id: "tone",   name: "Tone Curve",    cat: "tone",    params: { shadows: -8, mids: 6, highs: -14 }, bypass: false },
  { id: "hsl",    name: "HSL Adjust",    cat: "color",   params: { active: 3 }, bypass: false },
  { id: "wheel",  name: "Color Wheels",  cat: "color",   params: { lift: "#f5f2ec", gamma: "#fff6e8", gain: "#eaf1ff" }, bypass: false },
  { id: "lut",    name: "Look LUT",      cat: "tone",    params: { lut: "Neutral-Night-v3.cube" }, bypass: false },
  { id: "sharp",  name: "Sharpen",       cat: "detail",  params: { amount: 22, radius: 0.8 }, bypass: true },
  { id: "gamma",  name: "Output Gamma",  cat: "output",  params: { curve: "Rec.709" }, bypass: false },
  { id: "output", name: "Output",        cat: "sink",    params: { fmt: "JPEG Q92" }, bypass: false },
]

export const CAT_COLOR: Record<BlockCategory, string> = {
  source:  "oklch(0.70 0.09 260)",
  correct: "oklch(0.70 0.11 180)",
  color:   "oklch(0.72 0.13 30)",
  detail:  "oklch(0.72 0.12 140)",
  tone:    "oklch(0.72 0.13 65)",
  output:  "oklch(0.55 0.02 260)",
  sink:    "oklch(0.45 0.02 260)",
}

export const LIB_ITEMS: LibraryItem[] = [
  { id: 1,  name: "night_0042_ref.dng",      src: "ref", tags: ["night","low-light","street"],  hue: 210, fav: true,  w: 6000, h: 4000, iso: 6400, date: "Apr 18", session: "night-A" },
  { id: 2,  name: "night_0042_sim-r7.jpg",   src: "sim", tags: ["night","rev-7"],               hue: 45,  fav: true,  w: 1920, h: 1080, iso: null, date: "Apr 18", session: "night-A" },
  { id: 3,  name: "hdr_portrait_ref.cr3",    src: "ref", tags: ["hdr","skin","portrait"],       hue: 60,  fav: false, w: 6720, h: 4480, iso: 400,  date: "Apr 17", session: "hdr-outdoor" },
  { id: 4,  name: "hdr_portrait_sim-r4.jpg", src: "sim", tags: ["hdr","skin","rev-4"],          hue: 300, fav: false, w: 1920, h: 1080, iso: null, date: "Apr 17", session: "hdr-outdoor" },
  { id: 5,  name: "colorchecker_SG_D65.dng", src: "ref", tags: ["chart","calibration","D65"],   hue: 150, fav: true,  w: 5472, h: 3648, iso: 100,  date: "Apr 16", session: "calibration" },
  { id: 6,  name: "colorchecker_SG_sim.jpg", src: "sim", tags: ["chart","calibration"],         hue: 200, fav: false, w: 5472, h: 3648, iso: null, date: "Apr 16", session: "calibration" },
  { id: 7,  name: "mixed_light_cafe.dng",    src: "ref", tags: ["mixed-light","indoor"],        hue: 25,  fav: false, w: 6000, h: 4000, iso: 1600, date: "Apr 15", session: "auto-wb" },
  { id: 8,  name: "mixed_light_cafe_sim.jpg",src: "sim", tags: ["mixed-light","rev-2"],         hue: 80,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 15", session: "auto-wb" },
  { id: 9,  name: "skin_tone_patch_01.tif",  src: "ref", tags: ["skin","reference"],            hue: 30,  fav: true,  w: 3000, h: 2000, iso: 200,  date: "Apr 14", session: "skin-study" },
  { id: 10, name: "skin_tone_sim-v2.jpg",    src: "sim", tags: ["skin","rev-2"],                hue: 40,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 14", session: "skin-study" },
  { id: 11, name: "backlit_tree_ref.raf",    src: "ref", tags: ["hdr","backlit","foliage"],     hue: 130, fav: false, w: 7008, h: 4672, iso: 320,  date: "Apr 12", session: "hdr-outdoor" },
  { id: 12, name: "backlit_tree_sim-r1.jpg", src: "sim", tags: ["hdr","backlit","rev-1"],       hue: 95,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 12", session: "hdr-outdoor" },
  { id: 13, name: "neon_signage_street.dng", src: "ref", tags: ["night","neon","street"],       hue: 325, fav: false, w: 6000, h: 4000, iso: 3200, date: "Apr 11", session: "night-A" },
  { id: 14, name: "neon_signage_sim-r5.jpg", src: "sim", tags: ["night","neon","rev-5"],        hue: 290, fav: true,  w: 1920, h: 1080, iso: null, date: "Apr 11", session: "night-A" },
  { id: 15, name: "gray_card_18pct.dng",     src: "ref", tags: ["chart","reference"],           hue: 240, fav: false, w: 3000, h: 2000, iso: 100,  date: "Apr 10", session: "calibration" },
  { id: 16, name: "sunset_lake_ref.cr3",     src: "ref", tags: ["outdoor","sunset"],            hue: 20,  fav: false, w: 6720, h: 4480, iso: 200,  date: "Apr 09", session: "golden-hour" },
  { id: 17, name: "sunset_lake_sim-r3.jpg",  src: "sim", tags: ["outdoor","sunset","rev-3"],    hue: 50,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 09", session: "golden-hour" },
  { id: 18, name: "office_daylight_ref.dng", src: "ref", tags: ["indoor","daylight"],           hue: 190, fav: false, w: 6000, h: 4000, iso: 400,  date: "Apr 08", session: "auto-wb" },
]

export const COLLECTIONS: Collection[] = [
  { name: "All images",   count: 1284, icon: "img",     id: "all" },
  { name: "References",   count: 420,  icon: "camera",  id: "ref" },
  { name: "Simulations",  count: 864,  icon: "sparkle", id: "sim" },
  { name: "Favorites",    count: 42,   icon: "star",    id: "fav" },
]

export const SESSIONS: Session[] = [
  { name: "night-A · Pass 3",  count: 18, active: true },
  { name: "hdr-outdoor",       count: 24 },
  { name: "calibration · D65", count: 36 },
  { name: "skin-study",        count: 12 },
  { name: "auto-wb",           count: 48 },
  { name: "golden-hour",       count: 22 },
]

export const ALL_TAGS: Tag[] = [
  { name: "night",       count: 42 }, { name: "hdr",         count: 28 }, { name: "skin",        count: 19 },
  { name: "low-light",   count: 22 }, { name: "chart",       count: 16 }, { name: "calibration", count: 16 },
  { name: "portrait",    count: 14 }, { name: "street",      count: 22 }, { name: "neon",        count: 8  },
  { name: "mixed-light", count: 12 }, { name: "indoor",      count: 26 }, { name: "outdoor",     count: 38 },
  { name: "backlit",     count: 7  }, { name: "foliage",     count: 5  }, { name: "sunset",      count: 11 },
  { name: "rev-7",       count: 4  }, { name: "rev-5",       count: 6  },
]
