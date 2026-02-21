import type L from 'leaflet'

export function isInViewport(map: L.Map, lat: number, lng: number) {
  const b = map.getBounds()
  return b.contains([lat, lng])
}

export async function flyToAlert({
  map,
  lat,
  lng,
  isOutsideViewport,
  onShowBanner,
  onTriggerMarker,
}: {
  map: L.Map
  lat: number
  lng: number
  isOutsideViewport: boolean
  onShowBanner: () => void
  onTriggerMarker: () => void
}) {
  if (!isOutsideViewport) {
    map.flyTo([lat, lng], 15, { animate: true, duration: 2 })
    window.setTimeout(() => {
      onTriggerMarker()
      onShowBanner()
    }, 700)
    return
  }

  map.flyTo([-2.5, 118.0], 5, { animate: true, duration: 1.5 })
  window.setTimeout(() => {
    onShowBanner()
  }, 2200)
  window.setTimeout(() => {
    map.flyTo([lat, lng], 15, { animate: true, duration: 2.5 })
  }, 3200)
  window.setTimeout(() => {
    onTriggerMarker()
  }, 6000)
}

