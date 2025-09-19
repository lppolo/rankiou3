import { supabase } from '@/lib/supabaseClient'
import type { Category } from '@/types'

const samples: Array<{ title: string; category: Category; scope: 'MUNDO'|'LOCAL'|'ROLÊ'; options: string[]; city?: string }>= [
  { title: 'Melhor pizza da cidade?', category: 'COMIDA & BEBIDA', scope: 'LOCAL', options: ['Margherita','Calabresa','Frango com Catupiry','Quatro Queijos'] },
  { title: 'Time que vai ser campeão brasileiro?', category: 'ESPORTES', scope: 'MUNDO', options: ['Flamengo','Palmeiras','São Paulo','Grêmio'] },
  { title: 'Filme para ver no fim de semana?', category: 'FILMES & SÉRIES', scope: 'MUNDO', options: ['Ação','Comédia','Drama','Terror'] },
  { title: 'Console favorito', category: 'GAMES', scope: 'MUNDO', options: ['PlayStation','Xbox','Nintendo','PC'] },
  { title: 'Tecnologia que mais te empolga em 2025', category: 'TECNOLOGIA', scope: 'MUNDO', options: ['IA Generativa','Carros Elétricos','Computação Quântica','AR/VR'] },
  { title: 'Melhor burger em SP?', category: 'COMIDA & BEBIDA', scope: 'LOCAL', options: ['Clássico','Bacon','Smash','Veggie'] },
  { title: 'Plano para a sexta-feira', category: 'LAZER', scope: 'ROLÊ', options: ['Barzinho','Cinema','Show','Jantar com amigos'] },
  { title: 'Melhor série do ano', category: 'FILMES & SÉRIES', scope: 'MUNDO', options: ['Série A','Série B','Série C','Série D'] },
]

export async function seedDemoData({ userId, city }: { userId: string; city: string }) {
  // insert two demo ads if none exists
  const { data: existingAds } = await supabase.from('advertisements').select('id').limit(1)
  if (!existingAds || existingAds.length === 0) {
    await supabase.from('advertisements').insert([
      { advertiser: 'Marca X', title: 'Desconto exclusivo', cta_text: 'Aproveitar', cta_url: 'https://example.com', image_url: 'https://images.pexels.com/photos/2983421/pexels-photo-2983421.jpeg', scope: 'MUNDO', status: 'ACTIVE' },
      { advertiser: 'Loja Local', title: 'Promoção na sua cidade', cta_text: 'Ver oferta', cta_url: 'https://example.com/oferta', image_url: 'https://images.pexels.com/photos/3184450/pexels-photo-3184450.jpeg', scope: 'LOCAL', location_city: city, status: 'ACTIVE' },
    ])
  }

  // create polls
  for (const s of samples) {
    const scopeCity = s.scope === 'MUNDO' ? null : city
    const { data: poll, error } = await supabase.from('polls').insert({
      author_id: userId,
      title: s.title,
      category: s.category,
      type: 'ENQUETE',
      scope: s.scope,
      location_city: scopeCity,
      status: 'APPROVED'
    }).select('id').single()
    if (error || !poll) continue
    const rows = s.options.map(text => ({ poll_id: poll.id, text }))
    await supabase.from('poll_options').insert(rows)
  }

  return { ok: true }
}
