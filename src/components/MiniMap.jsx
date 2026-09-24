import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { CLS_COLOR } from './ui'

// Static preview map for the home hero.
export default function MiniMap({ records }) {
  return (
    <MapContainer
      center={[23.7, 90.3]}
      zoom={6}
      className="mini-map"
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {records.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.lat, r.lng]}
          radius={6}
          pathOptions={{ color: '#fff', weight: 1.5, fillColor: CLS_COLOR[r.cls], fillOpacity: 0.95 }}
        />
      ))}
    </MapContainer>
  )
}
