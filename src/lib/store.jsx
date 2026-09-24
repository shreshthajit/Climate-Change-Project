import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SEED_RECORDS } from '../data/records'
import { DEFAULT_SETTINGS, evaluate, completeness } from './scoring'
import { STRINGS } from './i18n'

const Ctx = createContext(null)

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
function save(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* storage unavailable — demo still works in memory */
  }
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => load('cai.lang', 'en'))
  const [role, setRole] = useState(() => load('cai.role', 'public'))
  const [records, setRecords] = useState(() => {
    // Records saved by an older build may miss fields the pages rely on; fall back to the seed.
    const saved = load('cai.records.v1', SEED_RECORDS)
    const ok = Array.isArray(saved) && saved.every((r) => r && r.id && r.title && Array.isArray(r.hazards) && r.beneficiaries && r.scores)
    return ok ? saved : SEED_RECORDS
  })
  const [settings, setSettings] = useState(() => load('cai.settings.v1', DEFAULT_SETTINGS))
  const [audit, setAudit] = useState(() => load('cai.audit.v1', []))
  const [compare, setCompare] = useState([])

  useEffect(() => { save('cai.lang', lang) }, [lang])
  useEffect(() => { save('cai.role', role) }, [role])
  useEffect(() => { save('cai.records.v1', records) }, [records])
  useEffect(() => { save('cai.settings.v1', settings) }, [settings])
  useEffect(() => { save('cai.audit.v1', audit) }, [audit])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Every record gets its BCR, MCDA score and class recomputed from current admin settings.
  const scored = useMemo(
    () => records.map((r) => ({ ...r, ...evaluate(r, settings), completeness: completeness(r) })),
    [records, settings],
  )
  const published = useMemo(() => scored.filter((r) => r.workflow === 'approved'), [scored])

  const value = useMemo(() => {
    const s = STRINGS[lang]
    const locale = lang === 'bn' ? 'bn-BD' : 'en-IN'
    const num = (n, d = 0) => (n == null ? '—' : Number(n).toLocaleString(locale, { maximumFractionDigits: d, minimumFractionDigits: d }))
    // BDT in lakh / crore, as used in Bangladesh.
    const money = (n) => {
      if (n == null) return '—'
      if (n >= 1e7) return `৳ ${num(n / 1e7, 1)} ${lang === 'bn' ? 'কোটি' : 'crore'}`
      if (n >= 1e5) return `৳ ${num(n / 1e5, 1)} ${lang === 'bn' ? 'লাখ' : 'lakh'}`
      return `৳ ${num(n)}`
    }
    const tx = (o) => (o == null ? '' : typeof o === 'string' ? o : o[lang] || o.en)

    const log = (id, action, note = '') =>
      setAudit((a) => [{ id, action, note, role, at: new Date().toISOString() }, ...a].slice(0, 200))

    const addRecord = (rec) => {
      setRecords((rs) => [...rs, rec])
      log(rec.id, 'submitted')
    }
    const updateRecord = (id, patch, action, note) => {
      setRecords((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
      if (action) log(id, action, note)
    }
    const nextId = () => {
      const max = records.reduce((m, r) => Math.max(m, parseInt(r.id.split('-')[1], 10) || 0), 0)
      return `CAI-${String(max + 1).padStart(4, '0')}`
    }
    const resetDemo = () => {
      setRecords(SEED_RECORDS)
      setSettings(DEFAULT_SETTINGS)
      setAudit([])
      setCompare([])
    }
    const toggleCompare = (id) =>
      setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id]))

    return {
      lang, setLang, t: s, num, money, tx, locale,
      role, setRole,
      records: scored, published, settings, setSettings, audit,
      addRecord, updateRecord, nextId, resetDemo,
      compare, toggleCompare, setCompare,
    }
  }, [lang, role, scored, published, settings, audit, records, compare])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
