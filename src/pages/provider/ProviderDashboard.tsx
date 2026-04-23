import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Calendar, BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { PROVIDER_BOOKINGS } from '../../data/mock'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { clsx } from 'clsx'

type Tab = 'overview' | 'calendar' | 'bookings' | 'analytics'

const TABS: { key: Tab; icon: typeof LayoutDashboard; label: string }[] = [
  { key: 'overview', icon: LayoutDashboard, label: 'Przegląd' },
  { key: 'calendar', icon: Calendar, label: 'Kalendarz' },
  { key: 'bookings', icon: CheckCircle, label: 'Rezerwacje' },
  { key: 'analytics', icon: BarChart3, label: 'Analityka' },
]

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const TODAY_EVENTS = [
  { time: '10:00', end: '11:00', name: 'Anna Kowalska', service: 'Strzyżenie damskie', color: 'bg-brand-100 border-brand-400 text-brand-800' },
  { time: '12:00', end: '16:00', name: 'Maria Nowak', service: 'Balayage', color: 'bg-amber-100 border-amber-400 text-amber-800' },
]

function CalendarView() {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-gray-900">Dzisiaj — środa, 23 kwi</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">‹ Wczoraj</Button>
          <Button variant="secondary" size="sm">Jutro ›</Button>
        </div>
      </div>
      <div className="relative">
        {HOURS.map((h) => {
          const event = TODAY_EVENTS.find((e) => e.time === h)
          return (
            <div key={h} className="flex gap-3 min-h-[48px] border-t border-gray-100">
              <div className="w-14 text-xs text-gray-400 pt-1 flex-shrink-0">{h}</div>
              <div className="flex-1 py-1">
                {event && (
                  <div className={clsx('text-xs font-medium px-3 py-2 rounded-lg border-l-4', event.color)}>
                    <div className="font-semibold">{event.name}</div>
                    <div className="opacity-70">{event.service}</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BookingsTable() {
  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Wszystkie rezerwacje</h3>
        <Button variant="secondary" size="sm">Eksportuj</Button>
      </div>
      <div className="divide-y divide-gray-100">
        {PROVIDER_BOOKINGS.map((b) => (
          <div key={b.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm">Anna Wiśniewska</div>
              <div className="text-xs text-gray-500">{b.serviceName}</div>
            </div>
            <div className="text-sm text-gray-600 hidden sm:block">{b.date}</div>
            <div className="text-sm font-medium text-gray-700 hidden sm:block">{b.time}</div>
            <StatusBadge status={b.status} />
            <div className="font-bold text-sm text-gray-900">{b.price} zł</div>
            {b.status === 'pending' && (
              <div className="flex gap-1">
                <Button size="sm" className="text-xs px-2 py-1">Potwierdź</Button>
                <Button variant="danger" size="sm" className="text-xs px-2 py-1">Odrzuć</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Analytics() {
  const weekData = [45, 78, 62, 91, 55, 83, 70]
  const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd']
  const max = Math.max(...weekData)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Przychód (kwi)', val: '8 240 zł', trend: '+12%', up: true },
          { label: 'Rezerwacje (kwi)', val: '64', trend: '+8%', up: true },
          { label: 'Avg. wartość wizyty', val: '128 zł', trend: '+3%', up: true },
          { label: 'Ocena', val: '4.9 ★', trend: '0', up: null },
        ].map(({ label, val, trend, up }) => (
          <div key={label} className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{val}</div>
            {up !== null && (
              <div className={clsx('text-xs font-medium mt-1', up ? 'text-emerald-600' : 'text-red-500')}>
                <TrendingUp className="inline w-3 h-3 mr-0.5" />{trend} vs poprzedni miesiąc
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 card-shadow">
        <h3 className="font-bold text-gray-900 mb-5">Rezerwacje — ostatnie 7 dni</h3>
        <div className="flex items-end gap-2 h-32">
          {weekData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full gradient-brand rounded-t-lg transition-all duration-500"
                style={{ height: `${(v / max) * 100}%` }}
              />
              <span className="text-xs text-gray-400">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProviderDashboard() {
  const [tab, setTab] = useState<Tab>('overview')

  const todayBookings = PROVIDER_BOOKINGS.filter((b) => b.date === '2026-04-23')
  const pendingCount = PROVIDER_BOOKINGS.filter((b) => b.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel dostawcy</h1>
          <p className="text-gray-500 text-sm mt-1">Studio Kowalska Hair</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4" />
            {pendingCount} oczekujące rezerwacje
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-8 overflow-x-auto">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center',
              tab === key ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Dzisiaj', val: todayBookings.length, icon: <Calendar className="w-5 h-5" />, color: 'text-brand-600 bg-brand-50' },
                { label: 'Oczekujące', val: pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
                { label: 'Potwierdzone', val: PROVIDER_BOOKINGS.filter((b) => b.status === 'confirmed').length, icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Przychód (tydzień)', val: '2 160 zł', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
              ].map(({ label, val, icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-5 card-shadow">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
                    {icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{val}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CalendarView />
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Nadchodzące rezerwacje</h3>
                <div className="space-y-3">
                  {PROVIDER_BOOKINGS.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        AW
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Anna Wiśniewska</div>
                        <div className="text-xs text-gray-400">{b.serviceName} · {b.date} {b.time}</div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'calendar' && <CalendarView />}
        {tab === 'bookings' && <BookingsTable />}
        {tab === 'analytics' && <Analytics />}
      </motion.div>
    </div>
  )
}
