import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, LayoutDashboard, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/bookingStore'
import { Button } from '../ui/Button'

export function Header() {
  const { isLoggedIn, role, login, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">termino</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/search" className="hover:text-brand-600 transition-colors">Usługi</Link>
          <Link to="/search?category=hair" className="hover:text-brand-600 transition-colors">Fryzjer</Link>
          <Link to="/search?category=beauty" className="hover:text-brand-600 transition-colors">Uroda</Link>
          <Link to="/search?category=fitness" className="hover:text-brand-600 transition-colors">Fitness</Link>
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 gradient-brand rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">Moje konto</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  {role === 'client' ? (
                    <button
                      onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Moje rezerwacje
                    </button>
                  ) : (
                    <button
                      onClick={() => { navigate('/provider/dashboard'); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Panel dostawcy
                    </button>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
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
              <Button variant="ghost" size="sm" onClick={() => login('client')}>
                Zaloguj
              </Button>
              <Button variant="primary" size="sm" onClick={() => login('provider')}>
                Dodaj firmę
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
