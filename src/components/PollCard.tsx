import React, { useState } from 'react'
import type { Poll } from '@/types'

export const PollCard: React.FC<{
  poll: Poll
  onVote: (pollId: string, optionText: string) => void
  onFavorite: (pollId: string) => void
  onChangeVote: (pollId: string, newOptionText: string) => void
  onAddOption: (poll: Poll) => void
  onReport: (poll: Poll) => void
  onOpenShareModal: (poll: Poll) => void
}> = ({ poll, onVote, onFavorite, onChangeVote, onAddOption, onReport, onOpenShareModal }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isChangingVote, setIsChangingVote] = useState(false)
  const hasVoted = poll.userVote !== null

  const getVotePercentage = (votes: number) => {
    if (poll.total_votes === 0) return 0
    return Math.round((votes / poll.total_votes) * 100)
  }

  const handleVoteClick = () => {
    if (selectedOption && !hasVoted) onVote(poll.id, selectedOption)
  }

  const handleOptionClick = (text: string) => {
    if (!hasVoted || isChangingVote) setSelectedOption(text)
  }

  const handleStartVoteChange = () => {
    setIsChangingVote(true)
    setSelectedOption(poll.userVote)
  }

  const handleConfirmVoteChange = () => {
    if (selectedOption && selectedOption !== poll.userVote) onChangeVote(poll.id, selectedOption)
    setIsChangingVote(false)
    setSelectedOption(null)
  }

  const handleCancelVoteChange = () => {
    setIsChangingVote(false)
    setSelectedOption(null)
  }

  const LocationInfo = () => {
    if (poll.scope === 'LOCAL' || poll.scope === 'ROLÊ') return <span className="font-bold">{poll.location_city}</span>
    return <span className="font-bold">MUNDO</span>
  }

  const StatusBanner = ({ status, reason }: { status: 'PENDING' | 'REJECTED', reason?: string }) => {
    const isPending = status === 'PENDING'
    const bgColor = isPending ? 'bg-yellow-500/80' : 'bg-red-600/80'
    const icon = isPending ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    )
    const text = isPending ? 'EM ANÁLISE' : 'REJEITADO'
    return (
      <div className={`absolute inset-0 ${bgColor} z-10 flex flex-col items-center justify-center text-white text-center p-4 backdrop-blur-sm`}>
        {icon}
        <p className="font-bold text-lg mt-2">{text}</p>
        {reason && <p className="text-sm mt-1">{reason}</p>}
      </div>
    )
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl flex flex-col overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-teal/10 relative">
      {poll.status !== 'APPROVED' && <StatusBanner status={poll.status} reason={poll.moderation_reason || undefined} />}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {poll.image_url ? <img src={poll.image_url} alt={poll.title} className="w-full h-40 object-cover" /> : (
          <div className="w-full h-40 bg-gradient-to-tr from-brand-teal to-cyan-600 flex items-center justify-center">
            <h2 className="text-3xl font-black text-center text-white/50 tracking-tighter p-4">RANK<span className="text-black/50">IOU</span></h2>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-bold py-1 px-2 rounded">{poll.total_votes} VOTOS</div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-brand-teal uppercase">{poll.category}</p>
          <div className="flex space-x-2 text-gray-400">
            <button onClick={() => onFavorite(poll.id)} className={`hover:text-brand-orange transition-colors ${poll.isFavorited ? 'text-brand-orange' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </button>
            <button onClick={() => onReport(poll)} className="hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 01-1-1V6z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
        <h3 className="font-bold text-lg my-2 text-white flex-grow">{poll.title}</h3>

        <div className="space-y-2">
          {poll.options.map(option => {
            const percentage = hasVoted ? getVotePercentage(option.votes) : 0
            const isVotedOption = poll.userVote === option.text
            const isSelected = selectedOption === option.text
            return (
              <button
                key={option.text}
                onClick={() => handleOptionClick(option.text)}
                disabled={(hasVoted && !isChangingVote) || poll.status !== 'APPROVED'}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm font-semibold relative overflow-hidden ${
                  isChangingVote
                    ? (isSelected ? 'border-brand-orange bg-brand-orange/10' : 'border-brand-border bg-gray-800 hover:border-gray-600')
                    : (hasVoted
                      ? 'border-gray-700 bg-gray-800'
                      : (isSelected ? 'border-brand-orange bg-brand-orange/10' : 'border-brand-border bg-gray-800 hover:border-gray-600'))
                }`}
              >
                {hasVoted && !isChangingVote && (
                  <div className={`absolute top-0 left-0 h-full ${isVotedOption ? 'bg-brand-orange/30' : 'bg-gray-700/50'}`} style={{ width: `${percentage}%` }} />
                )}
                <div className="relative flex justify-between items-center">
                  <span>{option.text}</span>
                  {hasVoted && !isChangingVote && (
                    <span className={`font-bold ${isVotedOption ? 'text-brand-orange' : 'text-gray-300'}`}>{percentage}% ({option.votes})</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {poll.status === 'APPROVED' && (
          <div className="mt-4 flex flex-col space-y-2">
            {isChangingVote ? (
              <>
                <button onClick={handleConfirmVoteChange} disabled={!selectedOption || selectedOption === poll.userVote} className="w-full bg-brand-teal text-white font-bold py-3 rounded-lg shadow-3d-teal active:shadow-3d-teal-active active:scale-95 transition-all disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed">CONFIRMAR TROCA</button>
                <button onClick={handleCancelVoteChange} className="w-full bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors hover:bg-gray-600 text-sm">CANCELAR</button>
              </>
            ) : hasVoted ? (
              <div className="flex space-x-2">
                <button onClick={handleStartVoteChange} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors hover:bg-gray-600">TROCAR VOTO</button>
                <button onClick={() => onOpenShareModal(poll)} className="flex-shrink-0 bg-brand-surface border border-brand-border text-white font-bold p-3 rounded-lg transition-colors hover:border-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button onClick={handleVoteClick} disabled={!selectedOption} className="w-full bg-brand-teal text-white font-bold py-3 rounded-lg shadow-3d-teal active:shadow-3d-teal-active active:scale-95 transition-all disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100">VOTAR</button>
                {poll.type === 'PERGUNTAS' && <button onClick={() => onAddOption(poll)} className="w-full bg-brand-orange text-black font-bold py-3 rounded-lg shadow-3d-orange active:shadow-3d-orange-active active:scale-95 transition-all">RESPONDER</button>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-black/30 p-2 flex items-center space-x-2 text-xs text-gray-400 border-t border-brand-border/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poll.author.avatar_url} alt={poll.author.name} className="w-5 h-5 rounded-full" />
        <span className="font-semibold">{poll.author.name}</span>
      </div>
    </div>
  )
}

export default PollCard
