"use client"
import React, { useMemo, useState } from 'react'
import { Header } from '@/components/Header'
import { HomeView } from '@/components/HomeView'
import { AcompanharView } from '@/components/AcompanharView'
import { BottomNavBar } from '@/components/BottomNavBar'
import AuthModal from '@/components/AuthModal'
import OnboardingModal from '@/components/OnboardingModal'
import CreatePollModal from '@/components/CreatePollModal'
import AdminView from '@/components/AdminView'
import ProfileModal from '@/components/ProfileModal'
import type { Advertisement, Poll, SortOrder, CategoryFilter, ShowFilter, User } from '@/types'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { usePolls, useAdvertisements, voteOnPoll, favoritePoll } from '@/hooks/usePolls'
import { supabase } from '@/lib/supabaseClient'
import { seedDemoData } from '../lib/seed'

const mockUser: User = {
  id: '1', name: 'Convidado', avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=guest', username: 'guest', role: 'user', creation_points: 0,
  onboarding_completed: false, preferred_city: null, rank_cards: [], rankcard_vote_progress: 0, rankcard_create_progress: 0,
}

const HomeContainer: React.FC = () => {
  const { isAuthenticated, signInWithGoogle, user } = useAuth()
  const [activeFeed, setActiveFeed] = useState<'MUNDO' | 'LOCAL' | 'ROLÊ'>('MUNDO')
  const [currentView, setCurrentView] = useState<'INICIO' | 'ACOMPANHAR' | 'RANKARDS' | 'ADMIN'>('INICIO')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
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
  const { polls: fetchedPolls, reload } = usePolls(activeFeed, preferredCity)
  const adsScope: 'MUNDO' | 'LOCAL' = activeFeed === 'LOCAL' ? 'LOCAL' : 'MUNDO'
  const fetchedAds = useAdvertisements(adsScope, preferredCity)
  const [localPolls, setLocalPolls] = useState<Poll[]>([])
  const [autoSeeded, setAutoSeeded] = useState(false)

  React.useEffect(() => { setLocalPolls(fetchedPolls) }, [fetchedPolls])

  // Dev helper: auto-seed ao logar se não houver enquetes
  React.useEffect(() => {
    const run = async () => {
      if (process.env.NODE_ENV === 'production') return
      if (!user || autoSeeded) return
      if ((fetchedPolls || []).length > 0) return
      try {
        await seedDemoData({ userId: user.id, city: user.preferred_city || 'São Paulo' })
        setAutoSeeded(true)
        await reload()
      } catch {}
    }
    run()
  }, [user, fetchedPolls, autoSeeded, reload])

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
  const handleAddOption = async (poll: Poll) => {
    if (!user) { setShowAuthModal(true); return }
    const text = typeof window !== 'undefined' ? window.prompt('Qual opção você quer adicionar?') : null
    if (!text || !text.trim()) return
    try {
      await supabase.rpc('add_option_and_vote', { p_poll_id: poll.id, p_option_text: text.trim() })
      await reload()
    } catch (e) { console.error(e) }
  }
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
    try {
      const { data, error } = await supabase.rpc('create_poll_with_options', {
        p_title: p.title,
        p_category: p.category,
        p_type: 'ENQUETE',
        p_scope: p.scope,
        p_location_city: p.scope === 'MUNDO' ? null : (p.location_city || user.preferred_city || null),
        p_options: p.options,
        p_image_url: null,
      })
      if (error) throw error
    } catch (e: any) {
      if (typeof window !== 'undefined') alert(e.message || 'Erro ao criar enquete. Verifique seus pontos.')
      console.error(e); return
    }
    setShowCreate(false)
    // atualiza lista para exibir a nova enquete imediatamente
    await reload()
  }

  const handleSeed = async () => {
    if (!user) { setShowAuthModal(true); return }
    try {
      await seedDemoData({ userId: user.id, city: user.preferred_city || 'São Paulo' })
      await reload()
    } catch (e) { console.error(e) }
  }

  return (
    <>
      <Header onClickLogo={() => { setActiveFeed('MUNDO'); setCurrentView('INICIO') }}
        onClickInicio={() => setCurrentView('INICIO')}
        onClickAcompanhar={() => (user ? setCurrentView('ACOMPANHAR') : setShowAuthModal(true))}
        onClickRankards={() => setCurrentView('RANKARDS')}
        isAdmin={user?.role === 'admin'}
        onClickAdmin={() => setCurrentView('ADMIN')}
        userName={user?.name || null}
        userAvatarUrl={user?.avatar_url || null}
        onLogin={() => setShowAuthModal(true)}
        onLogout={() => supabase.auth.signOut()}
        onCreate={() => (user ? setShowCreate(true) : setShowAuthModal(true))}
        onSeed={user && process.env.NODE_ENV !== 'production' ? handleSeed : undefined}
      />
      {currentView === 'INICIO' && (
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
      )}
      {currentView === 'ACOMPANHAR' && user && (
        <AcompanharView
          user={user}
          onVote={handleVote}
          onChangeVote={handleChangeVote}
          onFavorite={handleFavorite}
          onAddOption={(pollId, text) => { /* opcional: abrir modal próprio futuramente */ }}
          onReport={() => {}}
          onShare={() => {}}
        />
      )}
      {currentView === 'RANKARDS' && (
        <div className="container mx-auto px-4 py-6 text-center text-gray-300">
          <h2 className="text-2xl font-bold text-white mb-2">Rankards</h2>
          <p>Mecânica chegando em breve. Interaja nas enquetes para ganhar pontos!</p>
        </div>
      )}
      {currentView === 'ADMIN' && user?.role === 'admin' && (
        <AdminView />
      )}
      <BottomNavBar
        currentView={currentView}
        setCurrentView={(v) => {
          if (v === 'ACOMPANHAR' && !user) { setShowAuthModal(true); return }
          setCurrentView(v)
        }}
        onOpenCreatePollModal={() => (user ? setShowCreate(true) : setShowAuthModal(true))}
        onOpenProfileModal={() => (user ? setShowProfile(true) : setShowAuthModal(true))}
      />
      {showAuthModal && <AuthModal onLogin={signInWithGoogle} onClose={() => setShowAuthModal(false)} />}
      {showOnboarding && <OnboardingModal onSave={saveCity} onClose={() => setShowOnboarding(false)} />}
      {showCreate && <CreatePollModal onCreate={createPoll} onClose={() => setShowCreate(false)} defaultCity={user?.preferred_city || null} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
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
