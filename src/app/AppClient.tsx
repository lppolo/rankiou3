"use client"
import React, { useMemo, useState } from 'react'
import { Header } from '@/components/Header'
import { HomeView } from '@/components/HomeView'
import AuthModal from '@/components/AuthModal'
import OnboardingModal from '@/components/OnboardingModal'
import CreatePollModal from '@/components/CreatePollModal'
import type { Advertisement, Poll, SortOrder, CategoryFilter, ShowFilter, User } from '@/types'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { usePolls, useAdvertisements, voteOnPoll, favoritePoll } from '@/hooks/usePolls'
import { supabase } from '@/lib/supabaseClient'

const mockUser: User = {
  id: '1', name: 'Convidado', avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=guest', username: 'guest', role: 'user', creation_points: 0,
  onboarding_completed: false, preferred_city: null, rank_cards: [], rankcard_vote_progress: 0, rankcard_create_progress: 0,
}

const HomeContainer: React.FC = () => {
  const { isAuthenticated, signInWithGoogle, user } = useAuth()
  const [activeFeed, setActiveFeed] = useState<'MUNDO' | 'LOCAL' | 'ROLÊ'>('MUNDO')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  type FilterState = { sortOrder: SortOrder; categoryFilter: CategoryFilter; showFilter: ShowFilter; searchTerm: string }
  const [filterState, setFilter] = useState<FilterState>({
    sortOrder: 'MAIS RECENTES', categoryFilter: 'TUDO', showFilter: 'TUDO', searchTerm: ''
  })

  const setFilterState = {
    setSortOrder: (order: SortOrder) => setFilter((s: FilterState) => ({ ...s, sortOrder: order })),
    setCategoryFilter: (c: CategoryFilter) => setFilter((s: FilterState) => ({ ...s, categoryFilter: c })),
    setShowFilter: (f: ShowFilter) => setFilter((s: FilterState) => ({ ...s, showFilter: f })),
    setSearchTerm: (t: string) => setFilter((s: FilterState) => ({ ...s, searchTerm: t })),
  }

  const preferredCity = user?.preferred_city ?? null
  const { polls: fetchedPolls } = usePolls(activeFeed, preferredCity)
  const adsScope: 'MUNDO' | 'LOCAL' = activeFeed === 'LOCAL' ? 'LOCAL' : 'MUNDO'
  const fetchedAds = useAdvertisements(adsScope, preferredCity)
  const [localPolls, setLocalPolls] = useState<Poll[]>([])

  React.useEffect(() => { setLocalPolls(fetchedPolls) }, [fetchedPolls])

  const handleVote = async (pollId: string, optionText: string) => {
    // optimistic update
    setLocalPolls(prev => prev.map(p => p.id !== pollId ? p : {
      ...p,
      userVote: optionText,
      total_votes: p.total_votes + 1,
      options: p.options.map(o => o.text === optionText ? { ...o, votes: o.votes + 1 } : o)
    }))
    try { await voteOnPoll(pollId, optionText) } catch (e) { console.error(e) }
  }
  const handleChangeVote = async (pollId: string, optionText: string) => {
    // simple local swap
    setLocalPolls(prev => prev.map(p => {
      if (p.id !== pollId || p.userVote === optionText) return p
      return {
        ...p,
        options: p.options.map(o =>
          o.text === p.userVote ? { ...o, votes: Math.max(0, o.votes - 1) } : (o.text === optionText ? { ...o, votes: o.votes + 1 } : o)
        ),
        userVote: optionText,
      }
    }))
    try { await supabase.rpc('change_vote', { p_poll_id: pollId, p_new_option_text: optionText }) } catch (e) { console.error(e) }
  }
  const handleAddOption = (_poll: Poll) => { console.log('add option') }
  const handleReport = (_poll: Poll) => { console.log('report') }
  const handleFavorite = async (pollId: string) => {
    try {
      const res = await favoritePoll(pollId)
      setLocalPolls(prev => prev.map(p => p.id !== pollId ? p : ({ ...p, isFavorited: !!res.favorited })))
    } catch (e) { console.error(e) }
  }
  const handleShare = (_poll: Poll) => { console.log('share') }

  const saveCity = async (city: string) => {
    if (!user) return
    await supabase.from('profiles').update({ preferred_city: city, onboarding_completed: true }).eq('id', user.id)
    setShowOnboarding(false)
  }

  const createPoll = async (p: { title: string; category: any; scope: 'MUNDO'|'LOCAL'|'ROLÊ'; location_city?: string|null; options: string[] }) => {
    if (!user) { setShowAuthModal(true); return }
    const { data, error } = await supabase.from('polls').insert({
      author_id: user.id,
      title: p.title,
      category: p.category,
      type: 'ENQUETE',
      scope: p.scope,
      location_city: p.scope === 'MUNDO' ? null : (p.location_city || user.preferred_city || null),
      status: 'APPROVED'
    }).select('id').single()
    if (error || !data) { console.error(error); return }
    const pollId = data.id
    const rows = p.options.map(text => ({ poll_id: pollId, text }))
    await supabase.from('poll_options').insert(rows)
    setShowCreate(false)
  }

  return (
    <>
      <Header onClickLogo={() => setActiveFeed('MUNDO')}
        userName={user?.name || null}
        userAvatarUrl={user?.avatar_url || null}
        onLogin={() => setShowAuthModal(true)}
        onLogout={() => supabase.auth.signOut()}
        onCreate={() => (user ? setShowCreate(true) : setShowAuthModal(true))}
      />
      <div className="container mx-auto px-4 py-6">
        <HomeView
          polls={localPolls}
          advertisements={fetchedAds}
          user={user || null}
          isAuthenticated={isAuthenticated}
          activeFeed={activeFeed}
          setActiveFeed={setActiveFeed}
          onVote={handleVote}
          onChangeVote={handleChangeVote}
          onAddOption={handleAddOption}
          onReport={handleReport}
          onFavorite={handleFavorite}
          onOpenShareModal={handleShare}
          onOpenAuthModal={() => (user ? setShowOnboarding(true) : setShowAuthModal(true))}
          filterState={filterState}
          setFilterState={setFilterState}
        />
      </div>
      {showAuthModal && <AuthModal onLogin={signInWithGoogle} onClose={() => setShowAuthModal(false)} />}
      {showOnboarding && <OnboardingModal onSave={saveCity} onClose={() => setShowOnboarding(false)} />}
      {showCreate && <CreatePollModal onCreate={createPoll} onClose={() => setShowCreate(false)} defaultCity={user?.preferred_city || null} />}
    </>
  )
}

export const AppClient: React.FC = () => {
  return (
    <AuthProvider>
      <HomeContainer />
    </AuthProvider>
  )
}

export default AppClient
