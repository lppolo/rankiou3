import React from 'react'
import type { User, PredefinedRankard, Rarity } from '@/types'

export const RankardCard: React.FC<{
  card: PredefinedRankard
  user?: User
  userCardId?: string
  onEvolve?: (userCardId: string) => void
  isLocked?: boolean
  onClick?: () => void
}> = ({ card, user, userCardId, onEvolve, isLocked = false, onClick }) => {
  const rarityColorMap: Record<Rarity, string> = {
    'COMUM': 'border-gray-500 text-gray-400',
    'RARO': 'border-blue-500 text-blue-400',
    'ÉPICO': 'border-purple-500 text-purple-400',
    'LENDÁRIO': 'border-yellow-400 text-yellow-300'
  }

  if (isLocked) {
    return (
      <div className="bg-brand-surface border-2 border-brand-border rounded-2xl flex flex-col items-center justify-center aspect-[3/4] p-4 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="font-bold mt-2">???</span>
      </div>
    )
  }

  const reqs = card.evolution_reqs
  const canEvolve = user && reqs && user.rankcard_vote_progress >= reqs.votes && user.rankcard_create_progress >= reqs.creates
  const cardRarityStyle = card.rarity ? rarityColorMap[card.rarity] : 'border-brand-border'
  const isClickable = onClick && !isLocked

  return (
    <div onClick={onClick} className={`bg-gray-800 border-4 ${cardRarityStyle} rounded-2xl flex flex-col overflow-hidden ${isClickable ? 'cursor-pointer transition-transform hover:scale-105 hover:shadow-lg hover:shadow-brand-teal/20' : ''}`}>
      <div className="bg-brand-surface p-4 flex-grow flex flex-col items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image_url} alt={card.name} className="w-32 h-32 object-contain" />
      </div>
      <div className="p-4 bg-brand-surface border-t-2 border-brand-border space-y-3">
        <h3 className="font-bold text-lg text-white text-center truncate">{card.name}</h3>
        <div className="text-xs text-center">
          <span className="font-bold text-gray-400">Estágio: </span>
          <span className="text-white">{card.stage} / 3</span>
        </div>
        {reqs && user && userCardId && onEvolve && (
          <div className="space-y-2 text-xs">
            <div>
              <p className="text-gray-300">Votar ({user.rankcard_vote_progress}/{reqs.votes})</p>
              <div className="w-full bg-brand-border rounded-full h-2.5"><div className="bg-brand-teal h-2.5 rounded-full" style={{width: `${Math.min(100, (user.rankcard_vote_progress / reqs.votes) * 100)}%`}} /></div>
            </div>
            <div>
              <p className="text-gray-300">Criar ({user.rankcard_create_progress}/{reqs.creates})</p>
              <div className="w-full bg-brand-border rounded-full h-2.5"><div className="bg-brand-orange h-2.5 rounded-full" style={{width: `${Math.min(100, (user.rankcard_create_progress / reqs.creates) * 100)}%`}} /></div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onEvolve(userCardId) }} disabled={!canEvolve} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-lg transition-all active:scale-95 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed">EVOLUIR</button>
          </div>
        )}
        {card.stage === 3 && card.rarity && (
          <p className={`text-center font-bold text-sm ${cardRarityStyle}`}>{card.rarity}</p>
        )}
      </div>
    </div>
  )
}

export default RankardCard
