import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useApp } from '../lib/store'

const ROLES = ['public', 'contributor', 'institution', 'reviewer', 'admin']

export default function Header() {
  const { t, lang, setLang, role, setRole, records } = useApp()
  const [open, setOpen] = useState(false)
  const pending = records.filter((r) => ['submitted', 'under_review'].includes(r.workflow)).length

  const links = [
    ['/', t.nav.home],
    ['/explore', t.nav.explore],
    ['/inventory', t.nav.inventory],
    ['/dashboard', t.nav.dashboard],
    ['/submit', t.nav.submit],
  ]
  if (role === 'reviewer' || role === 'admin') links.push(['/review', t.nav.review, pending])
  if (role === 'admin') links.push(['/admin', t.nav.admin])

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-inner">
          <label className="role-switch">
            <span>{t.viewAs}:</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{t.roles[r]}</option>
              ))}
            </select>
          </label>
          <div className="utility-right">
            <Link to="/about">{t.nav.about}</Link>
            <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} aria-label="Switch language">
              {t.langToggle}
            </button>
          </div>
        </div>
      </div>
      <div className="main-bar">
        <div className="container main-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img src="/oxfam-logo.svg" alt="Oxfam" className="brand-logo" />
            <span className="brand-divider" />
            <span className="brand-text">
              <strong>{t.siteName}</strong>
              <small>{t.siteTag}</small>
            </span>
          </Link>
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            <span /><span /><span />
          </button>
          <nav className={`main-nav ${open ? 'open' : ''}`}>
            {links.map(([to, text, badge]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>
                {text}
                {badge ? <span className="nav-badge">{badge}</span> : null}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
