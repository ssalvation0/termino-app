import { create } from 'zustand'
import type { Addon } from '../types'

interface BookingState {
  providerId: string | null
  serviceId: string | null
  date: string | null
  time: string | null
  addons: Addon[]
  guestMode: boolean
  step: number

  setProvider: (id: string) => void
  setService: (id: string) => void
  setDate: (date: string) => void
  setTime: (time: string) => void
  toggleAddon: (addon: Addon) => void
  setGuestMode: (v: boolean) => void
  setStep: (step: number) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  providerId: null,
  serviceId: null,
  date: null,
  time: null,
  addons: [],
  guestMode: true,
  step: 1,

  setProvider: (id) => set({ providerId: id }),
  setService: (id) => set({ serviceId: id }),
  setDate: (date) => set({ date, time: null }),
  setTime: (time) => set({ time }),
  toggleAddon: (addon) =>
    set((s) => ({
      addons: s.addons.find((a) => a.id === addon.id)
        ? s.addons.filter((a) => a.id !== addon.id)
        : [...s.addons, addon],
    })),
  setGuestMode: (guestMode) => set({ guestMode }),
  setStep: (step) => set({ step }),
  reset: () =>
    set({ providerId: null, serviceId: null, date: null, time: null, addons: [], step: 1 }),
}))

interface AuthState {
  isLoggedIn: boolean
  role: 'client' | 'provider' | null
  login: (role: 'client' | 'provider') => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  role: null,
  login: (role) => set({ isLoggedIn: true, role }),
  logout: () => set({ isLoggedIn: false, role: null }),
}))

interface FilterState {
  category: string | null
  query: string
  priceMax: number | null
  ratingMin: number | null
  setCategory: (c: string | null) => void
  setQuery: (q: string) => void
  setPriceMax: (p: number | null) => void
  setRatingMin: (r: number | null) => void
  reset: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  category: null,
  query: '',
  priceMax: null,
  ratingMin: null,
  setCategory: (category) => set({ category }),
  setQuery: (query) => set({ query }),
  setPriceMax: (priceMax) => set({ priceMax }),
  setRatingMin: (ratingMin) => set({ ratingMin }),
  reset: () => set({ category: null, query: '', priceMax: null, ratingMin: null }),
}))
