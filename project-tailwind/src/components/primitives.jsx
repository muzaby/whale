import React from "react";

/* ─── className helper ─────────────────────────────── */
export const cx = (...parts) => parts.filter(Boolean).join(" ");

/* ─── Icon ─────────────────────────────────────────── */
const ICON_PATHS = {
  home: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path d="m6 6 3 3M15 15l3 3M6 18l3-3M15 9l3-3" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  upload: (
    <>
      <path d="M12 15V3M7 8l5-5 5 5" />
      <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  node: (
    <>
      <rect x="3" y="9" width="6" height="6" rx="1" />
      <rect x="15" y="4" width="6" height="6" rx="1" />
      <rect x="15" y="14" width="6" height="6" rx="1" />
      <path d="M9 12h3v-5h3M9 12h3v5h3" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </>
  ),
  timeline: <path d="M3 12h18M7 8v8M13 6v12M19 9v6" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  rows: (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <rect x="3" y="15" width="18" height="5" rx="1" />
    </>
  ),
  split: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M12 4v16" />
    </>
  ),
  slider: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M11 4v16" />
      <path d="M9 10l2 2-2 2M13 10l-2 2 2 2" />
    </>
  ),
  star: <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.8 6.2 20.8l1.1-6.4L2.6 9.8l6.5-.9L12 3z" />,
  tag: (
    <>
      <path d="M20 10.5 13.5 4H4v9.5L10.5 20a2 2 0 0 0 2.83 0l6.67-6.67a2 2 0 0 0 0-2.83Z" />
      <circle cx="8" cy="8" r="1.2" />
    </>
  ),
  play: <path d="M6 4v16l14-8-14-8Z" />,
  chev: <path d="m9 6 6 6-6 6" />,
  chevDown: <path d="m6 9 6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="6" r="1" />
      <circle cx="12" cy="6" r="1" />
      <circle cx="18" cy="6" r="1" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
      <circle cx="6" cy="18" r="1" />
      <circle cx="12" cy="18" r="1" />
      <circle cx="18" cy="18" r="1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M10.6 5.1C11.06 5.03 11.53 5 12 5c6.5 0 10 7 10 7a16.3 16.3 0 0 1-3.4 4.1M6.7 6.7A16.3 16.3 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.3-1.7M3 3l18 18" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  reset: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  wand: (
    <>
      <path d="M15 4V2M15 14v2M8 9H6M19 9h2M17 6l-1.4 1.4M13.4 10.6 12 12M12.6 7.4 14 6M8 15l-5 5" />
      <path d="m15.5 7.5 4 4-9 9-4-4 9-9Z" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  img: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m3 17 6-5 5 4 3-2 4 3" />
    </>
  ),
  pipeline: (
    <>
      <circle cx="5" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M7 6h4l2 6-2 6H7" />
    </>
  ),
  curve: (
    <>
      <path d="M3 21 21 3" />
      <path d="M3 21c4 0 6-12 18-12" strokeDasharray="0" />
    </>
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
    </>
  ),
  histogram: <path d="M4 20V10M8 20V7M12 20v-3M16 20v-8M20 20v-5" />,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z" />,
  check: <path d="m5 12 5 5L20 7" />,
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  zap: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  droplet: <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5M3 18l9 5 9-5" />
    </>
  ),
};

export const Icon = ({ name, size = 14, stroke = 1.6, className = "", style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {ICON_PATHS[name] || null}
  </svg>
);

/* ─── Placeholder image ───────────────────────────── */
export const PhImg = ({ label = "image", hue = 220, style, tag, className = "" }) => {
  const bg1 = `oklch(0.93 0.04 ${hue})`;
  const bg2 = `oklch(0.97 0.02 ${hue})`;
  return (
    <div
      className={cx(
        "relative flex items-center justify-center overflow-hidden",
        "rounded-sm font-mono text-[11px] text-ink-subtle",
        className
      )}
      style={{
        background: `repeating-linear-gradient(45deg, ${bg1} 0 10px, ${bg2} 10px 20px)`,
        ...style,
      }}
    >
      {tag && (
        <span className="absolute left-2 top-2 rounded-[3px] bg-white/85 px-1.5 py-0.5 font-mono text-2xs text-ink-muted backdrop-blur-sm">
          {tag}
        </span>
      )}
      <span className="opacity-50 tracking-[0.04em]">{label}</span>
    </div>
  );
};

/* ─── Button ──────────────────────────────────────── */
const BTN_BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border font-medium transition-colors";
const BTN_VARIANT = {
  default: "border-line bg-surface-panel text-ink hover:bg-surface-subtle hover:border-line-strong",
  primary:
    "border-accent bg-accent text-accent-fg hover:bg-accent-hover hover:border-accent-hover",
  ghost: "border-transparent bg-transparent text-ink hover:bg-surface-subtle",
  danger: "border-line bg-surface-panel text-err hover:bg-surface-subtle",
};
const BTN_SIZE = {
  md: "px-2.5 py-[5px] text-[12px]",
  sm: "px-2 py-[3px] text-[11px]",
};
export const Btn = ({
  variant = "default",
  size = "md",
  icon = false,
  className = "",
  children,
  ...rest
}) => (
  <button
    className={cx(
      BTN_BASE,
      BTN_VARIANT[variant],
      icon ? (size === "sm" ? "p-[3px]" : "p-[5px]") : BTN_SIZE[size],
      className
    )}
    {...rest}
  >
    {children}
  </button>
);

/* ─── Badge ───────────────────────────────────────── */
const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-[10px] border px-[7px] py-[1px] font-mono text-2xs font-medium tracking-[0.02em]";
const BADGE_VARIANT = {
  default: "border-line bg-surface-subtle text-ink-muted",
  ok: "text-ok border-[color-mix(in_oklch,var(--ok)_25%,transparent)] bg-[color-mix(in_oklch,var(--ok)_8%,var(--panel))]",
  warn: "text-warn border-[color-mix(in_oklch,var(--warn)_25%,transparent)] bg-[color-mix(in_oklch,var(--warn)_8%,var(--panel))]",
  accent: "text-accent border-accent-border bg-accent-soft",
  sim: "text-[oklch(0.55_0.12_300)] border-[oklch(0.85_0.05_300)] bg-[oklch(0.96_0.02_300)]",
};
const BADGE_DOT_COLOR = {
  default: "bg-ink-subtle",
  ok: "bg-ok",
  warn: "bg-warn",
  accent: "bg-accent",
  sim: "bg-[oklch(0.55_0.12_300)]",
};
export const Badge = ({ variant = "default", dot = false, className = "", children }) => (
  <span className={cx(BADGE_BASE, BADGE_VARIANT[variant], className)}>
    {dot && (
      <span className={cx("h-[5px] w-[5px] rounded-full", BADGE_DOT_COLOR[variant])} />
    )}
    {children}
  </span>
);

/* ─── Keyboard chip ───────────────────────────────── */
export const KbdChip = ({ children, className = "" }) => (
  <span
    className={cx(
      "rounded border border-b-2 border-line bg-surface-panel px-[5px] py-[2px] font-mono text-[10px] text-ink-subtle",
      className
    )}
  >
    {children}
  </span>
);

/* ─── TopBar ──────────────────────────────────────── */
export const TopBar = ({ page, onNav, crumb = null }) => (
  <div className="relative z-10 grid h-topbar grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line bg-surface-panel px-3.5">
    <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-[0.02em]">
      <span className="h-[7px] w-[7px] rounded-full bg-accent" />
      WHALE
      <span className="ml-1 border-l border-line pl-1 text-[11px] font-normal text-ink-faint">
        v0.4.2 · tuning studio
      </span>
    </div>
    <div
      role="tablist"
      className="flex gap-0.5 rounded-md border border-line bg-surface-subtle p-[3px]"
    >
      {[
        { id: "home", label: "Home", icon: "home" },
        { id: "e2e", label: "E2E", icon: "pipeline" },
        { id: "library", label: "Library", icon: "folder" },
      ].map((t) => (
        <button
          key={t.id}
          onClick={() => onNav(t.id)}
          className={cx(
            "flex items-center gap-1.5 rounded-sm px-3.5 py-1 text-[12px] font-medium transition-colors",
            page === t.id
              ? "bg-surface-panel text-ink shadow-sm"
              : "text-ink-muted hover:text-ink"
          )}
        >
          <Icon name={t.icon} size={12} /> {t.label}
        </button>
      ))}
    </div>
    <div className="flex items-center justify-end gap-1.5">
      {crumb && (
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-subtle">
          {crumb}
        </div>
      )}
      <Btn variant="ghost" size="sm" title="Sync">
        <Icon name="clock" size={12} /> <span className="font-mono">2m ago</span>
      </Btn>
      <Btn variant="ghost" size="sm" icon title="Settings">
        <Icon name="settings" size={13} />
      </Btn>
      <div
        className="flex h-[22px] w-[22px] items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white"
        style={{ background: "oklch(0.72 0.08 220)" }}
      >
        JK
      </div>
    </div>
  </div>
);

/* ─── Slider ──────────────────────────────────────── */
export const Slider = ({
  label,
  value,
  min = -100,
  max = 100,
  step = 1,
  unit = "",
  onChange,
  color,
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="grid grid-cols-[1fr_56px] items-center gap-2">
      <div className="col-span-full flex items-center justify-between text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-ink">{label}</span>
          {color && (
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color }}
            />
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
        className="whale-range w-full"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
        }}
      />
      <span className="num rounded-xs border border-line bg-surface-subtle px-1.5 py-0.5 text-right font-mono text-[11px] text-ink">
        {value > 0 ? "+" : ""}
        {value}
        {unit}
      </span>
    </div>
  );
};

/* ─── Segmented ───────────────────────────────────── */
export const Seg = ({ value, onChange, options }) => (
  <div className="grid auto-cols-fr grid-flow-col gap-0.5 rounded-sm border border-line bg-surface-subtle p-[2px]">
    {options.map((o) => (
      <button
        key={o.v}
        onClick={() => onChange(o.v)}
        className={cx(
          "flex items-center justify-center gap-1 rounded-[3px] px-1.5 py-1 text-[11px] font-medium transition-colors",
          value === o.v
            ? "bg-surface-panel text-ink shadow-sm"
            : "text-ink-muted hover:text-ink"
        )}
      >
        {o.icon && <Icon name={o.icon} size={11} />} {o.label}
      </button>
    ))}
  </div>
);

/* ─── Field / inputs ──────────────────────────────── */
export const Input = ({ className = "", mono = false, search = false, ...rest }) => {
  if (search) {
    return (
      <div className="relative">
        <Icon
          name="search"
          size={12}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          className={cx(
            "rounded-sm border border-line bg-surface-panel py-1.5 pl-7 pr-2 text-[12px] text-ink outline-none transition-colors focus:border-accent focus:shadow-focus",
            mono && "font-mono text-[11px]",
            className
          )}
          {...rest}
        />
      </div>
    );
  }
  return (
    <input
      className={cx(
        "rounded-sm border border-line bg-surface-panel px-2 py-1.5 text-[12px] text-ink outline-none transition-colors focus:border-accent focus:shadow-focus",
        mono && "font-mono text-[11px]",
        className
      )}
      {...rest}
    />
  );
};

export const Select = ({ className = "", mono = false, children, ...rest }) => (
  <select
    className={cx(
      "rounded-sm border border-line bg-surface-panel px-2 py-1.5 text-[12px] text-ink outline-none transition-colors focus:border-accent focus:shadow-focus",
      mono && "font-mono text-[11px]",
      className
    )}
    {...rest}
  >
    {children}
  </select>
);

/* ─── Section helpers ─────────────────────────────── */
export const SectionTitle = ({ children, right }) => (
  <div className="mb-2 flex items-center justify-between whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
    <span className="whitespace-nowrap">{children}</span>
    {right}
  </div>
);
