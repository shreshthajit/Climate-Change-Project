import { useMemo, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, ReferenceLine } from 'recharts'
import { useApp } from '../lib/store'
import Filters, { useFiltered } from '../components/Filters'
import { PageHead, CLS_COLOR } from '../components/ui'
import { SECTORS, DIVISIONS, HAZARDS } from '../data/taxonomy'
import { exportCsv } from '../lib/export'

const PALETTE = ['#44841a', '#0b9cda', '#f16e22', '#53297d', '#e70052', '#336114', '#9d4816', '#96968f', '#630235', '#3f6b22']
// Indicative multi-hazard exposure index per division (0–1). Real build derives this from official hazard layers.
const EXPOSURE = { khulna: 0.95, barishal: 0.92, chattogram: 0.82, sylhet: 0.78, rangpur: 0.72, rajshahi: 0.68, mymensingh: 0.6, dhaka: 0.5 }

function svgToPng(node, name) {
  const svg = node?.querySelector('svg.recharts-surface')
  if (!svg) return
  const { width, height } = svg.getBoundingClientRect()
  const clone = svg.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)
  const img = new Image()
  img.onload = () => {
    const c = document.createElement('canvas')
    c.width = width * 2
    c.height = height * 2
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.scale(2, 2)
    ctx.drawImage(img, 0, 0)
    const a = document.createElement('a')
    a.download = name
    a.href = c.toDataURL('image/png')
    a.click()
  }
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone))
}

function ChartCard({ title, children, file, wide }) {
  const ref = useRef(null)
  const { t } = useApp()
  return (
    <div className={`chart-card ${wide ? 'wide' : ''}`} ref={ref}>
      <div className="chart-head">
        <h3>{title}</h3>
        <button className="btn-link small" onClick={() => svgToPng(ref.current, file)}>⬇ {t.dash.downloadChart}</button>
      </div>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { t, lang, published, num, money } = useApp()
  const [list, f, setF] = useFiltered(published)
  const crore = (v) => +(v / 1e7).toFixed(1)

  const data = useMemo(() => {
    const sector = SECTORS.map((s) => ({
      name: s[lang],
      v: crore(list.filter((r) => r.sector === s.id).reduce((a, r) => a + r.capex, 0)),
    })).filter((d) => d.v > 0).sort((a, b) => b.v - a.v)

    const division = DIVISIONS.map((d) => {
      const rs = list.filter((r) => r.division === d.id)
      const inv = rs.reduce((a, r) => a + r.capex, 0)
      const ppl = rs.reduce((a, r) => a + r.beneficiaries.total, 0)
      return { id: d.id, name: d[lang], v: crore(inv), inv, ppl, perCap: ppl ? inv / ppl : 0, n: rs.length, exposure: EXPOSURE[d.id] }
    })
    const maxPer = Math.max(1, ...division.map((d) => d.perCap))
    const gaps = division
      .map((d) => ({ ...d, gap: d.exposure * (1 - d.perCap / maxPer) }))
      .sort((a, b) => b.gap - a.gap)

    const bins = [
      ['< 0.5', 0, 0.5], ['0.5–1', 0.5, 1], ['1–1.5', 1, 1.5], ['1.5–2', 1.5, 2], ['2–3', 2, 3], ['3+', 3, Infinity],
    ].map(([name, lo, hi]) => ({ name, lo, v: list.filter((r) => r.bcr != null && r.bcr >= lo && r.bcr < hi).length }))
    const noBcr = list.filter((r) => r.bcr == null).length

    const cls = ['good', 'mal', 'wip'].map((c) => ({ id: c, name: t.cls[c], v: list.filter((r) => r.cls === c).length })).filter((d) => d.v)

    const hazard = HAZARDS.map((h) => ({ name: h[lang], v: list.filter((r) => r.hazards.includes(h.id)).length }))
      .filter((d) => d.v).sort((a, b) => b.v - a.v)

    return { sector, division, gaps, bins, noBcr, cls, hazard }
  }, [list, lang, t])

  const invest = list.reduce((a, r) => a + r.capex, 0)
  const people = list.reduce((a, r) => a + r.beneficiaries.total, 0)
  const women = list.reduce((a, r) => a + r.beneficiaries.women, 0)
  const withBcr = list.filter((r) => r.bcr != null)
  const avgBcr = withBcr.length ? withBcr.reduce((a, r) => a + r.bcr, 0) / withBcr.length : null
  const consulted = list.filter((r) => r.consulted).length

  const kpis = [
    [num(list.length), t.statRecords],
    [money(invest), t.statInvest],
    [num(people), t.statBenef],
    [people ? `${num((women / people) * 100)}%` : '—', t.detail.women],
    [avgBcr == null ? '—' : num(avgBcr, 2), `${t.bcrShort} (avg)`],
    [list.length ? `${num((consulted / list.length) * 100)}%` : '—', t.detail.consulted],
  ]

  const tip = { contentStyle: { borderRadius: 4, border: '1px solid #d9d9ce', fontSize: 13 } }

  return (
    <>
      <PageHead title={t.dash.title} sub={t.dash.sub}>
        <button className="btn btn-sm btn-white" onClick={() => exportCsv(list)}>⬇ {t.export}</button>
      </PageHead>
      <div className="container page-body">
        <Filters f={f} setF={setF} count={list.length} compact />
        <div className="kpi-grid">
          {kpis.map(([v, l]) => (
            <div key={l} className="kpi"><strong>{v}</strong><span>{l}</span></div>
          ))}
        </div>

        <div className="chart-grid">
          <ChartCard title={t.dash.bySector} file="investment-by-sector.png">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.sector} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid horizontal={false} stroke="#eaeade" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                <Tooltip {...tip} formatter={(v) => [`৳ ${num(v, 1)} ${lang === 'bn' ? 'কোটি' : 'crore'}`]} />
                <Bar isAnimationActive={false} dataKey="v" fill="#44841a" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t.dash.classSplit} file="effectiveness-classes.png">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie isAnimationActive={false} data={data.cls} dataKey="v" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2} label={({ name, value }) => `${name}: ${num(value)}`}>
                  {data.cls.map((d) => <Cell key={d.id} fill={CLS_COLOR[d.id]} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t.dash.byDivision} file="investment-by-division.png">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.division} margin={{ right: 10 }}>
                <CartesianGrid vertical={false} stroke="#eaeade" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...tip} formatter={(v) => [`৳ ${num(v, 1)} ${lang === 'bn' ? 'কোটি' : 'crore'}`]} />
                <Bar isAnimationActive={false} dataKey="v" radius={[3, 3, 0, 0]}>
                  {data.division.map((d, i) => <Cell key={d.id} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t.dash.bcrDist} file="bcr-distribution.png">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.bins}>
                <CartesianGrid vertical={false} stroke="#eaeade" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip {...tip} formatter={(v) => [v, t.dash.records]} />
                <ReferenceLine x="1–1.5" stroke="#303030" strokeDasharray="3 3" label={{ value: 'BCR = 1', position: 'top', fontSize: 11 }} />
                <Bar isAnimationActive={false} dataKey="v" radius={[3, 3, 0, 0]}>
                  {data.bins.map((d) => <Cell key={d.name} fill={d.lo >= 1 ? '#44841a' : '#e70052'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="small muted">{t.notCalc}: {num(data.noBcr)} {t.dash.records}</p>
          </ChartCard>

          <ChartCard title={t.dash.byHazard} file="records-by-hazard.png">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.hazard} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid horizontal={false} stroke="#eaeade" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                <Tooltip {...tip} formatter={(v) => [v, t.dash.records]} />
                <Bar isAnimationActive={false} dataKey="v" fill="#0b9cda" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="chart-card">
            <div className="chart-head"><h3>{t.dash.gaps}</h3></div>
            <p className="small muted">{t.dash.gapsText}</p>
            <table className="gap-table">
              <thead>
                <tr><th>{t.division}</th><th>{t.dash.exposure}</th><th className="num">{t.dash.perCapita}</th><th /></tr>
              </thead>
              <tbody>
                {data.gaps.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td><span className="expo"><span style={{ width: `${d.exposure * 100}%` }} /></span></td>
                    <td className="num">{d.ppl ? `৳ ${num(d.perCap)}` : '—'}</td>
                    <td>{d.gap > 0.5 && <span className="badge badge-mal">Gap</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
