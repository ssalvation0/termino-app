import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons (Vite/Webpack would otherwise look in wrong path)
const icon = L.divIcon({
  className: 'termino-marker',
  html: `<div style="
    width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
    background: #7c3aed; transform: rotate(-45deg); border: 3px solid white;
    box-shadow: 0 4px 10px rgba(124,58,237,.4);
    display:flex;align-items:center;justify-content:center;
  "><div style="transform: rotate(45deg); color:white; font-size:14px;">📍</div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

interface Props {
  lat: number
  lng: number
  name: string
  address: string
  zoom?: number
  className?: string
}

export function ProviderMap({ lat, lng, name, address, zoom = 15, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], zoom)
      return
    }
    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom,
      scrollWheelZoom: false,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    L.marker([lat, lng], { icon }).addTo(map).bindPopup(
      `<div style="font-family: Inter, sans-serif">
        <div style="font-weight:600; color:#111827">${name}</div>
        <div style="font-size:12px; color:#6b7280; margin-top:2px">${address}</div>
      </div>`,
    )
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, zoom, name, address])

  return <div ref={containerRef} className={className} style={{ minHeight: 280, borderRadius: 16, overflow: 'hidden' }} />
}
