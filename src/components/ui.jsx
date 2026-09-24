import { Link } from 'react-router-dom'
import { useApp } from '../lib/store'
import { HAZARDS, SECTORS, label } from '../data/taxonomy'

export const CLS_COLOR = { good: '#44841a', mal: '#e70052', wip: '#f16e22' }

export function ClassBadge({ cls }) {
  const { t } = useApp()
  return <span className={`badge badge-${cls}`}>{t.cls[cls]}</span>
}

export function BcrPill({ value }) {
  const { t, num } = useApp()
  if (value == null) return <span className="pill pill-muted">{t.bcrShort}: {t.notCalc}</span>
  return (
    <span className={`pill ${value >= 1 ? 'pill-good' : 'pill-bad'}`}>
      {t.bcrShort} {num(value, 2)}
    </span>
  )
}

export function ScoreBar({ value, max = 5 }) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  const color = value >= 3.5 ? CLS_COLOR.good : value >= 2.5 ? CLS_COLOR.wip : CLS_COLOR.mal
  return (
    <span className="scorebar">
      <span style={{ width: `${pct}%`, background: color }} />
    </span>
  )
}

export function RecordCard({ r }) {
  const { tx, lang, money, t, compare, toggleCompare } = useApp()
  const inCompare = compare.includes(r.id)
  return (
    <article className="card record-card">
      <div className={`card-topline tl-${r.cls}`} />
      <div className="card-body">
        <div className="card-meta">
          <ClassBadge cls={r.cls} />
          <span className="muted small">{r.id}</span>
        </div>
        <h3><Link to={`/record/${r.id}`}>{tx(r.title)}</Link></h3>
        <p className="muted small">
          📍 {r.district}, {r.upazila} · {label(SECTORS, r.sector, lang)}
        </p>
        <div className="tags">
          {r.hazards.map((h) => (
            <span key={h} className="tag">{label(HAZARDS, h, lang)}</span>
          ))}
        </div>
        <div className="card-foot">
          <span className="money">{money(r.capex)}</span>
          <BcrPill value={r.bcr} />
        </div>
        <div className="card-actions">
          <Link to={`/record/${r.id}`} className="link-arrow">{t.viewDetails} →</Link>
          <label className="compare-check">
            <input type="checkbox" checked={inCompare} onChange={() => toggleCompare(r.id)} /> {t.compare}
          </label>
        </div>
      </div>
    </article>
  )
}

export function Section({ title, sub, children, className = '' }) {
  return (
    <section className={`section ${className}`}>
      <div className="container">
        {title && <h2 className="section-title">{title}</h2>}
        {sub && <p className="section-sub">{sub}</p>}
        {children}
      </div>
    </section>
  )
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div className="container">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
        {children}
      </div>
    </div>
  )
}
