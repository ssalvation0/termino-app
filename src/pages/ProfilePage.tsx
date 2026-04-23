import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, RotateCcw, X } from 'lucide-react'
import { MOCK_BOOKINGS, MOCK_USER } from '../data/mock'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { BookingStatus } from '../types'
import { clsx } from 'clsx'

const TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'confirmed', label: 'Potwierdzone' },
  { key: 'pending', label: 'Oczekujące' },
  { key: 'completed', label: 'Zakończone' },
  { key: 'cancelled', label: 'Anulowane' },
]

export function ProfilePage() {
  const [tab, setTab] = useState<BookingStatus | 'all'>('all')

  const filtered = MOCK_BOOKINGS.filter((b) => tab === 'all' || b.status === tab)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {MOCK_USER.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{MOCK_USER.name}</h1>
          <p className="text-gray-500 text-sm">{MOCK_USER.email} · {MOCK_USER.phone}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Łącznie rezerwacji', val: MOCK_BOOKINGS.length },
          { label: 'Zakończonych', val: MOCK_BOOKINGS.filter((b) => b.status === 'completed').length },
          { label: 'Nadchodzących', val: MOCK_BOOKINGS.filter((b) => b.status === 'confirmed').length },
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
        {filtered.length === 0 ? (
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
                  src={booking.providerImage}
                  alt={booking.providerName}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-bold text-gray-900">{booking.providerName}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{booking.serviceName}</div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {booking.time} · {booking.duration} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-gray-900">{booking.price} zł</span>
                    {booking.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <RotateCcw className="w-3.5 h-3.5" /> Zmień termin
                        </Button>
                        <Button variant="danger" size="sm" className="gap-1">
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
