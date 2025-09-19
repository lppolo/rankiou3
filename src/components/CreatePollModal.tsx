import React, { useState } from 'react'
import type { Category } from '@/types'

const CATEGORIES: Category[] = ['GERAL','ESPORTES','COMIDA & BEBIDA','FILMES & SÉRIES','GAMES','TECNOLOGIA','LAZER']

export const CreatePollModal: React.FC<{
  onCreate: (p: { title: string; category: Category; scope: 'MUNDO'|'LOCAL'|'ROLÊ'; location_city?: string|null; options: string[] }) => void
  onClose: () => void
  defaultCity?: string | null
}> = ({ onCreate, onClose, defaultCity }) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('GERAL')
  const [scope, setScope] = useState<'MUNDO'|'LOCAL'|'ROLÊ'>('MUNDO')
  const [city, setCity] = useState<string>(defaultCity || '')
  const [options, setOptions] = useState<string[]>(['',''])

  const canSave = title.trim() && options.filter(o => o.trim()).length >= 2 && (scope !== 'LOCAL' && scope !== 'ROLÊ' || city.trim())

  const handleAddOption = () => setOptions(prev => [...prev, ''])
  const handleChangeOption = (i: number, val: string) => setOptions(prev => prev.map((o, idx) => idx === i ? val : o))
  const handleCreate = () => {
    const clean = options.map(o => o.trim()).filter(Boolean)
    onCreate({ title: title.trim(), category, scope, location_city: scope === 'MUNDO' ? null : city.trim(), options: clean })
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold text-white">Criar Enquete</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da enquete" className="w-full bg-brand-surface border border-brand-border rounded-lg p-3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="bg-brand-surface border border-brand-border rounded-lg p-3">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={scope} onChange={e => setScope(e.target.value as any)} className="bg-brand-surface border border-brand-border rounded-lg p-3">
              <option value="MUNDO">MUNDO</option>
              <option value="LOCAL">LOCAL</option>
              <option value="ROLÊ">ROLÊ</option>
            </select>
            {(scope === 'LOCAL' || scope === 'ROLÊ') && (
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade" className="bg-brand-surface border border-brand-border rounded-lg p-3" />
            )}
          </div>

          <div className="space-y-2">
            {options.map((o, idx) => (
              <input key={idx} value={o} onChange={e => handleChangeOption(idx, e.target.value)} placeholder={`Opção ${idx+1}`} className="w-full bg-brand-surface border border-brand-border rounded-lg p-3" />
            ))}
            <button onClick={handleAddOption} className="w-full bg-gray-700 text-white font-semibold py-2 rounded-lg">Adicionar opção</button>
          </div>

          <button onClick={handleCreate} disabled={!canSave} className="w-full bg-brand-teal text-white font-bold py-3 rounded-lg shadow-3d-teal active:shadow-3d-teal-active active:scale-95 transition-all disabled:bg-gray-600">Publicar</button>
        </div>
      </div>
    </div>
  )
}

export default CreatePollModal
