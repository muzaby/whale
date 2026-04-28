/* Compare viewer: side-by-side OR slider */

const CompareViewer = ({ mode, onMode, labelA = "Reference", labelB = "Simulation" }) => {
  const [slider, setSlider] = React.useState(50);
  const [zoom, setZoom] = React.useState(100);
  return (
    <div className="cv">
      <style>{`
        .cv { display: flex; flex-direction: column; height: 100%; background: var(--bg-subtle); }
        .cv-toolbar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
          background: var(--panel);
          font-size: 12px;
        }
        .cv-toolbar .spacer { flex: 1; }
        .cv-stage {
          flex: 1; position: relative; overflow: hidden;
          background:
            linear-gradient(45deg, oklch(0.88 0.004 240) 25%, transparent 25%),
            linear-gradient(-45deg, oklch(0.88 0.004 240) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, oklch(0.88 0.004 240) 75%),
            linear-gradient(-45deg, transparent 75%, oklch(0.88 0.004 240) 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0;
          background-color: oklch(0.94 0.004 240);
        }
        .cv-split { display: grid; grid-template-columns: 1fr 1fr; height: 100%; gap: 1px; background: var(--border); }
        .cv-pane { position: relative; overflow: hidden; background: #000; }
        .cv-pane .label {
          position: absolute; top: 10px; left: 10px; z-index: 3;
          background: rgba(0,0,0,.6); color: white;
          padding: 3px 8px; border-radius: 3px;
          font-family: var(--font-mono); font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          backdrop-filter: blur(6px);
        }
        .cv-pane .label.ref { background: rgba(30,30,30,.75); }
        .cv-pane .label.sim { background: color-mix(in oklch, var(--accent) 80%, black); }
        .cv-pane .info {
          position: absolute; bottom: 10px; left: 10px; z-index: 3;
          color: rgba(255,255,255,.85);
          font-family: var(--font-mono); font-size: 10px;
          background: rgba(0,0,0,.45); padding: 3px 7px; border-radius: 3px;
          backdrop-filter: blur(6px);
        }
        .cv-slider-wrap { position: relative; height: 100%; overflow: hidden; cursor: ew-resize; }
        .cv-slider-a, .cv-slider-b { position: absolute; inset: 0; overflow: hidden; }
        .cv-slider-b { clip-path: polygon(var(--sx) 0, 100% 0, 100% 100%, var(--sx) 100%); }
        .cv-handle {
          position: absolute; top: 0; bottom: 0; width: 2px;
          left: var(--sx); transform: translateX(-50%);
          background: white; z-index: 5; pointer-events: none;
          box-shadow: 0 0 0 1px rgba(0,0,0,.3);
        }
        .cv-handle::before {
          content: ""; position: absolute; left: 50%; top: 50%;
          width: 34px; height: 34px; border-radius: 50%;
          border: 2px solid white; background: rgba(0,0,0,.3);
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 1px rgba(0,0,0,.25);
        }
        .cv-handle::after {
          content: "◂▸"; position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          color: white; font-size: 10px; letter-spacing: -2px;
        }
        .cv-bottom {
          display: flex; align-items: center; gap: 16px;
          padding: 8px 14px;
          border-top: 1px solid var(--border);
          background: var(--panel);
          font-size: 11px; color: var(--fg-muted);
        }
        .cv-bottom .stat .k { color: var(--fg-faint); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; margin-right: 4px; }
        .cv-bottom .stat .v { font-family: var(--font-mono); color: var(--fg); }
      `}</style>
      <div className="cv-toolbar">
        <Seg value={mode} onChange={onMode} options={[
          { v: "split",  label: "Split", icon: "split" },
          { v: "slider", label: "Slider", icon: "slider" },
          { v: "overlay", label: "A / B", icon: "layers" },
        ]} />
        <button className="btn sm ghost"><Icon name="reset" size={12} /> Fit</button>
        <div className="btn sm" style={{ padding: 0, gap: 0 }}>
          <button className="btn sm ghost" style={{ borderRadius: 0 }} onClick={() => setZoom(z => Math.max(25, z - 25))}>−</button>
          <span className="mono" style={{ padding: "0 10px", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", minWidth: 54, textAlign: "center" }}>{zoom}%</span>
          <button className="btn sm ghost" style={{ borderRadius: 0 }} onClick={() => setZoom(z => Math.min(400, z + 25))}>+</button>
        </div>
        <div className="spacer" />
        <span className="badge mono">1920 × 1080</span>
        <span className="badge mono">sRGB · 8-bit</span>
        <button className="btn sm"><Icon name="eye" size={12} /> Mask</button>
        <button className="btn sm"><Icon name="droplet" size={12} /> Picker</button>
        <button className="btn sm primary"><Icon name="check" size={12} /> Commit</button>
      </div>

      <div className="cv-stage">
        {mode === "split" && (
          <div className="cv-split">
            <div className="cv-pane">
              <span className="label ref">A · {labelA}</span>
              <PhImg label="reference photo" hue={210} style={{ height: "100%", width: "100%", borderRadius: 0 }} />
              <span className="info">night_ref_042.dng · 14-bit · as shot</span>
            </div>
            <div className="cv-pane">
              <span className="label sim">B · {labelB}</span>
              <PhImg label="simulated output" hue={35} style={{ height: "100%", width: "100%", borderRadius: 0 }} />
              <span className="info">rev-7 · WB 5200K · tone+14 · LUT night-v3</span>
            </div>
          </div>
        )}
        {mode === "slider" && (
          <SliderCompare slider={slider} setSlider={setSlider} />
        )}
        {mode === "overlay" && (
          <div className="cv-pane" style={{ height: "100%" }}>
            <span className="label sim">A/B · BLEND 50%</span>
            <div style={{ position: "relative", height: "100%" }}>
              <PhImg label="reference" hue={210} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
              <PhImg label="simulation" hue={35} style={{ position: "absolute", inset: 0, borderRadius: 0, opacity: 0.5, mixBlendMode: "difference" }} />
            </div>
          </div>
        )}
      </div>

      <div className="cv-bottom">
        <span className="stat"><span className="k">ΔE₀₀</span><span className="v">2.84</span></span>
        <span className="stat"><span className="k">PSNR</span><span className="v">34.2 dB</span></span>
        <span className="stat"><span className="k">SSIM</span><span className="v">0.962</span></span>
        <span className="stat"><span className="k">WB ref</span><span className="v">5180 K / +6</span></span>
        <span className="stat"><span className="k">WB sim</span><span className="v">5200 K / +4</span></span>
        <div className="spacer" />
        <span className="mono" style={{ color: "var(--fg-faint)" }}>pointer: 912, 488 · R 182 G 144 B 108 · L* 62.4</span>
      </div>
    </div>
  );
};

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
      className="cv-slider-wrap"
      style={{ "--sx": `${slider}%` }}
      onMouseDown={(e) => { drag.current = true; onMove(e); }}
      onMouseMove={onMove}
      onMouseUp={() => drag.current = false}
      onMouseLeave={() => drag.current = false}
    >
      <div className="cv-slider-a">
        <span className="label ref" style={{ position: "absolute", top: 10, left: 10, zIndex: 3, background: "rgba(30,30,30,.75)", color: "white", padding: "3px 8px", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>A · Reference</span>
        <PhImg label="reference" hue={210} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
      </div>
      <div className="cv-slider-b">
        <span className="label sim" style={{ position: "absolute", top: 10, right: 10, zIndex: 3, background: "color-mix(in oklch, var(--accent) 80%, black)", color: "white", padding: "3px 8px", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>B · Simulation</span>
        <PhImg label="simulation" hue={35} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
      </div>
      <div className="cv-handle" />
    </div>
  );
};

Object.assign(window, { CompareViewer });
