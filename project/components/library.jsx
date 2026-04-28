/* Library — grid + list, filters, tags */

const LIB_ITEMS = [
  { id: 1, name: "night_0042_ref.dng",     src: "ref", tags: ["night","low-light","street"],  hue: 210, fav: true,  w: 6000, h: 4000, iso: 6400, date: "Apr 18", session: "night-A" },
  { id: 2, name: "night_0042_sim-r7.jpg",  src: "sim", tags: ["night","rev-7"],                hue: 45,  fav: true,  w: 1920, h: 1080, iso: null,  date: "Apr 18", session: "night-A" },
  { id: 3, name: "hdr_portrait_ref.cr3",   src: "ref", tags: ["hdr","skin","portrait"],        hue: 60,  fav: false, w: 6720, h: 4480, iso: 400,  date: "Apr 17", session: "hdr-outdoor" },
  { id: 4, name: "hdr_portrait_sim-r4.jpg",src: "sim", tags: ["hdr","skin","rev-4"],           hue: 300, fav: false, w: 1920, h: 1080, iso: null, date: "Apr 17", session: "hdr-outdoor" },
  { id: 5, name: "colorchecker_SG_D65.dng",src: "ref", tags: ["chart","calibration","D65"],    hue: 150, fav: true,  w: 5472, h: 3648, iso: 100,  date: "Apr 16", session: "calibration" },
  { id: 6, name: "colorchecker_SG_sim.jpg",src: "sim", tags: ["chart","calibration"],          hue: 200, fav: false, w: 5472, h: 3648, iso: null, date: "Apr 16", session: "calibration" },
  { id: 7, name: "mixed_light_cafe.dng",   src: "ref", tags: ["mixed-light","indoor"],         hue: 25,  fav: false, w: 6000, h: 4000, iso: 1600, date: "Apr 15", session: "auto-wb" },
  { id: 8, name: "mixed_light_cafe_sim.jpg",src: "sim",tags: ["mixed-light","rev-2"],          hue: 80,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 15", session: "auto-wb" },
  { id: 9, name: "skin_tone_patch_01.tif", src: "ref", tags: ["skin","reference"],             hue: 30,  fav: true,  w: 3000, h: 2000, iso: 200,  date: "Apr 14", session: "skin-study" },
  { id:10, name: "skin_tone_sim-v2.jpg",   src: "sim", tags: ["skin","rev-2"],                 hue: 40,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 14", session: "skin-study" },
  { id:11, name: "backlit_tree_ref.raf",   src: "ref", tags: ["hdr","backlit","foliage"],      hue: 130, fav: false, w: 7008, h: 4672, iso: 320,  date: "Apr 12", session: "hdr-outdoor" },
  { id:12, name: "backlit_tree_sim-r1.jpg",src: "sim", tags: ["hdr","backlit","rev-1"],        hue: 95,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 12", session: "hdr-outdoor" },
  { id:13, name: "neon_signage_street.dng",src: "ref", tags: ["night","neon","street"],        hue: 325, fav: false, w: 6000, h: 4000, iso: 3200, date: "Apr 11", session: "night-A" },
  { id:14, name: "neon_signage_sim-r5.jpg",src: "sim", tags: ["night","neon","rev-5"],         hue: 290, fav: true,  w: 1920, h: 1080, iso: null, date: "Apr 11", session: "night-A" },
  { id:15, name: "gray_card_18pct.dng",    src: "ref", tags: ["chart","reference"],            hue: 240, fav: false, w: 3000, h: 2000, iso: 100,  date: "Apr 10", session: "calibration" },
  { id:16, name: "sunset_lake_ref.cr3",    src: "ref", tags: ["outdoor","sunset"],             hue: 20,  fav: false, w: 6720, h: 4480, iso: 200,  date: "Apr 09", session: "golden-hour" },
  { id:17, name: "sunset_lake_sim-r3.jpg", src: "sim", tags: ["outdoor","sunset","rev-3"],     hue: 50,  fav: false, w: 1920, h: 1080, iso: null, date: "Apr 09", session: "golden-hour" },
  { id:18, name: "office_daylight_ref.dng",src: "ref", tags: ["indoor","daylight"],            hue: 190, fav: false, w: 6000, h: 4000, iso: 400,  date: "Apr 08", session: "auto-wb" },
];

const COLLECTIONS = [
  { name: "All images",          count: 1284, icon: "img",    id: "all" },
  { name: "References",          count: 420,  icon: "camera", id: "ref" },
  { name: "Simulations",         count: 864,  icon: "sparkle",id: "sim" },
  { name: "Favorites",           count: 42,   icon: "star",   id: "fav" },
];
const SESSIONS = [
  { name: "night-A · Pass 3",   count: 18, active: true },
  { name: "hdr-outdoor",        count: 24 },
  { name: "calibration · D65",  count: 36 },
  { name: "skin-study",         count: 12 },
  { name: "auto-wb",            count: 48 },
  { name: "golden-hour",        count: 22 },
];
const ALL_TAGS = [
  { name: "night", count: 42 }, { name: "hdr", count: 28 }, { name: "skin", count: 19 },
  { name: "low-light", count: 22 }, { name: "chart", count: 16 }, { name: "calibration", count: 16 },
  { name: "portrait", count: 14 }, { name: "street", count: 22 }, { name: "neon", count: 8 },
  { name: "mixed-light", count: 12 }, { name: "indoor", count: 26 }, { name: "outdoor", count: 38 },
  { name: "backlit", count: 7 }, { name: "foliage", count: 5 }, { name: "sunset", count: 11 },
  { name: "rev-7", count: 4 }, { name: "rev-5", count: 6 },
];

const Library = () => {
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

  const filtered = LIB_ITEMS.filter(it => {
    if (srcFilter !== "all" && it.src !== srcFilter) return false;
    if (filter === "fav" && !it.fav) return false;
    if (filter === "ref" && it.src !== "ref") return false;
    if (filter === "sim" && it.src !== "sim") return false;
    return true;
  });

  return (
    <div className="lib" data-screen-label="Library">
      <style>{`
        .lib { display: grid; grid-template-columns: 220px 1fr; height: 100%; }

        .lib-side { background: var(--panel); border-right: 1px solid var(--border); overflow-y: auto; padding: 10px 8px; }
        .lib-side .sh {
          font-size: 10px; font-weight: 600; color: var(--fg-muted);
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 10px 8px 6px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .lib-side .sh button { border: 0; background: transparent; cursor: pointer; color: var(--fg-faint); padding: 2px; }
        .lib-side .it {
          display: grid; grid-template-columns: 14px 1fr auto; gap: 8px;
          align-items: center; padding: 5px 8px;
          border-radius: var(--r-xs); cursor: pointer; font-size: 12px;
          color: var(--fg);
        }
        .lib-side .it:hover { background: var(--bg-subtle); }
        .lib-side .it.active { background: var(--accent-soft); color: var(--accent); }
        .lib-side .it .c { font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint); }
        .lib-side .it.active .c { color: var(--accent); opacity: .7; }
        .lib-side .it .ic { color: var(--fg-subtle); }
        .lib-side .it.active .ic { color: var(--accent); }

        .lib-tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; border-radius: 10px;
          background: var(--bg-subtle); border: 1px solid var(--border);
          font-size: 11px; color: var(--fg-muted); font-family: var(--font-mono);
          cursor: pointer; margin: 0 4px 4px 0;
        }
        .lib-tag:hover { color: var(--fg); border-color: var(--border-strong); }
        .lib-tag.active { background: var(--fg); color: var(--panel); border-color: var(--fg); }
        .lib-tag .c { opacity: .6; font-size: 10px; }

        .lib-main { display: flex; flex-direction: column; min-width: 0; }
        .lib-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-bottom: 1px solid var(--border);
          background: var(--panel);
        }
        .lib-bar h2 { font-size: 16px; margin: 0 10px 0 0; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .lib-bar .input.search { width: 260px; }
        .lib-sub {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px;
          border-bottom: 1px solid var(--divider);
          background: var(--bg-subtle);
          font-size: 11px; color: var(--fg-muted);
          overflow-x: auto;
        }
        .lib-content { flex: 1; overflow-y: auto; padding: 14px; background: var(--bg-subtle); }

        /* Grid view */
        .lib-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 10px;
        }
        .lib-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transition: border-color .1s;
        }
        .lib-card:hover { border-color: var(--border-strong); }
        .lib-card.sel { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
        .lib-card .thumb { aspect-ratio: 4 / 3; position: relative; }
        .lib-card .thumb .src-badge {
          position: absolute; top: 6px; left: 6px; z-index: 2;
        }
        .lib-card .thumb .fav {
          position: absolute; top: 6px; right: 6px; z-index: 2;
          background: rgba(255,255,255,.85); border: 0;
          width: 22px; height: 22px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
        }
        .lib-card .meta { padding: 8px 10px; }
        .lib-card .name { font-family: var(--font-mono); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lib-card .m2 { font-family: var(--font-mono); font-size: 10px; color: var(--fg-faint); margin-top: 2px; display: flex; justify-content: space-between; }
        .lib-card .chk {
          position: absolute; top: 6px; left: 6px; z-index: 3;
          width: 18px; height: 18px; border-radius: 3px;
          background: rgba(255,255,255,.9); border: 1px solid var(--border-strong);
          display: none; align-items: center; justify-content: center;
        }
        .lib-card:hover .chk, .lib-card.sel .chk { display: flex; }
        .lib-card.sel .chk { background: var(--accent); border-color: var(--accent); color: white; }

        /* List view */
        .lib-table {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          overflow: hidden;
        }
        .lib-table .th, .lib-table .tr {
          display: grid;
          grid-template-columns: 24px 56px 2fr 0.8fr 1.4fr 0.9fr 0.9fr 0.7fr 0.5fr;
          gap: 10px; align-items: center;
          padding: 7px 12px;
        }
        .lib-table .th {
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--fg-muted); background: var(--bg-subtle);
          border-bottom: 1px solid var(--border);
        }
        .lib-table .tr {
          border-bottom: 1px solid var(--divider); font-size: 12px; cursor: pointer;
        }
        .lib-table .tr:last-child { border-bottom: 0; }
        .lib-table .tr:hover { background: var(--bg-subtle); }
        .lib-table .tr.sel { background: var(--accent-soft); }
        .lib-table .tr .name { font-family: var(--font-mono); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lib-table .tr .mono { color: var(--fg-muted); font-size: 11px; }
        .lib-table .tr .thumb { width: 48px; height: 32px; border-radius: 3px; overflow: hidden; }
        .lib-table .tags { display: flex; gap: 3px; flex-wrap: nowrap; overflow: hidden; }
        .lib-table .tags .tg { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); background: var(--bg-subtle); border: 1px solid var(--border); padding: 0 5px; border-radius: 8px; white-space: nowrap; }
      `}</style>

      {/* Sidebar */}
      <div className="lib-side">
        <div className="sh">Collections <button><Icon name="plus" size={12} /></button></div>
        {COLLECTIONS.map(c => (
          <div key={c.id} className={`it ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>
            <Icon name={c.icon} size={13} className="ic" />
            <span>{c.name}</span>
            <span className="c num">{c.count}</span>
          </div>
        ))}

        <div className="sh">Sessions <button><Icon name="plus" size={12} /></button></div>
        {SESSIONS.map(s => (
          <div key={s.name} className={`it ${s.active ? "active" : ""}`}>
            <Icon name="folder" size={13} className="ic" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
            <span className="c num">{s.count}</span>
          </div>
        ))}

        <div className="sh">Tags</div>
        <div style={{ padding: "0 6px" }}>
          {ALL_TAGS.slice(0, 12).map(t => (
            <span key={t.name} className={`lib-tag ${activeTags.has(t.name) ? "active" : ""}`} onClick={() => toggleTag(t.name)}>
              {t.name}<span className="c">{t.count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="lib-main">
        <div className="lib-bar">
          <h2>{COLLECTIONS.find(c => c.id === filter)?.name || "All images"}</h2>
          <input className="input search" placeholder="Search images, tags, sessions…" />
          <div className="spacer" style={{ flex: 1 }} />
          <Seg value={srcFilter} onChange={setSrcFilter} options={[
            { v: "all", label: "All" },
            { v: "ref", label: "Ref" },
            { v: "sim", label: "Sim" },
          ]} />
          <button className="btn sm"><Icon name="filter" size={12} /> Filter</button>
          <Seg value={view} onChange={setView} options={[
            { v: "grid", label: "", icon: "grid" },
            { v: "list", label: "", icon: "list" },
          ]} />
          <button className="btn sm primary"><Icon name="upload" size={11} /> Upload</button>
        </div>

        <div className="lib-sub">
          <span className="mono">{filtered.length} of {LIB_ITEMS.length} items</span>
          <span style={{ color: "var(--fg-faint)" }}>·</span>
          <span className="mono">{selected.size} selected</span>
          {selected.size > 0 && (
            <>
              <button className="btn sm"><Icon name="tag" size={11} /> Tag</button>
              <button className="btn sm"><Icon name="folder" size={11} /> Add to…</button>
              <button className="btn sm"><Icon name="star" size={11} /> Favorite</button>
              <button className="btn sm primary"><Icon name="split" size={11} /> Compare in E2E</button>
            </>
          )}
          <div className="spacer" style={{ flex: 1 }} />
          <span className="mono" style={{ color: "var(--fg-faint)" }}>sort: date ↓</span>
          <span className="mono" style={{ color: "var(--fg-faint)" }}>· group: session</span>
        </div>

        <div className="lib-content">
          {view === "grid" ? (
            <div className="lib-grid">
              {filtered.map(it => (
                <div key={it.id}
                  className={`lib-card ${selected.has(it.id) ? "sel" : ""}`}
                  onClick={() => toggleSel(it.id)}>
                  <div className="thumb">
                    <span className={`badge ${it.src === "ref" ? "" : "sim"} dot src-badge`}>{it.src.toUpperCase()}</span>
                    <div className="chk">{selected.has(it.id) && <Icon name="check" size={12} />}</div>
                    <PhImg label={it.src === "ref" ? "reference" : "simulation"} hue={it.hue} style={{ height: "100%", borderRadius: 0 }} />
                    <button className="fav" onClick={(e) => e.stopPropagation()}>
                      <Icon name="star" size={12} stroke={1.4} style={{ color: it.fav ? "oklch(0.72 0.15 75)" : "var(--fg-subtle)", fill: it.fav ? "oklch(0.75 0.15 75)" : "none" }} />
                    </button>
                  </div>
                  <div className="meta">
                    <div className="name" title={it.name}>{it.name}</div>
                    <div className="m2">
                      <span>{it.w}×{it.h}</span>
                      <span>{it.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lib-table">
              <div className="th">
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
              {filtered.map(it => (
                <div key={it.id} className={`tr ${selected.has(it.id) ? "sel" : ""}`} onClick={() => toggleSel(it.id)}>
                  <span>
                    <div style={{ width: 14, height: 14, border: "1px solid var(--border-strong)", borderRadius: 3, background: selected.has(it.id) ? "var(--accent)" : "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                      {selected.has(it.id) && <Icon name="check" size={10} />}
                    </div>
                  </span>
                  <div className="thumb">
                    <PhImg label="" hue={it.hue} style={{ height: "100%", borderRadius: 0, fontSize: 8 }} />
                  </div>
                  <span className="name">
                    {it.fav && <Icon name="star" size={11} style={{ color: "oklch(0.72 0.15 75)", marginRight: 4 }} />}
                    {it.name}
                  </span>
                  <span><span className={`badge ${it.src === "ref" ? "" : "sim"} dot`}>{it.src.toUpperCase()}</span></span>
                  <span className="tags">{it.tags.slice(0, 3).map(t => <span key={t} className="tg">{t}</span>)}</span>
                  <span className="mono">{it.session}</span>
                  <span className="mono">{it.w}×{it.h}</span>
                  <span className="mono">{it.date}</span>
                  <span style={{ textAlign: "right" }}><button className="btn sm ghost icon"><Icon name="more" size={12} /></button></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Library });
