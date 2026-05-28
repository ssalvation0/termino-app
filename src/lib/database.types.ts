// Hand-written types for Supabase schema (mirrors supabase/schema.sql).
// Regenerate with `supabase gen types typescript` once Supabase CLI is set up.

export type UserRole = 'client' | 'provider' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type ServiceCategory = 'hair' | 'beauty' | 'nails' | 'massage' | 'fitness' | 'barber' | 'spa' | 'dental'

export interface WorkingDay { open: string; close: string }
export type WorkingHours = Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', WorkingDay | null>

export interface ProfileRow {
  id: string
  name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface ProviderRow {
  id: string
  owner_id: string
  name: string
  category: ServiceCategory
  description: string | null
  address: string
  city: string
  lat: number | null
  lng: number | null
  images: string[]
  tags: string[]
  verified: boolean
  working_hours: WorkingHours
  rating: number
  review_count: number
  created_at: string
}

export interface ServiceRow {
  id: string
  provider_id: string
  name: string
  description: string | null
  duration_min: number
  price: number
  active: boolean
  created_at: string
}

export interface AddonRow {
  id: string
  service_id: string
  name: string
  price: number
}

export interface BookingRow {
  id: string
  client_id: string
  provider_id: string
  service_id: string
  starts_at: string
  duration_min: number
  total_price: number
  status: BookingStatus
  addon_ids: string[]
  notes: string | null
  created_at: string
}

export interface ReviewRow {
  id: string
  booking_id: string
  client_id: string
  provider_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles:  { Row: ProfileRow;  Insert: Partial<ProfileRow> & { id: string; name: string };  Update: Partial<ProfileRow> }
      providers: { Row: ProviderRow; Insert: Omit<ProviderRow, 'id' | 'created_at' | 'rating' | 'review_count'> & { id?: string; rating?: number; review_count?: number }; Update: Partial<ProviderRow> }
      services:  { Row: ServiceRow;  Insert: Omit<ServiceRow, 'id' | 'created_at' | 'active'> & { id?: string; active?: boolean }; Update: Partial<ServiceRow> }
      addons:    { Row: AddonRow;    Insert: Omit<AddonRow, 'id'> & { id?: string };    Update: Partial<AddonRow> }
      bookings:  { Row: BookingRow;  Insert: Omit<BookingRow, 'id' | 'created_at' | 'status'> & { id?: string; status?: BookingStatus }; Update: Partial<BookingRow> }
      reviews:   { Row: ReviewRow;   Insert: Omit<ReviewRow, 'id' | 'created_at'> & { id?: string }; Update: Partial<ReviewRow> }
    }
  }
}
