import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DealCard } from '@/components/deals/DealCard'
import { expressInterest } from '@/lib/actions'
import { Star } from 'lucide-react'

export default async function AcheteurDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('status', 'actif')
    .order('ghost_score', { ascending: false })
    .limit(20)

  // Get existing match IDs to mark deals already actioned
  const { data: matches } = await supabase
    .from('matches')
    .select('deal_id, status')
    .eq('buyer_id', user!.id)

  const matchedDealIds = new Set(matches?.map(m => m.deal_id) ?? [])

  // Compute "golden matches" — simplified: top score + buyer sector preference
  const goldenMatchIds = new Set(
    deals?.filter(d => d.ghost_score === 'A+' || d.ghost_score === 'A').slice(0, 2).map(d => d.id) ?? []
  )

  const unactionedDeals = deals?.filter(d => !matchedDealIds.has(d.id)) ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900">
          Bonjour, {profile?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {unactionedDeals.length} dossiers disponibles · {goldenMatchIds.size} Golden Match
        </p>
      </div>

      {/* Golden Match banner */}
      {goldenMatchIds.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-ghost-50 rounded-xl border border-ghost-100">
          <Star className="w-4 h-4 text-ghost-600 fill-ghost-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-ghost-800">Golden Match activé</p>
            <p className="text-xs text-ghost-600">
              {goldenMatchIds.size} entreprise{goldenMatchIds.size > 1 ? 's correspondent' : ' correspond'} à votre profil
            </p>
          </div>
        </div>
      )}

      {/* Deal feed */}
      <div className="space-y-4">
        {unactionedDeals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal as any}
            isGoldenMatch={goldenMatchIds.has(deal.id)}
            onInterest={expressInterest}
            onPass={() => {}}
          />
        ))}

        {unactionedDeals.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Aucun nouveau dossier disponible.</p>
            <p className="text-xs mt-1">Revenez bientôt — de nouveaux dossiers sont ajoutés chaque semaine.</p>
          </div>
        )}
      </div>
    </div>
  )
}
