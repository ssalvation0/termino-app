import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, BadgeCheck, ChevronLeft, ChevronRight, ArrowRight, Loader2, Star, MessageSquare } from 'lucide-react'
import { StarRating } from '../components/ui/StarRating'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProviderMap } from '../components/ui/ProviderMap'
import { useBookingStore } from '../store/bookingStore'
import { useAsync } from '../hooks/useAsync'
import { getProvider, listProviderReviews } from '../lib/api'
import type { WorkingDay } from '../lib/database.types'

const DAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd']
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

function formatDuration(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} godz. ${m} min` : `${h} godz.`
}

export function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: provider, loading } = useAsync(() => (id ? getProvider(id) : Promise.resolve(null)), [id])
  const { data: reviews } = useAsync(() => (id ? listProviderReviews(id) : Promise.resolve([])), [id])
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const { setProvider, setService } = useBookingStore()

  if (loading) {
    return (
      <div className="text-center py-32 text-gray-400">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-500" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="text-center py-32 text-gray-400">
        <p className="text-2xl mb-4">404</p>
        <Button onClick={() => navigate('/search')}>Wróć do wyszukiwania</Button>
      </div>
    )
  }

  const handleBook = () => {
    const svcId = selectedService ?? provider.services[0].id
    setProvider(provider.id)
    setService(svcId)
    navigate(`/booking/${provider.id}?service=${svcId}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-500 hover:text-brand-600 text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Wróć
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-100">
            <motion.img
              key={imgIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={provider.images[imgIdx]}
              alt={provider.name}
              className="w-full h-full object-cover"
            />
            {provider.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + provider.images.length) % provider.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow hover:bg-white transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % provider.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow hover:bg-white transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {provider.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white w-5' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                  {provider.verified && (
                    <BadgeCheck className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <StarRating rating={provider.rating} count={provider.review_count} />
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {provider.address}, {provider.city}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">od</div>
                <div className="text-2xl font-bold text-brand-600">{Number(provider.priceFrom)} zł</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {provider.tags.map((tag) => (
                <Badge key={tag} variant="neutral" size="sm">{tag}</Badge>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed">{provider.description}</p>
          </div>

          {/* Usługi */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h2 className="font-bold text-xl text-gray-900 mb-4">Usługi</h2>
            <div className="space-y-3">
              {provider.services.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedService === svc.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-100 hover:border-brand-200'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900">{svc.name}</span>
                      {selectedService === svc.id && (
                        <Badge variant="brand" size="sm">Wybrano</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{svc.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(svc.duration_min)}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 whitespace-nowrap">{svc.price} zł</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa */}
          {provider.lat && provider.lng && (
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h2 className="font-bold text-xl text-gray-900 mb-4">Lokalizacja</h2>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {provider.address}, {provider.city}
              </p>
              <ProviderMap
                lat={Number(provider.lat)}
                lng={Number(provider.lng)}
                name={provider.name}
                address={provider.address}
                className="h-72 w-full"
              />
            </div>
          )}

          {/* Opinie */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              Opinie ({reviews?.length ?? 0})
            </h2>
            {!reviews || reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Brak opinii — bądź pierwszą osobą, która oceni to miejsce po wizycie.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{r.authorName}</span>
                      <span className="flex items-center gap-2">
                        <span className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Godziny pracy */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h2 className="font-bold text-xl text-gray-900 mb-4">Godziny pracy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DAY_KEYS.map((key, i) => {
                const hours = provider.working_hours[key] as WorkingDay | null
                return (
                  <div key={key} className={`flex justify-between text-sm px-3 py-2 rounded-lg ${!hours ? 'text-gray-300' : 'text-gray-700'} ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <span className="font-medium">{DAYS[i]}</span>
                    <span>{hours ? `${hours.open} – ${hours.close}` : 'Zamknięte'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right — Sticky CTA ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 card-shadow sticky top-24">
            <h3 className="font-bold text-lg text-gray-900 mb-1">Zarezerwuj wizytę</h3>
            <p className="text-sm text-gray-500 mb-5">Wybierz usługę i termin online</p>

            <div className="space-y-3 mb-5">
              {provider.services.slice(0, 3).map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc.id)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border-2 text-left text-sm transition-all ${
                    selectedService === svc.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-100 hover:border-brand-200'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">{svc.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{formatDuration(svc.duration_min)}</div>
                  </div>
                  <span className="font-bold text-gray-900 ml-2">{svc.price} zł</span>
                </button>
              ))}
            </div>

            <Button fullWidth size="lg" onClick={handleBook}>
              Wybierz termin
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-center text-gray-400 mt-3">
              Bezpłatne anulowanie do 24h przed wizytą
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
