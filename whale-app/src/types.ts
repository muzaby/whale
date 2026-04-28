export type PageId = 'home' | 'e2e' | 'library'

export type AccentColor = 'ocean' | 'teal' | 'amber' | 'graphite'
export type DensityMode = 'compact' | 'comfortable' | 'spacious'

export interface Tweaks {
  accent: AccentColor
  density: DensityMode
  monoMeta: boolean
}

export type BlockCategory = 'source' | 'correct' | 'color' | 'detail' | 'tone' | 'output' | 'sink'

export interface PipelineBlock {
  id: string
  name: string
  cat: BlockCategory
  params: Record<string, string | number>
  bypass: boolean
}

export type PipelineView = 'node' | 'list' | 'timeline'
export type CompareMode = 'split' | 'slider' | 'overlay'

export type ImageSource = 'ref' | 'sim'

export interface LibraryItem {
  id: number
  name: string
  src: ImageSource
  tags: string[]
  hue: number
  fav: boolean
  w: number
  h: number
  iso: number | null
  date: string
  session: string
}

export interface Collection {
  name: string
  count: number
  icon: string
  id: string
}

export interface Session {
  name: string
  count: number
  active?: boolean
}

export interface Tag {
  name: string
  count: number
}
