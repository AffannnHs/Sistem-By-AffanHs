import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function HeatmapLayer({ enabled, points }: { enabled: boolean; points: [number, number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (!enabled) return
    if (!points.length) return
    type HeatLayerFactory = (
      points: [number, number, number][],
      opts: { radius: number; blur: number; maxZoom: number; gradient: Record<number, string> },
    ) => L.Layer
    const factory = (L as unknown as { heatLayer: HeatLayerFactory }).heatLayer
    const layer = factory(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' },
    })
    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [enabled, map, points])

  return null
}

