import { useState } from 'react'
import type { PipelineView, CompareMode } from '../../types'
import { PIPELINE } from '../../data'
import { Icon } from '../Icon'
import { Seg } from '../Seg'
import { NodeGraph } from './NodeGraph'
import { StepList } from './StepList'
import { Timeline } from './Timeline'
import { CompareViewer } from './CompareViewer'
import { TuningPanel } from './TuningPanel'

export function E2EPage() {
  const [pipeView, setPipeView] = useState<PipelineView>('node')
  const [cmpMode, setCmpMode] = useState<CompareMode>('split')
  const [sel, setSel] = useState('tone')
  const [bypass, setBypass] = useState(false)
  const [pipeH, setPipeH] = useState(260)

  const totalMs = PIPELINE.reduce((a, _, i) => a + (1.2 + i * 0.31), 0)

  return (
    <div className="e2e">
      <style>{`
        .e2e { display: grid; grid-template-columns: 1fr 320px; height: 100%; }
        .e2e-main { display: grid; grid-template-rows: 1fr auto ${pipeH}px; min-width: 0; }
        .e2e-compare { min-height: 0; }
        .e2e-resizer {
          height: 6px; background: var(--panel);
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          cursor: row-resize; position: relative;
        }
        .e2e-resizer::after {
          content: ""; position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 28px; height: 2px; background: var(--border-strong); border-radius: 2px;
        }
        .e2e-pipe { border-top: 0; display: flex; flex-direction: column; min-height: 0; background: var(--panel); }
        .e2e-pipe-head {
          padding: 8px 12px; display: flex; align-items: center; gap: 10px;
          border-bottom: 1px solid var(--border); font-size: 12px;
        }
        .e2e-pipe-head h4 {
          margin: 0; font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.06em; font-weight: 600; color: var(--fg-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
        }
        .e2e-pipe-head .badge { flex-shrink: 0; }
        .e2e-pipe-body { flex: 1; min-height: 0; position: relative; }
      `}</style>

      <div className="e2e-main">
        <div className="e2e-compare">
          <CompareViewer mode={cmpMode} onMode={setCmpMode} />
        </div>

        <div
          className="e2e-resizer"
          onMouseDown={(e) => {
            const startY = e.clientY, startH = pipeH
            const move = (ev: MouseEvent) => setPipeH(Math.max(140, Math.min(500, startH + (startY - ev.clientY))))
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
            window.addEventListener('mousemove', move)
            window.addEventListener('mouseup', up)
          }}
        />

        <div className="e2e-pipe">
          <div className="e2e-pipe-head">
            <h4>Pipeline · Sensor-A · Night Tuning Pass 3</h4>
            <span className="badge accent dot">Rev 7</span>
            <span className="badge mono">{PIPELINE.length} blocks</span>
            <span className="badge mono">~{totalMs.toFixed(1)} ms</span>
            <div style={{ flex: 1 }} />
            <Seg<PipelineView>
              value={pipeView} onChange={setPipeView}
              options={[
                { v: 'node',     label: 'Node',     icon: 'node' },
                { v: 'list',     label: 'List',     icon: 'list' },
                { v: 'timeline', label: 'Timeline', icon: 'timeline' },
              ]}
            />
            <button className="btn sm"><Icon name="plus" size={11} /> Add block</button>
            <button className="btn sm"><Icon name="play" size={11} /> Run</button>
            <button className="btn sm primary"><Icon name="zap" size={11} /> Live</button>
          </div>
          <div className="e2e-pipe-body">
            {pipeView === 'node'     && <NodeGraph  selected={sel} onSelect={setSel} />}
            {pipeView === 'list'     && <StepList   selected={sel} onSelect={setSel} />}
            {pipeView === 'timeline' && <Timeline   selected={sel} onSelect={setSel} />}
          </div>
        </div>
      </div>

      <TuningPanel blockId={sel} bypass={bypass} onToggleBypass={() => setBypass(b => !b)} />
    </div>
  )
}
