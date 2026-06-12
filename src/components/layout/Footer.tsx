import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-white text-lg">termino</span>
            </div>
            <p className="text-sm leading-relaxed">
              Platforma do rezerwacji usług łącząca klientów z najlepszymi dostawcami.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Usługi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search?category=hair" className="hover:text-white transition-colors">Fryzjer</Link></li>
              <li><Link to="/search?category=beauty" className="hover:text-white transition-colors">Uroda</Link></li>
              <li><Link to="/search?category=nails" className="hover:text-white transition-colors">Paznokcie</Link></li>
              <li><Link to="/search?category=massage" className="hover:text-white transition-colors">Masaż</Link></li>
              <li><Link to="/search?category=fitness" className="hover:text-white transition-colors">Fitness</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Dostawcy</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auth" className="hover:text-white transition-colors">Zarejestruj firmę</Link></li>
              <li><Link to="/provider/dashboard" className="hover:text-white transition-colors">Panel dostawcy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Informacje</h4>
            <ul className="space-y-2 text-sm">
              <li><span>O nas</span></li>
              <li><span>Polityka prywatności</span></li>
              <li><span>Regulamin</span></li>
              <li><a href="mailto:kontakt@termino.pl" className="hover:text-white transition-colors">Kontakt</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <span>© 2026 Termino. Wszelkie prawa zastrzeżone.</span>
          <span>Warszawa, Polska</span>
        </div>
      </div>
    </footer>
  )
}
