export interface PexelsImage {
  id: number;
  src: { medium: string; large: string; original: string; tiny: string };
  photographer: string;
}

export const searchImages = async (query: string): Promise<PexelsImage[]> => {
  const apiKey = process.env.PEXELS_API_KEY || process.env.NEXT_PUBLIC_PEXELS_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&locale=pt-BR`, {
      headers: { Authorization: apiKey }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.photos || []
  } catch {
    return []
  }
}
