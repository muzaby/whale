import type { CSSProperties } from 'react'

interface PhImgProps {
  label?: string
  hue?: number
  style?: CSSProperties
  tag?: string | null
  className?: string
}

export function PhImg({ label = 'image', hue = 220, style = {}, tag = null, className = '' }: PhImgProps) {
  const bg1 = `oklch(0.93 0.04 ${hue})`
  const bg2 = `oklch(0.97 0.02 ${hue})`
  return (
    <div
      className={`ph-img ${className}`}
      style={{
        background: `repeating-linear-gradient(45deg, ${bg1} 0 10px, ${bg2} 10px 20px)`,
        ...style,
      }}
    >
      {tag && <span className="tag">{tag}</span>}
      <span style={{ opacity: 0.5, letterSpacing: '0.04em' }}>{label}</span>
    </div>
  )
}
