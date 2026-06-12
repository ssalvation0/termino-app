import { create } from 'zustand'
import type { Session, User, Subscription } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { ProfileRow, UserRole } from '../lib/database.types'

interface AuthState {
  session: Session | null
  user: User | null
  profile: ProfileRow | null
  loading: boolean
  init: () => Promise<void>
  signUp: (input: { email: string; password: string; name: string; role: UserRole }) => Promise<void>
  signIn: (input: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

// Module-level singletons (survive StrictMode double-invocation)
let initPromise: Promise<void> | null = null
let authSubscription: Subscription | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  init: () => {
    // Run init exactly once, even under StrictMode double-effect
    if (initPromise) return initPromise

    initPromise = (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const profile = session?.user ? await fetchProfile(session.user.id) : null
      set({ session, user: session?.user ?? null, profile, loading: false })

      // Remove any prior subscription (defensive)
      authSubscription?.unsubscribe()
      // The callback MUST stay synchronous: supabase-js holds an internal auth
      // lock while dispatching events, and any supabase query awaited inside
      // the callback waits on that same lock — deadlocking every request in
      // the app until reload (fires on TOKEN_REFRESHED too, so it looked like
      // random hangs). Profile fetch is deferred past the lock via setTimeout.
      const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
        // On SIGNED_OUT we already cleared state in signOut(); skip duplicate work
        if (event === 'SIGNED_OUT') {
          set({ session: null, user: null, profile: null })
          return
        }
        set({ session: newSession, user: newSession?.user ?? null })
        const userId = newSession?.user?.id
        if (!userId) {
          set({ profile: null })
          return
        }
        // Skip refetch when the profile is already loaded for this user
        // (TOKEN_REFRESHED fires periodically and on tab refocus).
        if (get().profile?.id === userId) return
        setTimeout(() => {
          fetchProfile(userId).then((profile) => {
            if (get().user?.id === userId) set({ profile })
          })
        }, 0)
      })
      authSubscription = data.subscription
    })()
    return initPromise
  },

  signUp: async ({ email, password, name, role }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })
    if (error) throw error
  },

  signIn: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    // Clear UI state IMMEDIATELY so header/profile update without waiting for network
    set({ session: null, user: null, profile: null })
    await supabase.auth.signOut()
  },

  refreshProfile: async () => {
    const user = get().user
    if (!user) return
    const profile = await fetchProfile(user.id)
    set({ profile })
  },
}))
