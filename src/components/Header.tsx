import React from 'react'

interface HeaderProps {
  onClickLogo?: () => void
  onClickInicio?: () => void
  onClickAcompanhar?: () => void
  onClickRankards?: () => void
  userName?: string | null
  userAvatarUrl?: string | null
  onLogin?: () => void
  onLogout?: () => void
  onCreate?: () => void
  onSeed?: () => void // novo: botão de exemplos (opcional)
  isAdmin?: boolean
  onClickAdmin?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onClickLogo, onClickInicio, onClickAcompanhar, onClickRankards, userName, userAvatarUrl, onLogin, onLogout, onCreate, onSeed, isAdmin, onClickAdmin }) => {
  return (
    <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button onClick={onClickLogo} className="text-3xl font-black text-white tracking-tighter">
            RANK<span className="text-brand-orange">IOU</span>
          </button>
          <div className="hidden md:flex items-center space-x-6 font-semibold text-gray-400">
            <button onClick={onClickInicio} className="hover:text-white">INÍCIO</button>
            <button onClick={onClickAcompanhar} className="hover:text-white">ACOMPANHAR</button>
            <button onClick={onClickRankards} className="hover:text-white">RANKARDS</button>
            {isAdmin && <button onClick={onClickAdmin} className="text-brand-teal hover:text-white">ADMIN</button>}
          </div>
          <div className="flex items-center space-x-3">
            {onSeed && (
              <button onClick={onSeed} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hidden md:inline-flex">EXEMPLOS</button>
            )}
            <button onClick={onCreate} className="hidden md:inline-flex bg-brand-orange text-black font-bold py-2 px-4 rounded-lg shadow-3d-orange active:shadow-3d-orange-active active:scale-95 transition-all">CRIAR</button>
            {userName ? (
              <div className="flex items-center space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={userAvatarUrl || ''} alt={userName} className="w-8 h-8 rounded-full border border-brand-border" />
                <span className="text-gray-300 hidden sm:block">{userName}</span>
                <button onClick={onLogout} className="text-gray-300 hover:text-white">Sair</button>
              </div>
            ) : (
              <button onClick={onLogin} className="text-gray-300 hover:text-white font-semibold">Entrar</button>
            )}
          </div>
        </div>
        {onSeed && (
          <div className="md:hidden pb-3 flex justify-end">
            <button onClick={onSeed} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">EXEMPLOS</button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
