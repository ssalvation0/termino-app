import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Clock, ArrowRight } from 'lucide-react'
import { useBookingStore } from '../store/bookingStore'
import { useAsync } from '../hooks/useAsync'
import { getProvider } from '../lib/api'
import { Button } from '../components/ui/Button'

export function ConfirmationPage() {
  const navigate = useNavigate()
  // Snapshot booking data at mount: the store is reset right after, and under
  // StrictMode effects run twice, so rendering live store state would wipe the
  // page (reset-in-cleanup cleared everything before the second effect run).
  const [{ providerId, serviceId, date, time, addons }] = useState(useBookingStore.getState)

  const { data: provider } = useAsync(
    () => (providerId ? getProvider(providerId) : Promise.resolve(null)),
    [providerId],
  )
  const service = provider?.services.find((s) => s.id === serviceId)

  useEffect(() => {
    if (!providerId || !serviceId) {
      navigate('/', { replace: true })
      return
    }
    // Data is captured in the snapshot above — safe to clear for the next booking
    useBookingStore.getState().reset()
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Zgłoszenie wysłane!</h1>
        <p className="text-gray-500 mb-8">
          Czekamy na potwierdzenie od salonu. Powiadomimy Cię e-mailem gdy tylko zatwierdzą termin.
        </p>

        <div className="bg-white rounded-2xl p-6 card-shadow text-left mb-6">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <img
              src={provider?.images[0]}
              alt=""
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <div className="font-bold text-gray-900">{provider?.name}</div>
              <div className="text-sm text-gray-500">{service?.name}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{time} · {service?.duration_min} min</span>
            </div>
            {addons.length > 0 && (
              <div className="text-sm text-gray-500 pl-6">
                + {addons.map((a) => a.name).join(', ')}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button fullWidth size="lg" onClick={() => navigate('/profile')}>
            Moje rezerwacje
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button fullWidth variant="secondary" onClick={() => navigate('/')}>
            Wróć na stronę główną
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
