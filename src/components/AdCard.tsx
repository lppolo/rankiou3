import React from 'react'
import type { Advertisement } from '@/types'

export const AdCard: React.FC<{ ad: Advertisement }> = ({ ad }) => (
  <a href={ad.cta_url} target="_blank" rel="noopener noreferrer" className="block bg-brand-surface border-2 border-brand-orange rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] h-full animate-glow">
    <div className="flex flex-col h-full">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.image_url} alt={ad.title} className="w-full h-40 object-cover" />
        <div className="absolute top-2 left-2 bg-black/70 text-brand-orange text-xs font-bold py-1 px-2 rounded">PATROCINADO</div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs font-bold text-gray-400 uppercase">{ad.advertiser}</p>
        <h3 className="font-bold text-lg my-2 text-white flex-grow">{ad.title}</h3>
        <div className="mt-auto">
          <div className="w-full bg-brand-orange text-black font-bold py-3 rounded-lg text-center transition-colors group-hover:bg-yellow-300">{ad.cta_text}</div>
        </div>
      </div>
    </div>
  </a>
)

export default AdCard
