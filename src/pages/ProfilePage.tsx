import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, X, Loader2, AlertCircle, Pencil, Camera, Check } from 'lucide-react'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { BookingStatus } from '../lib/database.types'
import { clsx } from 'clsx'
import { useAuthStore } from '../store/authStore'
import { useAsync } from '../hooks/useAsync'
import { listMyBookings, updateBookingStatus, updateProfile, uploadAvatar } from '../lib/api'
import { useToast } from '../components/ui/Toast'

const TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'confirmed', label: 'Potwierdzone' },
  { key: 'pending', label: 'Oczekujące' },
  { key: 'completed', label: 'Zakończone' },
  { key: 'cancelled', label: 'Anulowane' },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

export function ProfilePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { session, profile, loading: authLoading, refreshProfile } = useAuthStore()
  const [tab, setTab] = useState<BookingStatus | 'all'>('all')

  // Profile editing
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: bookingsRaw, loading, refetch } = useAsync(
    () => (session ? listMyBookings() : Promise.resolve([])),
    [session?.user.id],
  )
  const bookings = bookingsRaw ?? []

  const filtered = bookings.filter((b) => tab === 'all' || b.status === tab)

  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    upcoming: bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length,
  }

  const startEdit = () => {
    if (!profile) return
    setEditName(profile.name)
    setEditPhone(profile.phone ?? '')
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!editName.trim()) {
      toast.show({ kind: 'error', title: 'Imię nie może być puste' })
      return
    }
    setSaving(true)
    try {
      await updateProfile({ name: editName.trim(), phone: editPhone.trim() || null })
      await refreshProfile()
      toast.show({ kind: 'success', title: 'Profil zaktualizowany' })
      setEditing(false)
    } catch (e) {
      toast.show({ kind: 'error', title: 'Nie udało się zapisać', body: e instanceof Error ? e.message : '' })
    } finally {
      setSaving(false)
    }
  }

  const onAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.show({ kind: 'error', title: 'Plik za duży', body: 'Maksymalny rozmiar zdjęcia to 2 MB.' })
      return
    }
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file)
      await updateProfile({ avatar_url: url })
      await refreshProfile()
      toast.show({ kind: 'success', title: 'Zdjęcie zaktualizowane' })
    } catch (err) {
      toast.show({ kind: 'error', title: 'Nie udało się wgrać zdjęcia', body: err instanceof Error ? err.message : '' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const cancel = async (id: string) => {
    if (!confirm('Czy na pewno chcesz anulować rezerwację?')) return
    try {
      await updateBookingStatus(id, 'cancelled')
      toast.show({ kind: 'success', title: 'Rezerwacja anulowana' })
      refetch()
    } catch (e) {
      toast.show({ kind: 'error', title: 'Nie udało się anulować', body: e instanceof Error ? e.message : '' })
    }
  }

  if (authLoading) {
    return <div className="text-center py-32 text-gray-400"><Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-500" /></div>
  }

  if (!session || !profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Musisz być zalogowany</h2>
        <p className="text-gray-500 mb-6">Zaloguj się, aby zobaczyć swoje rezerwacje.</p>
        <Button onClick={() => navigate('/auth')}>Zaloguj się</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        {/* Avatar — click to change */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploadingAvatar}
          className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg group flex-shrink-0 cursor-pointer"
          title="Zmień zdjęcie profilowe"
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
              {profile.name[0]?.toUpperCase()}
            </div>
          )}
          <div className={clsx(
            'absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity',
            uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}>
            {uploadingAvatar
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Camera className="w-5 h-5 text-white" />}
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />

        {editing ? (
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Imię i nazwisko"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-900 font-semibold"
              />
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+48 600 000 000"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-900"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={saveEdit} loading={saving} className="gap-1">
                <Check className="w-3.5 h-3.5" /> Zapisz
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Anuluj
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name}</h1>
              <button
                onClick={startEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0"
                title="Edytuj profil"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-500 text-sm">
              {session.user.email}
              {profile.phone && <> · {profile.phone}</>}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Łącznie rezerwacji', val: stats.total },
          { label: 'Zakończonych', val: stats.completed },
          { label: 'Nadchodzących', val: stats.upcoming },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white rounded-2xl p-5 card-shadow text-center">
            <div className="text-3xl font-bold text-brand-600">{val}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-brand-50 card-shadow',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bookings */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-gray-300">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Brak rezerwacji</p>
          </div>
        ) : (
          filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 card-shadow"
            >
              <div className="flex items-start gap-4">
                <img
                  src={booking.provider.images[0]}
                  alt={booking.provider.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-bold text-gray-900">{booking.provider.name}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{booking.service.name}</div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(booking.starts_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatTime(booking.starts_at)} · {booking.duration_min} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-gray-900">{Number(booking.total_price)} zł</span>
                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm" className="gap-1" onClick={() => cancel(booking.id)}>
                          <X className="w-3.5 h-3.5" /> Anuluj
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
