import { Link } from 'react-router-dom'
import { useApp } from '../lib/store'
import { PageHead, ClassBadge, BcrPill, ScoreBar } from '../components/ui'
import { HAZARDS, SECTORS, INTERVENTION_TYPES, SURVIVAL, label } from '../data/taxonomy'

export default function Compare() {
  const { t, lang, records, compare, toggleCompare, tx, money, num } = useApp()
  const items = compare.map((id) => records.find((r) => r.id === id)).filter(Boolean)
  const d = t.detail

  const rows = [
    [t.effectiveness, (r) => <ClassBadge cls={r.cls} />],
    [t.bcr, (r) => <BcrPill value={r.bcr} />],
    [t.mcda, (r) => <><b>{num(r.mcda, 2)}</b> <ScoreBar value={r.mcda} /></>],
    [d.location, (r) => `${r.upazila}, ${r.district}`],
    [t.hazard, (r) => r.hazards.map((h) => label(HAZARDS, h, lang)).join(', ')],
    [t.sector, (r) => label(SECTORS, r.sector, lang)],
    [t.type, (r) => label(INTERVENTION_TYPES, r.type, lang)],
    [d.implementer, (r) => r.implementer],
    [d.capex, (r) => money(r.capex)],
    [d.maint, (r) => money(r.maint)],
    [d.avoided, (r) => (r.benefit == null ? t.notCalc : money(r.benefit))],
    [d.beneficiaries, (r) => num(r.beneficiaries.total)],
    [d.women, (r) => num(r.beneficiaries.women)],
    [d.consulted, (r) => (r.consulted ? d.yes : d.no)],
    [d.survival, (r) => label(SURVIVAL, r.survival, lang)],
    ...Object.keys(t.crit).filter((k) => k !== 'cost').map((k) => [t.crit[k], (r) => <><b>{num(r.scores[k], 1)}</b> <ScoreBar value={r.scores[k]} /></>]),
    [d.lessons, (r) => <span className="small">{tx(r.lessons)}</span>],
  ]

  return (
    <>
      <PageHead title={t.compareTitle} />
      <div className="container page-body">
        {items.length < 2 ? (
          <div className="empty">
            {t.compare}: {items.length}/3 — <Link to="/inventory">{t.nav.inventory}</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table compare-table">
              <thead>
                <tr>
                  <th />
                  {items.map((r) => (
                    <th key={r.id}>
                      <Link to={`/record/${r.id}`}>{tx(r.title)}</Link>
                      <button className="btn-link small" onClick={() => toggleCompare(r.id)}>✕</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, fn]) => (
                  <tr key={k}>
                    <th>{k}</th>
                    {items.map((r) => <td key={r.id}>{fn(r)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
