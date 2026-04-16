import type { Deal, GhostScore, GhostScoreDetails, MatchOffer } from '@/types'

// ─── Ghost Score ──────────────────────────────────────────────────────────────

export function computeGhostScore(
  netMargin: number,
  growth3y: number,
  ebitda: number,
  revenue: number
): GhostScoreDetails {
  const rentabilite = Math.min(100, Math.max(0, Math.round(netMargin * 4)))
  const attractivite = Math.min(100, Math.max(0, Math.round(60 + growth3y * 1.5)))
  const multiple = parseFloat((4.0 + growth3y / 30 + netMargin / 25).toFixed(2))
  const liquidity = Math.max(3, Math.round(24 - growth3y / 2 - netMargin / 3))

  let score: GhostScore
  if (netMargin > 18 && growth3y > 10) score = 'A+'
  else if (netMargin > 14 && growth3y > 5) score = 'A'
  else if (netMargin > 10) score = 'B+'
  else if (netMargin > 6) score = 'B'
  else score = 'C'

  return {
    rentabilite,
    attractivite_marche: attractivite,
    multiple_estime: multiple,
    liquidite_mois: liquidity,
    risque: netMargin > 15 ? 'faible' : netMargin > 8 ? 'moyen' : 'eleve',
    potentiel: attractivite > 80 ? 'eleve' : attractivite > 60 ? 'bon' : attractivite > 40 ? 'moyen' : 'faible',
  }
}

export function getScoreColor(score: GhostScore): string {
  const map: Record<GhostScore, string> = {
    'A+': 'bg-teal-50 text-teal-800 border-teal-400',
    'A':  'bg-teal-50 text-teal-600 border-teal-400',
    'B+': 'bg-amber-50 text-amber-800 border-amber-400',
    'B':  'bg-amber-50 text-amber-600 border-amber-400',
    'C':  'bg-red-50 text-red-800 border-red-400',
  }
  return map[score]
}

export function getScoreLabel(score: GhostScore): string {
  const map: Record<GhostScore, string> = {
    'A+': 'Excellent', 'A': 'Très bon', 'B+': 'Bon', 'B': 'Correct', 'C': 'À évaluer',
  }
  return map[score]
}

// ─── Currency formatting ───────────────────────────────────────────────────────

export function formatCAD(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M $`
    if (amount >= 1_000) return `${Math.round(amount / 1_000)}k $`
  }
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-CA').format(n)
}

// ─── Loan simulator ───────────────────────────────────────────────────────────

export function simulateLoan(
  askingPrice: number,
  downPaymentPct: number,   // 0-100
  ebitda: number,
  interestRate = 0.065,
  termYears = 10
) {
  const loan = askingPrice * (1 - downPaymentPct / 100)
  const monthlyRate = interestRate / 12
  const nPayments = termYears * 12
  const monthlyPayment = loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -nPayments))
  const annualPayments = monthlyPayment * 12
  const netCashFlow = ebitda - annualPayments

  return {
    loanAmount: Math.round(loan),
    monthlyPayment: Math.round(monthlyPayment),
    annualPayments: Math.round(annualPayments),
    netCashFlow: Math.round(netCashFlow),
    cashFlowPositive: netCashFlow > 0,
  }
}

// ─── Match status helpers ─────────────────────────────────────────────────────

export const MATCH_STAGES = [
  { key: 'en_attente',    label: 'Intérêt',      step: 1 },
  { key: 'nda_signe',     label: 'NDA signé',    step: 2 },
  { key: 'data_room',     label: 'Data Room',    step: 3 },
  { key: 'due_diligence', label: 'Due diligence',step: 4 },
  { key: 'offre',         label: 'Offre',        step: 5 },
  { key: 'closing',       label: 'Closing',      step: 6 },
]

export function getMatchStep(status: string): number {
  return MATCH_STAGES.find(s => s.key === status)?.step ?? 1
}

export function getMatchStageLabel(status: string): string {
  return MATCH_STAGES.find(s => s.key === status)?.label ?? status
}

// ─── Ghost success fee ────────────────────────────────────────────────────────

export function computeSuccessFee(price: number, rate = 0.01): number {
  return Math.round(price * rate)
}

// ─── Sector / Region labels ───────────────────────────────────────────────────

export const SECTOR_LABELS: Record<string, string> = {
  agroalimentaire: 'Agroalimentaire',
  manufacturier: 'Manufacturier',
  services_b2b: 'Services B2B',
  commerce_detail: 'Commerce de détail',
  technologies: 'Technologies',
  construction: 'Construction',
  sante: 'Santé',
  transport: 'Transport & logistique',
  autre: 'Autre',
}

export const REGION_LABELS: Record<string, string> = {
  estrie: 'Estrie',
  monteregie: 'Montérégie',
  montreal: 'Montréal',
  quebec_ville: 'Québec (ville)',
  laurentides: 'Laurentides',
  laval: 'Laval',
  lanaudiere: 'Lanaudière',
  chaudiere_appalaches: 'Chaudière-Appalaches',
  autre: 'Autre région',
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days} jours`
  return new Date(dateStr).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}

// ─── Class name utility ───────────────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
