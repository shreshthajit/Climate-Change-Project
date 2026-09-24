import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Tooltip } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { useApp } from '../lib/store'
import Filters, { useFiltered } from '../components/Filters'
import { ClassBadge, BcrPill, CLS_COLOR } from '../components/ui'
import { HAZARD_ZONES, DIVISIONS } from '../data/taxonomy'
import { exportCsv, exportGeoJson } from '../lib/export'

const icons = {}
function iconFor(cls) {
  if (!icons[cls]) {
    icons[cls] = L.divIcon({
      className: 'pin-wrap',
      html: `<span class="pin" style="background:${CLS_COLOR[cls]}"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -10],
    })
  }
  return icons[cls]
}

export default function Explore() {
  const { t, lang, published, tx, money } = useApp()
  const [list, f, setF] = useFiltered(published)
  const [layers, setLayers] = useState({ points: true, hazards: true, invest: false })
  const toggle = (k) => setLayers({ ...layers, [k]: !layers[k] })

  const byDivision = useMemo(() => {
    const m = {}
    for (const r of list) m[r.division] = (m[r.division] || 0) + (r.capex || 0)
    return m
  }, [list])
  const maxDiv = Math.max(1, ...Object.values(byDivision))

  return (
    <div className="explore">
      <aside className="explore-side">
        <h1 className="side-title">{t.nav.explore}</h1>
        <Filters f={f} setF={setF} count={list.length} compact />
        <div className="layer-box">
          <h4>{t.layers}</h4>
          <label><input type="checkbox" checked={layers.points} onChange={() => toggle('points')} /> {t.interventions}</label>
          <label><input type="checkbox" checked={layers.hazards} onChange={() => toggle('hazards')} /> {t.hazardLayer}</label>
          <label><input type="checkbox" checked={layers.invest} onChange={() => toggle('invest')} /> {t.gapLayer}</label>
        </div>
        <div className="legend">
          {['good', 'mal', 'wip'].map((c) => (
            <span key={c}><i style={{ background: CLS_COLOR[c] }} /> {t.cls[c]}</span>
          ))}
        </div>
        <div className="side-actions">
          <button className="btn btn-sm btn-outline" onClick={() => exportCsv(list)}>⬇ {t.export}</button>
          <button className="btn btn-sm btn-outline" onClick={() => exportGeoJson(list)}>⬇ {t.exportGeo}</button>
        </div>
        <ul className="side-list">
          {list.map((r) => (
            <li key={r.id}>
              <Link to={`/record/${r.id}`}>
                <span className="dot" style={{ background: CLS_COLOR[r.cls] }} />
                <span>
                  <strong>{tx(r.title)}</strong>
                  <small>{r.district} · {money(r.capex)}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="explore-map">
        <MapContainer center={[23.7, 90.35]} zoom={7} minZoom={6} className="big-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {layers.hazards &&
            HAZARD_ZONES.map((z) => (
              <Circle key={z.id} center={z.center} radius={z.radius} pathOptions={{ color: z.color, weight: 1, fillOpacity: 0.12, dashArray: '4 4' }}>
                <Tooltip sticky>{z[lang]}</Tooltip>
              </Circle>
            ))}
          {layers.invest &&
            DIVISIONS.map((d) => {
              const v = byDivision[d.id] || 0
              return (
                <CircleMarker
                  key={d.id}
                  center={[d.lat, d.lng]}
                  radius={8 + 30 * Math.sqrt(v / maxDiv)}
                  pathOptions={{ color: '#336114', weight: 1, fillColor: '#44841a', fillOpacity: 0.25 }}
                >
                  <Tooltip>{d[lang]}: {money(v)}</Tooltip>
                </CircleMarker>
              )
            })}
          {layers.points && (
            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={40}>
              {list.map((r) => (
                <Marker key={r.id} position={[r.lat, r.lng]} icon={iconFor(r.cls)}>
                  <Popup>
                    <div className="popup">
                      <ClassBadge cls={r.cls} />
                      <h4>{tx(r.title)}</h4>
                      <p>{r.district}, {r.upazila}</p>
                      <p><strong>{money(r.capex)}</strong> · <BcrPill value={r.bcr} /></p>
                      <Link to={`/record/${r.id}`}>{t.viewDetails} →</Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
