import React from "react";
import { CAT_COLOR, PIPELINE } from "../data/pipeline.js";
import {
  Btn,
  cx,
  Icon,
  Input,
  SectionTitle,
  Select,
  Slider,
} from "./primitives.jsx";

/* ─── Tone Curve ───────────────────────────────────── */
const ToneCurve = () => {
  const [channel, setChannel] = React.useState("luma");
  const [points, setPoints] = React.useState([
    { x: 0, y: 0 },
    { x: 64, y: 58 },
    { x: 128, y: 138 },
    { x: 192, y: 200 },
    { x: 255, y: 255 },
  ]);
  const W = 220;
  const H = 160;
  const pad = 6;
  const xs = (v) => pad + (v / 255) * (W - pad * 2);
  const ys = (v) => H - pad - (v / 255) * (H - pad * 2);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xs(p.x)} ${ys(p.y)}`).join(" ");

  const onDragPoint = (i, e) => {
    const svg = e.currentTarget.ownerSVGElement;
    const move = (ev) => {
      const r = svg.getBoundingClientRect();
      const nx = Math.max(
        0,
        Math.min(255, ((ev.clientX - r.left - pad) / (W - pad * 2)) * 255)
      );
      const ny = Math.max(
        0,
        Math.min(255, 255 - ((ev.clientY - r.top - pad) / (H - pad * 2)) * 255)
      );
      setPoints((p) =>
        p.map((pt, idx) =>
          idx === i
            ? { x: i === 0 ? 0 : i === p.length - 1 ? 255 : nx, y: ny }
            : pt
        )
      );
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const channelColor = {
    r: "var(--red)",
    g: "var(--green)",
    b: "var(--blue)",
    luma: "var(--fg)",
  }[channel];
  const histColor = {
    r: "var(--red)",
    g: "var(--green)",
    b: "var(--blue)",
    luma: "var(--luma)",
  }[channel];

  return (
    <div>
      <div className="mb-2 flex gap-0.5">
        {[
          { v: "luma", label: "LUMA", activeBg: "var(--fg)", activeFg: "var(--panel)", activeBorder: "var(--fg)" },
          { v: "r", label: "R", activeBg: "var(--red)", activeFg: "white", activeBorder: "var(--red)" },
          { v: "g", label: "G", activeBg: "var(--green)", activeFg: "white", activeBorder: "var(--green)" },
          { v: "b", label: "B", activeBg: "var(--blue)", activeFg: "white", activeBorder: "var(--blue)" },
        ].map((c) => {
          const active = channel === c.v;
          return (
            <button
              key={c.v}
              onClick={() => setChannel(c.v)}
              className={cx(
                "flex-1 cursor-pointer rounded-xs border px-0 py-[3px] font-mono text-[10px]",
                !active && "border-line bg-surface-panel text-ink-muted"
              )}
              style={
                active
                  ? {
                      background: c.activeBg,
                      color: c.activeFg,
                      borderColor: c.activeBorder,
                    }
                  : undefined
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full rounded-xs border border-line"
        style={{ background: "oklch(0.98 0.004 240)" }}
      >
        <defs>
          <pattern id="grid" width={W / 4} height={H / 4} patternUnits="userSpaceOnUse">
            <path
              d={`M ${W / 4} 0 L 0 0 0 ${H / 4}`}
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect x={pad} y={pad} width={W - pad * 2} height={H - pad * 2} fill="url(#grid)" />
        <g opacity="0.3">
          {Array.from({ length: 64 }, (_, i) => {
            const x = pad + (i / 64) * (W - pad * 2);
            const v = Math.max(
              2,
              70 * Math.exp(-Math.pow((i - 32) / 22, 2)) + Math.random() * 8
            );
            return (
              <rect
                key={i}
                x={x}
                y={H - pad - v}
                width={(W - pad * 2) / 64 - 0.5}
                height={v}
                fill={histColor}
              />
            );
          })}
        </g>
        <line
          x1={pad}
          y1={H - pad}
          x2={W - pad}
          y2={pad}
          stroke="var(--border)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
        <path d={path} fill="none" stroke={channelColor} strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xs(p.x)}
            cy={ys(p.y)}
            r="3.5"
            fill="var(--panel)"
            stroke="var(--fg)"
            strokeWidth="1.2"
            style={{ cursor: "grab" }}
            onMouseDown={(e) => onDragPoint(i, e)}
          />
        ))}
      </svg>
    </div>
  );
};

/* ─── Color Wheel ──────────────────────────────────── */
const ColorWheel = ({ label, pos = { x: 0, y: 0 }, value = 0 }) => {
  const R = 50;
  const [p, setP] = React.useState(pos);
  const drag = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx0 = r.left + r.width / 2;
    const cy0 = r.top + r.height / 2;
    const move = (ev) => {
      let dx = ev.clientX - cx0;
      let dy = ev.clientY - cy0;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > R) {
        dx = (dx / d) * R;
        dy = (dy / d) * R;
      }
      setP({ x: dx, y: dy });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    move(e);
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </span>
      <div
        className="relative h-[108px] w-[108px] cursor-crosshair rounded-full"
        onMouseDown={drag}
        style={{
          background:
            "conic-gradient(from 90deg, oklch(0.75 0.15 30), oklch(0.80 0.14 65), oklch(0.85 0.13 110), oklch(0.80 0.13 155), oklch(0.78 0.14 200), oklch(0.70 0.15 250), oklch(0.68 0.17 295), oklch(0.70 0.17 340), oklch(0.75 0.15 30))",
          boxShadow:
            "inset 0 0 0 1px var(--border), inset 0 0 25px rgba(255,255,255,.55)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[30%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,.9), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-2.5 w-2.5 rounded-full border-[1.5px] border-ink bg-white shadow-[0_1px_2px_rgba(0,0,0,.4)]"
          style={{
            transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
          }}
        />
      </div>
      <div className="grid w-full grid-cols-[1fr_44px] items-center gap-1.5">
        <input
          type="range"
          min="-100"
          max="100"
          defaultValue={value}
          className="whale-range"
          style={{
            background:
              "linear-gradient(to right, oklch(0.2 0 0), oklch(0.5 0 0), oklch(0.98 0 0))",
          }}
        />
        <span className="num rounded-xs border border-line bg-surface-subtle px-1.5 py-0.5 text-right font-mono text-[11px] text-ink">
          {value > 0 ? "+" : ""}
          {value}
        </span>
      </div>
    </div>
  );
};

/* ─── HSL panel ────────────────────────────────────── */
const HUES = [
  { name: "red",     color: "oklch(0.65 0.19 25)" },
  { name: "orange",  color: "oklch(0.75 0.15 55)" },
  { name: "yellow",  color: "oklch(0.87 0.15 95)" },
  { name: "green",   color: "oklch(0.72 0.15 145)" },
  { name: "aqua",    color: "oklch(0.78 0.11 200)" },
  { name: "blue",    color: "oklch(0.60 0.16 245)" },
  { name: "purple",  color: "oklch(0.55 0.17 300)" },
  { name: "magenta", color: "oklch(0.65 0.19 340)" },
];

const HSL = () => {
  const [sel, setSel] = React.useState(0);
  return (
    <div>
      <div className="mb-2.5 flex gap-1">
        {HUES.map((h, i) => (
          <button
            key={h.name}
            title={h.name}
            onClick={() => setSel(i)}
            style={{ background: h.color }}
            className={cx(
              "h-[22px] flex-1 cursor-pointer rounded-[3px] border border-line",
              sel === i && "outline outline-2 outline-offset-1 outline-ink"
            )}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        <Slider label="Hue" value={-8} onChange={() => {}} color={HUES[sel].color} />
        <Slider label="Saturation" value={22} onChange={() => {}} />
        <Slider label="Luminance" value={-4} onChange={() => {}} />
      </div>
    </div>
  );
};

/* ─── Histogram ────────────────────────────────────── */
const Histogram = () => {
  const W = 220;
  const H = 86;
  const pad = 4;
  const bins = 96;
  const gen = (peak, spread, scale) =>
    Array.from(
      { length: bins },
      (_, i) =>
        Math.max(
          0,
          scale * Math.exp(-Math.pow((i - peak) / spread, 2)) + (Math.random() - 0.5) * 3
        )
    );
  const r = gen(36, 18, 60);
  const g = gen(46, 22, 75);
  const b = gen(28, 16, 55);
  const y = r.map((_, i) => r[i] * 0.3 + g[i] * 0.59 + b[i] * 0.11);
  const toPath = (arr) => {
    const max = 80;
    let d = `M ${pad} ${H - pad}`;
    arr.forEach((v, i) => {
      const x = pad + (i / bins) * (W - pad * 2);
      const yy = H - pad - Math.min(H - pad * 2, (v / max) * (H - pad * 2));
      d += ` L ${x.toFixed(1)} ${yy.toFixed(1)}`;
    });
    d += ` L ${W - pad} ${H - pad} Z`;
    return d;
  };
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full rounded-xs"
        style={{ background: "oklch(0.13 0.005 250)" }}
      >
        <path
          d={toPath(y)}
          fill="oklch(0.9 0.01 250 / 0.15)"
          stroke="oklch(0.9 0.01 250 / 0.6)"
          strokeWidth="0.6"
        />
        <path
          d={toPath(r)}
          fill="oklch(0.65 0.19 28 / 0.35)"
          stroke="oklch(0.75 0.19 28 / 0.9)"
          strokeWidth="0.6"
        />
        <path
          d={toPath(g)}
          fill="oklch(0.70 0.17 150 / 0.35)"
          stroke="oklch(0.80 0.17 150 / 0.9)"
          strokeWidth="0.6"
        />
        <path
          d={toPath(b)}
          fill="oklch(0.60 0.17 250 / 0.35)"
          stroke="oklch(0.72 0.17 250 / 0.9)"
          strokeWidth="0.6"
        />
      </svg>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>0</span>
        <span>64</span>
        <span>128</span>
        <span>192</span>
        <span>255</span>
      </div>
    </div>
  );
};

/* ─── Section wrapper ──────────────────────────────── */
const Section = ({ children }) => (
  <div className="border-b border-line-divider px-3 py-2.5 last:border-b-0">
    {children}
  </div>
);

/* ─── Tuning Panel ─────────────────────────────────── */
export const TuningPanel = ({ blockId, onToggleBypass, bypass }) => {
  const block = PIPELINE.find((b) => b.id === blockId) || PIPELINE[6];
  const type = ["tone"].includes(block.id)
    ? "curve"
    : ["hsl"].includes(block.id)
    ? "hsl"
    : ["wheel"].includes(block.id)
    ? "wheel"
    : ["wb"].includes(block.id)
    ? "wb"
    : ["lut"].includes(block.id)
    ? "lut"
    : ["nr", "sharp"].includes(block.id)
    ? "detail"
    : "generic";

  return (
    <div className="flex h-full flex-col border-l border-line bg-surface-panel">
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: CAT_COLOR[block.cat] }}
          />
          <div>
            <h3 className="m-0 whitespace-nowrap text-[14px] font-semibold">{block.name}</h3>
            <div className="font-mono text-[10px] text-ink-faint">
              block {PIPELINE.findIndex((b) => b.id === block.id) + 1} /{" "}
              {PIPELINE.length} · {block.cat}
            </div>
          </div>
        </div>
        <button
          onClick={onToggleBypass}
          className={cx(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border bg-surface-panel px-2 py-[3px] font-mono text-[11px]",
            !bypass
              ? "border-accent-border bg-accent-soft text-accent"
              : "border-line text-ink-muted"
          )}
        >
          <Icon name={bypass ? "eyeOff" : "eye"} size={11} />{" "}
          {bypass ? "BYPASSED" : "ACTIVE"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section>
          <SectionTitle right={<span className="font-mono text-ink-faint">RGB + L</span>}>
            Histogram
          </SectionTitle>
          <Histogram />
        </Section>

        {type === "curve" && (
          <>
            <Section>
              <SectionTitle
                right={
                  <Btn variant="ghost" size="sm" title="Reset">
                    <Icon name="reset" size={11} />
                  </Btn>
                }
              >
                Tone Curve
              </SectionTitle>
              <ToneCurve />
            </Section>
            <Section>
              <SectionTitle>Zones</SectionTitle>
              <div className="flex flex-col gap-2.5">
                <Slider label="Shadows" value={-8} onChange={() => {}} />
                <Slider label="Midtones" value={6} onChange={() => {}} />
                <Slider label="Highlights" value={-14} onChange={() => {}} />
              </div>
            </Section>
          </>
        )}

        {type === "hsl" && (
          <Section>
            <SectionTitle>HSL Adjust</SectionTitle>
            <HSL />
          </Section>
        )}

        {type === "wheel" && (
          <>
            <Section>
              <SectionTitle
                right={
                  <Btn variant="ghost" size="sm">
                    Linked
                  </Btn>
                }
              >
                Color Wheels
              </SectionTitle>
              <div className="grid grid-cols-3 gap-2.5">
                <ColorWheel label="Lift" value={-4} />
                <ColorWheel label="Gamma" value={6} />
                <ColorWheel label="Gain" value={8} />
              </div>
            </Section>
            <Section>
              <div className="flex flex-col gap-2.5">
                <Slider label="Contrast" value={12} onChange={() => {}} />
                <Slider label="Saturation" value={8} onChange={() => {}} />
                <Slider label="Pivot" value={0} min={-50} max={50} onChange={() => {}} />
              </div>
            </Section>
          </>
        )}

        {type === "wb" && (
          <>
            <Section>
              <SectionTitle
                right={
                  <Btn variant="ghost" size="sm">
                    <Icon name="droplet" size={11} /> Pick
                  </Btn>
                }
              >
                White Balance
              </SectionTitle>
              <div className="flex flex-col gap-2.5">
                <Slider
                  label="Temperature"
                  value={5200}
                  min={2500}
                  max={10000}
                  step={10}
                  unit="K"
                  onChange={() => {}}
                />
                <Slider label="Tint" value={4} min={-100} max={100} onChange={() => {}} />
              </div>
            </Section>
            <Section>
              <SectionTitle>RGB Gains</SectionTitle>
              <div className="flex flex-col gap-2.5">
                <Slider
                  label="R gain"
                  value={182}
                  min={50}
                  max={400}
                  color="var(--red)"
                  onChange={() => {}}
                />
                <Slider
                  label="G gain"
                  value={100}
                  min={50}
                  max={400}
                  color="var(--green)"
                  onChange={() => {}}
                />
                <Slider
                  label="B gain"
                  value={164}
                  min={50}
                  max={400}
                  color="var(--blue)"
                  onChange={() => {}}
                />
              </div>
            </Section>
          </>
        )}

        {type === "lut" && (
          <Section>
            <SectionTitle right={<Btn variant="ghost" size="sm">Browse…</Btn>}>
              Look LUT
            </SectionTitle>
            <Select mono className="w-full">
              <option>Neutral-Night-v3.cube</option>
              <option>Warm-Film-21.cube</option>
              <option>Low-light-A7.cube</option>
            </Select>
            <div className="mt-2.5 flex flex-col gap-2.5">
              <Slider label="Strength" value={78} min={0} max={100} unit="%" onChange={() => {}} />
              <Slider label="Gamut bias" value={-6} onChange={() => {}} />
            </div>
          </Section>
        )}

        {type === "detail" && (
          <Section>
            <SectionTitle>{block.name}</SectionTitle>
            <div className="flex flex-col gap-2.5">
              {Object.entries(block.params).map(([k, v]) => (
                <Slider
                  key={k}
                  label={k.charAt(0).toUpperCase() + k.slice(1)}
                  value={v}
                  onChange={() => {}}
                />
              ))}
            </div>
          </Section>
        )}

        {type === "generic" && (
          <Section>
            <SectionTitle>Parameters</SectionTitle>
            <div className="flex flex-col gap-2.5">
              {Object.entries(block.params).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-muted">
                    {k}
                  </label>
                  <Input mono defaultValue={String(v)} />
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section>
          <SectionTitle>Apply to</SectionTitle>
          <div className="mb-2 grid auto-cols-fr grid-flow-col gap-0.5 rounded-sm border border-line bg-surface-subtle p-[2px]">
            {[
              { v: "current", label: "Current", active: true },
              { v: "scene", label: "Scene" },
              { v: "all", label: "All" },
            ].map((o) => (
              <button
                key={o.v}
                className={cx(
                  "rounded-[3px] px-1.5 py-1 text-[11px] font-medium",
                  o.active
                    ? "bg-surface-panel text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
            <span>scope</span>
            <span>night-tuning-pass-3 · 18 imgs</span>
          </div>
        </Section>
      </div>

      <div className="flex items-center gap-1.5 border-t border-line px-3.5 py-2.5 text-[11px]">
        <Btn size="sm">
          <Icon name="reset" size={11} /> Reset
        </Btn>
        <Btn size="sm">Copy</Btn>
        <div className="flex-1" />
        <Btn variant="primary" size="sm">
          <Icon name="check" size={11} /> Save preset
        </Btn>
      </div>
    </div>
  );
};
