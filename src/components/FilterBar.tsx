import React, { useState, useEffect } from 'react'
import type { SortOrder, CategoryFilter, ShowFilter, Category } from '@/types'

type FeedType = 'MUNDO' | 'LOCAL' | 'ROLÊ'

interface FilterBarProps {
  activeFeed: FeedType
  onFeedChange: (feed: FeedType) => void
  filterState: {
    sortOrder: SortOrder
    categoryFilter: CategoryFilter
    showFilter: ShowFilter
    searchTerm: string
  }
  setFilterState: {
    setSortOrder: (order: SortOrder) => void
    setCategoryFilter: (category: CategoryFilter) => void
    setShowFilter: (filter: ShowFilter) => void
    setSearchTerm: (term: string) => void
  }
}

const Button = ({ children, active = false, icon, onClick }: { children: React.ReactNode, active?: boolean, icon: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold transition-all text-sm h-12 ${active ? 'bg-brand-teal text-white shadow-3d-teal' : 'bg-brand-surface text-gray-300 hover:bg-gray-700'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d={icon} />
    </svg>
    <span>{children}</span>
  </button>
)

const Select = ({ children, label, value, onChange }: { children: React.ReactNode, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
  <div className="flex-grow">
    <label className="text-xs text-gray-400 font-bold uppercase">{label}</label>
    <select 
      value={value}
      onChange={onChange}
      className="w-full bg-brand-surface border border-brand-border rounded-lg p-2 mt-1 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-teal"
    >
      {children}
    </select>
  </div>
)

const ALL_CATEGORIES: Category[] = ['GERAL' , 'ESPORTES' , 'COMIDA & BEBIDA' , 'FILMES & SÉRIES' , 'GAMES', 'TECNOLOGIA', 'LAZER']

export const FilterBar: React.FC<FilterBarProps> = ({ activeFeed, onFeedChange, filterState, setFilterState }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilterState.setSearchTerm(localSearchTerm)
    }, 500)
    return () => clearTimeout(handler)
  }, [localSearchTerm, setFilterState])

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-end md:justify-between md:space-x-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
      <div className="flex items-center space-x-2">
        <Button onClick={() => onFeedChange('MUNDO')} active={activeFeed === 'MUNDO'} icon="M10 20a10 10 0 110-20 10 10 0 010 20zM2 10a8 8 0 1016 0 8 8 0 00-16 0z">MUNDO</Button>
        <Button onClick={() => onFeedChange('LOCAL')} active={activeFeed === 'LOCAL'} icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM10 11a3 3 0 100-6 3 3 0 000 6z">LOCAL</Button>
        <Button onClick={() => onFeedChange('ROLÊ')} active={activeFeed === 'ROLÊ'} icon="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM3 9a1 1 0 000 2h2a1 1 0 100-2H3zM9 16a1 1 0 000 2h2a1 1 0 100-2H9zM1.172 6.172a1 1 0 000 1.414l1.414 1.414a1 1 0 001.414-1.414L2.586 6.172a1 1 0 00-1.414 0zM15 2a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 001.414 1.414L15 3.414a1 1 0 000-1.414zM8.172 15.172a1 1 0 000 1.414l1.414 1.414a1 1 0 001.414-1.414L9.586 15.172a1 1 0 00-1.414 0zM15 13a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 001.414 1.414L15 14.414a1 1 0 000-1.414z">ROLÊ</Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-2 w-full md:w-auto flex-grow">
        <Select label="ORDENAR" value={filterState.sortOrder} onChange={(e) => setFilterState.setSortOrder(e.target.value as SortOrder)}>
          <option>MAIS RECENTES</option>
          <option>MAIS VOTADAS</option>
        </Select>
        <Select label="CATEGORIA" value={filterState.categoryFilter} onChange={(e) => setFilterState.setCategoryFilter(e.target.value as CategoryFilter)}>
          <option value="TUDO">TUDO</option>
          {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
        <Select label="MOSTRAR" value={filterState.showFilter} onChange={(e) => setFilterState.setShowFilter(e.target.value as ShowFilter)}>
          <option>TUDO</option>
          <option>VOTADAS</option>
          <option>NÃO VOTADAS</option>
        </Select>
        <div className="flex-grow">
          <label className="text-xs text-gray-400 font-bold uppercase">BUSCAR</label>
          <div className="relative mt-1">
             <input 
                type="text" 
                placeholder="Título..." 
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-teal" />
             <svg className="h-5 w-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
