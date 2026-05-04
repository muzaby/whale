import React from "react";
import { ALL_TAGS, COLLECTIONS, LIB_ITEMS, SESSIONS } from "../data/library.js";
import {
  Badge,
  Btn,
  cx,
  Icon,
  Input,
  PhImg,
  Seg,
} from "./primitives.jsx";

const SideHeader = ({ children, action }) => (
  <div className="flex items-center justify-between px-2 pb-1.5 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
    <span>{children}</span>
    {action && (
      <button className="border-0 bg-transparent p-0.5 text-ink-faint">{action}</button>
    )}
  </div>
);

const SideItem = ({ active, icon, name, count }) => (
  <div
    className={cx(
      "grid cursor-pointer grid-cols-[14px_1fr_auto] items-center gap-2 rounded-xs px-2 py-1.5 text-[12px]",
      active
        ? "bg-accent-soft text-accent"
        : "text-ink hover:bg-surface-subtle"
    )}
  >
    <Icon
      name={icon}
      size={13}
      className={active ? "text-accent" : "text-ink-subtle"}
    />
    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
    <span
      className={cx(
        "num font-mono text-[10px]",
        active ? "text-accent opacity-70" : "text-ink-faint"
      )}
    >
      {count}
    </span>
  </div>
);

const LibTag = ({ active, name, count, onClick }) => (
  <span
    onClick={onClick}
    className={cx(
      "mb-1 mr-1 inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-2 py-[3px] font-mono text-[11px]",
      active
        ? "border-ink bg-ink text-surface-panel"
        : "border-line bg-surface-subtle text-ink-muted hover:border-line-strong hover:text-ink"
    )}
  >
    {name}
    <span className="text-[10px] opacity-60">{count}</span>
  </span>
);

const TR_GRID = "grid-cols-[24px_56px_2fr_0.8fr_1.4fr_0.9fr_0.9fr_0.7fr_0.5fr]";

export const Library = () => {
  const [view, setView] = React.useState("grid");
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState(new Set([1, 2]));
  const [srcFilter, setSrcFilter] = React.useState("all");
  const [activeTags, setActiveTags] = React.useState(new Set(["night"]));

  const toggleTag = (t) => {
    const n = new Set(activeTags);
    n.has(t) ? n.delete(t) : n.add(t);
    setActiveTags(n);
  };
  const toggleSel = (id) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const filtered = LIB_ITEMS.filter((it) => {
    if (srcFilter !== "all" && it.src !== srcFilter) return false;
    if (filter === "fav" && !it.fav) return false;
    if (filter === "ref" && it.src !== "ref") return false;
    if (filter === "sim" && it.src !== "sim") return false;
    return true;
  });

  return (
    <div data-screen-label="Library" className="grid h-full grid-cols-[220px_1fr]">
      {/* Sidebar */}
      <div className="overflow-y-auto border-r border-line bg-surface-panel p-2.5">
        <SideHeader action={<Icon name="plus" size={12} />}>Collections</SideHeader>
        {COLLECTIONS.map((c) => (
          <div key={c.id} onClick={() => setFilter(c.id)}>
            <SideItem
              active={filter === c.id}
              icon={c.icon}
              name={c.name}
              count={c.count}
            />
          </div>
        ))}

        <SideHeader action={<Icon name="plus" size={12} />}>Sessions</SideHeader>
        {SESSIONS.map((s) => (
          <SideItem
            key={s.name}
            active={s.active}
            icon="folder"
            name={s.name}
            count={s.count}
          />
        ))}

        <SideHeader>Tags</SideHeader>
        <div className="px-1.5">
          {ALL_TAGS.slice(0, 12).map((t) => (
            <LibTag
              key={t.name}
              active={activeTags.has(t.name)}
              name={t.name}
              count={t.count}
              onClick={() => toggleTag(t.name)}
            />
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2 border-b border-line bg-surface-panel px-3.5 py-2.5">
          <h2 className="m-0 mr-2.5 flex-shrink-0 whitespace-nowrap text-[16px] font-semibold">
            {COLLECTIONS.find((c) => c.id === filter)?.name || "All images"}
          </h2>
          <Input
            search
            placeholder="Search images, tags, sessions…"
            className="w-[260px]"
          />
          <div className="flex-1" />
          <Seg
            value={srcFilter}
            onChange={setSrcFilter}
            options={[
              { v: "all", label: "All" },
              { v: "ref", label: "Ref" },
              { v: "sim", label: "Sim" },
            ]}
          />
          <Btn size="sm">
            <Icon name="filter" size={12} /> Filter
          </Btn>
          <Seg
            value={view}
            onChange={setView}
            options={[
              { v: "grid", label: "", icon: "grid" },
              { v: "list", label: "", icon: "list" },
            ]}
          />
          <Btn variant="primary" size="sm">
            <Icon name="upload" size={11} /> Upload
          </Btn>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-line-divider bg-surface-subtle px-3.5 py-2 text-[11px] text-ink-muted">
          <span className="font-mono">
            {filtered.length} of {LIB_ITEMS.length} items
          </span>
          <span className="text-ink-faint">·</span>
          <span className="font-mono">{selected.size} selected</span>
          {selected.size > 0 && (
            <>
              <Btn size="sm">
                <Icon name="tag" size={11} /> Tag
              </Btn>
              <Btn size="sm">
                <Icon name="folder" size={11} /> Add to…
              </Btn>
              <Btn size="sm">
                <Icon name="star" size={11} /> Favorite
              </Btn>
              <Btn variant="primary" size="sm">
                <Icon name="split" size={11} /> Compare in E2E
              </Btn>
            </>
          )}
          <div className="flex-1" />
          <span className="font-mono text-ink-faint">sort: date ↓</span>
          <span className="font-mono text-ink-faint">· group: session</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface-subtle p-3.5">
          {view === "grid" ? (
            <div className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
              {filtered.map((it) => {
                const isSel = selected.has(it.id);
                return (
                  <div
                    key={it.id}
                    onClick={() => toggleSel(it.id)}
                    className={cx(
                      "group relative cursor-pointer overflow-hidden rounded-md border bg-surface-panel transition-colors",
                      isSel
                        ? "border-accent shadow-[0_0_0_2px_var(--accent-soft)]"
                        : "border-line hover:border-line-strong"
                    )}
                  >
                    <div className="relative aspect-[4/3]">
                      <Badge
                        variant={it.src === "ref" ? "default" : "sim"}
                        dot
                        className="absolute left-1.5 top-1.5 z-[2]"
                      >
                        {it.src.toUpperCase()}
                      </Badge>
                      <div
                        className={cx(
                          "absolute left-1.5 top-1.5 z-[3] hidden h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-line-strong bg-white/90 group-hover:flex",
                          isSel && "!flex !border-accent !bg-accent !text-white"
                        )}
                      >
                        {isSel && <Icon name="check" size={12} />}
                      </div>
                      <PhImg
                        label={it.src === "ref" ? "reference" : "simulation"}
                        hue={it.hue}
                        className="!h-full !rounded-none"
                      />
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-1.5 top-1.5 z-[2] flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-0 bg-white/85 backdrop-blur"
                      >
                        <Icon
                          name="star"
                          size={12}
                          stroke={1.4}
                          style={{
                            color: it.fav
                              ? "oklch(0.72 0.15 75)"
                              : "var(--fg-subtle)",
                            fill: it.fav ? "oklch(0.75 0.15 75)" : "none",
                          }}
                        />
                      </button>
                    </div>
                    <div className="px-2.5 py-2">
                      <div
                        title={it.name}
                        className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px]"
                      >
                        {it.name}
                      </div>
                      <div className="mt-0.5 flex justify-between font-mono text-[10px] text-ink-faint">
                        <span>
                          {it.w}×{it.h}
                        </span>
                        <span>{it.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-line bg-surface-panel">
              <div
                className={cx(
                  "grid items-center gap-2.5 border-b border-line bg-surface-subtle px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted",
                  TR_GRID
                )}
              >
                <span />
                <span />
                <span>Name</span>
                <span>Source</span>
                <span>Tags</span>
                <span>Session</span>
                <span>Dimensions</span>
                <span>Date</span>
                <span />
              </div>
              {filtered.map((it) => {
                const isSel = selected.has(it.id);
                return (
                  <div
                    key={it.id}
                    onClick={() => toggleSel(it.id)}
                    className={cx(
                      "grid cursor-pointer items-center gap-2.5 border-b border-line-divider px-3 py-1.5 text-[12px] last:border-b-0 hover:bg-surface-subtle",
                      TR_GRID,
                      isSel && "bg-accent-soft hover:bg-accent-soft"
                    )}
                  >
                    <span>
                      <div
                        className={cx(
                          "flex h-[14px] w-[14px] items-center justify-center rounded-[3px] border text-white",
                          isSel
                            ? "border-line-strong bg-accent"
                            : "border-line-strong bg-surface-panel"
                        )}
                      >
                        {isSel && <Icon name="check" size={10} />}
                      </div>
                    </span>
                    <div className="h-8 w-12 overflow-hidden rounded-[3px]">
                      <PhImg
                        label=""
                        hue={it.hue}
                        className="!h-full !rounded-none !text-[8px]"
                      />
                    </div>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12px]">
                      {it.fav && (
                        <Icon
                          name="star"
                          size={11}
                          className="mr-1 inline-block align-middle"
                          style={{ color: "oklch(0.72 0.15 75)" }}
                        />
                      )}
                      {it.name}
                    </span>
                    <span>
                      <Badge variant={it.src === "ref" ? "default" : "sim"} dot>
                        {it.src.toUpperCase()}
                      </Badge>
                    </span>
                    <span className="flex gap-[3px] overflow-hidden">
                      {it.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="whitespace-nowrap rounded-lg border border-line bg-surface-subtle px-1.5 font-mono text-[10px] text-ink-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {it.session}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {it.w}×{it.h}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {it.date}
                    </span>
                    <span className="text-right">
                      <Btn variant="ghost" size="sm" icon>
                        <Icon name="more" size={12} />
                      </Btn>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
