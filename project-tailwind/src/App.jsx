import React from "react";
import { E2E } from "./components/e2e_page.jsx";
import { Home } from "./components/home.jsx";
import { Library } from "./components/library.jsx";
import { Btn, Icon, Seg, TopBar, cx } from "./components/primitives.jsx";

const TWEAK_DEFAULTS = {
  accent: "ocean",
  density: "comfortable",
  monoMeta: true,
};

const ACCENT_SWATCHES = [
  { k: "ocean", c: "oklch(0.58 0.13 220)" },
  { k: "teal", c: "oklch(0.60 0.11 185)" },
  { k: "amber", c: "oklch(0.70 0.14 55)" },
  { k: "graphite", c: "oklch(0.36 0.02 260)" },
];

const Tweaks = ({ tweaks, setTweak, onClose }) => (
  <div className="fixed bottom-3.5 right-3.5 z-[100] w-[280px] origin-bottom-right overflow-hidden rounded-lg border border-line bg-surface-panel shadow-lg">
    <header className="flex items-center justify-between border-b border-line-divider bg-surface-subtle px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-ink">
      <span>Tweaks</span>
      <Btn variant="ghost" size="sm" icon onClick={onClose}>
        <Icon name="close" size={12} />
      </Btn>
    </header>
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Accent color
        </span>
        <div className="flex gap-1.5">
          {ACCENT_SWATCHES.map((s) => (
            <button
              key={s.k}
              title={s.k}
              onClick={() => setTweak("accent", s.k)}
              style={{ background: s.c }}
              className={cx(
                "h-6 flex-1 cursor-pointer rounded-xs border border-line",
                tweaks.accent === s.k && "outline outline-2 outline-offset-1 outline-ink"
              )}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Density
        </span>
        <Seg
          value={tweaks.density}
          onChange={(v) => setTweak("density", v)}
          options={[
            { v: "compact", label: "Compact" },
            { v: "comfortable", label: "Comfortable" },
            { v: "spacious", label: "Spacious" },
          ]}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Jump to page
        </span>
        <Seg
          value={localStorage.getItem("whale:page") || "home"}
          onChange={(v) => {
            localStorage.setItem("whale:page", v);
            location.reload();
          }}
          options={[
            { v: "home", label: "Home" },
            { v: "e2e", label: "E2E" },
            { v: "library", label: "Library" },
          ]}
        />
      </div>
      <div className="border-t border-line-divider pt-2 font-mono text-[10px] text-ink-faint">
        hint · try node vs list vs timeline in E2E, split vs slider compare
      </div>
    </div>
  </div>
);

const App = () => {
  const [page, setPage] = React.useState(
    () => (typeof localStorage !== "undefined" && localStorage.getItem("whale:page")) || "home"
  );
  const [tweaksOn, setTweaksOn] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);

  React.useEffect(() => {
    localStorage.setItem("whale:page", page);
  }, [page]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", tweaks.accent === "ocean" ? "" : tweaks.accent);
    root.style.setProperty(
      "--density-pad",
      tweaks.density === "compact"
        ? "6px"
        : tweaks.density === "spacious"
        ? "16px"
        : "10px"
    );
  }, [tweaks]);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweaksOn(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOn(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const setTweak = (k, v) => {
    const n = { ...tweaks, [k]: v };
    setTweaks(n);
    window.parent.postMessage(
      { type: "__edit_mode_set_keys", edits: { [k]: v } },
      "*"
    );
  };

  const crumb =
    page === "e2e" ? (
      <>
        <span>sensor-A</span>
        <span className="text-ink-faint">/</span>
        <span>night-tuning</span>
        <span className="text-ink-faint">/</span>
        <span className="text-ink">pass-3 · rev-7</span>
      </>
    ) : page === "library" ? (
      <>
        <span>library</span>
        <span className="text-ink-faint">/</span>
        <span className="text-ink">all images</span>
      </>
    ) : null;

  return (
    <div className="grid h-screen min-h-[600px] grid-rows-[48px_1fr]">
      <TopBar page={page} onNav={setPage} crumb={crumb} />
      <div className="relative overflow-hidden">
        {page === "home" && <Home goto={setPage} />}
        {page === "e2e" && <E2E />}
        {page === "library" && <Library />}
      </div>
      {tweaksOn && (
        <Tweaks tweaks={tweaks} setTweak={setTweak} onClose={() => setTweaksOn(false)} />
      )}
    </div>
  );
};

export default App;
