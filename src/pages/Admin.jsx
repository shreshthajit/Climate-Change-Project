import { useApp } from '../lib/store'
import { PageHead, CLS_COLOR } from '../components/ui'
import { HAZARDS, SECTORS, INTERVENTION_TYPES, ECOSYSTEMS } from '../data/taxonomy'
import { DEFAULT_SETTINGS } from '../lib/scoring'

const DEMO_USERS = [
  ['Nusrat Jahan', 'Oxfam CJNRR', 'admin'],
  ['Tanvir Ahmed', 'Climate & Geospatial Analyst', 'reviewer'],
  ['Friendship NGO', 'Institutional account', 'institution'],
  ['BRAC Climate Unit', 'Institutional account', 'institution'],
  ['Rahima Begum', 'Kulkandi, Jamalpur', 'contributor'],
]

export default function Admin() {
  const { t, lang, settings, setSettings, published, records, num, resetDemo } = useApp()
  const a = t.admin
  const w = settings.weights
  const totalW = Object.values(w).reduce((x, y) => x + y, 0)
  const setW = (k, v) => setSettings({ ...settings, weights: { ...w, [k]: v } })
  const counts = ['good', 'mal', 'wip'].map((c) => [c, published.filter((r) => r.cls === c).length])

  return (
    <>
      <PageHead title={a.title} />
      <div className="container page-body admin-grid">
        <section className="form-card">
          <h2>{a.weights}</h2>
          <p className="muted small">{a.weightsSub}</p>
          {Object.keys(w).map((k) => (
            <div key={k} className="slider-row">
              <span>{t.crit[k]}</span>
              <input type="range" min="0" max="50" value={w[k]} onChange={(e) => setW(k, +e.target.value)} />
              <b>{totalW ? num((w[k] / totalW) * 100) : 0}%</b>
            </div>
          ))}
          <h3 className="mt">{a.econ}</h3>
          <div className="slider-row">
            <span>{a.rate}</span>
            <input type="range" min="0" max="0.2" step="0.01" value={settings.discountRate} onChange={(e) => setSettings({ ...settings, discountRate: +e.target.value })} />
            <b>{num(settings.discountRate * 100)}%</b>
          </div>
          <div className="slider-row">
            <span>{a.horizon}</span>
            <input type="range" min="5" max="50" value={settings.horizon} onChange={(e) => setSettings({ ...settings, horizon: +e.target.value })} />
            <b>{num(settings.horizon)}</b>
          </div>
          <h3 className="mt">{a.thresholds}</h3>
          <div className="slider-row">
            <span>{a.good}</span>
            <input type="range" min="2.5" max="4.5" step="0.1" value={settings.goodThreshold} onChange={(e) => setSettings({ ...settings, goodThreshold: +e.target.value })} />
            <b>{num(settings.goodThreshold, 1)}</b>
          </div>
          <div className="slider-row">
            <span>{a.fail}</span>
            <input type="range" min="1" max="3.5" step="0.1" value={settings.failThreshold} onChange={(e) => setSettings({ ...settings, failThreshold: +e.target.value })} />
            <b>{num(settings.failThreshold, 1)}</b>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setSettings(DEFAULT_SETTINGS)}>↺ Default</button>
            <span className="grow" />
            <button className="btn btn-danger-outline" onClick={resetDemo}>{a.reset}</button>
          </div>
        </section>

        <div className="admin-side">
          <section className="form-card">
            <h3>{a.impact}</h3>
            <div className="class-bars">
              {counts.map(([c, n]) => (
                <div key={c} className="class-bar">
                  <span>{t.cls[c]}</span>
                  <div><i style={{ width: `${published.length ? (n / published.length) * 100 : 0}%`, background: CLS_COLOR[c] }} /></div>
                  <b>{num(n)}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="form-card">
            <h3>{a.stats}</h3>
            <div className="kpi-grid small-kpi">
              <div className="kpi"><strong>{num(records.length)}</strong><span>{a.total}</span></div>
              <div className="kpi"><strong>{num(published.length)}</strong><span>{t.review.wf.approved}</span></div>
              <div className="kpi"><strong>{num(records.filter((r) => ['submitted', 'under_review'].includes(r.workflow)).length)}</strong><span>{t.nav.review}</span></div>
              <div className="kpi"><strong>{num(new Set(records.map((r) => r.implementer)).size)}</strong><span>{t.implementer}</span></div>
            </div>
          </section>

          <section className="form-card">
            <h3>{a.users}</h3>
            <table className="data-table">
              <tbody>
                {DEMO_USERS.map(([n, org, role]) => (
                  <tr key={n}><td><b>{n}</b><br /><small className="muted">{org}</small></td><td><span className="tag">{t.roles[role]}</span></td></tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="form-card">
            <h3>{a.taxonomy}</h3>
            {[[t.hazard, HAZARDS], [t.sector, SECTORS], [t.type, INTERVENTION_TYPES], [t.ecosystem, ECOSYSTEMS]].map(([name, list]) => (
              <details key={name} className="tax">
                <summary>{name} <span className="muted">({list.length})</span></summary>
                <div className="tags">{list.map((x) => <span key={x.id} className="tag">{x[lang]} ✎</span>)}<span className="tag tag-add">+</span></div>
              </details>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
