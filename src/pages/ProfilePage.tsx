import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, X, Loader2, AlertCircle } from 'lucide-react'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { BookingStatus } from '../lib/database.types'
import { clsx } from 'clsx'
import { useAuthStore } from '../store/authStore'
import { useAsync } from '../hooks/useAsync'
import { listMyBookings, updateBookingStatus } from '../lib/api'
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
  const { session, profile, loading: authLoading } = useAuthStore()
  const [tab, setTab] = useState<BookingStatus | 'all'>('all')

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
        <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {profile.name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-500 text-sm">
            {session.user.email}
            {profile.phone && <> · {profile.phone}</>}
          </p>
        </div>
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
