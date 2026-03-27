/**
 * components/ui/ConnectionMap.jsx
 * Carte interactive des connexions — basée sur react-leaflet + OpenStreetMap.
 * Affiche des cercles colorés pour chaque localisation unique.
 */

import React, { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../../context/ThemeContext'

// Tuile claire vs sombre
const TILE_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

const ATTR_OSM   = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const ATTR_CARTO = '&copy; <a href="https://carto.com/attributions">CARTO</a>'

/**
 * Regroupe les activités de connexion par coordonnées uniques
 * et retourne un tableau { lat, lon, city, country, count }.
 */
function groupConnections(activities) {
  const map = {}
  for (const a of activities) {
    if (a.type !== 'connection' || !a.lat || !a.lon) continue
    const key = `${a.lat.toFixed(2)},${a.lon.toFixed(2)}`
    if (!map[key]) {
      map[key] = { lat: a.lat, lon: a.lon, city: a.city, country: a.country, count: 0 }
    }
    map[key].count++
  }
  return Object.values(map)
}

export default function ConnectionMap({ activities }) {
  const { dark } = useTheme()
  const locations = useMemo(() => groupConnections(activities), [activities])

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
        Aucune connexion géolocalisée à afficher.
      </div>
    )
  }

  // Centre de la carte : moyenne des coordonnées
  const centerLat = locations.reduce((s, l) => s + l.lat, 0) / locations.length
  const centerLon = locations.reduce((s, l) => s + l.lon, 0) / locations.length

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--color-border)]" style={{ height: 280 }}>
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={locations.length === 1 ? 5 : 3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={dark ? TILE_DARK : TILE_LIGHT}
          attribution={dark ? ATTR_CARTO : ATTR_OSM}
        />

        {locations.map((loc, i) => (
          <CircleMarker
            key={i}
            center={[loc.lat, loc.lon]}
            radius={8 + Math.log(loc.count + 1) * 4}
            pathOptions={{
              fillColor:   '#7B2D8B',
              color:       '#fff',
              weight:      2,
              opacity:     1,
              fillOpacity: 0.85,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={false}>
              <span className="text-xs font-semibold">
                {loc.city ? `${loc.city}, ` : ''}{loc.country || 'Inconnu'}
              </span>
              <br />
              <span className="text-xs text-gray-500">
                {loc.count} connexion{loc.count > 1 ? 's' : ''}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
