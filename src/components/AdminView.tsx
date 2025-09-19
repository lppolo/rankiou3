import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Row = {
  id: string
  title: string
  author_id: string
  created_at: string
}

export const AdminView: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('polls')
      .select('id, title, author_id, created_at')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setRows((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const act = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const { error } = await supabase.rpc('admin_set_poll_status', { p_poll_id: id, p_status: status, p_reason: null })
    if (error) { alert(error.message); return }
    await load()
  }
  const runBot = async () => {
    const { error } = await supabase.rpc('run_role_bot_now')
    if (error) { alert(error.message); return }
    alert('Bot executado. Verifique o feed ROLÊ.')
  }

  if (loading) return <div className="container mx-auto px-4 py-6 text-gray-300">Carregando…</div>
  if (error) return <div className="container mx-auto px-4 py-6 text-red-400">Erro: {error}</div>

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-white mb-4">Moderação — Pendentes</h2>
      <div className="flex justify-end mb-3">
        <button onClick={runBot} className="px-3 py-2 rounded-md bg-brand-orange text-black font-bold">Rodar bot agora</button>
      </div>
      {rows.length === 0 ? (
        <div className="text-gray-400">Nada pendente no momento.</div>
      ) : (
        <ul className="space-y-3">
          {rows.map(r => (
            <li key={r.id} className="bg-brand-surface border border-brand-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{r.title}</div>
                <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => act(r.id, 'REJECTED')} className="px-3 py-2 rounded-md bg-gray-700 text-white">Rejeitar</button>
                <button onClick={() => act(r.id, 'APPROVED')} className="px-3 py-2 rounded-md bg-brand-teal text-black font-bold">Aprovar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminView
