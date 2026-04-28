import { PIPELINE, CAT_COLOR } from '../../data'

interface NodeGraphProps {
  selected: string
  onSelect: (id: string) => void
}

export function NodeGraph({ selected, onSelect }: NodeGraphProps) {
  const cols = 5
  const rows = Math.ceil(PIPELINE.length / cols)
  const cellW = 160, cellH = 80, gapX = 40, gapY = 44
  const w = cols * cellW + (cols - 1) * gapX + 40
  const h = rows * cellH + (rows - 1) * gapY + 40

  const pos = (i: number) => {
    const row = Math.floor(i / cols)
    const col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols)
    return {
      x: 20 + col * (cellW + gapX),
      y: 20 + row * (cellH + gapY),
    }
  }

  const conns = PIPELINE.slice(0, -1).map((_, i) => {
    const a = pos(i), b = pos(i + 1)
    const ax = a.x + cellW, ay = a.y + cellH / 2
    const bx = b.x, by = b.y + cellH / 2
    const sameRow = Math.abs(ay - by) < 1
    let d: string
    if (sameRow) {
      const mid = (ax + bx) / 2
      d = `M ${ax} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${bx} ${by}`
    } else {
      d = `M ${ax} ${ay} L ${ax + 20} ${ay} L ${ax + 20} ${by} L ${bx} ${by}`
    }
    return { d, key: i }
  })

  return (
    <div className="nodegraph-wrap">
      <style>{`
        .nodegraph-wrap {
          overflow: auto; height: 100%;
          background:
            radial-gradient(circle at 1px 1px, oklch(0.86 0.005 240) 1px, transparent 1px) 0 0 / 14px 14px,
            var(--bg-subtle);
        }
        .node {
          position: absolute; width: 160px; height: 80px;
          background: var(--panel); border: 1px solid var(--border);
          border-radius: var(--r-md); padding: 8px 10px;
          box-shadow: var(--shadow-sm); cursor: pointer;
          transition: border-color .1s, box-shadow .1s;
          font-size: 12px; display: flex; flex-direction: column; justify-content: space-between;
        }
        .node:hover { border-color: var(--border-strong); }
        .node.sel { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow-sm); }
        .node.bypass { opacity: .5; }
        .node .cat-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: var(--r-md) var(--r-md) 0 0; }
        .node .head { display: flex; justify-content: space-between; align-items: center; }
        .node .name { font-weight: 600; }
        .node .body { font-family: var(--font-mono); font-size: 10px; color: var(--fg-subtle); }
        .node .port {
          position: absolute; top: 50%; width: 9px; height: 9px; border-radius: 50%;
          background: var(--panel); border: 1.5px solid var(--border-strong);
          transform: translateY(-50%);
        }
        .node .port.in { left: -5px; }
        .node .port.out { right: -5px; }
        .node.sel .port { border-color: var(--accent); }
      `}</style>
      <div style={{ position: 'relative', width: w, height: h, minWidth: '100%' }}>
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {conns.map(c => (
            <path key={c.key} d={c.d} fill="none" stroke="oklch(0.75 0.008 240)" strokeWidth="1.3" />
          ))}
        </svg>
        {PIPELINE.map((n, i) => {
          const p = pos(i)
          const params = Object.entries(n.params).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')
          return (
            <div
              key={n.id}
              className={`node ${selected === n.id ? 'sel' : ''} ${n.bypass ? 'bypass' : ''}`}
              style={{ left: p.x, top: p.y }}
              onClick={() => onSelect(n.id)}
            >
              <div className="cat-bar" style={{ background: CAT_COLOR[n.cat] }} />
              <div className="head">
                <span className="name">{n.name}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--fg-faint)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="body">
                {params || <span style={{ color: 'var(--fg-faint)' }}>—</span>}
              </div>
              {n.cat !== 'source' && <div className="port in" />}
              {n.cat !== 'sink' && <div className="port out" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
