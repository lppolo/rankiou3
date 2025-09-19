import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Poll, Advertisement } from '@/types'

export const usePolls = (scope?: 'MUNDO' | 'LOCAL' | 'ROLÊ', city?: string | null) => {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from('polls')
          .select(`
            id, title, image_url, category, type, scope, location_city, total_votes, created_at,
            status, moderation_reason, author_id,
            poll_options(text, votes),
            profiles:author_id(name, avatar_url)
          `)
          .order('created_at', { ascending: false })

        if (scope) query = query.eq('scope', scope)
        if (scope && scope !== 'MUNDO' && city) query = query.eq('location_city', city)

        const { data, error: err } = await query
        if (err) throw err

        const mapped: Poll[] = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          image_url: p.image_url,
          category: p.category,
          type: p.type,
          scope: p.scope,
          location_city: p.location_city,
          options: (p.poll_options || []).map((o: any) => ({ text: o.text, votes: o.votes })),
          total_votes: p.total_votes,
          created_at: p.created_at,
          author: { id: p.author_id, name: p.profiles?.name || 'Usuário', avatar_url: p.profiles?.avatar_url || '' },
          status: p.status,
          moderation_reason: p.moderation_reason,
          userVote: null,
          isFavorited: false,
        }))
        if (!mounted) return
        setPolls(mapped)
      } catch (e: any) {
        if (!mounted) return
        setError(e.message || 'Erro ao carregar enquetes')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [scope, city])

  return { polls, loading, error }
}

export const voteOnPoll = async (pollId: string, optionText: string) => {
  const { error } = await supabase.rpc('vote_on_poll', { p_poll_id: pollId, p_option_text: optionText })
  if (error) throw error
  return { ok: true }
}

export const favoritePoll = async (pollId: string) => {
  const { data, error } = await supabase.rpc('toggle_favorite', { p_poll_id: pollId })
  if (error) throw error
  return { ok: true, favorited: !!data }
}

export const useAdvertisements = (scope: 'MUNDO' | 'LOCAL', city?: string | null) => {
  const [ads, setAds] = useState<Advertisement[]>([])
  useEffect(() => {
    let mounted = true
    const load = async () => {
      let q = supabase.from('advertisements').select('*').eq('status', 'ACTIVE')
      if (scope) q = q.eq('scope', scope)
      if (scope === 'LOCAL' && city) q = q.eq('location_city', city)
      const { data } = await q
      if (!mounted) return
      setAds((data || []) as any)
    }
    load()
    return () => { mounted = false }
  }, [scope, city])
  return ads
}
