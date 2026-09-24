import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../lib/store'

export default function CompareBar() {
  const { compare, records, tx, t, setCompare } = useApp()
  const { pathname } = useLocation()
  if (!compare.length || pathname === '/compare') return null
  const items = compare.map((id) => records.find((r) => r.id === id)).filter(Boolean)
  return (
    <div className="compare-bar">
      <div className="container compare-inner">
        <strong>{t.compare} ({items.length}/3)</strong>
        <div className="compare-chips">
          {items.map((r) => (
            <span key={r.id} className="chip">{tx(r.title)}</span>
          ))}
        </div>
        <button className="btn btn-ghost-light" onClick={() => setCompare([])}>✕</button>
        <Link to="/compare" className="btn btn-orange">{t.compareSel}</Link>
      </div>
    </div>
  )
}
