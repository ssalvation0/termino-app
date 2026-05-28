import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, User, Building2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'

export function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, signUp, session, profile, signOut, refreshProfile } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login',
  )
  const [role, setRole] = useState<'client' | 'provider'>(
    searchParams.get('role') === 'provider' ? 'provider' : 'client',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Poll until supabase session is materialized in the store
  const waitForSession = async () => {
    for (let i = 0; i < 30; i++) {
      const { data } = await supabase.auth.getSession()
      if (data.session) return
      await new Promise((r) => setTimeout(r, 100))
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  // If already logged in, show "already in" panel instead of silent redirect
  if (session && profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white font-bold text-2xl">{profile.name[0]?.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Już jesteś zalogowany</h1>
          <p className="text-gray-500 mb-8">jako <span className="font-medium text-gray-700">{profile.name}</span></p>
          <div className="space-y-3">
            <Button fullWidth size="lg" onClick={() => navigate(profile.role === 'provider' ? '/provider/dashboard' : '/profile')}>
              {profile.role === 'provider' ? 'Panel dostawcy' : 'Moje rezerwacje'}
            </Button>
            <Button fullWidth size="lg" variant="secondary" onClick={async () => { await signOut(); }}>
              Wyloguj się
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await signIn({ email, password })
        // Wait for session before navigating so target page sees auth state
        await waitForSession()
        const next = searchParams.get('next')
        navigate(next ?? '/')
      } else {
        if (!name.trim()) throw new Error('Podaj imię.')
        await signUp({ email, password, name: name.trim(), role })
        await waitForSession()
        await refreshProfile()
        navigate(role === 'provider' ? '/provider/dashboard' : '/profile')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Coś poszło nie tak.'
      // Translate common Supabase errors to Polish
      if (msg.toLowerCase().includes('invalid login')) setError('Nieprawidłowy e-mail lub hasło.')
      else if (msg.toLowerCase().includes('already registered')) setError('Ten e-mail jest już zarejestrowany.')
      else if (msg.toLowerCase().includes('password should be at least')) setError('Hasło musi mieć min. 6 znaków.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
                      type="button"
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
                  {role === 'provider' ? 'Nazwa firmy lub Twoje imię' : 'Imię i nazwisko'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anna@przyklad.pl"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Hasło</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 6 znaków"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
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
              lub
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Kontynuuj z Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'login' ? 'Nie masz konta? ' : 'Masz już konto? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            className="text-brand-600 font-medium hover:underline"
          >
            {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </p>
      </div>
    </div>
  )
}
