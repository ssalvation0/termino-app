import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, LogOut, LayoutDashboard, Calendar, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'

export function Header() {
  const { session, profile, signOut } = useAuthStore()
  const isLoggedIn = !!session
  const role = profile?.role
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menus on route change
  useEffect(() => { setMenuOpen(false); setNavOpen(false) }, [location.pathname, location.search])

  // H4: close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">termino</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/search" className="hover:text-brand-600 transition-colors">Usługi</Link>
          <Link to="/search?category=hair" className="hover:text-brand-600 transition-colors">Fryzjer</Link>
          <Link to="/search?category=beauty" className="hover:text-brand-600 transition-colors">Uroda</Link>
          <Link to="/search?category=fitness" className="hover:text-brand-600 transition-colors">Fitness</Link>
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 gradient-brand rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {profile?.name?.split(' ')[0] ?? 'Konto'}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  {role === 'provider' ? (
                    <button
                      onClick={() => { navigate('/provider/dashboard'); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Panel dostawcy
                    </button>
                  ) : (
                    <button
                      onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Moje rezerwacje
                    </button>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={async () => { await signOut(); setMenuOpen(false); navigate('/') }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Wyloguj
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Zaloguj
              </Button>
              <Button variant="primary" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/auth?mode=register&role=provider')}>
                Dodaj firmę
              </Button>
            </>
          )}

          {/* H5: hamburger for mobile */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {navOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1 text-sm font-medium text-gray-700">
            <Link to="/search" className="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-600">Wszystkie usługi</Link>
            <Link to="/search?category=hair" className="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-600">Fryzjer</Link>
            <Link to="/search?category=beauty" className="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-600">Uroda</Link>
            <Link to="/search?category=nails" className="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-600">Paznokcie</Link>
            <Link to="/search?category=massage" className="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-600">Masaż</Link>
            <Link to="/search?category=fitness" className="px-3 py-2 rounded-lg hover:bg-brand-50 hover:text-brand-600">Fitness</Link>
            {!isLoggedIn && (
              <Link to="/auth?mode=register&role=provider" className="px-3 py-2 rounded-lg text-brand-600 font-semibold">
                Dodaj swoją firmę
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
