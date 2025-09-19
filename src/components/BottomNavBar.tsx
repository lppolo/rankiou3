import React from 'react'

export const BottomNavBar: React.FC<{
  currentView: 'INICIO' | 'ACOMPANHAR' | 'RANKARDS' | 'ADMIN'
  setCurrentView: (v: 'INICIO' | 'ACOMPANHAR' | 'RANKARDS' | 'ADMIN') => void
  onOpenCreatePollModal: () => void
  onOpenProfileModal: () => void
  isAdmin?: boolean
}> = ({ currentView, setCurrentView, onOpenCreatePollModal, onOpenProfileModal, isAdmin }) => {
  const NavItem: React.FC<{ label: string; icon: JSX.Element; isActive: boolean; onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-brand-teal' : 'text-gray-400 hover:text-white'}`}>
      {icon}
      <span className="text-xs font-bold mt-1">{label}</span>
    </button>
  )

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-brand-surface border-t border-brand-border z-50 flex items-center justify-around">
      <div className="flex justify-around w-full">
        <NavItem label="INÍCIO" isActive={currentView === 'INICIO'} onClick={() => setCurrentView('INICIO')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
        <NavItem label="RANKARDS" isActive={currentView === 'RANKARDS'} onClick={() => setCurrentView('RANKARDS')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
        <div className="w-16 h-16" />
        <NavItem label="ACOMPANHAR" isActive={currentView === 'ACOMPANHAR'} onClick={() => setCurrentView('ACOMPANHAR')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
        <NavItem label="PERFIL" isActive={false} onClick={onOpenProfileModal} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
        {isAdmin && <NavItem label="ADMIN" isActive={currentView === 'ADMIN'} onClick={() => setCurrentView('ADMIN')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-7 4h8M5 8h14M5 8l1-3h12l1 3" /></svg>} />}
      </div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <button onClick={onOpenCreatePollModal} className="w-20 h-20 bg-brand-orange rounded-full flex items-center justify-center text-black shadow-3d-orange active:shadow-3d-orange-active active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
    </div>
  )
}

export default BottomNavBar
