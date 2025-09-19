"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types'

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']

interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  user: User | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const mapSessionToUser = (session: Session): User => {
  const meta: any = session?.user?.user_metadata || {}
  const email = session?.user?.email || ''
  const base = email ? email.split('@')[0] : 'usuario'
  return {
    id: session!.user.id,
    name: meta.name || meta.full_name || base,
    avatar_url: meta.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${session!.user.id}`,
    username: meta.user_name || base,
    role: 'user',
    creation_points: 0,
    onboarding_completed: false,
    preferred_city: null,
    rank_cards: [],
    rankcard_vote_progress: 0,
    rankcard_create_progress: 0,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session) {
        const base = mapSessionToUser(data.session)
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, preferred_city, creation_points, rankcard_vote_progress, rankcard_create_progress, role, name, avatar_url, username')
          .eq('id', data.session.user.id)
          .single()
        setUser({ ...base, ...(profile || {}) })
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      if (s) {
        const base = mapSessionToUser(s)
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, preferred_city, creation_points, rankcard_vote_progress, rankcard_create_progress, role, name, avatar_url, username')
          .eq('id', s.user.id)
          .single()
        setUser({ ...base, ...(profile || {}) })
      } else {
        setUser(null)
      }
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAuthenticated: !!session,
    user,
    async signInWithGoogle() {
      await supabase.auth.signInWithOAuth({ provider: 'google' })
    },
    async signOut() {
      await supabase.auth.signOut()
    },
  }), [session, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
