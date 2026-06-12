import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Calendar, BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Loader2, Building2, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { useAsync } from '../../hooks/useAsync'
import { getMyProviders, listProviderBookings, updateBookingStatus } from '../../lib/api'
import type { BookingWithJoins } from '../../lib/api'
import { FirmSettings, CreateFirmForm } from './FirmSettings'
import { supabase } from '../../lib/supabase'

type Tab = 'overview' | 'calendar' | 'bookings' | 'analytics' | 'firm'

const TABS: { key: Tab; icon: typeof LayoutDashboard; label: string }[] = [
  { key: 'overview', icon: LayoutDashboard, label: 'Przegląd' },
  { key: 'calendar', icon: Calendar, label: 'Kalendarz' },
  { key: 'bookings', icon: CheckCircle, label: 'Rezerwacje' },
  { key: 'analytics', icon: BarChart3, label: 'Analityka' },
  { key: 'firm', icon: Settings, label: 'Firma' },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' })
}
function isSameDay(iso: string, ref: Date) {
  const d = new Date(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
}

function CalendarView({ bookings }: { bookings: BookingWithJoins[] }) {
  const [offset, setOffset] = useState(0)
  const day = new Date()
  day.setDate(day.getDate() + offset)
  const isToday = offset === 0

  const days = bookings
    .filter((b) => isSameDay(b.starts_at, day) && b.status !== 'cancelled')
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  // 09–18 by default, extended when bookings fall outside that range
  let startH = 9, endH = 18
  for (const b of days) {
    const s = new Date(b.starts_at)
    startH = Math.min(startH, s.getHours())
    endH = Math.max(endH, Math.ceil((s.getHours() * 60 + s.getMinutes() + b.duration_min) / 60))
  }
  const hours = Array.from({ length: endH - startH + 1 }, (_, i) => startH + i)

  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-5 gap-2">
        <h3 className="font-bold text-lg text-gray-900">
          {isToday ? 'Dzisiaj' : day.toLocaleDateString('pl-PL', { weekday: 'long' })} — {day.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setOffset((o) => o - 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Poprzedni dzień">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isToday && (
            <button onClick={() => setOffset(0)} className="px-2 py-1 rounded-lg hover:bg-gray-100 text-xs text-gray-500">
              Dziś
            </button>
          )}
          <button onClick={() => setOffset((o) => o + 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Następny dzień">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        {hours.map((h) => {
          const events = days.filter((b) => new Date(b.starts_at).getHours() === h)
          return (
            <div key={h} className="flex gap-3 min-h-[48px] border-t border-gray-100">
              <div className="w-14 text-xs text-gray-400 pt-1 flex-shrink-0">{String(h).padStart(2, '0')}:00</div>
              <div className="flex-1 py-1 space-y-1">
                {events.map((event) => (
                  <div key={event.id} className="text-xs font-medium px-3 py-2 rounded-lg border-l-4 bg-brand-100 border-brand-400 text-brand-800">
                    <div className="font-semibold">{formatTime(event.starts_at)} · {event.service.name}</div>
                    <div className="opacity-70">{event.duration_min} min · {Number(event.total_price)} zł</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {days.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Brak rezerwacji {isToday ? 'na dziś' : 'w tym dniu'}</p>
        )}
      </div>
    </div>
  )
}

function BookingsTable({ bookings, onAction, onToast }: { bookings: BookingWithJoins[]; onAction: () => void; onToast: (msg: string, kind: 'success' | 'error') => void }) {
  const confirm = async (id: string) => {
    try { await updateBookingStatus(id, 'confirmed'); onToast('Rezerwacja potwierdzona', 'success'); onAction() }
    catch (e) { onToast(e instanceof Error ? e.message : 'Błąd', 'error') }
  }
  const reject = async (id: string) => {
    try { await updateBookingStatus(id, 'cancelled'); onToast('Rezerwacja odrzucona', 'success'); onAction() }
    catch (e) { onToast(e instanceof Error ? e.message : 'Błąd', 'error') }
  }
  const complete = async (id: string) => {
    try { await updateBookingStatus(id, 'completed'); onToast('Wizyta zakończona', 'success'); onAction() }
    catch (e) { onToast(e instanceof Error ? e.message : 'Błąd', 'error') }
  }

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Wszystkie rezerwacje ({bookings.length})</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {bookings.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">Brak rezerwacji</p>
        ) : bookings.map((b) => (
          <div key={b.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <div className="font-medium text-gray-900 text-sm">{b.service.name}</div>
              <div className="text-xs text-gray-500">{b.duration_min} min</div>
            </div>
            <div className="text-sm text-gray-600 hidden sm:block">{formatDate(b.starts_at)}</div>
            <div className="text-sm font-medium text-gray-700 hidden sm:block">{formatTime(b.starts_at)}</div>
            <StatusBadge status={b.status} />
            <div className="font-bold text-sm text-gray-900">{Number(b.total_price)} zł</div>
            {b.status === 'pending' && (
              <div className="flex gap-1">
                <Button size="sm" className="text-xs px-2 py-1" onClick={() => confirm(b.id)}>Potwierdź</Button>
                <Button variant="danger" size="sm" className="text-xs px-2 py-1" onClick={() => reject(b.id)}>Odrzuć</Button>
              </div>
            )}
            {b.status === 'confirmed' && new Date(b.starts_at) <= new Date() && (
              <Button variant="secondary" size="sm" className="text-xs px-2 py-1" onClick={() => complete(b.id)}>
                Zakończ
              </Button>
            )}
            {b.notes && (
              <div className="w-full text-xs text-gray-400 -mt-1">{b.notes}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Analytics({ bookings }: { bookings: BookingWithJoins[] }) {
  const completed = bookings.filter((b) => b.status === 'completed')
  const revenue = completed.reduce((s, b) => s + Number(b.total_price), 0)
  const avg = completed.length ? Math.round(revenue / completed.length) : 0

  const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd']
  const weekData = Array(7).fill(0)
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    weekData[6 - i] = bookings.filter((b) => isSameDay(b.starts_at, d)).length
  }
  const max = Math.max(...weekData, 1)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Przychód (zakończone)', val: `${revenue} zł` },
          { label: 'Rezerwacji łącznie', val: bookings.length },
          { label: 'Avg. wartość wizyty', val: `${avg} zł` },
          { label: 'Zakończonych', val: completed.length },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white rounded-2xl p-5 card-shadow">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 card-shadow">
        <h3 className="font-bold text-gray-900 mb-5">Rezerwacje — ostatnie 7 dni</h3>
        <div className="flex items-end gap-2 h-32">
          {weekData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full gradient-brand rounded-t-lg transition-all duration-500" style={{ height: `${(v / max) * 100}%` }} />
              <span className="text-xs text-gray-400">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProviderDashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const { session, profile, loading: authLoading } = useAuthStore()
  const [tab, setTab] = useState<Tab>('overview')

  const { data: providersRaw, loading: provLoading, refetch: refetchProviders } = useAsync(
    () => (session ? getMyProviders() : Promise.resolve([])),
    [session?.user.id],
  )
  const providers = providersRaw ?? []
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const provider = providers.find((p) => p.id === selectedProviderId) ?? providers[0] ?? null

  const { data: bookingsRaw, loading: bookLoading, refetch } = useAsync(
    () => (provider ? listProviderBookings(provider.id) : Promise.resolve([])),
    [provider?.id],
  )
  const bookings = bookingsRaw ?? []

  // Realtime: subscribe to changes on bookings for this provider
  useEffect(() => {
    if (!provider) return
    const ch = supabase
      .channel(`provider-bookings-${provider.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `provider_id=eq.${provider.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.show({ kind: 'notification', title: 'Nowa rezerwacja!', body: 'Sprawdź zakładkę "Rezerwacje" aby zatwierdzić.' })
          } else if (payload.eventType === 'UPDATE') {
            const oldRow = payload.old as { status?: string }
            const newRow = payload.new as { status?: string }
            if (oldRow?.status !== newRow?.status && newRow?.status === 'cancelled') {
              toast.show({ kind: 'info', title: 'Klient odwołał wizytę' })
            }
          }
          refetch()
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [provider?.id])

  if (authLoading || provLoading) {
    return <div className="text-center py-32 text-gray-400"><Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-500" /></div>
  }

  if (!session || !profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Musisz być zalogowany</h2>
        <Button onClick={() => navigate('/auth')}>Zaloguj się</Button>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Nie masz jeszcze firmy</h2>
        </div>
        <CreateFirmForm onCreated={refetchProviders} />
      </div>
    )
  }

  const today = new Date()
  const todayBookings = bookings.filter((b) => isSameDay(b.starts_at, today))
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const weekRevenue = bookings
    .filter((b) => b.status === 'completed' && (today.getTime() - new Date(b.starts_at).getTime()) < 7 * 86400000)
    .reduce((s, b) => s + Number(b.total_price), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel dostawcy</h1>
          {providers.length > 1 ? (
            <select
              value={provider.id}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="mt-1 px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          ) : (
            <p className="text-gray-500 text-sm mt-1">{provider.name}</p>
          )}
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4" />
            {pendingCount} oczekujące rezerwacje
          </div>
        )}
      </div>

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

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Dzisiaj', val: todayBookings.length, icon: <Calendar className="w-5 h-5" />, color: 'text-brand-600 bg-brand-50' },
                { label: 'Oczekujące', val: pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
                { label: 'Potwierdzone', val: bookings.filter((b) => b.status === 'confirmed' && new Date(b.starts_at) >= today).length, icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Przychód (tydzień)', val: `${weekRevenue} zł`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
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
              <CalendarView bookings={bookings} />
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Nadchodzące rezerwacje</h3>
                {bookLoading ? (
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-brand-500 my-8" />
                ) : (
                  <div className="space-y-3">
                    {bookings.filter((b) => new Date(b.starts_at) >= today).slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {b.service.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{b.service.name}</div>
                          <div className="text-xs text-gray-400">{formatDate(b.starts_at)} {formatTime(b.starts_at)}</div>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-center text-sm text-gray-400 py-4">Brak rezerwacji</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'calendar' && <CalendarView bookings={bookings} />}
        {tab === 'bookings' && <BookingsTable bookings={bookings} onAction={refetch} onToast={(msg, kind) => toast.show({ kind, title: msg })} />}
        {tab === 'analytics' && <Analytics bookings={bookings} />}
        {tab === 'firm' && <FirmSettings key={provider.id} provider={provider} onSaved={refetchProviders} />}
      </motion.div>
    </div>
  )
}
