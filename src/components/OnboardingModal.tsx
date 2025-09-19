import React, { useState } from 'react'

export const OnboardingModal: React.FC<{ onSave: (city: string) => void; onClose: () => void }> = ({ onSave, onClose }) => {
  const [city, setCity] = useState('')
  const handleSave = () => { if (city.trim()) onSave(city.trim()) }
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold text-white">Defina sua cidade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-300">Escolha sua cidade para liberar conteúdos LOCAL e ROLÊ.</p>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: São Paulo" className="w-full bg-brand-surface border border-brand-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-teal" />
          <button onClick={handleSave} disabled={!city.trim()} className="w-full bg-brand-teal text-white font-bold py-3 rounded-lg shadow-3d-teal active:shadow-3d-teal-active active:scale-95 transition-all disabled:bg-gray-600">Salvar</button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
