import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'
import { useApp } from '../lib/store'
import { PageHead } from '../components/ui'
import { HAZARDS, SECTORS, INTERVENTION_TYPES, ECOSYSTEMS, STATUSES, DIVISIONS, DISTRICTS, ACTOR_TYPES, SURVIVAL, POLICY_TAGS } from '../data/taxonomy'

const DRAFT_KEY = 'cai.draft.v1'
const EMPTY = {
  titleEn: '', titleBn: '', status: 'past', start: '', end: '', sector: '', type: '', ecosystem: '',
  division: '', district: '', upazila: '', union: '', lat: '', lng: '',
  hazards: [], vulnerability: '', description: '',
  implementer: '', partner: '', funder: '', governing: '', actorType: '',
  capex: '', maint: '', benefit: '', lifetime: '10', total: '', women: '', youth: '', pwd: '',
  consulted: '', consultMethod: '', benefitsDirect: '', benefitsIndirect: '', survival: 'na', policy: [], lessons: '',
  source: '', files: [], consent: false,
}

// Required fields per step (FR-09).
const REQUIRED = [
  ['titleEn', 'status', 'start', 'sector', 'type'],
  ['division', 'district', 'upazila', 'lat', 'lng'],
  ['hazards', 'vulnerability', 'description'],
  ['implementer', 'actorType'],
  ['capex'],
  ['consulted'],
  ['consent'],
]

function isEmpty(v) {
  return v === '' || v == null || v === false || (Array.isArray(v) && !v.length)
}

function words(s) {
  return new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
}

// FR-10: duplicate check on title, location, implementer.
function findDuplicates(form, records) {
  const w = words(form.titleEn)
  return records.filter((r) => {
    const rw = words(r.title.en)
    const overlap = [...w].filter((x) => rw.has(x)).length / Math.max(1, Math.min(w.size, rw.size))
    const sameDistrict = form.district && r.district === form.district
    const sameImpl = form.implementer && r.implementer.toLowerCase() === form.implementer.toLowerCase()
    return (overlap >= 0.5 && w.size > 0) || (sameDistrict && sameImpl)
  })
}

function Pin({ form, set }) {
  useMapEvents({
    click(e) {
      set({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5) })
    },
  })
  return form.lat && form.lng ? (
    <CircleMarker center={[+form.lat, +form.lng]} radius={9} pathOptions={{ color: '#fff', weight: 2, fillColor: '#44841a', fillOpacity: 1 }} />
  ) : null
}

export default function Submit() {
  const { t, lang, published, addRecord, nextId, role, tx } = useApp()
  const s = t.submit
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => {
    try {
      return { ...EMPTY, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') }
    } catch {
      return EMPTY
    }
  })
  const [errors, setErrors] = useState([])
  const [saved, setSaved] = useState(false)
  const [doneId, setDoneId] = useState(null)

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setSaved(false)
  }
  const field = (k) => ({ value: form[k], onChange: (e) => set({ [k]: e.target.value }) })
  const toggleIn = (k, v) => set({ [k]: form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v] })
  const req = (k) => (REQUIRED[step].includes(k) ? <span className="req">*</span> : null)
  const errCls = (k) => (errors.includes(k) ? 'has-error' : '')

  const dupes = useMemo(() => (step >= 3 ? findDuplicates(form, published) : []), [form, published, step])
  const divCenter = DIVISIONS.find((d) => d.id === form.division)

  const validate = () => {
    const missing = REQUIRED[step].filter((k) => isEmpty(form[k]))
    if (step === 0 && form.start && form.end && form.end < form.start) missing.push('end')
    setErrors(missing)
    return missing.length === 0
  }
  const next = () => validate() && setStep((x) => Math.min(x + 1, s.steps.length - 1))
  const prev = () => { setErrors([]); setStep((x) => Math.max(0, x - 1)) }
  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)) } catch { /* ignore */ }
    setSaved(true)
  }

  const submit = () => {
    if (!validate()) return
    const id = nextId()
    const n = (v) => (v === '' ? null : Number(v))
    addRecord({
      id, workflow: 'submitted', verification: 'self', currency: 'BDT', costYear: new Date().getFullYear(),
      title: { en: form.titleEn, bn: form.titleBn || form.titleEn }, status: form.status, start: form.start, end: form.end || '—',
      division: form.division, district: form.district, upazila: form.upazila, union: form.union || '—',
      lat: +form.lat, lng: +form.lng, ecosystem: form.ecosystem || 'floodplain', hazards: form.hazards,
      sector: form.sector, type: form.type,
      vulnerability: { en: form.vulnerability, bn: form.vulnerability }, description: { en: form.description, bn: form.description },
      implementer: form.implementer, partner: form.partner, funder: form.funder, governing: form.governing, actorType: form.actorType,
      capex: n(form.capex), maint: n(form.maint) || 0, benefit: n(form.benefit), lifetime: n(form.lifetime) || 10,
      beneficiaries: { total: n(form.total) || 0, women: n(form.women) || 0, youth: n(form.youth) || 0, pwd: n(form.pwd) || 0 },
      consulted: form.consulted === 'yes', consultMethod: form.consultMethod, survival: form.survival,
      scores: { effectiveness: 3, sustainability: 3, equity: 3, ownership: form.consulted === 'yes' ? 3.5 : 2 },
      policy: form.policy, benefitsDirect: { en: form.benefitsDirect, bn: form.benefitsDirect },
      benefitsIndirect: { en: form.benefitsIndirect, bn: form.benefitsIndirect }, lessons: { en: form.lessons, bn: form.lessons },
      source: form.source || 'Web form submission', submittedBy: `${t.roles[role]} (web form)`, files: form.files,
    })
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    setDoneId(id)
  }

  if (doneId) {
    return (
      <>
        <PageHead title={s.title} />
        <div className="container page-body narrow">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2>{s.done}</h2>
            <p>{s.doneRef}: <strong>{doneId}</strong></p>
            <div className="hero-ctas center">
              <button className="btn btn-green" onClick={() => { setForm(EMPTY); setStep(0); setDoneId(null) }}>{s.another}</button>
              <Link to="/inventory" className="btn btn-outline">{t.nav.inventory}</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const opt = (list) => list.map((o) => <option key={o.id} value={o.id}>{o[lang]}</option>)

  return (
    <>
      <PageHead title={s.title} sub={s.sub}>
        <div className="tabs-inline">
          <span className="on">{s.single}</span>
          <Link to="/bulk">{s.bulk}</Link>
        </div>
      </PageHead>
      <div className="container page-body narrow">
        <ol className="stepper">
          {s.steps.map((name, i) => (
            <li key={name} className={i === step ? 'current' : i < step ? 'done' : ''}>
              <button onClick={() => i < step && setStep(i)} disabled={i > step}>
                <span>{i < step ? '✓' : i + 1}</span>
                <em>{name}</em>
              </button>
            </li>
          ))}
        </ol>

        <div className="form-card">
          <h2>{s.steps[step]}</h2>
          {errors.length > 0 && <div className="alert alert-error">{errors.includes('end') ? s.errRange : s.errRequired}</div>}

          {step === 0 && (
            <div className="form-grid">
              <label className={`full ${errCls('titleEn')}`}><span>{s.titleEn}{req('titleEn')}</span><input {...field('titleEn')} /></label>
              <label className="full">{s.titleBn}<input {...field('titleBn')} lang="bn" /></label>
              <label className={errCls('status')}><span>{t.status}{req('status')}</span><select {...field('status')}>{opt(STATUSES)}</select></label>
              <label className={errCls('sector')}><span>{t.sector}{req('sector')}</span><select {...field('sector')}><option value="">—</option>{opt(SECTORS)}</select></label>
              <label className={errCls('start')}><span>{s.startDate}{req('start')}</span><input type="month" {...field('start')} /></label>
              <label className={errCls('end')}>{s.endDate}<input type="month" {...field('end')} /></label>
              <fieldset className={`full ${errCls('type')}`}>
                <legend>{t.type}{req('type')}</legend>
                <div className="radio-cards">
                  {INTERVENTION_TYPES.map((o) => (
                    <label key={o.id} className={form.type === o.id ? 'on' : ''}>
                      <input type="radio" name="type" checked={form.type === o.id} onChange={() => set({ type: o.id })} /> {o[lang]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 1 && (
            <div className="form-grid">
              <label className={errCls('division')}><span>{t.division}{req('division')}</span>
                <select value={form.division} onChange={(e) => set({ division: e.target.value, district: '' })}>
                  <option value="">—</option>{opt(DIVISIONS)}
                </select>
              </label>
              <label className={errCls('district')}><span>{s.district}{req('district')}</span>
                <select {...field('district')} disabled={!form.division}>
                  <option value="">—</option>
                  {(DISTRICTS[form.division] || []).map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label className={errCls('upazila')}><span>{s.upazila}{req('upazila')}</span><input {...field('upazila')} /></label>
              <label>{s.union}<input {...field('union')} /></label>
              <label>{t.ecosystem}<select {...field('ecosystem')}><option value="">—</option>{opt(ECOSYSTEMS)}</select></label>
              <div className={`full ${errCls('lat')}`}>
                <p className="hint">📍 {s.pin}{req('lat')}</p>
                <MapContainer
                  key={form.division || 'bd'}
                  center={divCenter ? [divCenter.lat, divCenter.lng] : [23.7, 90.3]}
                  zoom={divCenter ? 8 : 6}
                  className="pick-map"
                >
                  <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Pin form={form} set={set} />
                </MapContainer>
              </div>
              <label>{s.lat}<input {...field('lat')} inputMode="decimal" /></label>
              <label>{s.lng}<input {...field('lng')} inputMode="decimal" /></label>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <fieldset className={`full ${errCls('hazards')}`}>
                <legend>{t.detail.hazards}{req('hazards')}</legend>
                <div className="chip-select">
                  {HAZARDS.map((h) => (
                    <button type="button" key={h.id} className={form.hazards.includes(h.id) ? 'on' : ''} onClick={() => toggleIn('hazards', h.id)}>
                      {h[lang]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className={`full ${errCls('vulnerability')}`}><span>{s.vuln}{req('vulnerability')}</span><textarea rows={3} {...field('vulnerability')} /></label>
              <label className={`full ${errCls('description')}`}><span>{s.desc}{req('description')}</span><textarea rows={4} {...field('description')} /></label>
            </div>
          )}

          {step === 3 && (
            <div className="form-grid">
              <label className={errCls('implementer')}><span>{t.detail.implementer}{req('implementer')}</span><input {...field('implementer')} /></label>
              <label className={errCls('actorType')}><span>{t.actorType}{req('actorType')}</span><select {...field('actorType')}><option value="">—</option>{opt(ACTOR_TYPES)}</select></label>
              <label>{t.detail.partner}<input {...field('partner')} /></label>
              <label>{t.detail.funder}<input {...field('funder')} /></label>
              <label className="full">{t.detail.governing}<input {...field('governing')} /></label>
            </div>
          )}

          {step === 4 && (
            <div className="form-grid">
              <label className={errCls('capex')}><span>{s.capex}{req('capex')}</span><input type="number" min="0" {...field('capex')} /></label>
              <label>{s.maint}<input type="number" min="0" {...field('maint')} /></label>
              <label>{s.benefit}<input type="number" min="0" {...field('benefit')} placeholder={s.unknown} /></label>
              <label>{s.lifetime}<input type="number" min="1" max="100" {...field('lifetime')} /></label>
              <label>{t.detail.beneficiaries} — {t.detail.total}<input type="number" min="0" {...field('total')} /></label>
              <label>{t.detail.women}<input type="number" min="0" {...field('women')} /></label>
              <label>{t.detail.youth}<input type="number" min="0" {...field('youth')} /></label>
              <label>{t.detail.pwd}<input type="number" min="0" {...field('pwd')} /></label>
              <label className="full">{t.detail.survival}<select {...field('survival')}>{opt(SURVIVAL)}</select></label>
            </div>
          )}

          {step === 5 && (
            <div className="form-grid">
              <fieldset className={`full ${errCls('consulted')}`}>
                <legend>{t.detail.consulted}{req('consulted')}</legend>
                <div className="radio-cards">
                  {[['yes', t.detail.yes], ['no', t.detail.no], ['unknown', s.unknown]].map(([v, l]) => (
                    <label key={v} className={form.consulted === v ? 'on' : ''}>
                      <input type="radio" name="consulted" checked={form.consulted === v} onChange={() => set({ consulted: v })} /> {l}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="full">{t.detail.method}<input {...field('consultMethod')} /></label>
              <label className="full">{t.detail.direct}<textarea rows={2} {...field('benefitsDirect')} /></label>
              <label className="full">{t.detail.indirect}<textarea rows={2} {...field('benefitsIndirect')} /></label>
              <label className="full">{t.detail.lessons}<textarea rows={2} {...field('lessons')} /></label>
              <fieldset className="full">
                <legend>{t.detail.policy}</legend>
                <div className="chip-select">
                  {POLICY_TAGS.map((p) => (
                    <button type="button" key={p.id} className={form.policy.includes(p.id) ? 'on' : ''} onClick={() => toggleIn('policy', p.id)}>{p[lang]}</button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 6 && (
            <div className="form-grid">
              <label className="full">{t.detail.source}<input {...field('source')} /></label>
              <label className="full dropzone">
                <span>📎 {s.evidence}</span>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => set({ files: [...e.target.files].map((f) => f.name) })} />
                {form.files.length > 0 && <small>{form.files.join(', ')}</small>}
              </label>
              <label className={`full consent ${errCls('consent')}`}>
                <input type="checkbox" checked={form.consent} onChange={(e) => set({ consent: e.target.checked })} />
                <span>{s.consent}{req('consent')}</span>
              </label>
            </div>
          )}

          {dupes.length > 0 && (
            <div className="alert alert-warn">
              <strong>⚠ {s.dupWarn}</strong> — {s.dupText}
              <ul>
                {dupes.slice(0, 3).map((r) => (
                  <li key={r.id}><Link to={`/record/${r.id}`} target="_blank">{r.id} · {tx(r.title)} ({r.district})</Link></li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-outline" onClick={prev} disabled={step === 0}>← {s.prev}</button>
            <span className="grow" />
            <button className="btn-link" onClick={saveDraft}>💾 {s.saveDraft}</button>
            {saved && <span className="small muted">{s.draftSaved}</span>}
            {step < s.steps.length - 1 ? (
              <button className="btn btn-green" onClick={next}>{s.next} →</button>
            ) : (
              <button className="btn btn-orange" onClick={submit}>{s.submitBtn}</button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
