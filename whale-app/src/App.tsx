import { useState, useEffect } from 'react'
import type { PageId, Tweaks, AccentColor, DensityMode } from './types'
import type { MockUser } from './api'
import { mockLogin, fetchMe } from './api'
import { TopBar } from './components/TopBar'
import { Home } from './components/Home'
import { E2EPage } from './components/e2e/E2EPage'
import { Library } from './components/Library'
import { Icon } from './components/Icon'
import { Seg } from './components/Seg'

const TWEAK_DEFAULTS: Tweaks = {
  accent: 'ocean',
  density: 'comfortable',
  monoMeta: true,
}

function LoginPanel({ onLogin }: { onLogin: (user: MockUser) => void }) {
  const [email, setEmail] = useState('isp.engineer@whale.local')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const signIn = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await mockLogin(email)
      localStorage.setItem('whale:token', data.token)
      onLogin(data.user)
    } catch {
      setError('mock login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card panel">
        <div className="panel-header"><span className="title">Mock Sign-In</span></div>
        <div className="panel-body">
          <div className="field">
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <p className="login-help">isp.engineer@whale.local / review.engineer@whale.local</p>
          {error && <div className="badge warn">{error}</div>}
          <button className="btn primary login-btn" onClick={signIn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in (Mock)'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TweaksPanel({ tweaks, setTweak, onClose }: {
  tweaks: Tweaks
  setTweak: (k: keyof Tweaks, v: Tweaks[keyof Tweaks]) => void
  onClose: () => void
}) {
  return (
    <div className="tweaks">
      <header>
        <span>Tweaks</span>
        <button className="btn sm ghost icon" onClick={onClose}><Icon name="close" size={12} /></button>
      </header>
      <div className="body">
        <div className="tweak-group">
          <span className="t-label">Accent color</span>
          <div className="swatch-row">
            {[
              { k: 'ocean'    as AccentColor, c: 'oklch(0.58 0.13 220)' },
              { k: 'teal'     as AccentColor, c: 'oklch(0.60 0.11 185)' },
              { k: 'amber'    as AccentColor, c: 'oklch(0.70 0.14 55)'  },
              { k: 'graphite' as AccentColor, c: 'oklch(0.36 0.02 260)' },
            ].map(s => (
              <button
                key={s.k}
                className={tweaks.accent === s.k ? 'active' : ''}
                style={{ background: s.c }}
                onClick={() => setTweak('accent', s.k)}
                title={s.k}
              />
            ))}
          </div>
        </div>
        <div className="tweak-group">
          <span className="t-label">Density</span>
          <Seg<DensityMode>
            value={tweaks.density}
            onChange={(v) => setTweak('density', v)}
            options={[
              { v: 'compact',     label: 'Compact' },
              { v: 'comfortable', label: 'Comfortable' },
              { v: 'spacious',    label: 'Spacious' },
            ]}
          />
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-faint)', borderTop: '1px solid var(--divider)', paddingTop: 8 }}>
          hint · try node vs list vs timeline in E2E, split vs slider compare
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<PageId>(() => (localStorage.getItem('whale:page') as PageId) ?? 'home')
  const [tweaksOn, setTweaksOn] = useState(false)
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS)
  const [user, setUser] = useState<MockUser | null>(null)
  const [checkingUser, setCheckingUser] = useState(true)

  useEffect(() => {
    fetchMe().then((me) => {
      setUser(me)
      setCheckingUser(false)
    })
  }, [])

  useEffect(() => { localStorage.setItem('whale:page', page) }, [page])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-accent', tweaks.accent === 'ocean' ? '' : tweaks.accent)
    root.style.setProperty('--density-pad', tweaks.density === 'compact' ? '6px' : tweaks.density === 'spacious' ? '16px' : '10px')
  }, [tweaks])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return
      if (e.data.type === '__activate_edit_mode') setTweaksOn(true)
      if (e.data.type === '__deactivate_edit_mode') setTweaksOn(false)
    }
    window.addEventListener('message', onMsg)
    window.parent.postMessage({ type: '__edit_mode_available' }, '*')
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const setTweak = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    setTweaks(prev => ({ ...prev, [k]: v }))
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*')
  }

  if (checkingUser) {
    return <div className="loading">checking session…</div>
  }

  if (!user) {
    return <LoginPanel onLogin={setUser} />
  }

  const crumb = page === 'e2e' ? (
    <>
      <span>sensor-A</span><span className="sep">/</span>
      <span>night-tuning</span><span className="sep">/</span>
      <span style={{ color: 'var(--fg)' }}>pass-3 · rev-7</span>
    </>
  ) : page === 'library' ? (
    <><span>library</span><span className="sep">/</span><span style={{ color: 'var(--fg)' }}>all images</span></>
  ) : null

  return (
    <div className="app">
      <TopBar page={page} onNav={setPage} crumb={crumb} />
      <div className="content">
        {page === 'home'    && <Home goto={setPage} />}
        {page === 'e2e'     && <E2EPage />}
        {page === 'library' && <Library />}
      </div>
      {tweaksOn && (
        <TweaksPanel
          tweaks={tweaks}
          setTweak={setTweak}
          onClose={() => setTweaksOn(false)}
        />
      )}
    </div>
  )
}
