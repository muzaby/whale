import { useState } from 'react'
import { PIPELINE, CAT_COLOR } from '../../data'
import { Icon } from '../Icon'
import { Slider } from '../Slider'

/* ─── Tone Curve ─── */
function ToneCurve() {
  const [channel, setChannel] = useState<'luma' | 'r' | 'g' | 'b'>('luma')
  const [points, setPoints] = useState([
    { x: 0, y: 0 }, { x: 64, y: 58 }, { x: 128, y: 138 }, { x: 192, y: 200 }, { x: 255, y: 255 },
  ])
  const W = 220, H = 160, pad = 6
  const xs = (v: number) => pad + (v / 255) * (W - pad * 2)
  const ys = (v: number) => H - pad - (v / 255) * (H - pad * 2)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(p.x)} ${ys(p.y)}`).join(' ')

  const onDragPoint = (idx: number, e: React.MouseEvent<SVGCircleElement>) => {
    const svg = e.currentTarget.ownerSVGElement!
    const move = (ev: MouseEvent) => {
      const r = svg.getBoundingClientRect()
      const nx = Math.max(0, Math.min(255, ((ev.clientX - r.left - pad) / (W - pad * 2)) * 255))
      const ny = Math.max(0, Math.min(255, 255 - ((ev.clientY - r.top - pad) / (H - pad * 2)) * 255))
      setPoints(p => p.map((pt, i) => i === idx ? { x: idx === 0 ? 0 : idx === p.length - 1 ? 255 : nx, y: ny } : pt))
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const chanColor = channel === 'r' ? 'var(--red)' : channel === 'g' ? 'var(--green)' : channel === 'b' ? 'var(--blue)' : 'var(--fg)'

  return (
    <div className="tone-curve">
      <style>{`
        .tone-curve .chans { display: flex; gap: 2px; margin-bottom: 8px; }
        .tone-curve .chans button {
          flex: 1; border: 1px solid var(--border);
          background: var(--panel); font-size: 10px; font-family: var(--font-mono);
          padding: 3px 0; cursor: pointer; color: var(--fg-muted); border-radius: var(--r-xs);
        }
        .tone-curve .chans button.active { background: var(--fg); color: var(--panel); border-color: var(--fg); }
        .tone-curve .chans button.r.active { background: var(--red); border-color: var(--red); }
        .tone-curve .chans button.g.active { background: var(--green); border-color: var(--green); }
        .tone-curve .chans button.b.active { background: var(--blue); border-color: var(--blue); }
        .tone-curve svg { background: oklch(0.98 0.004 240); border: 1px solid var(--border); border-radius: var(--r-xs); display: block; width: 100%; height: auto; }
      `}</style>
      <div className="chans">
        {(['luma','r','g','b'] as const).map(c => (
          <button key={c} className={`${c !== 'luma' ? c : ''} ${channel === c ? 'active' : ''}`} onClick={() => setChannel(c)}>
            {c === 'luma' ? 'LUMA' : c.toUpperCase()}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <pattern id="grid" width={W / 4} height={H / 4} patternUnits="userSpaceOnUse">
            <path d={`M ${W / 4} 0 L 0 0 0 ${H / 4}`} fill="none" stroke="var(--border)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x={pad} y={pad} width={W - pad * 2} height={H - pad * 2} fill="url(#grid)" />
        <g opacity="0.3">
          {Array.from({ length: 64 }, (_, i) => {
            const x = pad + (i / 64) * (W - pad * 2)
            const v = Math.max(2, 70 * Math.exp(-Math.pow((i - 32) / 22, 2)) + (i * 0.7 % 8))
            return <rect key={i} x={x} y={H - pad - v} width={(W - pad * 2) / 64 - 0.5} height={v} fill={chanColor} />
          })}
        </g>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={pad} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d={path} fill="none" stroke={chanColor} strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle key={i} cx={xs(p.x)} cy={ys(p.y)} r="3.5"
            fill="var(--panel)" stroke="var(--fg)" strokeWidth="1.2"
            style={{ cursor: 'grab' }}
            onMouseDown={(e) => onDragPoint(i, e)}
          />
        ))}
      </svg>
    </div>
  )
}

/* ─── Color Wheel ─── */
function ColorWheel({ label, value = 0 }: { label: string; value?: number }) {
  const R = 50
  const [p, setP] = useState({ x: 0, y: 0 })

  const drag = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const move = (ev: MouseEvent) => {
      let dx = ev.clientX - cx, dy = ev.clientY - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }
      setP({ x: dx, y: dy })
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    move(e.nativeEvent)
  }

  return (
    <div className="wheel">
      <style>{`
        .wheel { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .wheel .disc {
          width: 108px; height: 108px; border-radius: 50%;
          background: conic-gradient(from 90deg,
            oklch(0.75 0.15 30), oklch(0.80 0.14 65), oklch(0.85 0.13 110),
            oklch(0.80 0.13 155), oklch(0.78 0.14 200), oklch(0.70 0.15 250),
            oklch(0.68 0.17 295), oklch(0.70 0.17 340), oklch(0.75 0.15 30));
          position: relative; cursor: crosshair;
          box-shadow: inset 0 0 0 1px var(--border), inset 0 0 25px rgba(255,255,255,.55);
        }
        .wheel .disc::after {
          content: ""; position: absolute; inset: 30%; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.9), transparent 70%);
        }
        .wheel .puck {
          position: absolute; width: 10px; height: 10px; border-radius: 50%;
          background: white; border: 1.5px solid var(--fg);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none; z-index: 2; box-shadow: 0 1px 2px rgba(0,0,0,.4);
        }
        .wheel .lbl { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .wheel .yscale { width: 100%; display: grid; grid-template-columns: 1fr 44px; gap: 6px; align-items: center; }
        .wheel .yscale input { height: 3px; background: linear-gradient(to right, oklch(0.2 0 0), oklch(0.5 0 0), oklch(0.98 0 0)); border-radius: 2px; }
      `}</style>
      <span className="lbl">{label}</span>
      <div className="disc" onMouseDown={drag}>
        <div className="puck" style={{ transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))` }} />
      </div>
      <div className="yscale">
        <input type="range" min="-100" max="100" defaultValue={value} />
        <span className="val num">{value > 0 ? '+' : ''}{value}</span>
      </div>
    </div>
  )
}

/* ─── HSL ─── */
function HSL() {
  const hues = [
    { name: 'red',     color: 'oklch(0.65 0.19 25)' },
    { name: 'orange',  color: 'oklch(0.75 0.15 55)' },
    { name: 'yellow',  color: 'oklch(0.87 0.15 95)' },
    { name: 'green',   color: 'oklch(0.72 0.15 145)' },
    { name: 'aqua',    color: 'oklch(0.78 0.11 200)' },
    { name: 'blue',    color: 'oklch(0.60 0.16 245)' },
    { name: 'purple',  color: 'oklch(0.55 0.17 300)' },
    { name: 'magenta', color: 'oklch(0.65 0.19 340)' },
  ]
  const [sel, setSel] = useState(0)
  return (
    <div>
      <style>{`
        .hsl-row { display: flex; gap: 4px; margin-bottom: 10px; }
        .hsl-row button { flex: 1; height: 22px; border: 1px solid var(--border); border-radius: 3px; cursor: pointer; }
        .hsl-row button.active { outline: 2px solid var(--fg); outline-offset: 1px; }
      `}</style>
      <div className="hsl-row">
        {hues.map((h, i) => (
          <button key={h.name} style={{ background: h.color }} className={sel === i ? 'active' : ''} onClick={() => setSel(i)} title={h.name} />
        ))}
      </div>
      <div className="col" style={{ gap: 10 }}>
        <Slider label="Hue"        value={-8}  onChange={() => {}} color={hues[sel].color} />
        <Slider label="Saturation" value={22}  onChange={() => {}} />
        <Slider label="Luminance"  value={-4}  onChange={() => {}} />
      </div>
    </div>
  )
}

/* ─── Histogram ─── */
function Histogram() {
  const W = 220, H = 86, pad = 4, bins = 96
  const gen = (peak: number, spread: number, scale: number) =>
    Array.from({ length: bins }, (_, i) => Math.max(0, scale * Math.exp(-Math.pow((i - peak) / spread, 2)) + ((i * 7 + 3) % 6) - 3))
  const r = gen(36, 18, 60), g = gen(46, 22, 75), b = gen(28, 16, 55)
  const y = r.map((_, i) => r[i] * 0.3 + g[i] * 0.59 + b[i] * 0.11)
  const toPath = (arr: number[]) => {
    const max = 80
    let d = `M ${pad} ${H - pad}`
    arr.forEach((v, i) => {
      const x = pad + (i / bins) * (W - pad * 2)
      const yy = H - pad - Math.min(H - pad * 2, (v / max) * (H - pad * 2))
      d += ` L ${x.toFixed(1)} ${yy.toFixed(1)}`
    })
    d += ` L ${W - pad} ${H - pad} Z`
    return d
  }
  return (
    <div>
      <style>{`.hist svg { display: block; width: 100%; height: auto; background: oklch(0.13 0.005 250); border-radius: var(--r-xs); }`}</style>
      <div className="hist">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <path d={toPath(y)} fill="oklch(0.9 0.01 250 / 0.15)" stroke="oklch(0.9 0.01 250 / 0.6)" strokeWidth="0.6" />
          <path d={toPath(r)} fill="oklch(0.65 0.19 28 / 0.35)"  stroke="oklch(0.75 0.19 28 / 0.9)"  strokeWidth="0.6" />
          <path d={toPath(g)} fill="oklch(0.70 0.17 150 / 0.35)" stroke="oklch(0.80 0.17 150 / 0.9)" strokeWidth="0.6" />
          <path d={toPath(b)} fill="oklch(0.60 0.17 250 / 0.35)" stroke="oklch(0.72 0.17 250 / 0.9)" strokeWidth="0.6" />
        </svg>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-faint)' }}>
        <span>0</span><span>64</span><span>128</span><span>192</span><span>255</span>
      </div>
    </div>
  )
}

/* ─── Tuning Panel ─── */
interface TuningPanelProps {
  blockId: string
  bypass: boolean
  onToggleBypass: () => void
}

export function TuningPanel({ blockId, bypass, onToggleBypass }: TuningPanelProps) {
  const block = PIPELINE.find(b => b.id === blockId) ?? PIPELINE[6]
  const type =
    block.id === 'tone'                    ? 'curve'   :
    block.id === 'hsl'                     ? 'hsl'     :
    block.id === 'wheel'                   ? 'wheel'   :
    block.id === 'wb'                      ? 'wb'      :
    block.id === 'lut'                     ? 'lut'     :
    ['nr','sharp'].includes(block.id)      ? 'detail'  : 'generic'

  return (
    <div className="tune">
      <style>{`
        .tune { display: flex; flex-direction: column; height: 100%; background: var(--panel); border-left: 1px solid var(--border); }
        .tune .hd {
          padding: 10px 14px; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .tune .hd .t { display: flex; align-items: center; gap: 8px; }
        .tune .hd .t .dot { width: 8px; height: 8px; border-radius: 2px; }
        .tune .hd .t h3 { margin: 0; font-size: 14px; font-weight: 600; white-space: nowrap; }
        .tune .hd .t .sub { font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint); }
        .tune .body { flex: 1; overflow-y: auto; }
        .tune .foot { padding: 10px 14px; border-top: 1px solid var(--border); display: flex; gap: 6px; font-size: 11px; }
        .toggle {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 8px; border: 1px solid var(--border);
          border-radius: 10px; font-size: 11px; cursor: pointer;
          background: var(--panel); color: var(--fg-muted); font-family: var(--font-mono);
        }
        .toggle.on { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-border); }
      `}</style>

      <div className="hd">
        <div className="t">
          <span className="dot" style={{ background: CAT_COLOR[block.cat] }} />
          <div>
            <h3>{block.name}</h3>
            <div className="sub">block {PIPELINE.findIndex(b => b.id === block.id) + 1} / {PIPELINE.length} · {block.cat}</div>
          </div>
        </div>
        <button className={`toggle ${!bypass ? 'on' : ''}`} onClick={onToggleBypass}>
          <Icon name={bypass ? 'eyeOff' : 'eye'} size={11} /> {bypass ? 'BYPASSED' : 'ACTIVE'}
        </button>
      </div>

      <div className="body">
        <div className="section">
          <div className="section-title"><span>Histogram</span><span className="chev mono">RGB + L</span></div>
          <Histogram />
        </div>

        {type === 'curve' && (
          <>
            <div className="section">
              <div className="section-title"><span>Tone Curve</span><button className="btn sm ghost" title="Reset"><Icon name="reset" size={11} /></button></div>
              <ToneCurve />
            </div>
            <div className="section">
              <div className="section-title"><span>Zones</span></div>
              <div className="col" style={{ gap: 10 }}>
                <Slider label="Shadows"    value={-8}  onChange={() => {}} />
                <Slider label="Midtones"   value={6}   onChange={() => {}} />
                <Slider label="Highlights" value={-14} onChange={() => {}} />
              </div>
            </div>
          </>
        )}

        {type === 'hsl' && (
          <div className="section">
            <div className="section-title"><span>HSL Adjust</span></div>
            <HSL />
          </div>
        )}

        {type === 'wheel' && (
          <>
            <div className="section">
              <div className="section-title"><span>Color Wheels</span><button className="btn sm ghost">Linked</button></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <ColorWheel label="Lift"  value={-4} />
                <ColorWheel label="Gamma" value={6}  />
                <ColorWheel label="Gain"  value={8}  />
              </div>
            </div>
            <div className="section">
              <div className="col" style={{ gap: 10 }}>
                <Slider label="Contrast"   value={12} />
                <Slider label="Saturation" value={8}  />
                <Slider label="Pivot"      value={0}  min={-50} max={50} />
              </div>
            </div>
          </>
        )}

        {type === 'wb' && (
          <>
            <div className="section">
              <div className="section-title"><span>White Balance</span><button className="btn sm ghost"><Icon name="droplet" size={11} /> Pick</button></div>
              <div className="col" style={{ gap: 10 }}>
                <Slider label="Temperature" value={5200} min={2500} max={10000} step={10} unit="K" />
                <Slider label="Tint"        value={4}    min={-100} max={100} />
              </div>
            </div>
            <div className="section">
              <div className="section-title"><span>RGB Gains</span></div>
              <div className="col" style={{ gap: 10 }}>
                <Slider label="R gain" value={182} min={50} max={400} color="var(--red)" />
                <Slider label="G gain" value={100} min={50} max={400} color="var(--green)" />
                <Slider label="B gain" value={164} min={50} max={400} color="var(--blue)" />
              </div>
            </div>
          </>
        )}

        {type === 'lut' && (
          <div className="section">
            <div className="section-title"><span>Look LUT</span><button className="btn sm ghost">Browse…</button></div>
            <div className="field">
              <select className="select mono">
                <option>Neutral-Night-v3.cube</option>
                <option>Warm-Film-21.cube</option>
                <option>Low-light-A7.cube</option>
              </select>
            </div>
            <div className="col" style={{ gap: 10, marginTop: 10 }}>
              <Slider label="Strength"   value={78} min={0} max={100} unit="%" />
              <Slider label="Gamut bias" value={-6} />
            </div>
          </div>
        )}

        {type === 'detail' && (
          <div className="section">
            <div className="section-title"><span>{block.name}</span></div>
            <div className="col" style={{ gap: 10 }}>
              {Object.entries(block.params).map(([k, v]) => (
                <Slider key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={Number(v)} />
              ))}
            </div>
          </div>
        )}

        {type === 'generic' && (
          <div className="section">
            <div className="section-title"><span>Parameters</span></div>
            <div className="col" style={{ gap: 10 }}>
              {Object.entries(block.params).map(([k, v]) => (
                <div className="field" key={k}>
                  <label>{k}</label>
                  <input className="input mono" defaultValue={String(v)} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-title"><span>Apply to</span></div>
          <div className="seg" style={{ marginBottom: 8 }}>
            <button className="active">Current</button>
            <button>Scene</button>
            <button>All</button>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
            <span>scope</span><span>night-tuning-pass-3 · 18 imgs</span>
          </div>
        </div>
      </div>

      <div className="foot">
        <button className="btn sm"><Icon name="reset" size={11} /> Reset</button>
        <button className="btn sm">Copy</button>
        <div style={{ flex: 1 }} />
        <button className="btn sm primary"><Icon name="check" size={11} /> Save preset</button>
      </div>
    </div>
  )
}
