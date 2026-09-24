import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/store'
import Filters, { useFiltered } from '../components/Filters'
import { RecordCard, PageHead, ClassBadge, BcrPill } from '../components/ui'
import { exportCsv, exportGeoJson } from '../lib/export'
import { SECTORS, label } from '../data/taxonomy'

const SORTS = {
  score: (a, b) => (b.mcda ?? 0) - (a.mcda ?? 0),
  bcr: (a, b) => (b.bcr ?? -1) - (a.bcr ?? -1),
  cost: (a, b) => (b.capex ?? 0) - (a.capex ?? 0),
  recent: (a, b) => (b.start || '').localeCompare(a.start || ''),
}

export default function Inventory() {
  const { t, lang, published, tx, money, num } = useApp()
  const [list, f, setF] = useFiltered(published)
  const [view, setView] = useState('cards')
  const [sort, setSort] = useState('score')
  const sorted = [...list].sort(SORTS[sort])
  const sortLabels = lang === 'bn'
    ? { score: 'স্কোর', bcr: 'BCR', cost: 'ব্যয়', recent: 'সাম্প্রতিক' }
    : { score: 'Score', bcr: 'BCR', cost: 'Cost', recent: 'Most recent' }

  return (
    <>
      <PageHead title={t.nav.inventory} sub={t.q5d + ' · ' + t.q6d} />
      <div className="container page-body">
        <Filters f={f} setF={setF} count={list.length} />
        <div className="toolbar">
          <div className="seg">
            <button className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>▦</button>
            <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>☰</button>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.keys(SORTS).map((k) => (
              <option key={k} value={k}>↓ {sortLabels[k]}</option>
            ))}
          </select>
          <span className="grow" />
          <button className="btn btn-sm btn-outline" onClick={() => exportCsv(sorted)}>⬇ {t.export}</button>
          <button className="btn btn-sm btn-outline" onClick={() => exportGeoJson(sorted)}>⬇ {t.exportGeo}</button>
        </div>
        {view === 'cards' ? (
          <div className="card-grid">
            {sorted.map((r) => <RecordCard key={r.id} r={r} />)}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>{t.nav.inventory}</th><th>{t.sector}</th><th>{t.division}</th>
                  <th className="num">{t.detail.capex}</th><th>{t.bcrShort}</th><th className="num">{t.mcda}</th><th>{t.effectiveness}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id}>
                    <td className="muted">{r.id}</td>
                    <td><Link to={`/record/${r.id}`}>{tx(r.title)}</Link></td>
                    <td>{label(SECTORS, r.sector, lang)}</td>
                    <td>{r.district}</td>
                    <td className="num">{money(r.capex)}</td>
                    <td><BcrPill value={r.bcr} /></td>
                    <td className="num">{num(r.mcda, 2)}</td>
                    <td><ClassBadge cls={r.cls} /></td>
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
