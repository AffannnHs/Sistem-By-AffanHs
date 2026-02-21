import { useEffect, useMemo, useState } from 'react'
import { useToastStore } from '@/stores/toastStore'
import { useSessionStore } from '@/stores/sessionStore'

type MapStyle = 'satellite' | 'normal' | 'dark' | 'terrain'

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

const LS_ME = 'eas_settings_me'
const LS_GLOBAL = 'eas_settings_global'

export default function Settings() {
  const pushToast = useToastStore((s) => s.push)
  const user = useSessionStore((s) => s.user)
  const isSuper = user?.role === 'SUPER_ADMIN'

  const [tab, setTab] = useState<'me' | 'global'>('me')

  const [areaPreset, setAreaPreset] = useState<(typeof presetAreas)[number]>('Jawa Barat')
  const [style, setStyle] = useState<MapStyle>('satellite')
  const [autoZoom, setAutoZoom] = useState(true)
  const [borderEffect, setBorderEffect] = useState(true)
  const [saveLastZoom, setSaveLastZoom] = useState(false)

  const [globalArea, setGlobalArea] = useState<(typeof presetAreas)[number]>('Seluruh Indonesia')
  const [override, setOverride] = useState(false)
  const [gpsNormal, setGpsNormal] = useState('5 menit')
  const [gpsAlert, setGpsAlert] = useState('1 menit')
  const [gpsSos, setGpsSos] = useState('15 detik')
  const [delay2, setDelay2] = useState('30 detik')
  const [delay3, setDelay3] = useState('60 detik')

  useEffect(() => {
    const raw = localStorage.getItem(LS_ME)
    if (raw) {
      try {
        const v = JSON.parse(raw) as {
          areaPreset?: (typeof presetAreas)[number]
          style?: MapStyle
          autoZoom?: boolean
          borderEffect?: boolean
          saveLastZoom?: boolean
        }
        setAreaPreset(v.areaPreset ?? 'Jawa Barat')
        setStyle(v.style ?? 'satellite')
        setAutoZoom(Boolean(v.autoZoom))
        setBorderEffect(Boolean(v.borderEffect))
        setSaveLastZoom(Boolean(v.saveLastZoom))
      } catch {
        localStorage.removeItem(LS_ME)
      }
    }
    const rawG = localStorage.getItem(LS_GLOBAL)
    if (rawG) {
      try {
        const v = JSON.parse(rawG) as {
          globalArea?: (typeof presetAreas)[number]
          override?: boolean
          gpsNormal?: string
          gpsAlert?: string
          gpsSos?: string
          delay2?: string
          delay3?: string
        }
        setGlobalArea(v.globalArea ?? 'Seluruh Indonesia')
        setOverride(Boolean(v.override))
        setGpsNormal(v.gpsNormal ?? '5 menit')
        setGpsAlert(v.gpsAlert ?? '1 menit')
        setGpsSos(v.gpsSos ?? '15 detik')
        setDelay2(v.delay2 ?? '30 detik')
        setDelay3(v.delay3 ?? '60 detik')
      } catch {
        localStorage.removeItem(LS_GLOBAL)
      }
    }
  }, [])

  const saveMe = () => {
    localStorage.setItem(
      LS_ME,
      JSON.stringify({ areaPreset, style, autoZoom, borderEffect, saveLastZoom }),
    )
    pushToast({ type: 'success', title: 'Pengaturan disimpan', message: '✅ Pengaturan berhasil disimpan', durationMs: 5000 })
  }

  const saveGlobal = () => {
    localStorage.setItem(
      LS_GLOBAL,
      JSON.stringify({ globalArea, override, gpsNormal, gpsAlert, gpsSos, delay2, delay3 }),
    )
    pushToast({ type: 'success', title: 'Global diterapkan', message: '✅ Pengaturan global berhasil diterapkan', durationMs: 5000 })
  }

  const resetGlobal = () => {
    setGlobalArea('Seluruh Indonesia')
    setOverride(false)
    setGpsNormal('5 menit')
    setGpsAlert('1 menit')
    setGpsSos('15 detik')
    setDelay2('30 detik')
    setDelay3('60 detik')
    localStorage.removeItem(LS_GLOBAL)
    pushToast({ type: 'warning', title: 'Reset', message: 'Pengaturan global direset ke default.', durationMs: 5000 })
  }

  const styles = useMemo(
    () => [
      { k: 'satellite', l: '🛰️ Satelit' },
      { k: 'normal', l: '🗺️ Normal' },
      { k: 'dark', l: '🌑 Gelap' },
      { k: 'terrain', l: '🏔️ Terrain' },
    ],
    [],
  )

  return (
    <div className="space-y-5">
      <div>
        <div className="text-lg font-semibold text-slate-100">⚙️ Settings</div>
        <div className="text-sm text-slate-300">Pengaturan peta pribadi dan kebijakan global.</div>
      </div>

      <div className="flex gap-2">
        <button
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'me' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          onClick={() => setTab('me')}
        >
          Pengaturan Peta Saya
        </button>
        <button
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === 'global' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          onClick={() => setTab('global')}
        >
          Pengaturan Global
        </button>
      </div>

      {tab === 'me' ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <div className="text-sm font-semibold text-white">⚙️ Pengaturan Peta Pribadi</div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-300">Default Area Pemantauan</div>
              <select
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
                value={areaPreset}
                    onChange={(e) => setAreaPreset(e.target.value as (typeof presetAreas)[number])}
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
                    <input type="radio" checked={style === s.k} onChange={() => setStyle(s.k as MapStyle)} /> {s.l}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold text-slate-300">Pengaturan Lainnya</div>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                <input type="checkbox" checked={autoZoom} onChange={(e) => setAutoZoom(e.target.checked)} /> Auto-zoom ke alert baru saat masuk
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                <input type="checkbox" checked={borderEffect} onChange={(e) => setBorderEffect(e.target.checked)} /> Tampilkan border effect saat alert
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                <input type="checkbox" checked={saveLastZoom} onChange={(e) => setSaveLastZoom(e.target.checked)} /> Simpan zoom level terakhir
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" onClick={saveMe}>
              💾 Simpan Pengaturan
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
          {isSuper ? (
            <>
              <div className="text-sm font-semibold text-white">🌐 Pengaturan Global</div>
              <div className="mt-1 text-xs text-amber-200">⚠️ Berlaku untuk SEMUA admin</div>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-slate-300">Area Default Global</div>
                  <select
                    className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
                    value={globalArea}
                    onChange={(e) => setGlobalArea(e.target.value as (typeof presetAreas)[number])}
                  >
                    {presetAreas.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                  <label className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                    <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} /> Override pengaturan peta individu admin
                  </label>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">Interval Update GPS</div>
                  <div className="mt-2 grid gap-2">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                      <div>Mode Normal</div>
                      <select className="rounded-lg bg-white/10 px-2 py-1 text-xs" value={gpsNormal} onChange={(e) => setGpsNormal(e.target.value)}>
                        <option>5 menit</option>
                        <option>2 menit</option>
                        <option>1 menit</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                      <div>Mode Alert</div>
                      <select className="rounded-lg bg-white/10 px-2 py-1 text-xs" value={gpsAlert} onChange={(e) => setGpsAlert(e.target.value)}>
                        <option>1 menit</option>
                        <option>30 detik</option>
                        <option>15 detik</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                      <div>Mode SOS</div>
                      <select className="rounded-lg bg-white/10 px-2 py-1 text-xs" value={gpsSos} onChange={(e) => setGpsSos(e.target.value)}>
                        <option>15 detik</option>
                        <option>10 detik</option>
                        <option>5 detik</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-slate-200">Eskalasi Alert</div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[var(--panel)] px-3 py-2 text-sm text-slate-200">
                    <div>Delay ke Level 2</div>
                    <select className="rounded-lg bg-white/10 px-2 py-1 text-xs" value={delay2} onChange={(e) => setDelay2(e.target.value)}>
                      <option>30 detik</option>
                      <option>45 detik</option>
                      <option>60 detik</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[var(--panel)] px-3 py-2 text-sm text-slate-200">
                    <div>Delay ke Level 3</div>
                    <select className="rounded-lg bg-white/10 px-2 py-1 text-xs" value={delay3} onChange={(e) => setDelay3(e.target.value)}>
                      <option>60 detik</option>
                      <option>90 detik</option>
                      <option>120 detik</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={resetGlobal}>
                  🚫 Reset ke Default
                </button>
                <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" onClick={saveGlobal}>
                  💾 Terapkan
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="text-5xl">🔒</div>
              <div className="mt-3 text-lg font-semibold text-white">Halaman ini hanya untuk Super Admin</div>
              <div className="mt-1 text-sm text-slate-300">Minta akses role SUPER_ADMIN untuk melihat pengaturan global.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

