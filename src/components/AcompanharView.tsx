import React, { useState } from 'react'
import type { User } from '@/types'
import { useMyFavorites, useMyPolls } from '@/hooks/useMyContent'
import { PollCard } from './PollCard'

export const AcompanharView: React.FC<{
  user: User
  onVote: (pollId: string, optionText: string) => void
  onChangeVote: (pollId: string, newOptionText: string) => void
  onFavorite: (pollId: string) => void
  onAddOption: (pollId: string, text: string) => void
  onReport: (pollId: string) => void
  onShare: (pollId: string) => void
}> = ({ user, onVote, onChangeVote, onFavorite, onAddOption, onReport, onShare }) => {
  const [tab, setTab] = useState<'FAVORITOS' | 'CRIADAS'>('FAVORITOS')
  const favs = useMyFavorites(user.id)
  const mine = useMyPolls(user.id)

  const Empty = ({ msg }: { msg: string }) => (
    <div className="text-center py-20 bg-brand-surface rounded-xl border border-brand-border">
      <h3 className="text-2xl font-bold text-white">{msg}</h3>
      <p className="text-gray-400 mt-2">Interaja no app e volte aqui depois.</p>
    </div>
  )

  const list = tab === 'FAVORITOS' ? favs : mine

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center mb-6">
        <div className="bg-black/30 p-1 rounded-xl flex space-x-1">
          <button onClick={() => setTab('FAVORITOS')} className={`px-6 py-2 font-bold rounded-lg text-sm ${tab==='FAVORITOS'?'bg-brand-teal text-white':'text-gray-400 hover:bg-brand-surface'}`}>FAVORITOS</button>
          <button onClick={() => setTab('CRIADAS')} className={`px-6 py-2 font-bold rounded-lg text-sm ${tab==='CRIADAS'?'bg-brand-teal text-white':'text-gray-400 hover:bg-brand-surface'}`}>CRIADAS</button>
        </div>
      </div>
      {list.loading ? (
        <div className="text-center text-gray-400">Carregando...</div>
      ) : list.polls.length === 0 ? (
        <Empty msg={tab === 'FAVORITOS' ? 'Você ainda não favoritou enquetes.' : 'Você ainda não criou enquetes.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {list.polls.map(p => (
            <PollCard key={p.id} poll={p}
              onVote={(id, opt) => onVote(id, opt)}
              onFavorite={(id) => onFavorite(id)}
              onChangeVote={(id, newOpt) => onChangeVote(id, newOpt)}
              onAddOption={() => onAddOption(p.id, '')}
              onReport={() => onReport(p.id)}
              onOpenShareModal={() => onShare(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AcompanharView
