import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Eye, TrendingUp, Bell, Star, ArrowUpRight } from 'lucide-react'
import { formatCAD, timeAgo, getScoreColor } from '@/lib/utils'
import Link from 'next/link'

export default async function VendeurDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('seller_id', user!.id)
    .eq('status', 'actif')
    .single()

  const { data: matches } = await supabase
    .from('matches')
    .select('*, buyer:profiles(id, full_name, buyer_profile, subscription_tier)')
    .eq('seller_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(5)

  const ndaSignedCount = matches?.filter(m => m.nda_signed_by_buyer).length ?? 0
  const activeMatchCount = matches?.filter(m => !['refuse','annule'].includes(m.status)).length ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Tableau de bord</h1>
          {deal && (
            <p className="text-sm text-gray-500 mt-0.5">
              Dossier #{deal.id.slice(-4).toUpperCase()} · {deal.status === 'actif' ? 'En ligne' : 'Hors ligne'}
            </p>
          )}
        </div>
        {deal && (
          <div className={`score-ring text-sm ${getScoreColor(deal.ghost_score)}`}>
            {deal.ghost_score}
          </div>
        )}
      </div>

      {/* No deal CTA */}
      {!deal && (
        <div className="card border-dashed border-2 border-gray-200 text-center py-10 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Aucun dossier publié</p>
          <p className="text-xs text-gray-400 mb-4">Publiez votre entreprise en 4 étapes. Gratuit et anonyme.</p>
          <Link href="/dashboard/vendeur/dossier/nouveau" className="btn-ghost text-sm">
            Publier mon dossier →
          </Link>
        </div>
      )}

      {/* Stats */}
      {deal && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon={<Eye className="w-4 h-4 text-ghost-600" />} label="Vues totales" value={deal.view_count} delta="+12 cette semaine" />
          <StatCard icon={<Bell className="w-4 h-4 text-teal-500" />} label="Intérêts reçus" value={activeMatchCount} delta={`${ndaSignedCount} NDA signés`} />
          <StatCard icon={<Star className="w-4 h-4 text-amber-500" />} label="Ghost Score" value={deal.ghost_score} delta="Top 8% du marché" />
          <StatCard icon={<TrendingUp className="w-4 h-4 text-blue-500" />} label="Valeur estimée" value={formatCAD(deal.asking_price, true)} delta={`Multiple ${deal.estimated_multiple}×`} />
        </div>
      )}

      {/* Activity feed */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-900">Activité récente</p>
          <Link href="/dashboard/vendeur/matches" className="text-xs text-ghost-600 hover:text-ghost-800 flex items-center gap-1">
            Tout voir <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-0">
            {notifications.map((n, i) => (
              <div key={n.id} className={`flex items-start gap-3 py-3 ${i < notifications.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <NotifDot type={n.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">Aucune activité récente.</p>
        )}
      </div>

      {/* Data room suggestion */}
      {deal && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">Suggestion IA</p>
            <p className="text-xs text-amber-600">Ajouter un bilan 2024 — les dossiers complets reçoivent 2× plus d'intérêts</p>
          </div>
          <Link href="/dashboard/vendeur/dataroom" className="text-xs font-medium text-amber-700 hover:text-amber-900 flex-shrink-0">
            Ajouter →
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, delta }: {
  icon: React.ReactNode
  label: string
  value: string | number
  delta: string
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-medium text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{delta}</p>
    </div>
  )
}

function NotifDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    match: 'bg-ghost-600',
    nda: 'bg-teal-400',
    message: 'bg-blue-400',
    offer: 'bg-amber-400',
    deal_view: 'bg-gray-300',
    system: 'bg-gray-300',
  }
  return (
    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors[type] ?? 'bg-gray-300'}`} />
  )
}
