interface SliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  unit?: string
  onChange?: (v: number) => void
  color?: string
}

export function Slider({ label, value, min = -100, max = 100, step = 1, unit = '', onChange, color }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="slider">
      <div className="label">
        <span className="name">{label}</span>
        {color && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />}
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
        }}
      />
      <span className="val num">{value > 0 ? '+' : ''}{value}{unit}</span>
    </div>
  )
}
