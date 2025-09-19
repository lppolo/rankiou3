import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export const ProfileModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity] = useState<string>('')
  const [cities, setCities] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession()
      const uid = session?.session?.user?.id
      if (!uid) return onClose()
      const { data: p } = await supabase.from('profiles').select('name, username, preferred_city').eq('id', uid).single()
      if (p) {
        setName(p.name || '')
        setUsername(p.username || '')
        setCity(p.preferred_city || '')
      }
      const { data: c } = await supabase.from('cities').select('name, state').limit(5000)
      setCities((c||[]).map((r:any)=> `${r.name}`))
    }
    load()
  }, [onClose])

  const matches = useMemo(() => {
    const q = (city||'').toLowerCase()
    if (!q) return []
    return cities.filter(c => c.toLowerCase().includes(q)).slice(0,6)
  }, [city, cities])

  const save = async () => {
    setSaving(true)
    const { data: session } = await supabase.auth.getSession()
    const uid = session?.session?.user?.id
    if (!uid) return
    await supabase.from('profiles').update({ name, username, preferred_city: city || null, onboarding_completed: true }).eq('id', uid)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-xl w-full max-w-md p-5">
        <h3 className="text-xl font-bold text-white mb-4">Seu Perfil</h3>
        <label className="block text-sm text-gray-300 mb-1">Nome</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-lg bg-black/40 border border-brand-border text-white" />
        <label className="block text-sm text-gray-300 mb-1">Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full mb-3 px-3 py-2 rounded-lg bg-black/40 border border-brand-border text-white" />
        <label className="block text-sm text-gray-300 mb-1">Cidade (para feed Local/Rolê)</label>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Ex: São Paulo" className="w-full mb-1 px-3 py-2 rounded-lg bg-black/40 border border-brand-border text-white" />
        {matches.length>0 && (
          <div className="bg-black/60 border border-brand-border rounded-lg mb-3 max-h-40 overflow-auto">
            {matches.map(m => (
              <button key={m} onClick={()=>setCity(m)} className="w-full text-left px-3 py-2 text-gray-200 hover:bg-white/10">{m}</button>
            ))}
          </div>
        )}
        <div className="flex justify-end space-x-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 text-white">Cancelar</button>
          <button disabled={saving} onClick={save} className="px-4 py-2 rounded-lg bg-brand-teal text-black font-bold disabled:opacity-60">Salvar</button>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
