import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Shield, Zap, Star, Clock, ChevronRight } from 'lucide-react'
import { CATEGORIES } from '../data/mock'
import { ProviderCard } from '../components/ui/ProviderCard'
import { Button } from '../components/ui/Button'
import { useAsync } from '../hooks/useAsync'
import { listProviders } from '../lib/api'

export function LandingPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const { data: providers } = useAsync(() => listProviders({ ratingMin: 4.5 }), [])
  const featured = (providers ?? []).filter((p) => p.verified).slice(0, 3)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="gradient-hero relative min-h-[88vh] flex items-center overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-800/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 glass text-brand-200 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Zap className="w-3.5 h-3.5 text-accent-400" />
                Nowa era rezerwacji online
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
                Zarezerwuj{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-400">
                  każdą usługę
                </span>
                <br />w kilka sekund
              </h1>

              <p className="text-lg sm:text-xl text-brand-200 leading-relaxed mb-10 max-w-xl mx-auto">
                Fryzjer, masaż, fitness, uroda — znajdź najlepszych specjalistów w swoim mieście i umów wizytę bez telefonu.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Fryzjer, masaż, fitness..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="shadow-lg shadow-brand-900/30 whitespace-nowrap">
                  Szukaj
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="flex flex-wrap justify-center gap-2 text-sm text-brand-300">
                <span>Popularne:</span>
                {['Fryzjer', 'Masaż', 'Manicure', 'Barber', 'Fitness'].map((t) => (
                  <button
                    key={t}
                    onClick={() => navigate(`/search?q=${t}`)}
                    className="underline hover:text-white transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { val: '2 400+', label: 'Dostawców' },
              { val: '48 000+', label: 'Rezerwacji' },
              { val: '4.9★', label: 'Średnia ocena' },
            ].map(({ val, label }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs text-brand-300 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Kategorie ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Wszystkie kategorie usług
            </h2>
            <p className="text-gray-500 text-lg">Znajdź specjalistów w dowolnej kategorii</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className="group flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-2xl card-shadow hover:card-shadow-hover hover:border-brand-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-600 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                  <cat.icon className="w-6 h-6 text-brand-600 group-hover:text-white transition-colors" strokeWidth={1.75} />
                </span>
                <span className="font-semibold text-gray-800 group-hover:text-brand-700 text-sm">
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jak to działa ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Jak to działa?</h2>
            <p className="text-gray-500 text-lg">Trzy kroki do Twojej wizyty</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Search className="w-6 h-6 text-brand-600" />,
                title: 'Znajdź usługę',
                desc: 'Wyszukaj po kategorii, lokalizacji lub nazwie. Filtruj po cenie, ocenach i dostępności.',
              },
              {
                step: '02',
                icon: <Clock className="w-6 h-6 text-brand-600" />,
                title: 'Wybierz termin',
                desc: 'Przeglądaj dostępne sloty w czasie rzeczywistym. Rezerwuj na konkretny dzień i godzinę.',
              },
              {
                step: '03',
                icon: <Star className="w-6 h-6 text-brand-600" />,
                title: 'Ciesz się wizytą',
                desc: 'Dostaniesz potwierdzenie i przypomnienie. Po wizycie oceń usługodawcę.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white rounded-2xl p-8 card-shadow"
              >
                <div className="absolute -top-4 left-8 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5 mt-2">
                  {item.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured providers ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Polecane miejsca
              </h2>
              <p className="text-gray-500">Najwyżej oceniani specjaliści w Warszawie</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/search')} className="hidden sm:flex">
              Pokaż wszystkich
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <ProviderCard key={p.id} provider={p} index={i} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button variant="secondary" onClick={() => navigate('/search')}>
              Pokaż wszystkich
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Dla dostawców ── */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 glass text-brand-200 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Shield className="w-3.5 h-3.5 text-accent-400" />
              Dla dostawców usług
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Rozwijaj swój biznes<br />razem z Termino
            </h2>
            <p className="text-brand-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Zarządzaj rezerwacjami, kalendarzem i klientami z jednego miejsca. Bez prowizji w pierwszych 3 miesiącach.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
                Zarejestruj swoją firmę
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="ghost" className="text-white border border-white/20 hover:bg-white/10">
                Dowiedz się więcej
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
