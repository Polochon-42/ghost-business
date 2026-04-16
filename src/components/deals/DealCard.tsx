'use client'

import { useState } from 'react'
import { TrendingUp, Shield, Lock, ChevronRight, Star } from 'lucide-react'
import { cn, formatCAD, getScoreColor, getScoreLabel, SECTOR_LABELS, REGION_LABELS } from '@/lib/utils'
import type { Deal, GhostScore } from '@/types'

interface DealCardProps {
  deal: Deal
  isGoldenMatch?: boolean
  onInterest: (dealId: string) => void
  onPass: (dealId: string) => void
}

export function DealCard({ deal, isGoldenMatch, onInterest, onPass }: DealCardProps) {
  const [passed, setPassed] = useState(false)

  if (passed) return null

  const scoreColor = getScoreColor(deal.ghost_score)
  const scoreLabel = getScoreLabel(deal.ghost_score)

  return (
    <div className={cn('card animate-in', isGoldenMatch && 'border-ghost-200 ring-1 ring-ghost-200')}>

      {/* Golden Match banner */}
      {isGoldenMatch && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-ghost-50 rounded-lg">
          <Star className="w-3.5 h-3.5 text-ghost-600 fill-ghost-600" />
          <span className="text-xs font-medium text-ghost-800">Golden Match — correspond à votre ADN</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            Entreprise #{deal.id.slice(-4).toUpperCase()}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.hide_exact_sector ? 'Secteur masqué' : SECTOR_LABELS[deal.sector]}
            {' · '}
            {deal.hide_exact_region ? 'Région masquée' : REGION_LABELS[deal.region]}
            {' · '}
            {new Date().getFullYear() - deal.founded_year} ans
          </p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span className="badge-ghost">Ghost</span>
            {!deal.hide_exact_sector && (
              <span className="badge-gray">{SECTOR_LABELS[deal.sector]}</span>
            )}
            {deal.off_market_only && (
              <span className="badge-teal">Off-Market</span>
            )}
          </div>
        </div>
        <div className={cn('score-ring ml-3', scoreColor)}>
          <span>{deal.ghost_score}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <MetricTile label="Chiffre d'affaires" value={formatCAD(deal.annual_revenue, true)} />
        <MetricTile label="EBITDA" value={formatCAD(deal.ebitda, true)} />
        <MetricTile label="Multiple" value={`${deal.estimated_multiple}×`} />
      </div>

      {/* Health bars */}
      <div className="space-y-1.5 mb-3">
        <DataBar label="Croissance" value={Math.min(100, deal.growth_3y * 4)} display={`+${deal.growth_3y}%`} color="bg-teal-400" />
        <DataBar label="Marge nette" value={Math.min(100, deal.net_margin * 4)} display={`${deal.net_margin}%`} color="bg-blue-400" />
        <DataBar
          label="Risque IA"
          value={deal.ghost_score_details?.risque === 'faible' ? 20 : deal.ghost_score_details?.risque === 'moyen' ? 45 : 80}
          display={deal.ghost_score_details?.risque ?? 'moyen'}
          color="bg-red-400"
        />
        <DataBar label="Potentiel" value={deal.ghost_score_rentabilite} display={deal.ghost_score_details?.potentiel ?? 'bon'} color="bg-ghost-600" />
      </div>

      {/* NDA row */}
      <div className="flex items-center gap-2.5 p-2.5 border border-gray-100 rounded-lg mb-3">
        <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700">Data Room disponible</p>
          <p className="text-xs text-gray-400">Bilans · Baux · Contrats · NDA requis</p>
        </div>
        <Shield className="w-3.5 h-3.5 text-ghost-600 flex-shrink-0" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => { setPassed(true); onPass(deal.id) }}
          className="btn-secondary flex-1 py-2 text-xs"
        >
          Passer
        </button>
        <button
          onClick={() => onInterest(deal.id)}
          className="btn-ghost flex-2 py-2 text-xs flex-[2]"
        >
          Demander le match
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs text-gray-500 leading-none">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
    </div>
  )
}

function DataBar({
  label, value, display, color
}: {
  label: string; value: number; display: string; color: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('data-bar-fill', color)}
          style={{ width: `${Math.round(value)}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right capitalize">{display}</span>
    </div>
  )
}
