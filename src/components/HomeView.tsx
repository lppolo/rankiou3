import React, { useMemo } from 'react'
import type { Poll, User, SortOrder, CategoryFilter, ShowFilter, Advertisement } from '@/types'
import { FilterBar } from './FilterBar'
import { PollCard } from './PollCard'
import { AdCard } from './AdCard'

export const HomeView: React.FC<{
  polls: Poll[]
  advertisements: Advertisement[]
  user: User | null
  isAuthenticated: boolean
  activeFeed: 'MUNDO' | 'LOCAL' | 'ROLÊ'
  setActiveFeed: (f: 'MUNDO' | 'LOCAL' | 'ROLÊ') => void
  onVote: (pollId: string, optionText: string) => void
  onChangeVote: (pollId: string, newOptionText: string) => void
  onAddOption: (poll: Poll) => void
  onReport: (poll: Poll) => void
  onFavorite: (pollId: string) => void
  onOpenShareModal: (poll: Poll) => void
  onOpenAuthModal: () => void
  filterState: { sortOrder: SortOrder; categoryFilter: CategoryFilter; showFilter: ShowFilter; searchTerm: string }
  setFilterState: { setSortOrder: (order: SortOrder) => void; setCategoryFilter: (category: CategoryFilter) => void; setShowFilter: (filter: ShowFilter) => void; setSearchTerm: (term: string) => void }
}> = (props) => {
  const { polls, advertisements, user, isAuthenticated, activeFeed, setActiveFeed, onOpenAuthModal, filterState, setFilterState } = props
  const todayIndex = new Date().getDay()

  const dayOfWeekMap: Record<string, number> = { 'DOMINGO': 0, 'SEGUNDA-FEIRA': 1, 'TERÇA-FEIRA': 2, 'QUARTA-FEIRA': 3, 'QUINTA-FEIRA': 4, 'FRIDAY': 5, 'SÁBADO': 6 }
  const getDayFromTitle = (title: string): number | null => {
    const upper = title.toUpperCase();
    for (const day in dayOfWeekMap) if (upper.includes(day)) return dayOfWeekMap[day]
    return null
  }
  const isAdvertisement = (item: Poll | Advertisement): item is Advertisement => 'advertiser' in item

  const contentWithAds = useMemo(() => {
    let processedPolls = polls.filter(p => p.status === 'APPROVED')
    processedPolls = processedPolls.filter(p => {
      switch (activeFeed) {
        case 'MUNDO': return p.scope === 'MUNDO'
        case 'LOCAL': return isAuthenticated && user?.onboarding_completed && p.scope === 'LOCAL' && p.location_city === user.preferred_city
        case 'ROLÊ': {
          if (!isAuthenticated || !user?.onboarding_completed) return false
          const pollDayIndex = getDayFromTitle(p.title)
          return p.scope === 'ROLÊ' && p.location_city === user.preferred_city && pollDayIndex !== null && pollDayIndex >= todayIndex
        }
      }
    })

    if (filterState.categoryFilter !== 'TUDO') processedPolls = processedPolls.filter(p => p.category === filterState.categoryFilter)
    if (filterState.showFilter !== 'TUDO') processedPolls = processedPolls.filter(p => filterState.showFilter === 'VOTADAS' ? p.userVote !== null : p.userVote === null)
    if (filterState.searchTerm) processedPolls = processedPolls.filter(p => p.title.toLowerCase().includes(filterState.searchTerm.toLowerCase()))
    processedPolls.sort((a, b) => filterState.sortOrder === 'MAIS VOTADAS' ? b.total_votes - a.total_votes : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const relevantAds = advertisements.filter(ad => {
      if (ad.status !== 'ACTIVE') return false
      if (activeFeed === 'MUNDO') return ad.scope === 'MUNDO'
      if (activeFeed === 'LOCAL' && isAuthenticated && user?.preferred_city) return ad.scope === 'LOCAL' && ad.location_city === user.preferred_city
      return false
    })
    if (relevantAds.length === 0 || activeFeed === 'ROLÊ') return processedPolls

    const mixed: (Poll | Advertisement)[] = []
    let adCounter = 0
    for (let i = 0; i < processedPolls.length; i++) {
      mixed.push(processedPolls[i])
      if ((i + 1) % 5 === 0 && i < processedPolls.length - 1) {
        mixed.push(relevantAds[adCounter % relevantAds.length])
        adCounter++
      }
    }
    return mixed
  }, [polls, advertisements, activeFeed, user, isAuthenticated, todayIndex, filterState])

  const renderContent = () => {
    if ((activeFeed === 'LOCAL' || activeFeed === 'ROLÊ') && (!isAuthenticated || !user?.onboarding_completed)) {
      return (
        <div className="text-center py-20 bg-brand-surface rounded-xl border border-brand-border">
          <h3 className="text-2xl font-bold text-white">Defina sua cidade!</h3>
          <p className="text-gray-400 mt-2 mb-4">Para ver o conteúdo {activeFeed === 'LOCAL' ? 'local' : 'de rolê'}, você precisa fazer login e configurar sua cidade.</p>
          <button onClick={onOpenAuthModal} className="bg-brand-teal text-white font-bold py-2 px-6 rounded-lg shadow-3d-teal active:shadow-3d-teal-active active:scale-95 transition-all">CONFIGURAR LOCALIZAÇÃO</button>
        </div>
      )
    }
    if (contentWithAds.length === 0) {
      return (
        <div className="text-center py-20 bg-brand-surface rounded-xl border border-brand-border">
          <h3 className="text-2xl font-bold text-white">Nenhuma enquete encontrada.</h3>
          <p className="text-gray-400 mt-2">Tente ajustar os filtros ou crie a primeira enquete!</p>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contentWithAds.map(item => isAdvertisement(item) ? <AdCard key={item.id} ad={item} /> : (
          <PollCard key={item.id} poll={item} onVote={props.onVote} onFavorite={props.onFavorite} onChangeVote={props.onChangeVote} onAddOption={props.onAddOption} onReport={props.onReport} onOpenShareModal={props.onOpenShareModal} />
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <FilterBar activeFeed={activeFeed} onFeedChange={setActiveFeed} filterState={filterState} setFilterState={setFilterState} />
      <div className="mt-4 border-t border-brand-border pt-4">{renderContent()}</div>
    </div>
  )
}

export default HomeView
