import { PIPELINE, CAT_COLOR } from '../../data'
import { Icon } from '../Icon'

interface StepListProps {
  selected: string
  onSelect: (id: string) => void
}

const LANES = [
  { title: 'Source',  cat: ['source'] },
  { title: 'Correct', cat: ['correct'] },
  { title: 'Color',   cat: ['color'] },
  { title: 'Detail',  cat: ['detail'] },
  { title: 'Tone',    cat: ['tone'] },
  { title: 'Output',  cat: ['output', 'sink'] },
]

export function StepList({ selected, onSelect }: StepListProps) {
  return (
    <div className="steplist-wrap">
      <style>{`
        .steplist-wrap { overflow-y: auto; height: 100%; padding: 12px 14px; background: var(--bg-subtle); }
        .step {
          display: grid; grid-template-columns: 28px 1fr auto auto auto;
          gap: 10px; align-items: center;
          padding: 8px 10px; background: var(--panel);
          border: 1px solid var(--border); border-radius: var(--r-sm);
          margin-bottom: 5px; cursor: pointer; font-size: 12px;
          position: relative; transition: border-color .1s;
        }
        .step:hover { border-color: var(--border-strong); }
        .step.sel { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        .step.bypass .sname, .step.bypass .params { text-decoration: line-through; opacity: .5; }
        .step .idx {
          font-family: var(--font-mono); font-size: 11px; color: var(--fg-faint);
          width: 28px; text-align: center;
          border-right: 1px solid var(--divider);
          padding-right: 10px;
          display: flex; gap: 6px; align-items: center;
        }
        .step .idx::before { content: ""; width: 4px; height: 22px; border-radius: 2px; background: var(--cat-color); }
        .step .scol { display: flex; flex-direction: column; gap: 2px; }
        .step .sname { font-weight: 500; }
        .step .params { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); }
        .step .cat-chip { font-family: var(--font-mono); font-size: 10px; color: var(--fg-subtle); text-transform: uppercase; letter-spacing: 0.04em; }
        .step .ms { font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint); }
        .step .eye { color: var(--fg-faint); border: 0; background: transparent; cursor: pointer; padding: 2px; }
        .step .eye:hover { color: var(--fg); }
        .step .eye.off { opacity: .4; }
        .lane-head {
          font-size: 10px; font-weight: 600; color: var(--fg-muted);
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 14px 4px 6px; display: flex; justify-content: space-between;
        }
        .lane-head:first-child { padding-top: 4px; }
      `}</style>
      {LANES.map(lane => {
        const items = PIPELINE.filter(n => lane.cat.includes(n.cat))
        if (!items.length) return null
        return (
          <div key={lane.title}>
            <div className="lane-head">
              <span>{lane.title}</span>
              <span className="mono" style={{ color: 'var(--fg-faint)' }}>{items.length} blocks</span>
            </div>
            {items.map(n => {
              const gi = PIPELINE.findIndex(x => x.id === n.id)
              const params = Object.entries(n.params).map(([k, v]) => `${k}: ${v}`).join(' · ')
              return (
                <div
                  key={n.id}
                  className={`step ${selected === n.id ? 'sel' : ''} ${n.bypass ? 'bypass' : ''}`}
                  style={{ '--cat-color': CAT_COLOR[n.cat] } as React.CSSProperties}
                  onClick={() => onSelect(n.id)}
                >
                  <span className="idx num">{String(gi + 1).padStart(2, '0')}</span>
                  <div className="scol">
                    <span className="sname">{n.name}</span>
                    <span className="params">{params}</span>
                  </div>
                  <span className="cat-chip">{n.cat}</span>
                  <span className="ms num">{(1.2 + gi * 0.31).toFixed(1)} ms</span>
                  <button className={`eye ${n.bypass ? 'off' : ''}`} title={n.bypass ? 'Enable' : 'Bypass'}>
                    <Icon name={n.bypass ? 'eyeOff' : 'eye'} size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
