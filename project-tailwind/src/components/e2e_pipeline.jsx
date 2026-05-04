import React from "react";
import { CAT_COLOR, PIPELINE } from "../data/pipeline.js";
import { cx, Icon } from "./primitives.jsx";

/* ─── Pipeline: Node graph ─────────────────────────── */
export const NodeGraph = ({ selected, onSelect }) => {
  const cols = 5;
  const rows = Math.ceil(PIPELINE.length / cols);
  const cellW = 160;
  const cellH = 80;
  const gapX = 40;
  const gapY = 44;
  const w = cols * cellW + (cols - 1) * gapX + 40;
  const h = rows * cellH + (rows - 1) * gapY + 40;

  const pos = (i) => {
    const row = Math.floor(i / cols);
    const col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    return {
      x: 20 + col * (cellW + gapX),
      y: 20 + row * (cellH + gapY),
    };
  };

  const conns = PIPELINE.slice(0, -1).map((_, i) => {
    const a = pos(i);
    const b = pos(i + 1);
    const ax = a.x + cellW;
    const ay = a.y + cellH / 2;
    const bx = b.x;
    const by = b.y + cellH / 2;
    const sameRow = Math.abs(ay - by) < 1;
    let d;
    if (sameRow) {
      const mid = (ax + bx) / 2;
      d = `M ${ax} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${bx} ${by}`;
    } else {
      d = `M ${ax} ${ay} L ${ax + 20} ${ay} L ${ax + 20} ${by} L ${bx} ${by}`;
    }
    return { d, key: i };
  });

  return (
    <div
      className="h-full overflow-auto"
      style={{
        background:
          "radial-gradient(circle at 1px 1px, oklch(0.86 0.005 240) 1px, transparent 1px) 0 0 / 14px 14px, var(--bg-subtle)",
      }}
    >
      <div
        className="relative min-w-full"
        style={{ width: w, height: h }}
      >
        <svg
          width={w}
          height={h}
          className="pointer-events-none absolute inset-0"
        >
          {conns.map((c) => (
            <path
              key={c.key}
              d={c.d}
              fill="none"
              stroke="oklch(0.75 0.008 240)"
              strokeWidth="1.3"
            />
          ))}
        </svg>
        {PIPELINE.map((n, i) => {
          const p = pos(i);
          const params = Object.entries(n.params)
            .slice(0, 2)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ");
          const isSel = selected === n.id;
          return (
            <div
              key={n.id}
              onClick={() => onSelect(n.id)}
              className={cx(
                "absolute flex h-20 w-40 cursor-pointer flex-col justify-between rounded-md border bg-surface-panel px-2.5 py-2 text-[12px] shadow-sm transition-all",
                isSel
                  ? "border-accent shadow-focus"
                  : "border-line hover:border-line-strong",
                n.bypass && "opacity-50"
              )}
              style={{ left: p.x, top: p.y }}
            >
              <div
                className="absolute left-0 right-0 top-0 h-[3px] rounded-t-md"
                style={{ background: CAT_COLOR[n.cat] }}
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold">{n.name}</span>
                <span className="font-mono text-[10px] text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="font-mono text-[10px] text-ink-subtle">
                {params || <span className="text-ink-faint">—</span>}
              </div>
              {n.cat !== "source" && (
                <div
                  className={cx(
                    "absolute top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-surface-panel border-[1.5px]",
                    isSel ? "border-accent" : "border-line-strong"
                  )}
                  style={{ left: -5 }}
                />
              )}
              {n.cat !== "sink" && (
                <div
                  className={cx(
                    "absolute top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-surface-panel border-[1.5px]",
                    isSel ? "border-accent" : "border-line-strong"
                  )}
                  style={{ right: -5 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Pipeline: Step list ──────────────────────────── */
const LANES = [
  { title: "Source", cat: "source" },
  { title: "Correct", cat: "correct" },
  { title: "Color", cat: "color" },
  { title: "Detail", cat: "detail" },
  { title: "Tone", cat: "tone" },
  { title: "Output", cat: ["output", "sink"] },
];

export const StepList = ({ selected, onSelect }) => (
  <div className="h-full overflow-y-auto bg-surface-subtle px-3.5 py-3">
    {LANES.map((lane) => {
      const items = PIPELINE.filter((n) =>
        Array.isArray(lane.cat) ? lane.cat.includes(n.cat) : n.cat === lane.cat
      );
      if (!items.length) return null;
      return (
        <div key={lane.title}>
          <div className="flex items-center justify-between px-1 pb-1.5 pt-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted first:pt-1">
            <span>{lane.title}</span>
            <span className="font-mono text-ink-faint">{items.length} blocks</span>
          </div>
          {items.map((n) => {
            const gi = PIPELINE.findIndex((x) => x.id === n.id);
            const params = Object.entries(n.params)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ");
            const isSel = selected === n.id;
            return (
              <div
                key={n.id}
                onClick={() => onSelect(n.id)}
                className={cx(
                  "relative mb-[5px] grid cursor-pointer grid-cols-[28px_1fr_auto_auto_auto] items-center gap-2.5 rounded-sm border bg-surface-panel px-2.5 py-2 text-[12px] transition-colors",
                  isSel
                    ? "border-accent shadow-focus"
                    : "border-line hover:border-line-strong"
                )}
              >
                <span className="num flex w-7 items-center gap-1.5 border-r border-line-divider pr-2.5 text-center font-mono text-[11px] text-ink-faint">
                  <span
                    className="h-[22px] w-1 rounded-sm"
                    style={{ background: CAT_COLOR[n.cat] }}
                  />
                  {String(gi + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className={cx("font-medium", n.bypass && "line-through opacity-50")}>
                    {n.name}
                  </span>
                  <span
                    className={cx(
                      "font-mono text-[10px] text-ink-muted",
                      n.bypass && "line-through opacity-50"
                    )}
                  >
                    {params}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-ink-subtle">
                  {n.cat}
                </span>
                <span className="num font-mono text-[10px] text-ink-faint">
                  {(1.2 + gi * 0.31).toFixed(1)} ms
                </span>
                <button
                  type="button"
                  title={n.bypass ? "Enable" : "Bypass"}
                  className={cx(
                    "border-0 bg-transparent p-0.5 hover:text-ink",
                    n.bypass ? "text-ink-faint opacity-40" : "text-ink-faint"
                  )}
                >
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

/* ─── Pipeline: Timeline ──────────────────────────── */
const TL_LANES = [
  { label: "Correct", cats: ["source", "correct"] },
  { label: "Color", cats: ["color"] },
  { label: "Detail", cats: ["detail"] },
  { label: "Tone", cats: ["tone"] },
  { label: "Output", cats: ["output", "sink"] },
];

export const Timeline = ({ selected, onSelect }) => {
  const totalMs = PIPELINE.reduce((a, _, i) => a + (1.2 + i * 0.31), 0);
  return (
    <div className="h-full overflow-auto bg-surface-subtle px-4 py-4">
      <div className="relative mb-2 flex h-[22px] items-center border-b border-line font-mono text-[10px] text-ink-faint">
        {[0, 2, 4, 6, 8, 10, 12, 14].map(
          (t) =>
            t <= totalMs + 1 && (
              <div
                key={t}
                className="absolute bottom-0 h-1.5 w-px bg-line-strong"
                style={{ left: `${(t / totalMs) * 100}%` }}
              >
                <span className="absolute bottom-2 left-0 -translate-x-1/2 whitespace-nowrap">
                  {t}ms
                </span>
              </div>
            )
        )}
      </div>

      {TL_LANES.map((lane) => {
        let x = 0;
        return (
          <div
            key={lane.label}
            className="mb-[3px] grid grid-cols-[130px_1fr_60px] items-center gap-2.5 text-[11px]"
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.04em] text-ink-muted">
              {lane.label}
            </div>
            <div className="relative h-[22px] overflow-hidden rounded-[3px] border border-line bg-surface-panel">
              {PIPELINE.map((n, i) => {
                const ms = 1.2 + i * 0.31;
                const left = (x / totalMs) * 100;
                const width = (ms / totalMs) * 100;
                x += ms;
                if (!lane.cats.includes(n.cat)) return null;
                const isSel = selected === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => onSelect(n.id)}
                    className={cx(
                      "absolute bottom-0 top-0 flex cursor-pointer items-center overflow-hidden whitespace-nowrap border-r border-surface-panel px-2 text-[10px] font-medium text-ink transition-transform hover:scale-y-110",
                      isSel && "z-[2] outline outline-2 -outline-offset-2 outline-ink",
                      n.bypass && "opacity-30"
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: `color-mix(in oklch, ${CAT_COLOR[n.cat]} 28%, var(--panel))`,
                      borderLeft: `3px solid ${CAT_COLOR[n.cat]}`,
                    }}
                  >
                    {n.name}
                  </div>
                );
              })}
            </div>
            <div className="num text-right font-mono text-[10px] text-ink-faint">
              —
            </div>
          </div>
        );
      })}

      <div className="mt-3 text-right">
        <span className="font-mono text-[11px] text-ink-muted">
          total ~{totalMs.toFixed(1)} ms / frame · 1920×1080
        </span>
      </div>
    </div>
  );
};
