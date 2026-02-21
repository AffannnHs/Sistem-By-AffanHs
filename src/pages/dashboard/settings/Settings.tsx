import { useEffect, useMemo, useState } from 'react'
import { useToastStore } from '@/stores/toastStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useMapSettings } from '@/hooks/useSupabase'

type MapStyle = 'SATELLITE' | 'NORMAL' | 'DARK' | 'TERRAIN'

const presetAreas = [
  'Seluruh Indonesia',
  'Pulau Jawa',
  'Sumatera',
  'Kalimantan',
  'Sulawesi',
  'Papua',
  'Bali & Nusa Tenggara',
  'Jawa Barat',
] as const

export default function Settings() {
  const pushToast = useToastStore((s) => s.push)
  const user = useSessionStore((s) => s.user)
  const { settings, loading, upsert } = useMapSettings(user?.id)

  const styles = useMemo(
    () => [
      { k: 'SATELLITE' as const, l: '🛰️ Satelit' },
      { k: 'NORMAL' as const, l: '🗺️ Normal' },
      { k: 'DARK' as const, l: '🌑 Gelap' },
      { k: 'TERRAIN' as const, l: '🏔️ Terrain' },
    ],
    [],
  )

  const [areaPreset, setAreaPreset] = useState<(typeof presetAreas)[number]>('Seluruh Indonesia')
  const [style, setStyle] = useState<MapStyle>('SATELLITE')

  useEffect(() => {
    if (!settings) return
    setAreaPreset((settings.preset_area as (typeof presetAreas)[number] | null) ?? 'Seluruh Indonesia')
    setStyle((settings.map_style as MapStyle | null) ?? 'SATELLITE')
  }, [settings])

  const onSave = async () => {
    if (!user?.id) return
    await upsert({ preset_area: areaPreset, map_style: style })
    pushToast({ type: 'success', title: 'Pengaturan disimpan', message: '✅ Pengaturan berhasil disimpan ke Supabase', durationMs: 5000 })
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-lg font-semibold text-slate-100">⚙️ Settings</div>
        <div className="text-sm text-slate-300">Pengaturan peta tersimpan di Supabase.</div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-sm font-semibold text-white">🗺️ Pengaturan Peta</div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-slate-300">Default Area Pemantauan</div>
            <select
              className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={areaPreset}
              onChange={(e) => setAreaPreset(e.target.value as (typeof presetAreas)[number])}
              disabled={loading}
            >
              {presetAreas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300">Style Peta Default</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <label key={s.k} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <input type="radio" checked={style === s.k} onChange={() => setStyle(s.k)} disabled={loading} /> {s.l}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            onClick={() => void onSave()}
            disabled={loading}
          >
            💾 Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
