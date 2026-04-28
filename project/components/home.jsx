/* Home — recent projects, quick actions, recent images */

const Home = ({ goto }) => {
  return (
    <div className="home" data-screen-label="Home">
      <style>{`
        .home { height: 100%; overflow-y: auto; background: var(--bg); }
        .home-inner { max-width: 1280px; margin: 0 auto; padding: 36px 40px 80px; }
        .home h1 {
          font-size: 28px; font-weight: 600; margin: 0 0 2px;
          letter-spacing: -0.01em;
        }
        .home .sub { color: var(--fg-muted); font-size: 13px; margin-bottom: 28px; }
        .home .quick {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          margin-bottom: 32px;
        }
        .home .qcard {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 16px 18px;
          cursor: pointer;
          display: flex; flex-direction: column; gap: 8px;
          text-align: left;
          transition: border-color .1s, transform .1s;
        }
        .home .qcard:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        .home .qcard .ic {
          width: 32px; height: 32px; border-radius: var(--r-sm);
          background: var(--accent-soft);
          color: var(--accent);
          display: flex; align-items: center; justify-content: center;
        }
        .home .qcard h3 { margin: 0; font-size: 14px; font-weight: 600; }
        .home .qcard p { margin: 0; color: var(--fg-muted); font-size: 12px; }
        .home .qcard .kbd-row { display: flex; gap: 4px; margin-top: auto; padding-top: 8px; }

        .home .section-h {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin: 28px 0 12px;
          gap: 12px;
        }
        .home .section-h h2 {
          font-size: 12px; font-weight: 600; margin: 0;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--fg-muted);
          white-space: nowrap;
        }
        .home .section-h > span { white-space: nowrap; }

        .recent-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        .proj {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          overflow: hidden;
          cursor: pointer;
          transition: border-color .1s;
        }
        .proj:hover { border-color: var(--border-strong); }
        .proj .preview { height: 150px; position: relative; display: grid; grid-template-columns: 1fr 1fr; }
        .proj .preview::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 70%, rgba(16,24,40,.2));
        }
        .proj .meta { padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .proj .meta .name { font-size: 13px; font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .proj .meta .t { font-size: 11px; color: var(--fg-faint); font-family: var(--font-mono); white-space: nowrap; flex-shrink: 0; }
        .proj .tags { display: flex; gap: 4px; padding: 0 12px 10px; }

        .stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
          margin-bottom: 0;
        }
        .stat {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 12px 14px;
        }
        .stat .l { font-size: 10px; color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .stat .v { font-size: 22px; font-weight: 600; font-family: var(--font-mono); margin-top: 2px; }
        .stat .sv { font-size: 11px; color: var(--fg-subtle); font-family: var(--font-mono); }
        .stat .delta { font-size: 10px; color: var(--ok); font-family: var(--font-mono); }

        .activity {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 4px 0;
        }
        .activity .row {
          display: grid;
          grid-template-columns: 16px 1fr auto auto;
          gap: 12px;
          align-items: center;
          padding: 9px 16px;
          border-bottom: 1px solid var(--divider);
          font-size: 12px;
        }
        .activity .row:last-child { border-bottom: 0; }
        .activity .row .ic { color: var(--fg-subtle); }
        .activity .row .who { color: var(--fg-muted); font-family: var(--font-mono); font-size: 11px; }
        .activity .row .t { color: var(--fg-faint); font-family: var(--font-mono); font-size: 11px; }
      `}</style>
      <div className="home-inner">
        <h1>Good afternoon, Jiwon</h1>
        <p className="sub">3 sessions in progress · 48 images tuned this week · 2 reviews awaiting</p>

        <div className="quick">
          <button className="qcard" onClick={() => goto("e2e")}>
            <div className="ic"><Icon name="pipeline" size={16} /></div>
            <div>
              <h3>Open E2E Pipeline</h3>
              <p>Tune per-block ISP parameters on your current session.</p>
            </div>
            <div className="kbd-row">
              <span className="kbd-chip">⌘</span><span className="kbd-chip">E</span>
            </div>
          </button>
          <button className="qcard" onClick={() => goto("library")}>
            <div className="ic"><Icon name="folder" size={16} /></div>
            <div>
              <h3>Browse Library</h3>
              <p>Uploaded references and simulated outputs with tags.</p>
            </div>
            <div className="kbd-row">
              <span className="kbd-chip">⌘</span><span className="kbd-chip">L</span>
            </div>
          </button>
          <button className="qcard">
            <div className="ic"><Icon name="upload" size={16} /></div>
            <div>
              <h3>Upload Reference</h3>
              <p>Bring in a RAW, DNG, or tone-map target for comparison.</p>
            </div>
            <div className="kbd-row">
              <span className="kbd-chip">⌘</span><span className="kbd-chip">U</span>
            </div>
          </button>
        </div>

        <div className="section-h">
          <h2>Overview · this week</h2>
          <span className="mono" style={{ fontSize: 11, color: "var(--fg-faint)" }}>week 16 · Apr 13 – Apr 19</span>
        </div>
        <div className="stats-row">
          <div className="stat">
            <div className="l">Images tuned</div>
            <div className="v num">48</div>
            <div className="delta">↑ 12 vs last week</div>
          </div>
          <div className="stat">
            <div className="l">Active sessions</div>
            <div className="v num">3</div>
            <div className="sv">night · auto · hdr-a</div>
          </div>
          <div className="stat">
            <div className="l">ΔE avg (target)</div>
            <div className="v num">2.14</div>
            <div className="sv">target ≤ 3.0</div>
          </div>
          <div className="stat">
            <div className="l">Library</div>
            <div className="v num">1,284</div>
            <div className="sv">420 ref · 864 sim</div>
          </div>
        </div>

        <div className="section-h">
          <h2>Recent sessions</h2>
          <button className="btn sm ghost">View all <Icon name="chev" size={10} /></button>
        </div>
        <div className="recent-grid">
          {[
            { name: "Night scene · sensor-A v3", time: "2 min ago", tags: ["night","low-light"], a: { l: "ref", h: 30 }, b: { l: "sim", h: 240 }, de: "2.8" },
            { name: "HDR · outdoor portrait", time: "1h ago", tags: ["hdr","skin"], a: { l: "ref", h: 60 }, b: { l: "sim", h: 300 }, de: "1.9" },
            { name: "ColorChecker SG · D65", time: "Yesterday", tags: ["chart","calibration"], a: { l: "ref", h: 150 }, b: { l: "sim", h: 200 }, de: "1.2" },
          ].map((p, i) => (
            <div className="proj" key={i} onClick={() => goto("e2e")}>
              <div className="preview">
                <PhImg label={p.a.l} hue={p.a.h} style={{ borderRadius: 0 }} />
                <PhImg label={p.b.l} hue={p.b.h} style={{ borderRadius: 0 }} />
              </div>
              <div className="meta">
                <div className="name">{p.name}</div>
                <div className="t">ΔE {p.de}</div>
              </div>
              <div className="tags">
                {p.tags.map(t => <span key={t} className="badge">{t}</span>)}
                <span className="badge accent dot">active</span>
              </div>
            </div>
          ))}
        </div>

        <div className="section-h">
          <h2>Activity</h2>
          <button className="btn sm ghost">All logs <Icon name="chev" size={10} /></button>
        </div>
        <div className="activity">
          {[
            { ic: "pipeline", txt: <>Updated <b>Tone Curve</b> on <b>HDR · outdoor portrait</b></>, who: "jiwon.k", t: "12:44" },
            { ic: "check", txt: <>Approved simulation set <b>night-A-rev7</b> (18 images)</>, who: "j.park", t: "11:02" },
            { ic: "upload", txt: <>Uploaded 6 references to <b>ColorChecker SG</b></>, who: "jiwon.k", t: "09:18" },
            { ic: "tag", txt: <>Added tag <span className="badge accent">low-light</span> to 14 images</>, who: "s.nam", t: "Yesterday" },
            { ic: "folder", txt: <>Created collection <b>Sensor-A · Night Tuning Pass 3</b></>, who: "jiwon.k", t: "Apr 16" },
          ].map((a, i) => (
            <div className="row" key={i}>
              <span className="ic"><Icon name={a.ic} size={13} /></span>
              <span>{a.txt}</span>
              <span className="who">{a.who}</span>
              <span className="t">{a.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Home });
