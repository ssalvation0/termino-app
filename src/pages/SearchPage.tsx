import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, SearchX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROVIDERS, CATEGORIES } from '../data/mock'
import { ProviderCard } from '../components/ui/ProviderCard'
import { Button } from '../components/ui/Button'
import { useFilterStore } from '../store/bookingStore'

export function SearchPage() {
  const [params] = useSearchParams()
  const { category, query, priceMax, ratingMin, setCategory, setQuery, setPriceMax, setRatingMin, reset } =
    useFilterStore()

  useEffect(() => {
    const cat = params.get('category')
    const q = params.get('q')
    if (cat) setCategory(cat)
    if (q) setQuery(q)
  }, [params])

  const results = useMemo(() => {
    return PROVIDERS.filter((p) => {
      if (category && p.category !== category) return false
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) &&
          !p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) return false
      if (priceMax && p.priceFrom > priceMax) return false
      if (ratingMin && p.rating < ratingMin) return false
      return true
    })
  }, [category, query, priceMax, ratingMin])

  const activeFilters = [
    category && CATEGORIES.find((c) => c.id === category)?.label,
    priceMax && `do ${priceMax} zł`,
    ratingMin && `${ratingMin}★+`,
  ].filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar filters ── */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 card-shadow sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filtry
              </h2>
              {activeFilters.length > 0 && (
                <button onClick={reset} className="text-xs text-brand-600 hover:underline">
                  Wyczyść
                </button>
              )}
            </div>

            {/* Search input */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Szukaj
              </label>
              <input
                type="text"
                placeholder="Nazwa lub usługa..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
              />
            </div>

            {/* Kategorie */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Kategoria
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    !category ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-brand-50'
                  }`}
                >
                  Wszystkie
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                      category === cat.id ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-brand-50'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" strokeWidth={1.75} /> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cena */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Cena maks. {priceMax ? `(${priceMax} zł)` : ''}
              </label>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={priceMax ?? 500}
                onChange={(e) => setPriceMax(Number(e.target.value) === 500 ? null : Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>50 zł</span><span>500+ zł</span>
              </div>
            </div>

            {/* Ocena */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Min. ocena
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {[null, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r ?? 'any'}
                    onClick={() => setRatingMin(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      ratingMin === r
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-brand-50'
                    }`}
                  >
                    {r ? `${r}★` : 'Wszystkie'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Results ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category
                  ? CATEGORIES.find((c) => c.id === category)?.label ?? 'Wyniki'
                  : 'Wszystkie usługi'}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">{results.length} wyników</p>
            </div>
            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                {activeFilters.map((f) => (
                  <span key={f} className="flex items-center gap-1 text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-medium">
                    {f}
                    <X className="w-3 h-3 cursor-pointer" onClick={reset} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-400"
              >
                <SearchX className="w-14 h-14 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                <p className="text-lg font-medium">Brak wyników</p>
                <p className="text-sm mt-1">Spróbuj zmienić filtry</p>
                <Button variant="secondary" className="mt-4" onClick={reset}>
                  Wyczyść filtry
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {results.map((p, i) => (
                  <ProviderCard key={p.id} provider={p} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
