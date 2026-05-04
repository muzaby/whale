import React from "react";
import { Badge, Btn, Icon, KbdChip, PhImg } from "./primitives.jsx";

const QUICK = [
  {
    icon: "pipeline",
    title: "Open E2E Pipeline",
    body: "Tune per-block ISP parameters on your current session.",
    keys: ["⌘", "E"],
    page: "e2e",
  },
  {
    icon: "folder",
    title: "Browse Library",
    body: "Uploaded references and simulated outputs with tags.",
    keys: ["⌘", "L"],
    page: "library",
  },
  {
    icon: "upload",
    title: "Upload Reference",
    body: "Bring in a RAW, DNG, or tone-map target for comparison.",
    keys: ["⌘", "U"],
  },
];

const STATS = [
  { l: "Images tuned", v: "48", delta: "↑ 12 vs last week" },
  { l: "Active sessions", v: "3", sv: "night · auto · hdr-a" },
  { l: "ΔE avg (target)", v: "2.14", sv: "target ≤ 3.0" },
  { l: "Library", v: "1,284", sv: "420 ref · 864 sim" },
];

const PROJECTS = [
  { name: "Night scene · sensor-A v3", time: "2 min ago", tags: ["night", "low-light"], a: { l: "ref", h: 30 }, b: { l: "sim", h: 240 }, de: "2.8" },
  { name: "HDR · outdoor portrait",    time: "1h ago",    tags: ["hdr", "skin"],         a: { l: "ref", h: 60 }, b: { l: "sim", h: 300 }, de: "1.9" },
  { name: "ColorChecker SG · D65",     time: "Yesterday", tags: ["chart", "calibration"], a: { l: "ref", h: 150 }, b: { l: "sim", h: 200 }, de: "1.2" },
];

const ACTIVITY = [
  { ic: "pipeline", txt: <>Updated <b>Tone Curve</b> on <b>HDR · outdoor portrait</b></>, who: "jiwon.k", t: "12:44" },
  { ic: "check",    txt: <>Approved simulation set <b>night-A-rev7</b> (18 images)</>,    who: "j.park",  t: "11:02" },
  { ic: "upload",   txt: <>Uploaded 6 references to <b>ColorChecker SG</b></>,            who: "jiwon.k", t: "09:18" },
  { ic: "tag",      txt: <>Added tag <Badge variant="accent">low-light</Badge> to 14 images</>, who: "s.nam", t: "Yesterday" },
  { ic: "folder",   txt: <>Created collection <b>Sensor-A · Night Tuning Pass 3</b></>,   who: "jiwon.k", t: "Apr 16" },
];

const SectionH = ({ title, right }) => (
  <div className="mt-7 mb-3 flex items-end justify-between gap-3">
    <h2 className="m-0 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
      {title}
    </h2>
    <span className="whitespace-nowrap">{right}</span>
  </div>
);

export const Home = ({ goto }) => (
  <div data-screen-label="Home" className="h-full overflow-y-auto bg-surface">
    <div className="mx-auto max-w-[1280px] px-10 pb-20 pt-9">
      <h1 className="m-0 mb-0.5 text-[28px] font-semibold tracking-[-0.01em]">
        Good afternoon, Jiwon
      </h1>
      <p className="mb-7 text-[13px] text-ink-muted">
        3 sessions in progress · 48 images tuned this week · 2 reviews awaiting
      </p>

      <div className="mb-8 grid grid-cols-3 gap-3">
        {QUICK.map((q) => (
          <button
            key={q.title}
            onClick={() => q.page && goto(q.page)}
            className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-line bg-surface-panel p-4 text-left transition-all hover:-translate-y-px hover:border-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-soft text-accent">
              <Icon name={q.icon} size={16} />
            </div>
            <div>
              <h3 className="m-0 text-[14px] font-semibold">{q.title}</h3>
              <p className="m-0 text-[12px] text-ink-muted">{q.body}</p>
            </div>
            <div className="mt-auto flex gap-1 pt-2">
              {q.keys.map((k) => (
                <KbdChip key={k}>{k}</KbdChip>
              ))}
            </div>
          </button>
        ))}
      </div>

      <SectionH
        title="Overview · this week"
        right={
          <span className="font-mono text-[11px] text-ink-faint">
            week 16 · Apr 13 – Apr 19
          </span>
        }
      />
      <div className="grid grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div
            key={s.l}
            className="rounded-md border border-line bg-surface-panel px-3.5 py-3"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              {s.l}
            </div>
            <div className="num mt-0.5 font-mono text-[22px] font-semibold">{s.v}</div>
            {s.delta && <div className="font-mono text-[10px] text-ok">{s.delta}</div>}
            {s.sv && <div className="font-mono text-[11px] text-ink-subtle">{s.sv}</div>}
          </div>
        ))}
      </div>

      <SectionH
        title="Recent sessions"
        right={
          <Btn variant="ghost" size="sm">
            View all <Icon name="chev" size={10} />
          </Btn>
        }
      />
      <div className="grid grid-cols-3 gap-3">
        {PROJECTS.map((p, i) => (
          <div
            key={i}
            onClick={() => goto("e2e")}
            className="cursor-pointer overflow-hidden rounded-lg border border-line bg-surface-panel transition-colors hover:border-line-strong"
          >
            <div className="relative grid h-[150px] grid-cols-2">
              <PhImg label={p.a.l} hue={p.a.h} className="!rounded-none" />
              <PhImg label={p.b.l} hue={p.b.h} className="!rounded-none" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 70%, rgba(16,24,40,.2))",
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <div className="min-w-0 truncate text-[13px] font-medium">{p.name}</div>
              <div className="flex-shrink-0 whitespace-nowrap font-mono text-[11px] text-ink-faint">
                ΔE {p.de}
              </div>
            </div>
            <div className="flex gap-1 px-3 pb-2.5">
              {p.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
              <Badge variant="accent" dot>
                active
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <SectionH
        title="Activity"
        right={
          <Btn variant="ghost" size="sm">
            All logs <Icon name="chev" size={10} />
          </Btn>
        }
      />
      <div className="rounded-lg border border-line bg-surface-panel py-1">
        {ACTIVITY.map((a, i) => (
          <div
            key={i}
            className="grid grid-cols-[16px_1fr_auto_auto] items-center gap-3 border-b border-line-divider px-4 py-2.5 text-[12px] last:border-b-0"
          >
            <span className="text-ink-subtle">
              <Icon name={a.ic} size={13} />
            </span>
            <span>{a.txt}</span>
            <span className="font-mono text-[11px] text-ink-muted">{a.who}</span>
            <span className="font-mono text-[11px] text-ink-faint">{a.t}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
