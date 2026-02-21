import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import OverlayModal from '@/components/OverlayModal'
import RightDrawer from '@/components/RightDrawer'
import { useToastStore } from '@/stores/toastStore'
import { useDevices, type DbDevice, type DbDeviceStatus, type DbDeviceType } from '@/hooks/useSupabase'
import { supabase } from '@/utils/supabase'

function statusPill(s: DbDeviceStatus) {
  if (s === 'ONLINE') return 'bg-emerald-500/15 text-emerald-200'
  if (s === 'WARNING') return 'bg-amber-500/15 text-amber-200'
  return 'bg-red-500/15 text-red-200'
}

function slugTopic(name: string) {
  return `eas/devices/${name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
}

export default function Devices() {
  const pushToast = useToastStore((s) => s.push)
  const { devices, loading, error, refetch } = useDevices()

  const [q, setQ] = useState('')
  const [type, setType] = useState<DbDeviceType | 'SEMUA'>('SEMUA')
  const [status, setStatus] = useState<DbDeviceStatus | 'SEMUA'>('SEMUA')
  const [group, setGroup] = useState<string>('SEMUA')

  const [addOpen, setAddOpen] = useState(false)
  const [drawer, setDrawer] = useState<DbDevice | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<DbDeviceType>('ALARM')
  const [formGroup, setFormGroup] = useState('')
  const [formLat, setFormLat] = useState('')
  const [formLng, setFormLng] = useState('')
  const [formTopic, setFormTopic] = useState('')

  const groups = useMemo(() => ['SEMUA', ...Array.from(new Set(devices.map((d) => d.group_name ?? '-')))], [devices])
  const qq = q.trim().toLowerCase()
  const filtered = useMemo(() => {
    return devices
      .filter((d) => (type === 'SEMUA' ? true : d.type === type))
      .filter((d) => (status === 'SEMUA' ? true : d.status === status))
      .filter((d) => (group === 'SEMUA' ? true : (d.group_name ?? '-') === group))
      .filter((d) => (qq ? d.name.toLowerCase().includes(qq) || (d.mqtt_topic ?? '').toLowerCase().includes(qq) : true))
  }, [devices, group, qq, status, type])

  const openAdd = () => {
    setAddOpen(true)
    setFormName('')
    setFormType('ALARM')
    setFormGroup('')
    setFormLat('')
    setFormLng('')
    setFormTopic('')
  }

  const openEdit = (d: DbDevice) => {
    setDrawer(d)
    setFormName(d.name)
    setFormType(d.type)
    setFormGroup(d.group_name ?? '')
    setFormLat(d.latitude == null ? '' : String(d.latitude))
    setFormLng(d.longitude == null ? '' : String(d.longitude))
    setFormTopic(d.mqtt_topic ?? '')
  }

  const saveDevice = async () => {
    if (!formName.trim()) {
      pushToast({ type: 'error', title: 'Validasi', message: 'Nama device wajib diisi', durationMs: 5000 })
      return
    }
    setBusy(true)
    const payload = {
      name: formName.trim(),
      type: formType,
      group_name: formGroup.trim() ? formGroup.trim() : null,
      latitude: formLat.trim() ? Number(formLat) : null,
      longitude: formLng.trim() ? Number(formLng) : null,
      mqtt_topic: formTopic.trim() ? formTopic.trim() : slugTopic(formName),
      updated_at: new Date().toISOString(),
    }

    if (drawer?.id) {
      const { error: e } = await supabase.from('iot_devices').update(payload).eq('id', drawer.id)
      if (e) {
        pushToast({ type: 'error', title: 'Gagal', message: e.message, durationMs: 6000 })
        setBusy(false)
        return
      }
      pushToast({ type: 'success', title: 'Berhasil', message: '✅ Device diperbarui', durationMs: 5000 })
      setDrawer(null)
      setBusy(false)
      await refetch()
      return
    }

    const { error: e } = await supabase.from('iot_devices').insert({ ...payload })
    if (e) {
      pushToast({ type: 'error', title: 'Gagal', message: e.message, durationMs: 6000 })
      setBusy(false)
      return
    }
    pushToast({ type: 'success', title: 'Berhasil', message: '✅ Device ditambahkan', durationMs: 5000 })
    setAddOpen(false)
    setBusy(false)
    await refetch()
  }

  const deleteDevice = async () => {
    const d = drawer
    if (!d?.id) return
    setBusy(true)
    const { error: e } = await supabase.from('iot_devices').delete().eq('id', d.id)
    if (e) {
      pushToast({ type: 'error', title: 'Gagal', message: e.message, durationMs: 6000 })
      setBusy(false)
      return
    }
    pushToast({ type: 'success', title: 'Dihapus', message: '🗑️ Device dihapus', durationMs: 5000 })
    setDeleteOpen(false)
    setDrawer(null)
    setBusy(false)
    await refetch()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">📡 Manajemen IoT Device</div>
          <div className="text-sm text-slate-300">CRUD device dari tabel `iot_devices` (Supabase).</div>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Tambah Device
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Cari device..."
          />
          <select className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={type} onChange={(e) => setType(e.target.value as DbDeviceType | 'SEMUA')}>
            <option value="SEMUA">Tipe</option>
            <option value="ALARM">ALARM</option>
            <option value="BUTTON">BUTTON</option>
            <option value="SENSOR">SENSOR</option>
          </select>
          <select className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={status} onChange={(e) => setStatus(e.target.value as DbDeviceStatus | 'SEMUA')}>
            <option value="SEMUA">Status</option>
            <option value="ONLINE">ONLINE</option>
            <option value="WARNING">WARNING</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
          <select className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={group} onChange={(e) => setGroup(e.target.value)}>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === 'SEMUA' ? 'Grup' : g}
              </option>
            ))}
          </select>
        </div>
        {error ? <div className="mt-3 text-sm text-red-200">{error}</div> : null}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <button
              key={d.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left hover:bg-white/5"
              onClick={() => openEdit(d)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-white">{d.name}</div>
                <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusPill(d.status)}`}>{d.status}</div>
              </div>
              <div className="mt-2 text-xs text-slate-300">Tipe: {d.type}</div>
              <div className="mt-1 text-xs text-slate-300">Grup: {d.group_name ?? '-'}</div>
              <div className="mt-1 text-xs text-slate-300">MQTT: {d.mqtt_topic ?? '-'}</div>
            </button>
          ))}
        </div>
      )}

      <RightDrawer open={!!drawer} title={drawer ? `📟 ${drawer.name}` : '📟 Device'} onClose={() => setDrawer(null)}>
        {drawer ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Detail ──</div>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <div>ID: {drawer.id}</div>
                <div>Status: {drawer.status}</div>
                <div>Signal: {drawer.signal ?? '-'}</div>
                <div>Last ping: {drawer.last_ping_at ?? '-'}</div>
                <div>Last triggered: {drawer.last_triggered_at ?? '-'}</div>
                <div>Triggers today: {drawer.triggers_today}</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Edit ──</div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-slate-300">Nama *</div>
                  <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-300">Tipe</div>
                    <select className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formType} onChange={(e) => setFormType(e.target.value as DbDeviceType)}>
                      <option value="ALARM">ALARM</option>
                      <option value="BUTTON">BUTTON</option>
                      <option value="SENSOR">SENSOR</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">Grup</div>
                    <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formGroup} onChange={(e) => setFormGroup(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-300">Latitude</div>
                    <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formLat} onChange={(e) => setFormLat(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">Longitude</div>
                    <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formLng} onChange={(e) => setFormLng(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300">MQTT Topic</div>
                  <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formTopic} onChange={(e) => setFormTopic(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                onClick={() => void saveDevice()}
                disabled={busy}
              >
                💾 Simpan
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                onClick={() => setDeleteOpen(true)}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" /> Hapus
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </RightDrawer>

      <OverlayModal open={addOpen} title="📡 Tambah Device Baru" onClose={() => setAddOpen(false)} widthClassName="w-[640px]">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-300">Nama Device *</div>
            <input
              className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value)
                if (!formTopic) setFormTopic(slugTopic(e.target.value))
              }}
              placeholder="Sirine Pos 3..."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-300">Tipe</div>
              <select className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formType} onChange={(e) => setFormType(e.target.value as DbDeviceType)}>
                <option value="ALARM">ALARM</option>
                <option value="BUTTON">BUTTON</option>
                <option value="SENSOR">SENSOR</option>
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-300">Grup</div>
              <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formGroup} onChange={(e) => setFormGroup(e.target.value)} placeholder="Grup Bogor" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-300">Latitude</div>
              <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formLat} onChange={(e) => setFormLat(e.target.value)} placeholder="-6.48" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-300">Longitude</div>
              <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formLng} onChange={(e) => setFormLng(e.target.value)} placeholder="106.82" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300">MQTT Topic</div>
            <input className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formTopic} onChange={(e) => setFormTopic(e.target.value)} placeholder="eas/devices/..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setAddOpen(false)} disabled={busy}>
              Batal
            </button>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60" onClick={() => void saveDevice()} disabled={busy}>
              💾 Simpan
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal open={deleteOpen && !!drawer} title="🗑️ Hapus Device" onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <div className="text-sm text-slate-200">
            Hapus device <span className="font-semibold text-white">{drawer?.name ?? '-'}</span>?
          </div>
          <div className="flex justify-end gap-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setDeleteOpen(false)} disabled={busy}>
              Batal
            </button>
            <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60" onClick={() => void deleteDevice()} disabled={busy}>
              Ya, Hapus
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}
