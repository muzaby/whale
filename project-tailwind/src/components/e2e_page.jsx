import React from "react";
import { CompareViewer } from "./compare.jsx";
import { NodeGraph, StepList, Timeline } from "./e2e_pipeline.jsx";
import { PIPELINE } from "../data/pipeline.js";
import { Badge, Btn, Icon, Seg } from "./primitives.jsx";
import { TuningPanel } from "./tuning_panel.jsx";

export const E2E = () => {
  const [pipeView, setPipeView] = React.useState("node");
  const [cmpMode, setCmpMode] = React.useState("split");
  const [sel, setSel] = React.useState("tone");
  const [bypass, setBypass] = React.useState(false);
  const [pipeH, setPipeH] = React.useState(260);

  const totalMs = PIPELINE.reduce((a, _, i) => a + (1.2 + i * 0.31), 0);

  return (
    <div data-screen-label="E2E" className="grid h-full grid-cols-[1fr_320px]">
      <div
        className="grid min-w-0"
        style={{ gridTemplateRows: `1fr auto ${pipeH}px` }}
      >
        <div className="min-h-0">
          <CompareViewer mode={cmpMode} onMode={setCmpMode} />
        </div>

        <div
          onMouseDown={(e) => {
            const startY = e.clientY;
            const startH = pipeH;
            const move = (ev) =>
              setPipeH(Math.max(140, Math.min(500, startH + (startY - ev.clientY))));
            const up = () => {
              window.removeEventListener("mousemove", move);
              window.removeEventListener("mouseup", up);
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
          className="relative h-1.5 cursor-row-resize border-y border-line bg-surface-panel"
        >
          <div className="absolute left-1/2 top-1/2 h-0.5 w-7 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-line-strong" />
        </div>

        <div className="flex min-h-0 flex-col bg-surface-panel">
          <div className="flex items-center gap-2.5 border-b border-line px-3 py-2 text-[12px]">
            <h4 className="m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              Pipeline · Sensor-A · Night Tuning Pass 3
            </h4>
            <Badge variant="accent" dot className="flex-shrink-0">
              Rev 7
            </Badge>
            <Badge className="flex-shrink-0">
              <span className="font-mono">{PIPELINE.length} blocks</span>
            </Badge>
            <Badge className="flex-shrink-0">
              <span className="font-mono">~{totalMs.toFixed(1)} ms</span>
            </Badge>
            <div className="flex-1" />
            <Seg
              value={pipeView}
              onChange={setPipeView}
              options={[
                { v: "node", label: "Node", icon: "node" },
                { v: "list", label: "List", icon: "list" },
                { v: "timeline", label: "Timeline", icon: "timeline" },
              ]}
            />
            <Btn size="sm">
              <Icon name="plus" size={11} /> Add block
            </Btn>
            <Btn size="sm">
              <Icon name="play" size={11} /> Run
            </Btn>
            <Btn variant="primary" size="sm">
              <Icon name="zap" size={11} /> Live
            </Btn>
          </div>
          <div className="relative min-h-0 flex-1">
            {pipeView === "node" && <NodeGraph selected={sel} onSelect={setSel} />}
            {pipeView === "list" && <StepList selected={sel} onSelect={setSel} />}
            {pipeView === "timeline" && <Timeline selected={sel} onSelect={setSel} />}
          </div>
        </div>
      </div>

      <TuningPanel
        blockId={sel}
        bypass={bypass}
        onToggleBypass={() => setBypass((b) => !b)}
      />
    </div>
  );
};
