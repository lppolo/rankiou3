import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Poll } from '@/types'

const mapPoll = (p: any): Poll => ({
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
  isFavorited: !!p.is_favorited,
})

export const useMyFavorites = (userId?: string | null) => {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setPolls([]); return }
    let mounted = true
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('favorites')
        .select(`polls:poll_id(*, poll_options(text, votes), profiles:author_id(name, avatar_url))`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      const mapped = (data || []).map((row: any) => mapPoll(row.polls))
      if (!mounted) return
      setPolls(mapped)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [userId])

  return { polls, loading }
}

export const useMyPolls = (userId?: string | null) => {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setPolls([]); return }
    let mounted = true
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('polls')
        .select(`*, poll_options(text, votes), profiles:author_id(name, avatar_url)`) 
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
      const mapped = (data || []).map((p: any) => mapPoll(p))
      if (!mounted) return
      setPolls(mapped)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [userId])

  return { polls, loading }
}
