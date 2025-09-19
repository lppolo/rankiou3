import React, { useMemo, useState } from 'react'
import type { User, PredefinedRankard } from '@/types'
import { RankardCard } from './RankardCard'

export const RankardsView: React.FC<{
  user: User
  predefinedRankards: PredefinedRankard[]
  onGetFirstEgg: () => void
  onBuyEgg: () => void
  onEvolve: (userCardId: string) => void
  onOpenDetail: (card: PredefinedRankard) => void
}> = ({ user, predefinedRankards, onGetFirstEgg, onBuyEgg, onEvolve, onOpenDetail }) => {
  const [activeTab, setActiveTab] = useState<'evolucao' | 'colecao'>('evolucao')

  const userCardsWithDetails = useMemo(() => {
    return user.rank_cards.map(userCard => {
      const details = predefinedRankards.find(p => p.id === userCard.predefined_card_id)
      return { ...userCard, details }
    }).filter(card => card.details)
  }, [user.rank_cards, predefinedRankards])

  const cardsForEvolution = userCardsWithDetails.filter(card => card.details!.stage < 3)
  const finalFormIds = new Set(userCardsWithDetails.filter(card => card.details!.stage === 3).map(c => c.details!.id))

  const TabButton: React.FC<{ tabName: 'evolucao' | 'colecao', label: string }> = ({ tabName, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`px-6 py-2 font-bold rounded-lg transition-colors text-sm ${activeTab === tabName ? 'bg-brand-teal text-white' : 'text-gray-400 hover:bg-brand-surface'}`}>{label}</button>
  )

  const renderEvolucao = () => {
    if (user.rank_cards.length === 0) {
      return (
        <div className="text-center py-20 bg-brand-surface rounded-xl border border-brand-border">
          <h3 className="text-2xl font-bold text-white">Comece sua coleção!</h3>
          <p className="text-gray-400 mt-2 mb-4">Gere seu primeiro ovo de Rankard gratuitamente para começar a evoluir.</p>
          <button onClick={onGetFirstEgg} className="bg-brand-teal text-white font-bold py-3 px-8 rounded-lg shadow-3d-teal active:shadow-3d-teal-active active:scale-95 transition-all">GERAR PRIMEIRO OVO GRÁTIS</button>
        </div>
      )
    }

    return (
      <>
        <div className="mb-6 flex justify-center">
          <button onClick={onBuyEgg} disabled={user.creation_points < 100} className="bg-brand-orange text-black font-bold py-3 px-8 rounded-lg shadow-3d-orange active:shadow-3d-orange-active active:scale-95 transition-all disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed">{user.creation_points < 100 ? 'PONTOS INSUFICIENTES' : 'GERAR NOVO OVO (100 PONTOS)'}</button>
        </div>
        {cardsForEvolution.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {cardsForEvolution.map(card => (
              <RankardCard key={card.id} card={card.details!} user={user} userCardId={card.id} onEvolve={onEvolve} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-brand-surface rounded-xl border border-brand-border">
            <h3 className="text-2xl font-bold text-white">Tudo evoluído!</h3>
            <p className="text-gray-400 mt-2">Todos os seus Rankards estão na forma final. Gere um novo ovo para continuar.</p>
          </div>
        )}
      </>
    )
  }

  const renderColecao = () => {
    const allFinalForms = predefinedRankards.filter(c => c.stage === 3)
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {allFinalForms.map(card => {
          const isLocked = !finalFormIds.has(card.id)
          return (
            <RankardCard key={card.id} card={card} isLocked={isLocked} onClick={!isLocked ? () => onOpenDetail(card) : undefined} />
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center mb-6">
        <div className="bg-black/30 p-1 rounded-xl flex space-x-1">
          <TabButton tabName="evolucao" label="EVOLUÇÃO" />
          <TabButton tabName="colecao" label="COLEÇÃO" />
        </div>
      </div>
      {activeTab === 'evolucao' ? renderEvolucao() : renderColecao()}
    </div>
  )
}

export default RankardsView
