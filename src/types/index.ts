// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'acheteur' | 'vendeur'
export type BuyerProfile = 'focus' | 'portfolio'
export type DealStatus = 'actif' | 'pause' | 'vendu' | 'retire'
export type MatchStatus = 'en_attente' | 'nda_signe' | 'data_room' | 'due_diligence' | 'offre' | 'closing' | 'refuse' | 'annule'
export type GhostScore = 'A+' | 'A' | 'B+' | 'B' | 'C'
export type SubscriptionTier = 'standard' | 'premium'
export type MessageType = 'text' | 'offer' | 'system' | 'file'
export type Sector =
  | 'agroalimentaire'
  | 'manufacturier'
  | 'services_b2b'
  | 'commerce_detail'
  | 'technologies'
  | 'construction'
  | 'sante'
  | 'transport'
  | 'autre'

export type Region =
  | 'estrie'
  | 'monteregie'
  | 'montreal'
  | 'quebec_ville'
  | 'laurentides'
  | 'laval'
  | 'lanaudiere'
  | 'chaudiere_appalaches'
  | 'autre'

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  buyer_profile?: BuyerProfile
  subscription_tier: SubscriptionTier
  subscription_active: boolean
  neq?: string                    // Numéro d'entreprise du Québec (vendeur)
  phone?: string
  avatar_url?: string
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  seller_id: string

  // Identity — NEVER exposed publicly
  company_name: string            // masked from buyers until reveal
  address: string                 // masked from buyers until reveal

  // Public financial data
  sector: Sector
  region: Region
  founded_year: number
  employee_count: '1-5' | '6-20' | '21-50' | '51-100' | '100+'
  annual_revenue: number          // CAD
  ebitda: number                  // CAD
  growth_3y: number               // percentage
  asking_price: number            // CAD
  net_margin: number              // percentage

  // AI computed
  ghost_score: GhostScore
  ghost_score_details: GhostScoreDetails
  estimated_multiple: number
  estimated_liquidity_months: number

  // Public description (anonymized by seller)
  description: string
  strengths: string[]
  ideal_buyer: string
  sale_reason: 'retraite' | 'reorientation' | 'sante' | 'transmission' | 'autre'

  // Visibility settings
  status: DealStatus
  off_market_only: boolean
  hide_exact_sector: boolean
  hide_exact_region: boolean
  block_same_sector: boolean

  // Stats
  view_count: number
  interest_count: number

  created_at: string
  updated_at: string
}

export interface GhostScoreDetails {
  rentabilite: number             // 0-100
  attractivite_marche: number     // 0-100
  multiple_estime: number
  liquidite_mois: number
  risque: 'faible' | 'moyen' | 'eleve'
  potentiel: 'eleve' | 'bon' | 'moyen' | 'faible'
}

export interface Match {
  id: string
  deal_id: string
  buyer_id: string
  seller_id: string
  status: MatchStatus

  // NDA
  nda_signed_at?: string
  nda_signed_by_buyer: boolean
  nda_signed_by_seller: boolean

  // Mutual reveal
  buyer_accepted_reveal: boolean
  seller_accepted_reveal: boolean
  revealed_at?: string

  // AI compatibility
  ai_compatibility_score: number  // 0-100

  // Offer (when status = 'offre')
  offer?: MatchOffer

  created_at: string
  updated_at: string

  // Joins
  deal?: Deal
  buyer?: Profile
  seller?: Profile
}

export interface MatchOffer {
  price: number
  payment_terms: 'comptant' | '80_20_balanceur' | 'bdc'
  transition_months: number
  submitted_at: string
  response?: 'acceptee' | 'refusee' | 'contre_offre'
  responded_at?: string
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  type: MessageType
  metadata?: MessageMetadata
  read_at?: string
  created_at: string

  // Joins
  sender?: Profile
}

export interface MessageMetadata {
  offer?: MatchOffer
  file_url?: string
  file_name?: string
  system_event?: string
}

export interface DataRoomDocument {
  id: string
  deal_id: string
  name: string
  description: string
  file_url: string
  file_size: number
  file_type: string
  is_required: boolean
  uploaded_at: string

  // Access log
  access_log?: DataRoomAccess[]
}

export interface DataRoomAccess {
  id: string
  document_id: string
  match_id: string
  accessed_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'match' | 'nda' | 'message' | 'offer' | 'system' | 'deal_view'
  read: boolean
  action_url?: string
  created_at: string
}

// ─── API / Form types ──────────────────────────────────────────────────────────

export interface CreateDealInput {
  sector: Sector
  region: Region
  founded_year: number
  employee_count: Deal['employee_count']
  sale_reason: Deal['sale_reason']
  annual_revenue: number
  ebitda: number
  growth_3y: number
  asking_price: number
  net_margin: number
  description: string
  strengths: string[]
  ideal_buyer: string
  company_name: string
  address: string
  off_market_only?: boolean
}

export interface SendMessageInput {
  match_id: string
  content: string
  type?: MessageType
  metadata?: MessageMetadata
}

export interface SubmitOfferInput {
  match_id: string
  price: number
  payment_terms: MatchOffer['payment_terms']
  transition_months: number
}

// ─── Dashboard / UI state ─────────────────────────────────────────────────────

export interface DealFeedItem extends Deal {
  is_golden_match: boolean
  match_id?: string
  match_status?: MatchStatus
}

export interface PipelineItem {
  match: Match
  deal: Deal
  last_message?: Message
  unread_count: number
}

export interface PortfolioStats {
  combined_ebitda: number
  total_portfolio_value: number
  active_deals: number
  closed_deals: number
  total_saved_vs_brokers: number
}
