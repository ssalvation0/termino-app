import { useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, Clock, CreditCard, User, Calendar } from 'lucide-react'
import { PROVIDERS, TIME_SLOTS } from '../data/mock'
import { useBookingStore } from '../store/bookingStore'
import { Button } from '../components/ui/Button'
import { clsx } from 'clsx'

const STEPS = ['Data', 'Godzina', 'Dodatki', 'Dane', 'Płatność']

function generateDates() {
  const today = new Date()
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })
}

const DAYS_PL = ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob']
const MONTHS_PL = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function BookingPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const provider = PROVIDERS.find((p) => p.id === id)

  const { date, time, addons, step, setDate, setTime, toggleAddon, setStep } = useBookingStore()

  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [paying, setPaying] = useState(false)

  const serviceId = searchParams.get('service') ?? provider?.services[0]?.id
  const service = provider?.services.find((s) => s.id === serviceId)

  const dates = useMemo(() => generateDates(), [])

  const availableSlots = useMemo(() => {
    return TIME_SLOTS.map((t, i) => ({ time: t, available: i % 3 !== 0 }))
  }, [date])

  const totalPrice = (service?.price ?? 0) + addons.reduce((sum, a) => sum + a.price, 0)

  if (!provider || !service) {
    return <div className="text-center py-20 text-gray-400">Nie znaleziono usługi</div>
  }

  const handlePay = async () => {
    setPaying(true)
    await new Promise((r) => setTimeout(r, 1800))
    navigate('/confirmation')
  }

  const canNext = () => {
    if (step === 1) return !!date
    if (step === 2) return !!time
    if (step === 4) return guestName.trim() && guestPhone.trim() && guestEmail.trim()
    return true
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
        className="flex items-center gap-1 text-gray-500 hover:text-brand-600 text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Wróć' : 'Poprzedni krok'}
      </button>

      {/* Provider mini header */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src={provider.images[0]}
          alt={provider.name}
          className="w-12 h-12 rounded-xl object-cover"
        />
        <div>
          <div className="font-bold text-gray-900">{provider.name}</div>
          <div className="text-sm text-gray-500">{service.name} · {service.price} zł</div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={label} className={clsx('flex items-center', i < STEPS.length - 1 && 'flex-1')}>
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all',
                done ? 'bg-brand-600 text-white' : active ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-gray-100 text-gray-400'
              )}>
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx('flex-1 h-0.5 mx-1', done ? 'bg-brand-600' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mb-8 -mt-5">
        {STEPS.map((label) => <span key={label} className="text-center">{label}</span>)}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl p-6 card-shadow mb-6"
        >
          {/* Step 1 — Data */}
          {step === 1 && (
            <div>
              <h2 className="font-bold text-xl text-gray-900 mb-5">Wybierz datę</h2>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((d) => {
                  const val = formatDate(d)
                  const isToday = formatDate(new Date()) === val
                  return (
                    <button
                      key={val}
                      onClick={() => setDate(val)}
                      className={clsx(
                        'flex flex-col items-center p-2 rounded-xl text-sm transition-all',
                        date === val ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 text-gray-700',
                      )}
                    >
                      <span className="text-xs opacity-70">{DAYS_PL[d.getDay()]}</span>
                      <span className="font-bold text-base">{d.getDate()}</span>
                      <span className="text-xs opacity-70">{MONTHS_PL[d.getMonth()]}</span>
                      {isToday && date !== val && (
                        <span className="w-1 h-1 bg-accent-500 rounded-full mt-0.5" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Godzina */}
          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-gray-900 mb-5">
                Wybierz godzinę
                <span className="text-sm font-normal text-gray-400 ml-2">· {service.duration} min</span>
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {availableSlots.map(({ time: t, available }) => (
                  <button
                    key={t}
                    disabled={!available}
                    onClick={() => setTime(t)}
                    className={clsx(
                      'py-2.5 rounded-xl text-sm font-medium transition-all',
                      !available && 'opacity-30 cursor-not-allowed bg-gray-50 text-gray-400',
                      available && time === t && 'bg-brand-600 text-white',
                      available && time !== t && 'bg-gray-50 text-gray-700 hover:bg-brand-50 hover:text-brand-700',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-200 rounded" />
                Szary = zajęty
              </p>
            </div>
          )}

          {/* Step 3 — Dodatki */}
          {step === 3 && (
            <div>
              <h2 className="font-bold text-xl text-gray-900 mb-2">Dodatki</h2>
              <p className="text-sm text-gray-400 mb-5">Opcjonalne — możesz pominąć</p>
              {service.addons && service.addons.length > 0 ? (
                <div className="space-y-3">
                  {service.addons.map((addon) => {
                    const selected = addons.some((a) => a.id === addon.id)
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={clsx(
                          'w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all text-left',
                          selected ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            selected ? 'border-brand-600 bg-brand-600' : 'border-gray-300',
                          )}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-medium text-gray-900">{addon.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">+{addon.price} zł</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-300">
                  <p>Brak dostępnych dodatków dla tej usługi</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Dane */}
          {step === 4 && (
            <div>
              <h2 className="font-bold text-xl text-gray-900 mb-5">Twoje dane</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Imię i nazwisko</label>
                  <input
                    type="text"
                    placeholder="Anna Kowalska"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Telefon</label>
                  <input
                    type="tel"
                    placeholder="+48 600 000 000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">E-mail</label>
                  <input
                    type="email"
                    placeholder="anna@przykład.pl"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 bg-brand-50 rounded-xl">
                <User className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-brand-700">Rezerwujesz jako gość. <span className="underline cursor-pointer">Zaloguj się</span> by zarządzać rezerwacjami.</p>
              </div>
            </div>
          )}

          {/* Step 5 — Płatność */}
          {step === 5 && (
            <div>
              <h2 className="font-bold text-xl text-gray-900 mb-5">Podsumowanie i płatność</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{service.name}</span>
                  <span className="font-medium">{service.price} zł</span>
                </div>
                {addons.map((a) => (
                  <div key={a.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{a.name}</span>
                    <span className="font-medium">+{a.price} zł</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Termin</span>
                  <span className="font-medium">{date}, {time}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between font-bold text-base">
                  <span>Razem</span>
                  <span className="text-brand-600">{totalPrice} zł</span>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl mb-5">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <CreditCard className="w-4 h-4" />
                  <span>Dane karty (demo)</span>
                </div>
                <input
                  type="text"
                  value="4242 4242 4242 4242"
                  readOnly
                  className="w-full text-sm bg-transparent text-gray-400 outline-none"
                />
              </div>

              <Button fullWidth size="lg" onClick={handlePay} loading={paying}>
                {paying ? 'Przetwarzanie...' : `Zapłać ${totalPrice} zł`}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Krok {step} z {STEPS.length}
          </div>
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            size="lg"
          >
            {step === 4 ? 'Przejdź do płatności' : 'Dalej'}
          </Button>
        </div>
      )}
    </div>
  )
}
