import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, User, Building2, Globe, Apple } from 'lucide-react'
import { useAuthStore } from '../store/bookingStore'
import { Button } from '../components/ui/Button'

export function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'client' | 'provider'>('client')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    login(role)
    navigate(role === 'provider' ? '/provider/dashboard' : '/profile')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Witaj z powrotem!' : 'Dołącz do Termino już dziś'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 card-shadow">
          {/* Role picker (only on register) */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Rejestruję się jako
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['client', 'provider'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-3 rounded-xl text-sm font-medium transition-all border-2 flex items-center justify-center gap-2 ${
                        role === r
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-100 text-gray-600 hover:border-brand-200'
                      }`}
                    >
                      {r === 'client' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      {r === 'client' ? 'Klient' : 'Dostawca'}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {role === 'provider' ? 'Nazwa firmy' : 'Imię i nazwisko'}
                </label>
                <input
                  type="text"
                  placeholder={role === 'provider' ? 'Studio Kowalska Hair' : 'Anna Kowalska'}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">E-mail</label>
              <input
                type="email"
                placeholder="anna@przykład.pl"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Hasło</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <a href="#" className="text-xs text-brand-600 hover:underline">Zapomniałeś hasła?</a>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-5">
            <hr className="border-gray-200" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
              lub kontynuuj z
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
              <Globe className="w-4 h-4" /> Google
            </button>
            <button className="py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
              <Apple className="w-4 h-4" /> Apple
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'login' ? 'Nie masz konta? ' : 'Masz już konto? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-brand-600 font-medium hover:underline"
          >
            {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </p>
      </div>
    </div>
  )
}
