export type Category = 'GERAL' | 'ESPORTES' | 'COMIDA & BEBIDA' | 'FILMES & SÉRIES' | 'GAMES' | 'TECNOLOGIA' | 'LAZER';
export type CategoryFilter = 'TUDO' | Category;
export type SortOrder = 'MAIS RECENTES' | 'MAIS VOTADAS';
export type ShowFilter = 'TUDO' | 'VOTADAS' | 'NÃO VOTADAS';

export type Rarity = 'COMUM' | 'RARO' | 'ÉPICO' | 'LENDÁRIO';

export interface Option { text: string; votes: number; }

export interface PollAuthor { id: string; name: string; avatar_url: string; }

export interface Poll {
  id: string;
  title: string;
  image_url?: string | null;
  category: Category;
  type: 'ENQUETE' | 'PERGUNTAS';
  scope: 'MUNDO' | 'LOCAL' | 'ROLÊ';
  location_city?: string | null;
  options: Option[];
  total_votes: number;
  created_at: string;
  author: PollAuthor;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  moderation_reason?: string | null;
  userVote: string | null;
  isFavorited?: boolean;
}

export interface Advertisement {
  id: string;
  advertiser: string;
  title: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  scope: 'MUNDO' | 'LOCAL';
  location_city?: string | null;
  status: 'ACTIVE' | 'PAUSED';
}

export interface PredefinedRankard {
  id: string;
  name: string;
  image_url: string;
  stage: 1 | 2 | 3;
  rarity?: Rarity;
  evolution_reqs?: { votes: number; creates: number };
}

export interface UserCard {
  id: string;
  predefined_card_id: string;
}

export interface User {
  id: string;
  name: string;
  avatar_url: string;
  username: string;
  role: 'user' | 'admin';
  creation_points: number;
  onboarding_completed?: boolean;
  preferred_city?: string | null;
  rank_cards: UserCard[];
  rankcard_vote_progress: number;
  rankcard_create_progress: number;
}
