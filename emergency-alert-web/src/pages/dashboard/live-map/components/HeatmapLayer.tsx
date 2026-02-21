import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

const heatmapData: [number, number, number][] = [
  [-6.4821, 106.8287, 0.9],
  [-6.5521, 106.9187, 0.7],
  [-6.4021, 106.7987, 0.6],
  [-6.2088, 106.8456, 0.8],
  [-6.3621, 106.8287, 0.5],
  [-6.4921, 106.8587, 0.7],
  [-6.5121, 106.8887, 0.4],
  [-6.9175, 107.6191, 0.6],
  [-6.8721, 107.5791, 0.4],
  [-7.0051, 107.6691, 0.3],
  [-6.4321, 106.7587, 0.5],
  [-6.3821, 106.7987, 0.4],
  [-6.4621, 106.8087, 0.6],
  [-6.5321, 106.8487, 0.5],
  [-6.5821, 106.9587, 0.3],
  [-6.6221, 106.7987, 0.4],
  [-6.4821, 107.0287, 0.3],
  [-6.3221, 107.1487, 0.2],
  [-6.2521, 106.9887, 0.4],
  [-6.2121, 107.0487, 0.5],
]

export default function HeatmapLayer({ enabled }: { enabled: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!enabled) return
    type HeatLayerFactory = (
      points: [number, number, number][],
      opts: { radius: number; blur: number; maxZoom: number; gradient: Record<number, string> },
    ) => L.Layer
    const factory = (L as unknown as { heatLayer: HeatLayerFactory }).heatLayer
    const layer = factory(heatmapData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' },
    })
    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [enabled, map])

  return null
}

