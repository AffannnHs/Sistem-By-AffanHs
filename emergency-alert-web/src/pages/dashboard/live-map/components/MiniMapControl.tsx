import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-minimap'

export default function MiniMapControl() {
  const map = useMap()
  type MiniMapInstance = { remove: () => void; addTo: (m: L.Map) => MiniMapInstance }
  const controlRef = useRef<MiniMapInstance | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const onZoom = () => {
      const z = map.getZoom()
      setEnabled(z > 10)
    }
    onZoom()
    map.on('zoomend', onZoom)
    return () => {
      map.off('zoomend', onZoom)
    }
  }, [map])

  useEffect(() => {
    if (!enabled) {
      if (controlRef.current) {
        controlRef.current.remove()
        controlRef.current = null
      }
      return
    }

    if (controlRef.current) return
    type MiniMapCtor = new (
      layer: L.TileLayer,
      opts: {
        position: 'bottomright'
        width: number
        height: number
        minimized: boolean
        toggleDisplay: boolean
        zoomLevelOffset: number
        aimingRectOptions: { color: string; weight: number }
        shadowRectOptions: { color: string; weight: number; opacity: number }
      },
    ) => MiniMapInstance
    const miniCtor = (L as unknown as { Control?: { MiniMap?: MiniMapCtor } }).Control?.MiniMap
    if (typeof miniCtor !== 'function') return
    const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' })
    let mini: MiniMapInstance | null = null
    try {
      mini = new miniCtor(layer, {
        position: 'bottomright',
        width: 150,
        height: 120,
        minimized: false,
        toggleDisplay: true,
        zoomLevelOffset: -5,
        aimingRectOptions: { color: '#ef4444', weight: 2 },
        shadowRectOptions: { color: '#ef4444', weight: 1, opacity: 0.2 },
      })
    } catch {
      return
    }
    mini.addTo(map)
    controlRef.current = mini

    return () => {
      mini?.remove()
      controlRef.current = null
    }
  }, [enabled, map])

  return null
}

