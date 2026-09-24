import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store'
import { PageHead, BcrPill } from '../components/ui'
import { HAZARDS, SECTORS, VERIFICATION, label } from '../data/taxonomy'

const PENDING = ['submitted', 'under_review', 'changes_requested']

function ReviewCard({ r }) {
  const { t, lang, tx, money, num, updateRecord } = useApp()
  const rv = t.review
  const [verification, setVerification] = useState(r.verification === 'self' ? 'desk' : r.verification)
  const [note, setNote] = useState('')
  const act = (workflow, action) => updateRecord(r.id, { workflow, ...(workflow === 'approved' ? { verification } : {}) }, action, note)

  return (
    <article className="review-card">
      <header>
        <div>
          <span className={`wf wf-${r.workflow}`}>{rv.wf[r.workflow]}</span>
          <span className="muted small"> {r.id}</span>
          <h3><Link to={`/record/${r.id}`}>{tx(r.title)}</Link></h3>
          <p className="small muted">{rv.submittedBy}: {r.submittedBy || '—'}</p>
        </div>
        <div className="review-score">
          <BcrPill value={r.bcr} />
          <span className="small">{t.detail.completeness}: <b>{num(r.completeness)}%</b></span>
        </div>
      </header>
      <dl className="kv-grid three">
        <div className="kv"><dt>{t.detail.location}</dt><dd>{r.upazila}, {r.district}</dd></div>
        <div className="kv"><dt>{t.sector}</dt><dd>{label(SECTORS, r.sector, lang)}</dd></div>
        <div className="kv"><dt>{t.detail.hazards}</dt><dd>{r.hazards.map((h) => label(HAZARDS, h, lang)).join(', ')}</dd></div>
        <div className="kv"><dt>{t.detail.implementer}</dt><dd>{r.implementer}</dd></div>
        <div className="kv"><dt>{t.detail.capex}</dt><dd>{money(r.capex)}</dd></div>
        <div className="kv"><dt>{t.detail.consulted}</dt><dd>{r.consulted ? t.detail.yes : t.detail.no}</dd></div>
      </dl>
      <p className="small">{tx(r.description)}</p>
      <div className="review-controls">
        <label>{rv.setVerification}
          <select value={verification} onChange={(e) => setVerification(e.target.value)}>
            {VERIFICATION.map((v) => <option key={v.id} value={v.id}>{v[lang]}</option>)}
          </select>
        </label>
        <label className="grow">{rv.note}
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      <div className="form-actions">
        {r.workflow === 'submitted' && <button className="btn btn-outline" onClick={() => act('under_review', 'review started')}>{rv.start}</button>}
        <span className="grow" />
        <button className="btn btn-danger-outline" onClick={() => act('rejected', 'rejected')}>{rv.reject}</button>
        <button className="btn btn-outline" onClick={() => act('changes_requested', 'changes requested')}>{rv.changes}</button>
        <button className="btn btn-green" onClick={() => act('approved', 'approved & published')}>✓ {rv.approve}</button>
      </div>
    </article>
  )
}

export default function Review() {
  const { t, records, audit, locale } = useApp()
  const rv = t.review
  const queue = records.filter((r) => PENDING.includes(r.workflow))
  return (
    <>
      <PageHead title={rv.title} sub={rv.sub} />
      <div className="container page-body review-layout">
        <div>
          <div className="wf-flow">
            {['submitted', 'under_review', 'changes_requested', 'approved'].map((w, i) => (
              <span key={w}>{i > 0 && '→ '}<b className={`wf wf-${w}`}>{rv.wf[w]}</b> ({records.filter((r) => r.workflow === w).length})</span>
            ))}
          </div>
          {queue.length ? queue.map((r) => <ReviewCard key={r.id} r={r} />) : <div className="empty">✓ {rv.empty}</div>}
        </div>
        <aside className="side-card audit">
          <h4>{rv.audit}</h4>
          {audit.length === 0 && <p className="small muted">—</p>}
          <ul>
            {audit.map((a, i) => (
              <li key={i}>
                <b>{a.id}</b> {a.action}
                {a.note && <em> — “{a.note}”</em>}
                <small>{t.roles[a.role]} · {new Date(a.at).toLocaleString(locale)}</small>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  )
}
