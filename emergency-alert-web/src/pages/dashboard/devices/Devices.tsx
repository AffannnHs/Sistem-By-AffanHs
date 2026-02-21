import { useEffect, useMemo, useState } from 'react'
import { Bell, CircleDot, Radio, Plus, Settings, Trash2 } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import OverlayModal from '@/components/OverlayModal'
import RightDrawer from '@/components/RightDrawer'
import { useToastStore } from '@/stores/toastStore'
import { devices as seed } from '@/mock/data'
import type { Device, DeviceStatus, DeviceType } from '@/mock/types'

function typeIcon(t: DeviceType) {
  if (t === 'ALARM') return Bell
  if (t === 'BUTTON') return CircleDot
  return Radio
}

function statusTop(s: DeviceStatus) {
  if (s === 'ONLINE') return 'border-t-2 border-emerald-500'
  if (s === 'WARNING') return 'border-t-2 border-amber-500'
  return 'border-t-2 border-red-500 opacity-70'
}

function signalBars(signal: number) {
  const filled = Math.round((Math.max(0, Math.min(100, signal)) / 100) * 5)
  return Array.from({ length: 5 }).map((_, i) => i < filled)
}

function slugTopic(name: string) {
  return `eas/devices/${name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
}

export default function Devices() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Device[]>(seed)

  const [q, setQ] = useState('')
  const [type, setType] = useState<DeviceType | 'SEMUA'>('SEMUA')
  const [status, setStatus] = useState<DeviceStatus | 'SEMUA'>('SEMUA')
  const [group, setGroup] = useState<string>('SEMUA')

  const [testTarget, setTestTarget] = useState<Device | null>(null)
  const [testLeft, setTestLeft] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [drawer, setDrawer] = useState<Device | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<DeviceType>('ALARM')
  const [formGroup, setFormGroup] = useState('Grup Bogor')
  const [formLoc, setFormLoc] = useState('')
  const [formLat, setFormLat] = useState('')
  const [formLng, setFormLng] = useState('')
  const [formTopic, setFormTopic] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1500)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!testLeft) return
    const t = window.setInterval(() => setTestLeft((x) => (x <= 0 ? 0 : x - 1)), 1000)
    return () => window.clearInterval(t)
  }, [testLeft])

  const groups = useMemo(() => ['SEMUA', ...Array.from(new Set(rows.map((r) => r.group)))], [rows])
  const qq = q.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      rows
        .filter((d) => (type === 'SEMUA' ? true : d.type === type))
        .filter((d) => (status === 'SEMUA' ? true : d.status === status))
        .filter((d) => (group === 'SEMUA' ? true : d.group === group))
        .filter((d) => (qq ? d.name.toLowerCase().includes(qq) || d.location.toLowerCase().includes(qq) : true)),
    [group, qq, rows, status, type],
  )

  const stats = useMemo(() => {
    const online = rows.filter((d) => d.status === 'ONLINE').length
    const offline = rows.filter((d) => d.status === 'OFFLINE').length
    const warning = rows.filter((d) => d.status === 'WARNING').length
    return { online, offline, warning, total: rows.length }
  }, [rows])

  const openAdd = () => {
    setAddOpen(true)
    setFormName('')
    setFormType('ALARM')
    setFormGroup('Grup Bogor')
    setFormLoc('')
    setFormLat('')
    setFormLng('')
    setFormTopic('')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">📡 Manajemen IoT Device</div>
          <div className="text-sm text-slate-300">Pantau status, uji trigger, dan kelola device.</div>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
          onClick={openAdd}
        >
          <Plus className="h-4 w-4" />
          Tambah Device
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            data-search
            className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Cari device..."
          />
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={type}
            onChange={(e) => setType(e.target.value as DeviceType | 'SEMUA')}
          >
            <option value="SEMUA">Tipe</option>
            <option value="ALARM">ALARM</option>
            <option value="BUTTON">BUTTON</option>
            <option value="SENSOR">SENSOR</option>
          </select>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value as DeviceStatus | 'SEMUA')}
          >
            <option value="SEMUA">Status</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="WARNING">Warning</option>
          </select>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === 'SEMUA' ? 'Grup' : g}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[{ k: 'Online', v: stats.online, c: 'bg-emerald-500/15 text-emerald-200' }, { k: 'Offline', v: stats.offline, c: 'bg-red-500/15 text-red-200' }, { k: 'Warning', v: stats.warning, c: 'bg-amber-500/15 text-amber-200' }, { k: 'Total', v: stats.total, c: 'bg-blue-500/15 text-blue-200' }].map((s) => (
            <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">{s.k}</div>
              <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center">
          <div className="text-5xl">📡</div>
          <div className="mt-3 text-lg font-semibold text-white">Belum ada device terdaftar</div>
          <div className="mt-1 text-sm text-slate-300">Tambahkan device pertama untuk memulai monitoring.</div>
          <button
            className="mt-6 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            onClick={openAdd}
          >
            + Tambah Device Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => {
            const Icon = typeIcon(d.type)
            const disabledTest = d.status === 'OFFLINE'
            const isTesting = testTarget?.id === d.id && testLeft > 0
            return (
              <div key={d.id} className={`rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 ${statusTop(d.status)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        d.status === 'ONLINE'
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : d.status === 'WARNING'
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-red-500/15 text-red-200'
                      }`}
                    >
                      {isTesting ? '🔔 Testing...' : d.status === 'ONLINE' ? '🟢 Online' : d.status === 'WARNING' ? '🟡 Warning' : '🔴 Offline'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm font-semibold text-white">{d.name}</div>
                <div className="mt-1 text-xs text-slate-300">Tipe: {d.type}</div>
                <div className="mt-1 text-xs text-slate-300">Grup: {d.group}</div>
                <div className="mt-1 text-xs text-slate-300">📍 {d.location}</div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-200">── Status & Signal ──</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="text-xs text-slate-300">Signal:</div>
                    <div className="flex items-center gap-1">
                      {signalBars(d.signal).map((on, i) => (
                        <div
                          key={i}
                          className={`h-3 w-2 rounded-sm ${
                            !on
                              ? 'bg-white/10'
                              : d.status === 'OFFLINE'
                                ? 'bg-red-500'
                                : d.signal < 50
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-300">{d.signal}%</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">Last ping: {d.lastPing}</div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-200">── Aktivitas ──</div>
                  <div className="mt-2 text-xs text-slate-300">Terakhir dipicu: {d.lastTriggered}</div>
                  <div className="mt-1 text-xs text-slate-300">Total trigger hari ini: {d.triggersToday}x</div>
                </div>

                {isTesting ? (
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(testLeft / 3) * 100}%`,
                        background: testLeft >= 2 ? '#22c55e' : testLeft === 1 ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <button
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                      disabledTest
                        ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                    title={disabledTest ? 'Device sedang offline' : undefined}
                    disabled={disabledTest}
                    onClick={() => setTestTarget(d)}
                  >
                    🔔 Test
                  </button>
                  <button
                    className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                    onClick={() => setDrawer(d)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Pengaturan
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <OverlayModal
        open={!!testTarget}
        title="🔔 Test Trigger Device"
        onClose={() => setTestTarget(null)}
        widthClassName="w-[520px]"
      >
        <div className="space-y-4">
          <div className="text-sm font-semibold text-white">{testTarget?.name}</div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            ⚠️ Device akan berbunyi selama 3 detik sebagai pengujian. Pastikan area sekitar sudah siap.
          </div>
          <div className="flex justify-end gap-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setTestTarget(null)}>
              Batal
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => {
                const d = testTarget
                if (!d) return
                setTestTarget(null)
                setTestLeft(3)
                window.setTimeout(() => {
                  setTestLeft(0)
                  pushToast({ type: 'success', title: 'Test berhasil', message: `✅ Test berhasil — ${d.name} berbunyi 3 detik`, durationMs: 5000 })
                }, 3000)
              }}
            >
              🔔 Trigger Sekarang
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal open={addOpen} title="📡 Tambah Device Baru" onClose={() => setAddOpen(false)} widthClassName="w-[640px]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-300">Nama Device *</div>
            <input
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value)
                if (!formTopic) setFormTopic(slugTopic(e.target.value))
              }}
              placeholder="Sirine Pos 3..."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">Tipe Device *</div>
              <select
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
                value={formType}
                onChange={(e) => setFormType(e.target.value as DeviceType)}
              >
                <option value="ALARM">🔔 Alarm Sirine</option>
                <option value="BUTTON">👆 Tombol Panic</option>
                <option value="SENSOR">📡 Sensor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">Grup *</div>
              <select
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
                value={formGroup}
                onChange={(e) => setFormGroup(e.target.value)}
              >
                <option>Grup Bogor</option>
                <option>Grup Sentul</option>
                <option>Grup Depok</option>
                <option>Grup Bogor Kota</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-300">Lokasi</div>
            <input
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={formLoc}
              onChange={(e) => setFormLoc(e.target.value)}
              placeholder="Nama lokasi..."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">Latitude</div>
              <input className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formLat} onChange={(e) => setFormLat(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">Longitude</div>
              <input className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={formLng} onChange={(e) => setFormLng(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-300">MQTT Topic</div>
            <input
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={formTopic}
              onChange={(e) => setFormTopic(e.target.value)}
              placeholder="eas/devices/alarm-pos-3"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setAddOpen(false)}>
              Batal
            </button>
            <button
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              onClick={() => {
                if (!formName.trim() || !formGroup.trim() || !formType) {
                  pushToast({ type: 'error', title: 'Validasi', message: 'Nama, tipe, dan grup wajib diisi.', durationMs: 5000 })
                  return
                }
                const d: Device = {
                  id: `DEV-${String(rows.length + 1).padStart(3, '0')}`,
                  name: formName.trim(),
                  type: formType,
                  group: formGroup,
                  location: formLoc || '-',
                  status: 'ONLINE',
                  signal: 90,
                  lastPing: 'baru saja',
                  lastTriggered: 'Belum pernah',
                  triggersToday: 0,
                  mqttTopic: formTopic || slugTopic(formName),
                }
                setRows((x) => [d, ...x])
                setAddOpen(false)
                pushToast({ type: 'success', title: 'Device ditambahkan', message: '✅ Device berhasil ditambahkan', durationMs: 5000 })
              }}
            >
              ➕ Tambah Device
            </button>
          </div>
        </div>
      </OverlayModal>

      <RightDrawer open={!!drawer} title="⚙️ Pengaturan Device" onClose={() => setDrawer(null)}>
        {drawer ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-white">{drawer.name}</div>
              <div className="mt-1 text-xs text-slate-400">{drawer.status === 'ONLINE' ? '🟢 Online' : drawer.status === 'WARNING' ? '🟡 Warning' : '🔴 Offline'}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Info Device ──</div>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <div>ID Device: {drawer.id}</div>
                <div>Tipe: {drawer.type}</div>
                <div>Grup: {drawer.group}</div>
                <div>Lokasi: {drawer.location}</div>
                <div>MQTT Topic: {drawer.mqttTopic}</div>
                <div>Terdaftar: 15 Jan 2025</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Log Aktivitas (5 terakhir) ──</div>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <div>14:23 - Alert KEBAKARAN dipicu</div>
                <div>12:01 - Test trigger oleh Admin</div>
                <div>Kemarin 08:15 - Alert MEDIS dipicu</div>
                <div>3 hari lalu - Test trigger</div>
                <div>5 hari lalu - Device online kembali</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Kontrol ──</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-slate-200">Status Aktif</div>
                <button
                  className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200"
                  onClick={() => pushToast({ type: 'info', title: 'Toggle', message: 'Toggle aktif/nonaktif (simulasi).', durationMs: 5000 })}
                >
                  Toggle ON
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => pushToast({ type: 'info', title: 'Edit', message: 'Edit info device (simulasi).', durationMs: 5000 })}
              >
                ✏️ Edit Info
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                onClick={() => setDeleteOpen(true)}
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Hapus
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </RightDrawer>

      <OverlayModal open={deleteOpen && !!drawer} title="🗑️ Hapus Device" onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <div className="text-sm text-slate-200">Hapus device <span className="font-semibold text-white">{drawer?.name}</span>?</div>
          <div className="flex justify-end gap-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setDeleteOpen(false)}>
              Batal
            </button>
            <button
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              onClick={() => {
                const cur = drawer
                if (!cur) return
                setRows((x) => x.filter((d) => d.id !== cur.id))
                setDeleteOpen(false)
                setDrawer(null)
                pushToast({ type: 'error', title: 'Device dihapus', message: '🗑️ Device berhasil dihapus', durationMs: 5000 })
              }}
            >
              Hapus
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}

