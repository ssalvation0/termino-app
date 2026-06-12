import { supabase } from './supabase'
import type { ProviderRow, ServiceRow, AddonRow, BookingRow, BookingStatus, ServiceCategory, WorkingHours } from './database.types'

// ── Providers ───────────────────────────────────────────────────────────────
export interface ProviderWithServices extends ProviderRow {
  services: (ServiceRow & { addons: AddonRow[] })[]
  priceFrom: number
}

function shapeProvider(row: any): ProviderWithServices {
  // Deactivated services are soft-deleted (bookings may still reference them)
  const services = ((row.services ?? []) as (ServiceRow & { addons: AddonRow[] })[])
    .filter((s) => s.active)
  const priceFrom = services.length ? Math.min(...services.map((s) => Number(s.price))) : 0
  return { ...row, services, priceFrom }
}

export async function listProviders(filters?: {
  category?: ServiceCategory | null
  query?: string
  priceMax?: number | null
  ratingMin?: number | null
}): Promise<ProviderWithServices[]> {
  let q = supabase.from('providers').select('*, services(*, addons(*))') as any
  if (filters?.category) q = q.eq('category', filters.category)
  if (filters?.ratingMin) q = q.gte('rating', filters.ratingMin)
  if (filters?.query) q = q.ilike('name', `%${filters.query}%`)

  const { data, error } = await q.order('rating', { ascending: false })
  if (error) throw error

  let list = ((data ?? []) as any[]).map(shapeProvider)
  if (filters?.priceMax) list = list.filter((p) => p.priceFrom <= filters.priceMax!)
  return list
}

export async function getProvider(id: string): Promise<ProviderWithServices | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*, services(*, addons(*))')
    .eq('id', id)
    .single() as any
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data ? shapeProvider(data) : null
}

export async function getMyProviders(): Promise<ProviderWithServices[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('providers')
    .select('*, services(*, addons(*))')
    .eq('owner_id', user.id) as any
  if (error) throw error
  return ((data ?? []) as any[]).map(shapeProvider)
}

// ── Provider management (owner only — enforced by RLS) ─────────────────────
export async function updateProvider(
  id: string,
  input: Partial<Pick<ProviderRow, 'name' | 'category' | 'description' | 'address' | 'city' | 'images' | 'tags'> & { working_hours: WorkingHours }>,
): Promise<void> {
  const { error } = await (supabase.from('providers') as any).update(input).eq('id', id)
  if (error) throw error
}

export async function createService(input: {
  providerId: string
  name: string
  description?: string
  durationMin: number
  price: number
}): Promise<ServiceRow> {
  const { data, error } = await (supabase.from('services') as any)
    .insert({
      provider_id: input.providerId,
      name: input.name,
      description: input.description ?? null,
      duration_min: input.durationMin,
      price: input.price,
    })
    .select()
    .single()
  if (error) throw error
  return data as ServiceRow
}

export async function updateService(
  id: string,
  input: Partial<Pick<ServiceRow, 'name' | 'description' | 'duration_min' | 'price'>>,
): Promise<void> {
  const { error } = await (supabase.from('services') as any).update(input).eq('id', id)
  if (error) throw error
}

// Hard delete when possible; bookings reference services with ON DELETE
// RESTRICT, so a service with booking history is deactivated instead.
export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (!error) return
  if (error.code === '23503') {
    const { error: updError } = await (supabase.from('services') as any).update({ active: false }).eq('id', id)
    if (updError) throw updError
    return
  }
  throw error
}

export async function createAddon(input: { serviceId: string; name: string; price: number }): Promise<AddonRow> {
  const { data, error } = await (supabase.from('addons') as any)
    .insert({ service_id: input.serviceId, name: input.name, price: input.price })
    .select()
    .single()
  if (error) throw error
  return data as AddonRow
}

export async function deleteAddon(id: string): Promise<void> {
  const { error } = await supabase.from('addons').delete().eq('id', id)
  if (error) throw error
}

// Reuses the public `avatars` bucket — its policies allow any file under the
// caller's own <uid>/ folder.
export async function uploadProviderImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Musisz być zalogowany.')
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/firm-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

// ── Profile ─────────────────────────────────────────────────────────────────
export async function updateProfile(input: { name?: string; phone?: string | null; avatar_url?: string }): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Musisz być zalogowany.')
  const { error } = await (supabase.from('profiles') as any).update(input).eq('id', user.id)
  if (error) throw error
}

// Uploads to the public `avatars` bucket and returns the public URL.
// Unique filename per upload avoids stale CDN/browser cache on the old URL.
export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Musisz być zalogowany.')
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

// ── Bookings ────────────────────────────────────────────────────────────────
export interface BookingWithJoins extends BookingRow {
  provider: Pick<ProviderRow, 'id' | 'name' | 'images' | 'address'>
  service: Pick<ServiceRow, 'id' | 'name' | 'duration_min' | 'price'>
}

export async function listMyBookings(): Promise<BookingWithJoins[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, provider:providers(id,name,images,address), service:services(id,name,duration_min,price)')
    .order('starts_at', { ascending: false }) as any
  if (error) throw error
  return (data ?? []) as BookingWithJoins[]
}

export async function listProviderBookings(providerId: string): Promise<BookingWithJoins[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, provider:providers(id,name,images,address), service:services(id,name,duration_min,price)')
    .eq('provider_id', providerId)
    .order('starts_at', { ascending: true }) as any
  if (error) throw error
  return (data ?? []) as BookingWithJoins[]
}

export async function createBooking(input: {
  providerId: string
  serviceId: string
  startsAt: Date
  durationMin: number
  totalPrice: number
  addonIds?: string[]
  notes?: string
}): Promise<BookingRow> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Musisz być zalogowany aby zarezerwować wizytę.')

  const { data, error } = await (supabase.from('bookings') as any)
    .insert({
      client_id: user.id,
      provider_id: input.providerId,
      service_id: input.serviceId,
      starts_at: input.startsAt.toISOString(),
      duration_min: input.durationMin,
      total_price: input.totalPrice,
      addon_ids: input.addonIds ?? [],
      notes: input.notes ?? null,
      status: 'pending',
    })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Ten termin jest już zajęty. Wybierz inny.')
    throw error
  }
  return data as BookingRow
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const { error } = await (supabase.from('bookings') as any).update({ status }).eq('id', id)
  if (error) throw error
}

// ── Availability ────────────────────────────────────────────────────────────
// Returns local-time "HH:MM" strings for all booked slots on the given local date.
export async function getBookedTimes(providerId: string, date: string): Promise<string[]> {
  // Build a generous UTC window covering the local day (accounting for any TZ)
  const localStart = new Date(`${date}T00:00:00`)
  const localEnd = new Date(`${date}T23:59:59`)
  const { data, error } = await supabase
    .from('bookings')
    .select('starts_at, duration_min')
    .eq('provider_id', providerId)
    .gte('starts_at', localStart.toISOString())
    .lte('starts_at', localEnd.toISOString())
    .in('status', ['pending', 'confirmed']) as any
  if (error) throw error
  return ((data ?? []) as { starts_at: string; duration_min: number }[]).map((b) => {
    const d = new Date(b.starts_at)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })
}
