import { useMemo, useState } from 'react'
import { useApp } from '../lib/store'
import { HAZARDS, SECTORS, DIVISIONS, STATUSES, ECOSYSTEMS, ACTOR_TYPES } from '../data/taxonomy'

export const EMPTY_FILTERS = { q: '', hazard: '', sector: '', division: '', status: '', cls: '', ecosystem: '', actorType: '' }

// FR-14: keyword search + facet filters over published records.
export function useFiltered(records) {
  const [f, setF] = useState(EMPTY_FILTERS)
  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return records.filter((r) => {
      if (f.hazard && !r.hazards.includes(f.hazard)) return false
      if (f.sector && r.sector !== f.sector) return false
      if (f.division && r.division !== f.division) return false
      if (f.status && r.status !== f.status) return false
      if (f.cls && r.cls !== f.cls) return false
      if (f.ecosystem && r.ecosystem !== f.ecosystem) return false
      if (f.actorType && r.actorType !== f.actorType) return false
      if (q) {
        const hay = [r.id, r.title.en, r.title.bn, r.description?.en, r.description?.bn, r.implementer, r.funder, r.district, r.upazila, r.union]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [records, f])
  return [list, f, setF]
}

function Sel({ value, onChange, options, placeholder, lang, all }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder}>
      <option value="">{placeholder}: {all}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o[lang]}</option>
      ))}
    </select>
  )
}

export default function Filters({ f, setF, count, compact = false }) {
  const { t, lang, num } = useApp()
  const set = (k) => (v) => setF({ ...f, [k]: v })
  const clsOptions = ['good', 'mal', 'wip'].map((id) => ({ id, en: t.cls[id], bn: t.cls[id] }))
  const active = Object.entries(f).some(([, v]) => v)
  return (
    <div className={`filters ${compact ? 'filters-compact' : ''}`}>
      <input className="search" type="search" placeholder={t.search} value={f.q} onChange={(e) => set('q')(e.target.value)} />
      <div className="filter-row">
        <Sel value={f.hazard} onChange={set('hazard')} options={HAZARDS} placeholder={t.hazard} lang={lang} all={t.all} />
        <Sel value={f.sector} onChange={set('sector')} options={SECTORS} placeholder={t.sector} lang={lang} all={t.all} />
        <Sel value={f.division} onChange={set('division')} options={DIVISIONS} placeholder={t.division} lang={lang} all={t.all} />
        <Sel value={f.cls} onChange={set('cls')} options={clsOptions} placeholder={t.effectiveness} lang={lang} all={t.all} />
        {!compact && (
          <>
            <Sel value={f.status} onChange={set('status')} options={STATUSES} placeholder={t.status} lang={lang} all={t.all} />
            <Sel value={f.ecosystem} onChange={set('ecosystem')} options={ECOSYSTEMS} placeholder={t.ecosystem} lang={lang} all={t.all} />
            <Sel value={f.actorType} onChange={set('actorType')} options={ACTOR_TYPES} placeholder={t.actorType} lang={lang} all={t.all} />
          </>
        )}
      </div>
      <div className="filter-foot">
        <span className="muted">{num(count)} {t.results}</span>
        {active && (
          <button className="btn-link" onClick={() => setF(EMPTY_FILTERS)}>{t.clear}</button>
        )}
      </div>
    </div>
  )
}
