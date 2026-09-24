import { Link, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { useApp } from '../lib/store'
import { ClassBadge, BcrPill, ScoreBar, CLS_COLOR } from '../components/ui'
import { HAZARDS, SECTORS, INTERVENTION_TYPES, ECOSYSTEMS, STATUSES, VERIFICATION, SURVIVAL, POLICY_TAGS, ACTOR_TYPES, DIVISIONS, label } from '../data/taxonomy'
import { costScore } from '../lib/scoring'

function Q({ n, title, children }) {
  return (
    <section className="q-block">
      <h2><span className="q-badge">{n}</span>{title}</h2>
      <div className="q-content">{children}</div>
    </section>
  )
}

function KV({ k, v }) {
  return (
    <div className="kv">
      <dt>{k}</dt>
      <dd>{v || '—'}</dd>
    </div>
  )
}

export default function RecordDetail() {
  const { id } = useParams()
  const { records, t, lang, tx, money, num, compare, toggleCompare } = useApp()
  const r = records.find((x) => x.id === id)
  if (!r) {
    return (
      <div className="container page-body">
        <p>Record not found.</p>
        <Link to="/inventory">{t.detail.back}</Link>
      </div>
    )
  }
  const d = t.detail
  const b = r.beneficiaries
  const pct = (x) => (b.total ? `${num((x / b.total) * 100)}%` : '')
  const crit = { ...r.scores, cost: costScore(r.bcr) }
  const radar = Object.keys(t.crit).map((k) => ({ k: t.crit[k], v: crit[k] ?? 0 }))

  return (
    <>
      <div className={`detail-head dh-${r.cls}`}>
        <div className="container">
          <Link to="/inventory" className="back">← {d.back}</Link>
          <div className="detail-badges">
            <ClassBadge cls={r.cls} />
            <span className="badge badge-outline">{label(STATUSES, r.status, lang)}</span>
            <span className="badge badge-outline">✔ {label(VERIFICATION, r.verification, lang)}</span>
            {r.workflow !== 'approved' && <span className="badge badge-wip">{t.review.wf[r.workflow]}</span>}
          </div>
          <h1>{tx(r.title)}</h1>
          <p className="detail-sub">{lang === 'en' ? r.title.bn : r.title.en}</p>
          <div className="detail-meta">
            <span>🆔 {r.id}</span>
            <span>📍 {r.union}, {r.upazila}, {r.district}, {label(DIVISIONS, r.division, lang)}</span>
            <span>🗓 {r.start} → {r.end}</span>
            <span>🌿 {label(ECOSYSTEMS, r.ecosystem, lang)}</span>
          </div>
          <div className="detail-actions">
            <button className="btn btn-sm btn-white" onClick={() => toggleCompare(r.id)}>
              {compare.includes(r.id) ? '✓ ' : '+ '}{t.addCompare}
            </button>
            <button className="btn btn-sm btn-outline-white" onClick={() => window.print()}>🖨 {t.print}</button>
          </div>
        </div>
      </div>

      <div className="container detail-grid">
        <div className="detail-main">
          <Q n="1" title={t.q1}>
            <div className="tags">
              {r.hazards.map((h) => <span key={h} className="tag tag-lg">{label(HAZARDS, h, lang)}</span>)}
            </div>
            <p>{tx(r.vulnerability)}</p>
          </Q>

          <Q n="2" title={t.q2}>
            <dl className="kv-grid">
              <KV k={t.sector} v={label(SECTORS, r.sector, lang)} />
              <KV k={t.type} v={label(INTERVENTION_TYPES, r.type, lang)} />
            </dl>
            <p>{tx(r.description)}</p>
          </Q>

          <Q n="3" title={t.q3}>
            <dl className="kv-grid">
              <KV k={d.implementer} v={r.implementer} />
              <KV k={d.partner} v={r.partner} />
              <KV k={d.funder} v={r.funder} />
              <KV k={d.governing} v={r.governing} />
              <KV k={t.actorType} v={label(ACTOR_TYPES, r.actorType, lang)} />
            </dl>
          </Q>

          <Q n="4" title={t.q4}>
            <div className="fin-grid">
              <div className="fin"><span>{d.capex}</span><strong>{money(r.capex)}</strong></div>
              <div className="fin"><span>{d.maint}</span><strong>{money(r.maint)}</strong></div>
              <div className="fin"><span>{d.avoided}</span><strong>{r.benefit == null ? t.notCalc : money(r.benefit)}</strong></div>
              <div className="fin"><span>{d.lifetime}</span><strong>{num(r.lifetime)} {d.years}</strong></div>
            </div>
            <h4>{d.beneficiaries}</h4>
            <div className="benef">
              <div><strong>{num(b.total)}</strong><span>{d.total}</span></div>
              <div><strong>{num(b.women)}</strong><span>{d.women} {pct(b.women)}</span></div>
              <div><strong>{num(b.youth)}</strong><span>{d.youth} {pct(b.youth)}</span></div>
              <div><strong>{num(b.pwd)}</strong><span>{d.pwd} {pct(b.pwd)}</span></div>
            </div>
            <div className="women-bar" title={d.women}>
              <span style={{ width: pct(b.women) }} />
            </div>
          </Q>

          <Q n="5" title={t.q5}>
            <div className="eval-grid">
              <div className="eval-bcr">
                <span>{t.bcr}</span>
                <strong style={{ color: r.bcr == null ? '#96968f' : r.bcr >= 1 ? CLS_COLOR.good : CLS_COLOR.mal }}>
                  {r.bcr == null ? t.notCalc : num(r.bcr, 2)}
                </strong>
                <small>{d.bcrNote}</small>
              </div>
              <div className="eval-bcr">
                <span>{t.mcda}</span>
                <strong>{num(r.mcda, 2)} <small>/ 5</small></strong>
                <ScoreBar value={r.mcda} />
              </div>
            </div>
            <div className="radar-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radar} outerRadius="70%">
                  <PolarGrid stroke="#d9d9ce" />
                  <PolarAngleAxis dataKey="k" tick={{ fontSize: 12, fill: '#545454' }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar isAnimationActive={false} dataKey="v" stroke={CLS_COLOR[r.cls]} fill={CLS_COLOR[r.cls]} fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <dl className="kv-grid">
              <KV k={d.survival} v={label(SURVIVAL, r.survival, lang)} />
            </dl>
            <div className="lesson">
              <strong>{d.lessons}</strong>
              <p>{tx(r.lessons)}</p>
            </div>
          </Q>

          <Q n="6" title={t.q6}>
            <dl className="kv-grid">
              <KV k={d.consulted} v={r.consulted ? `✅ ${d.yes}` : `❌ ${d.no}`} />
              <KV k={d.method} v={r.consultMethod} />
            </dl>
            <div className="two-col">
              <div className="benefit-box"><h4>{d.direct}</h4><p>{tx(r.benefitsDirect)}</p></div>
              <div className="benefit-box"><h4>{d.indirect}</h4><p>{tx(r.benefitsIndirect)}</p></div>
            </div>
          </Q>
        </div>

        <aside className="detail-side">
          <div className="side-card">
            <MapContainer center={[r.lat, r.lng]} zoom={9} className="detail-map" scrollWheelZoom={false} attributionControl={false}>
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CircleMarker center={[r.lat, r.lng]} radius={10} pathOptions={{ color: '#fff', weight: 2, fillColor: CLS_COLOR[r.cls], fillOpacity: 1 }} />
            </MapContainer>
            <p className="small muted">WGS84: {r.lat.toFixed(4)}, {r.lng.toFixed(4)}</p>
          </div>
          <div className="side-card">
            <h4>{d.criteria}</h4>
            {Object.keys(t.crit).map((k) => (
              <div key={k} className="crit-row">
                <span>{t.crit[k]}</span>
                <ScoreBar value={crit[k]} />
                <b>{crit[k] == null ? '—' : num(crit[k], 1)}</b>
              </div>
            ))}
            <div className="mt-sm"><BcrPill value={r.bcr} /></div>
          </div>
          <div className="side-card">
            <h4>{d.policy}</h4>
            <div className="tags">
              {r.policy.length ? r.policy.map((p) => <span key={p} className="tag tag-green">{label(POLICY_TAGS, p, lang)}</span>) : '—'}
            </div>
          </div>
          <div className="side-card">
            <h4>{d.completeness}</h4>
            <div className="complete">
              <div className="complete-bar"><span style={{ width: `${r.completeness}%` }} /></div>
              <b>{num(r.completeness)}%</b>
            </div>
            <dl className="kv-list">
              <KV k={d.verification} v={label(VERIFICATION, r.verification, lang)} />
              <KV k={d.source} v={r.source} />
              {r.submittedBy && <KV k={t.review.submittedBy} v={r.submittedBy} />}
            </dl>
          </div>
        </aside>
      </div>
    </>
  )
}
