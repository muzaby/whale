import { PIPELINE, CAT_COLOR } from '../../data'

interface TimelineProps {
  selected: string
  onSelect: (id: string) => void
}

const LANES = [
  { label: 'Correct', cats: ['source', 'correct'] },
  { label: 'Color',   cats: ['color'] },
  { label: 'Detail',  cats: ['detail'] },
  { label: 'Tone',    cats: ['tone'] },
  { label: 'Output',  cats: ['output', 'sink'] },
]

export function Timeline({ selected, onSelect }: TimelineProps) {
  const totalMs = PIPELINE.reduce((a, _, i) => a + (1.2 + i * 0.31), 0)

  return (
    <div className="tl-wrap">
      <style>{`
        .tl-wrap { overflow: auto; height: 100%; padding: 16px 18px; background: var(--bg-subtle); }
        .tl-scale {
          height: 22px; display: flex; align-items: center;
          font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint);
          margin-bottom: 8px; position: relative; border-bottom: 1px solid var(--border);
        }
        .tl-scale .tick { position: absolute; width: 1px; height: 6px; background: var(--border-strong); bottom: 0; }
        .tl-scale .tick span { position: absolute; bottom: 8px; left: 0; transform: translateX(-50%); white-space: nowrap; }
        .tl-row {
          display: grid; grid-template-columns: 130px 1fr 60px;
          align-items: center; gap: 10px; margin-bottom: 3px; font-size: 11px;
        }
        .tl-row .rlabel { color: var(--fg-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
        .tl-track { position: relative; height: 22px; background: var(--panel); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
        .tl-block {
          position: absolute; top: 0; bottom: 0; padding: 0 8px;
          display: flex; align-items: center; font-size: 10px; font-weight: 500; color: var(--fg);
          cursor: pointer; white-space: nowrap; overflow: hidden;
          border-right: 1px solid var(--panel); transition: transform .08s;
        }
        .tl-block:hover { transform: scaleY(1.12); }
        .tl-block.sel { outline: 2px solid var(--fg); outline-offset: -2px; z-index: 2; }
        .tl-block.bypass { opacity: .35; }
        .tl-total { text-align: right; font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint); }
      `}</style>

      <div className="tl-scale">
        {[0, 2, 4, 6, 8, 10, 12, 14].filter(t => t <= totalMs + 1).map(t => (
          <div key={t} className="tick" style={{ left: `${(t / totalMs) * 100}%` }}>
            <span>{t}ms</span>
          </div>
        ))}
      </div>

      {LANES.map(lane => {
        let x = 0
        return (
          <div className="tl-row" key={lane.label}>
            <div className="rlabel">{lane.label}</div>
            <div className="tl-track">
              {PIPELINE.map((n, i) => {
                const ms = 1.2 + i * 0.31
                const left = (x / totalMs) * 100
                const width = (ms / totalMs) * 100
                x += ms
                if (!lane.cats.includes(n.cat)) return null
                return (
                  <div
                    key={n.id}
                    className={`tl-block ${selected === n.id ? 'sel' : ''} ${n.bypass ? 'bypass' : ''}`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: `color-mix(in oklch, ${CAT_COLOR[n.cat]} 28%, var(--panel))`,
                      borderLeft: `3px solid ${CAT_COLOR[n.cat]}`,
                    }}
                    onClick={() => onSelect(n.id)}
                  >
                    {n.name}
                  </div>
                )
              })}
            </div>
            <div className="tl-total num">—</div>
          </div>
        )
      })}

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
          total ~{totalMs.toFixed(1)} ms / frame · 1920×1080
        </span>
      </div>
    </div>
  )
}
