import type { ReactNode } from 'react'
import type { PageId } from '../types'
import { Icon } from './Icon'

interface TopBarProps {
  page: PageId
  onNav: (page: PageId) => void
  crumb?: ReactNode
}

export function TopBar({ page, onNav, crumb }: TopBarProps) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="dot" />
        WHALE
        <span className="ver">v0.4.2 · tuning studio</span>
      </div>

      <div className="nav" role="tablist">
        <button className={page === 'home' ? 'active' : ''} onClick={() => onNav('home')}>
          <Icon name="home" size={12} /> Home
        </button>
        <button className={page === 'e2e' ? 'active' : ''} onClick={() => onNav('e2e')}>
          <Icon name="pipeline" size={12} /> E2E
        </button>
        <button className={page === 'library' ? 'active' : ''} onClick={() => onNav('library')}>
          <Icon name="folder" size={12} /> Library
        </button>
      </div>

      <div className="right">
        {crumb && <div className="crumb">{crumb}</div>}
        <button className="btn sm ghost" title="Sync">
          <Icon name="clock" size={12} />
          <span className="mono">2m ago</span>
        </button>
        <button className="btn sm ghost icon" title="Settings">
          <Icon name="settings" size={13} />
        </button>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'oklch(0.72 0.08 220)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          JK
        </div>
      </div>
    </div>
  )
}
