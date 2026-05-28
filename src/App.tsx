import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LandingPage } from './pages/LandingPage'
import { SearchPage } from './pages/SearchPage'
import { ServiceDetailPage } from './pages/ServiceDetailPage'
import { BookingPage } from './pages/BookingPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProviderDashboard } from './pages/provider/ProviderDashboard'
import { AuthPage } from './pages/AuthPage'
import { useAuthStore } from './store/authStore'
import { ToastProvider } from './components/ui/Toast'

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [])

  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}
