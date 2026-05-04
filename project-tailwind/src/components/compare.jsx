import React from "react";
import { Badge, Btn, cx, Icon, PhImg, Seg } from "./primitives.jsx";

const CHECKER_BG = {
  background: `
    linear-gradient(45deg, oklch(0.88 0.004 240) 25%, transparent 25%),
    linear-gradient(-45deg, oklch(0.88 0.004 240) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, oklch(0.88 0.004 240) 75%),
    linear-gradient(-45deg, transparent 75%, oklch(0.88 0.004 240) 75%)
  `,
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
  backgroundColor: "oklch(0.94 0.004 240)",
};

const PaneLabel = ({ kind = "ref", side = "left", children }) => (
  <span
    className={cx(
      "absolute top-2.5 z-[3] rounded-[3px] px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.06em] text-white backdrop-blur-md",
      side === "left" ? "left-2.5" : "right-2.5"
    )}
    style={{
      background:
        kind === "sim"
          ? "color-mix(in oklch, var(--accent) 80%, black)"
          : "rgba(30,30,30,.75)",
    }}
  >
    {children}
  </span>
);

const PaneInfo = ({ children }) => (
  <span className="absolute bottom-2.5 left-2.5 z-[3] rounded-[3px] bg-black/45 px-[7px] py-[3px] font-mono text-[10px] text-white/85 backdrop-blur-md">
    {children}
  </span>
);

const SliderCompare = ({ slider, setSlider }) => {
  const ref = React.useRef(null);
  const drag = React.useRef(false);
  const onMove = (e) => {
    if (!drag.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - r.left), r.width);
    setSlider((x / r.width) * 100);
  };
  return (
    <div
      ref={ref}
      className="relative h-full cursor-ew-resize overflow-hidden"
      onMouseDown={(e) => {
        drag.current = true;
        onMove(e);
      }}
      onMouseMove={onMove}
      onMouseUp={() => (drag.current = false)}
      onMouseLeave={() => (drag.current = false)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <PaneLabel kind="ref" side="left">
          A · Reference
        </PaneLabel>
        <PhImg label="reference" hue={210} className="!absolute inset-0 !rounded-none" />
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `polygon(${slider}% 0, 100% 0, 100% 100%, ${slider}% 100%)` }}
      >
        <PaneLabel kind="sim" side="right">
          B · Simulation
        </PaneLabel>
        <PhImg label="simulation" hue={35} className="!absolute inset-0 !rounded-none" />
      </div>
      <div
        className="pointer-events-none absolute bottom-0 top-0 z-[5] w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.3)]"
        style={{ left: `${slider}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/30 text-[10px] tracking-[-2px] text-white shadow-[0_0_0_1px_rgba(0,0,0,.25)]">
          ◂▸
        </div>
      </div>
    </div>
  );
};

export const CompareViewer = ({
  mode,
  onMode,
  labelA = "Reference",
  labelB = "Simulation",
}) => {
  const [slider, setSlider] = React.useState(50);
  const [zoom, setZoom] = React.useState(100);

  return (
    <div className="flex h-full flex-col bg-surface-subtle">
      <div className="flex items-center gap-2 border-b border-line bg-surface-panel px-3 py-2 text-[12px]">
        <Seg
          value={mode}
          onChange={onMode}
          options={[
            { v: "split", label: "Split", icon: "split" },
            { v: "slider", label: "Slider", icon: "slider" },
            { v: "overlay", label: "A / B", icon: "layers" },
          ]}
        />
        <Btn variant="ghost" size="sm">
          <Icon name="reset" size={12} /> Fit
        </Btn>
        <div className="inline-flex items-stretch overflow-hidden rounded-sm border border-line bg-surface-panel text-[11px]">
          <button
            type="button"
            className="border-0 bg-transparent px-2 py-[3px] text-ink-muted hover:text-ink"
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
          >
            −
          </button>
          <span className="min-w-[54px] border-x border-line px-2.5 text-center font-mono leading-[22px]">
            {zoom}%
          </span>
          <button
            type="button"
            className="border-0 bg-transparent px-2 py-[3px] text-ink-muted hover:text-ink"
            onClick={() => setZoom((z) => Math.min(400, z + 25))}
          >
            +
          </button>
        </div>
        <div className="flex-1" />
        <Badge>
          <span className="font-mono">1920 × 1080</span>
        </Badge>
        <Badge>
          <span className="font-mono">sRGB · 8-bit</span>
        </Badge>
        <Btn size="sm">
          <Icon name="eye" size={12} /> Mask
        </Btn>
        <Btn size="sm">
          <Icon name="droplet" size={12} /> Picker
        </Btn>
        <Btn variant="primary" size="sm">
          <Icon name="check" size={12} /> Commit
        </Btn>
      </div>

      <div className="relative flex-1 overflow-hidden" style={CHECKER_BG}>
        {mode === "split" && (
          <div className="grid h-full grid-cols-2 gap-px bg-line">
            <div className="relative overflow-hidden bg-black">
              <PaneLabel kind="ref" side="left">
                A · {labelA}
              </PaneLabel>
              <PhImg
                label="reference photo"
                hue={210}
                className="!h-full !w-full !rounded-none"
              />
              <PaneInfo>night_ref_042.dng · 14-bit · as shot</PaneInfo>
            </div>
            <div className="relative overflow-hidden bg-black">
              <PaneLabel kind="sim" side="left">
                B · {labelB}
              </PaneLabel>
              <PhImg
                label="simulated output"
                hue={35}
                className="!h-full !w-full !rounded-none"
              />
              <PaneInfo>rev-7 · WB 5200K · tone+14 · LUT night-v3</PaneInfo>
            </div>
          </div>
        )}

        {mode === "slider" && <SliderCompare slider={slider} setSlider={setSlider} />}

        {mode === "overlay" && (
          <div className="relative h-full overflow-hidden bg-black">
            <PaneLabel kind="sim" side="left">
              A/B · BLEND 50%
            </PaneLabel>
            <div className="relative h-full">
              <PhImg
                label="reference"
                hue={210}
                className="!absolute inset-0 !rounded-none"
              />
              <PhImg
                label="simulation"
                hue={35}
                className="!absolute inset-0 !rounded-none"
                style={{ opacity: 0.5, mixBlendMode: "difference" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-line bg-surface-panel px-3.5 py-2 text-[11px] text-ink-muted">
        {[
          ["ΔE₀₀", "2.84"],
          ["PSNR", "34.2 dB"],
          ["SSIM", "0.962"],
          ["WB ref", "5180 K / +6"],
          ["WB sim", "5200 K / +4"],
        ].map(([k, v]) => (
          <span key={k}>
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">
              {k}
            </span>
            <span className="font-mono text-ink">{v}</span>
          </span>
        ))}
        <div className="flex-1" />
        <span className="font-mono text-ink-faint">
          pointer: 912, 488 · R 182 G 144 B 108 · L* 62.4
        </span>
      </div>
    </div>
  );
};
