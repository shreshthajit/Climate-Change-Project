import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store'
import { PageHead } from '../components/ui'
import { HAZARDS, SECTORS, DIVISIONS, INTERVENTION_TYPES, STATUSES, ACTOR_TYPES } from '../data/taxonomy'
import { downloadText } from '../lib/export'

const COLS = ['title_en', 'title_bn', 'status', 'start_date', 'end_date', 'division', 'district', 'upazila', 'latitude', 'longitude',
  'hazards', 'sector', 'intervention_type', 'description', 'implementer', 'funder', 'actor_type', 'capital_cost_bdt',
  'annual_maintenance_bdt', 'annual_avoided_loss_bdt', 'design_life_years', 'beneficiaries_total', 'beneficiaries_women', 'community_consulted']
const REQUIRED = ['title_en', 'status', 'start_date', 'division', 'district', 'upazila', 'latitude', 'longitude', 'hazards', 'sector', 'intervention_type', 'implementer', 'actor_type', 'capital_cost_bdt']

const SAMPLE = [
  COLS.join(','),
  '"Community flood shelters in Char Rajibpur","চর রাজিবপুরে বন্যা আশ্রয়কেন্দ্র",past,2018-01,2020-12,mymensingh,Jamalpur,Dewanganj,25.15,89.77,flood,drr,physical,"Raised earthen flood shelters",Friendship NGO,EU,ngo,32000000,900000,5500000,20,6000,3100,Y',
  '"Saline-tolerant sunflower trials","লবণ-সহিষ্ণু সূর্যমুখী",ongoing,2024-11,2026-04,khulna,Khulna,Dacope,22.57,89.51,salinity,agriculture,behavioural,"Sunflower on fallow saline land",BARI,Government of Bangladesh,gov,4500000,300000,,5,1200,500,Y',
  '"Solar desalination units","সৌর লবণমুক্তকরণ ইউনিট",past,2019-02,2018-01,khulna,Satkhira,Shyamnagar,22.3,89.2,salinity,water,physical,"Solar-powered RO plants",Private,Private,private,-500,100,200,10,800,420,N',
  '"Hill terrace farming","পাহাড়ি ধাপ চাষ",past,2016-01,2019-01,chattogram,Bandarban,Ruma,,,landslide;drought,agriculture,behavioural,"Terracing on jhum slopes",Local CBO,UNDP,community,2500000,100000,900000,10,900,450,Y',
  '"Flood-resilient latrines","বন্যা-সহনশীল শৌচাগার",past,2017-03,2018-12,rangpur,Gaibandha,Saghata,25.1,89.55,tsunami,water,physical,"Raised latrines",DPHE,UNICEF,gov,12000000,400000,3000000,10,4000,2100,Y',
]

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false
      else cell += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()))
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim().replace(/^﻿/, ''), (r[i] || '').trim()])))
}

// FR-02: row-level validation against the data dictionary.
function validateRow(r) {
  const errs = []
  for (const k of REQUIRED) if (!r[k]) errs.push(`${k} is required`)
  const inList = (k, list, multi) => {
    if (!r[k]) return
    const vals = multi ? r[k].split(';') : [r[k]]
    for (const v of vals) if (!list.some((o) => o.id === v)) errs.push(`${k}: "${v}" is not an allowed value`)
  }
  inList('status', STATUSES)
  inList('division', DIVISIONS)
  inList('hazards', HAZARDS, true)
  inList('sector', SECTORS)
  inList('intervention_type', INTERVENTION_TYPES)
  inList('actor_type', ACTOR_TYPES)
  const lat = +r.latitude, lng = +r.longitude
  if (r.latitude && (lat < 20.5 || lat > 26.7)) errs.push('latitude outside Bangladesh')
  if (r.longitude && (lng < 88 || lng > 92.7)) errs.push('longitude outside Bangladesh')
  if (r.capital_cost_bdt && !(+r.capital_cost_bdt > 0)) errs.push('capital_cost_bdt must be > 0')
  if (r.start_date && r.end_date && r.end_date < r.start_date) errs.push('end_date is before start_date')
  return errs
}

export default function BulkUpload() {
  const { t, addRecord, nextId, role } = useApp()
  const b = t.bulk
  const [rows, setRows] = useState(null)
  const [fileName, setFileName] = useState('')
  const [imported, setImported] = useState(0)

  const load = (text, name) => {
    const parsed = parseCsv(text).map((r) => ({ r, errs: validateRow(r) }))
    setRows(parsed)
    setFileName(name)
    setImported(0)
  }
  const onFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => load(reader.result, f.name)
    reader.readAsText(f, 'utf-8')
  }

  const doImport = () => {
    const ok = rows.filter((x) => !x.errs.length)
    let base = parseInt(nextId().split('-')[1], 10)
    for (const { r } of ok) {
      const id = `CAI-${String(base++).padStart(4, '0')}`
      addRecord({
        id, workflow: 'submitted', verification: 'self', currency: 'BDT', costYear: 2024,
        title: { en: r.title_en, bn: r.title_bn || r.title_en }, status: r.status, start: r.start_date, end: r.end_date,
        division: r.division, district: r.district, upazila: r.upazila, union: '—', lat: +r.latitude, lng: +r.longitude,
        ecosystem: 'floodplain', hazards: r.hazards.split(';'), sector: r.sector, type: r.intervention_type,
        vulnerability: { en: '—', bn: '—' }, description: { en: r.description, bn: r.description },
        implementer: r.implementer, funder: r.funder, partner: '', governing: '', actorType: r.actor_type,
        capex: +r.capital_cost_bdt, maint: +r.annual_maintenance_bdt || 0,
        benefit: r.annual_avoided_loss_bdt ? +r.annual_avoided_loss_bdt : null, lifetime: +r.design_life_years || 10,
        beneficiaries: { total: +r.beneficiaries_total || 0, women: +r.beneficiaries_women || 0, youth: 0, pwd: 0 },
        consulted: r.community_consulted === 'Y', consultMethod: '', survival: 'na',
        scores: { effectiveness: 3, sustainability: 3, equity: 3, ownership: 3 }, policy: [],
        benefitsDirect: { en: '', bn: '' }, benefitsIndirect: { en: '', bn: '' }, lessons: { en: '', bn: '' },
        source: `Bulk upload: ${fileName}`, submittedBy: `${t.roles[role]} (bulk upload)`,
      })
    }
    setImported(ok.length)
  }

  const valid = rows ? rows.filter((x) => !x.errs.length).length : 0

  return (
    <>
      <PageHead title={b.title} sub={b.sub}>
        <div className="tabs-inline">
          <Link to="/submit">{t.submit.single}</Link>
          <span className="on">{t.submit.bulk}</span>
        </div>
      </PageHead>
      <div className="container page-body narrow">
        <div className="form-card">
          <div className="bulk-actions">
            <button className="btn btn-outline" onClick={() => downloadText('cai-bulk-template.csv', '﻿' + COLS.join(',') + '\n')}>⬇ {b.template}</button>
            <button className="btn btn-outline" onClick={() => load(SAMPLE.join('\n'), 'sample.csv')}>🧪 {b.sample}</button>
          </div>
          <label className="dropzone big">
            <span>📤 {b.drop}</span>
            <input type="file" accept=".csv" onChange={onFile} />
            {fileName && <small>{fileName}</small>}
          </label>

          {rows && (
            <>
              <table className="data-table mt">
                <thead><tr><th>{b.row}</th><th>{t.submit.titleEn}</th><th>{b.result}</th></tr></thead>
                <tbody>
                  {rows.map(({ r, errs }, i) => (
                    <tr key={i} className={errs.length ? 'row-err' : 'row-ok'}>
                      <td>{i + 2}</td>
                      <td>{r.title_en || '—'}</td>
                      <td>
                        {errs.length ? (
                          <ul className="err-list">{errs.map((e) => <li key={e}>✗ {e}</li>)}</ul>
                        ) : (
                          <span className="ok">✓ {b.ok}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="form-actions">
                <span className="muted">{valid} / {rows.length} {b.ok.toLowerCase()}</span>
                <span className="grow" />
                {imported ? (
                  <span className="ok">✓ {imported} {b.imported}</span>
                ) : (
                  <button className="btn btn-orange" disabled={!valid} onClick={doImport}>{b.importBtn} ({valid})</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
