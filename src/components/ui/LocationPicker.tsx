'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface LatLng {
  lat: number
  lng: number
}

export interface LocationPickerProps {
  /** Current pin position (controlled) */
  value: LatLng | null
  /** Called when the user clicks the map to drop/move the pin */
  onChange: (latlng: LatLng) => void
  /** Radius circle in km (optional, purely visual) */
  radiusKm?: number
  /** Map height CSS value */
  height?: string
  /** Default center when no pin is set */
  defaultCenter?: LatLng
  /** Default zoom level */
  defaultZoom?: number
}

const DEFAULT_CENTER: LatLng = { lat: 55.676, lng: 12.568 } // Copenhagen
const DEFAULT_ZOOM = 12

export function LocationPicker({
  value,
  onChange,
  radiusKm,
  height = '300px',
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

  // Stable callback ref so the click handler always sees the latest onChange
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [value?.lat ?? defaultCenter.lat, value?.lng ?? defaultCenter.lng],
      zoom: defaultZoom,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Fix default marker icon paths (Leaflet + bundlers issue)
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onChangeRef.current({ lat, lng })
    })

    mapRef.current = map
    L.Marker.prototype.options.icon = defaultIcon

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync marker with value
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (value) {
      if (markerRef.current) {
        markerRef.current.setLatLng([value.lat, value.lng])
      } else {
        markerRef.current = L.marker([value.lat, value.lng]).addTo(map)
      }
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [value])

  // Sync radius circle
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (value && radiusKm && radiusKm > 0) {
      const radiusMeters = radiusKm * 1000
      if (circleRef.current) {
        circleRef.current.setLatLng([value.lat, value.lng])
        circleRef.current.setRadius(radiusMeters)
      } else {
        circleRef.current = L.circle([value.lat, value.lng], {
          radius: radiusMeters,
          color: '#16a34a',
          fillColor: '#16a34a',
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(map)
      }
    } else if (circleRef.current) {
      circleRef.current.remove()
      circleRef.current = null
    }
  }, [value, radiusKm])

  return (
    <div
      ref={containerRef}
      data-testid="location-picker-map"
      style={{ height, width: '100%' }}
      className="rounded-md border border-gray-300 overflow-hidden z-0"
    />
  )
}
