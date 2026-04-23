export type ServiceCategory =
  | 'hair'
  | 'beauty'
  | 'fitness'
  | 'massage'
  | 'nails'
  | 'barber'
  | 'spa'
  | 'dental'

export interface Provider {
  id: string
  name: string
  category: ServiceCategory
  rating: number
  reviewCount: number
  address: string
  city: string
  lat: number
  lng: number
  images: string[]
  description: string
  verified: boolean
  priceFrom: number
  services: Service[]
  workingHours: WorkingHours
  tags: string[]
}

export interface Service {
  id: string
  providerId: string
  name: string
  description: string
  duration: number
  price: number
  addons?: Addon[]
}

export interface Addon {
  id: string
  name: string
  price: number
}

export interface WorkingHours {
  [day: string]: { open: string; close: string } | null
}

export interface TimeSlot {
  time: string
  available: boolean
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'alternative'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'

export interface Booking {
  id: string
  providerId: string
  providerName: string
  providerImage: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  duration: number
  price: number
  status: BookingStatus
  addons: Addon[]
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: 'client' | 'provider' | 'admin'
}
