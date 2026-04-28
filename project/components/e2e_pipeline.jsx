/* E2E — pipeline editor (node / list / timeline) + compare viewer + tuning panel */

const PIPELINE = [
  { id: "input",   name: "RAW Input",        cat: "source", params: { file: "night_0042.dng" }, bypass: false },
  { id: "bl",      name: "Black Level",      cat: "correct", params: { offset: 64 }, bypass: false },
  { id: "dem",     name: "Demosaic",         cat: "correct", params: { method: "AHD" }, bypass: false },
  { id: "wb",      name: "White Balance",    cat: "color", params: { r: 1.82, g: 1.00, b: 1.64, temp: 5200, tint: 4 }, bypass: false },
  { id: "ccm",     name: "Color Matrix",     cat: "color", params: { space: "sRGB D65" }, bypass: false },
  { id: "nr",      name: "Denoise",          cat: "detail", params: { luma: 32, chroma: 48 }, bypass: false },
  { id: "tone",    name: "Tone Curve",       cat: "tone", params: { shadows: -8, mids: 6, highs: -14 }, bypass: false },
  { id: "hsl",     name: "HSL Adjust",       cat: "color", params: { active: 3 }, bypass: false },
  { id: "wheel",   name: "Color Wheels",     cat: "color", params: { lift: "#f5f2ec", gamma: "#fff6e8", gain: "#eaf1ff" }, bypass: false },
  { id: "lut",     name: "Look LUT",         cat: "tone", params: { lut: "Neutral-Night-v3.cube" }, bypass: false },
  { id: "sharp",   name: "Sharpen",          cat: "detail", params: { amount: 22, radius: 0.8 }, bypass: true },
  { id: "gamma",   name: "Output Gamma",     cat: "output", params: { curve: "Rec.709" }, bypass: false },
  { id: "output",  name: "Output",           cat: "sink", params: { fmt: "JPEG Q92" }, bypass: false },
];

const CAT_COLOR = {
  source:  "oklch(0.70 0.09 260)",
  correct: "oklch(0.70 0.11 180)",
  color:   "oklch(0.72 0.13 30)",
  detail:  "oklch(0.72 0.12 140)",
  tone:    "oklch(0.72 0.13 65)",
  output:  "oklch(0.55 0.02 260)",
  sink:    "oklch(0.45 0.02 260)",
};

/* ─── Pipeline: Node graph view ─────────────────────────────── */
const NodeGraph = ({ selected, onSelect }) => {
  // layout in a column-based graph: 3 rows, auto-wrap
  const cols = 5;
  const rows = Math.ceil(PIPELINE.length / cols);
  const cellW = 160, cellH = 80, gapX = 40, gapY = 44;
  const w = cols * cellW + (cols - 1) * gapX + 40;
  const h = rows * cellH + (rows - 1) * gapY + 40;

  const pos = (i) => {
    const row = Math.floor(i / cols);
    const col = (row % 2 === 0) ? i % cols : (cols - 1 - (i % cols));
    return {
      x: 20 + col * (cellW + gapX),
      y: 20 + row * (cellH + gapY),
    };
  };

  // connectors between i and i+1
  const conns = PIPELINE.slice(0, -1).map((_, i) => {
    const a = pos(i), b = pos(i + 1);
    const ax = a.x + cellW, ay = a.y + cellH / 2;
    const bx = b.x,         by = b.y + cellH / 2;
    const sameRow = Math.abs(ay - by) < 1;
    let d;
    if (sameRow) {
      const mid = (ax + bx) / 2;
      d = `M ${ax} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${bx} ${by}`;
    } else {
      // same-row-end turn: go right, down, left
      const turnX = ax + 20;
      d = `M ${ax} ${ay} L ${turnX} ${ay} Q ${turnX + 12} ${ay}, ${turnX + 12} ${ay + 12} L ${turnX + 12} ${by - 12} Q ${turnX + 12} ${by}, ${turnX} ${by} L ${bx} ${by}`;
      // simpler: route right then down then left via polyline
      const dx = b.x - 20;
      d = `M ${ax} ${ay} L ${ax + 20} ${ay} L ${ax + 20} ${by} L ${bx} ${by}`;
    }
    return { d, key: i };
  });

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
          position: absolute;
          width: 160px; height: 80px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 8px 10px;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: border-color .1s, box-shadow .1s;
          font-size: 12px;
          display: flex; flex-direction: column; justify-content: space-between;
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
      <div style={{ position: "relative", width: w, height: h, minWidth: "100%" }}>
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {conns.map(c => (
            <path key={c.key} d={c.d} fill="none"
              stroke="oklch(0.75 0.008 240)" strokeWidth="1.3" />
          ))}
        </svg>
        {PIPELINE.map((n, i) => {
          const p = pos(i);
          const params = Object.entries(n.params).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" · ");
          return (
            <div
              key={n.id}
              className={`node ${selected === n.id ? "sel" : ""} ${n.bypass ? "bypass" : ""}`}
              style={{ left: p.x, top: p.y }}
              onClick={() => onSelect(n.id)}
            >
              <div className="cat-bar" style={{ background: CAT_COLOR[n.cat] }} />
              <div className="head">
                <span className="name">{n.name}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-faint)" }}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="body">{params || <span style={{ color: "var(--fg-faint)" }}>—</span>}</div>
              {n.cat !== "source" && <div className="port in" />}
              {n.cat !== "sink" && <div className="port out" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Pipeline: List / Steps view ────────────────────────────── */
const StepList = ({ selected, onSelect }) => (
  <div className="steplist-wrap">
    <style>{`
      .steplist-wrap { overflow-y: auto; height: 100%; padding: 12px 14px; background: var(--bg-subtle); }
      .step {
        display: grid;
        grid-template-columns: 28px 1fr auto auto auto;
        gap: 10px;
        align-items: center;
        padding: 8px 10px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: var(--r-sm);
        margin-bottom: 5px;
        cursor: pointer;
        font-size: 12px;
        position: relative;
        transition: border-color .1s;
      }
      .step:hover { border-color: var(--border-strong); }
      .step.sel { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
      .step.bypass .name, .step.bypass .params { text-decoration: line-through; opacity: .5; }
      .step .idx {
        font-family: var(--font-mono); font-size: 11px; color: var(--fg-faint);
        width: 28px; text-align: center;
        border-right: 1px solid var(--divider);
        padding-right: 10px;
        display: flex; gap: 6px; align-items: center;
      }
      .step .idx::before { content: ""; width: 4px; height: 22px; border-radius: 2px; background: var(--cat); }
      .step .col { display: flex; flex-direction: column; gap: 2px; }
      .step .name { font-weight: 500; }
      .step .params { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); }
      .step .cat-chip {
        font-family: var(--font-mono); font-size: 10px; color: var(--fg-subtle);
        text-transform: uppercase; letter-spacing: 0.04em;
      }
      .step .ms { font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint); }
      .step .eye { color: var(--fg-faint); border: 0; background: transparent; cursor: pointer; padding: 2px; }
      .step .eye:hover { color: var(--fg); }
      .step .eye.off { color: var(--fg-faint); opacity: .4; }

      .lane-head {
        font-size: 10px; font-weight: 600; color: var(--fg-muted);
        text-transform: uppercase; letter-spacing: 0.08em;
        padding: 14px 4px 6px; display: flex; justify-content: space-between;
      }
      .lane-head:first-child { padding-top: 4px; }
    `}</style>
    {[
      { title: "Source", cat: "source" },
      { title: "Correct", cat: "correct" },
      { title: "Color", cat: "color" },
      { title: "Detail", cat: "detail" },
      { title: "Tone", cat: "tone" },
      { title: "Output", cat: ["output","sink"] },
    ].map(lane => {
      const items = PIPELINE.filter(n => Array.isArray(lane.cat) ? lane.cat.includes(n.cat) : n.cat === lane.cat);
      if (!items.length) return null;
      return (
        <div key={lane.title}>
          <div className="lane-head"><span>{lane.title}</span><span className="mono" style={{ color: "var(--fg-faint)" }}>{items.length} blocks</span></div>
          {items.map((n) => {
            const gi = PIPELINE.findIndex(x => x.id === n.id);
            const params = Object.entries(n.params).map(([k, v]) => `${k}: ${v}`).join(" · ");
            return (
              <div
                key={n.id}
                className={`step ${selected === n.id ? "sel" : ""} ${n.bypass ? "bypass" : ""}`}
                style={{ "--cat": CAT_COLOR[n.cat] }}
                onClick={() => onSelect(n.id)}
              >
                <span className="idx num">{String(gi + 1).padStart(2, "0")}</span>
                <div className="col">
                  <span className="name">{n.name}</span>
                  <span className="params">{params}</span>
                </div>
                <span className="cat-chip">{n.cat}</span>
                <span className="ms num">{(1.2 + gi * 0.31).toFixed(1)} ms</span>
                <button className={`eye ${n.bypass ? "off" : ""}`} title={n.bypass ? "Enable" : "Bypass"}>
                  <Icon name={n.bypass ? "eyeOff" : "eye"} size={12} />
                </button>
              </div>
            );
          })}
        </div>
      );
    })}
  </div>
);

/* ─── Pipeline: Timeline view ─────────────────────────────────── */
const Timeline = ({ selected, onSelect }) => {
  const totalMs = PIPELINE.reduce((a, n, i) => a + (1.2 + i * 0.31), 0);
  let cursor = 0;
  return (
    <div className="tl-wrap">
      <style>{`
        .tl-wrap { overflow: auto; height: 100%; padding: 16px 18px; background: var(--bg-subtle); }
        .tl-scale {
          height: 22px;
          display: flex; align-items: center;
          font-family: var(--font-mono); font-size: 10px;
          color: var(--fg-faint);
          margin-bottom: 8px;
          position: relative;
          border-bottom: 1px solid var(--border);
        }
        .tl-scale .tick {
          position: absolute;
          width: 1px; height: 6px;
          background: var(--border-strong);
          bottom: 0;
        }
        .tl-scale .tick span {
          position: absolute; bottom: 8px; left: 0; transform: translateX(-50%);
          white-space: nowrap;
        }
        .tl-row {
          display: grid; grid-template-columns: 130px 1fr 60px; align-items: center;
          gap: 10px; margin-bottom: 3px;
          font-size: 11px;
        }
        .tl-row .rlabel { color: var(--fg-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
        .tl-track { position: relative; height: 22px; background: var(--panel); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
        .tl-block {
          position: absolute; top: 0; bottom: 0;
          padding: 0 8px;
          display: flex; align-items: center;
          font-size: 10px; font-weight: 500;
          color: var(--fg);
          cursor: pointer;
          white-space: nowrap; overflow: hidden;
          border-right: 1px solid var(--panel);
          transition: transform .08s;
        }
        .tl-block:hover { transform: scaleY(1.12); }
        .tl-block.sel { outline: 2px solid var(--fg); outline-offset: -2px; z-index: 2; }
        .tl-block.bypass { opacity: .35; }
        .tl-total { text-align: right; font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint); }
      `}</style>
      <div className="tl-scale">
        {[0, 2, 4, 6, 8, 10, 12, 14].map(t => t <= totalMs + 1 && (
          <div key={t} className="tick" style={{ left: `${(t / totalMs) * 100}%` }}>
            <span>{t}ms</span>
          </div>
        ))}
      </div>
      {[
        { label: "Correct", cats: ["source", "correct"] },
        { label: "Color",   cats: ["color"] },
        { label: "Detail",  cats: ["detail"] },
        { label: "Tone",    cats: ["tone"] },
        { label: "Output",  cats: ["output", "sink"] },
      ].map(lane => {
        let x = 0;
        return (
          <div className="tl-row" key={lane.label}>
            <div className="rlabel">{lane.label}</div>
            <div className="tl-track">
              {PIPELINE.map((n, i) => {
                const ms = 1.2 + i * 0.31;
                const left = (x / totalMs) * 100;
                const width = (ms / totalMs) * 100;
                x += ms;
                if (!lane.cats.includes(n.cat)) return null;
                return (
                  <div
                    key={n.id}
                    className={`tl-block ${selected === n.id ? "sel" : ""} ${n.bypass ? "bypass" : ""}`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: `color-mix(in oklch, ${CAT_COLOR[n.cat]} 28%, var(--panel))`,
                      borderLeft: `3px solid ${CAT_COLOR[n.cat]}`,
                    }}
                    onClick={() => onSelect(n.id)}
                  >{n.name}</div>
                );
              })}
            </div>
            <div className="tl-total num">—</div>
          </div>
        );
      })}
      <div style={{ marginTop: 12, textAlign: "right" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>total ~{totalMs.toFixed(1)} ms / frame · 1920×1080</span>
      </div>
    </div>
  );
};

Object.assign(window, { PIPELINE, CAT_COLOR, NodeGraph, StepList, Timeline });
