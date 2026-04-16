import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Lock, MessageSquare } from 'lucide-react'
import { cn, timeAgo, getMatchStageLabel } from '@/lib/utils'

export default async function MessageriePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  // Fetch matches with last message
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      deal:deals(id, sector, region, ghost_score),
      buyer:profiles!matches_buyer_id_fkey(id, full_name),
      seller:profiles!matches_seller_id_fkey(id, full_name)
    `)
    .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
    .not('status', 'in', '("refuse","annule")')
    .order('updated_at', { ascending: false })

  // Fetch last messages per match
  const matchIds = matches?.map(m => m.id) ?? []
  const { data: lastMessages } = await supabase
    .from('messages')
    .select('match_id, content, created_at, sender_id')
    .in('match_id', matchIds)
    .order('created_at', { ascending: false })

  // Unread counts
  const { data: unreadMsgs } = await supabase
    .from('messages')
    .select('match_id')
    .in('match_id', matchIds)
    .neq('sender_id', user!.id)
    .is('read_at', null)

  const lastMsgByMatch = Object.fromEntries(
    (lastMessages ?? []).reduce((acc, msg) => {
      if (!acc.has(msg.match_id)) acc.set(msg.match_id, msg)
      return acc
    }, new Map())
  )

  const unreadByMatch: Record<string, number> = {}
  for (const msg of (unreadMsgs ?? [])) {
    unreadByMatch[msg.match_id] = (unreadByMatch[msg.match_id] ?? 0) + 1
  }

  const isVendeur = profile?.role === 'vendeur'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Messagerie Ghost</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {matches?.length ?? 0} conversation{(matches?.length ?? 0) > 1 ? 's' : ''} active{(matches?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2 p-3 bg-ghost-50 border border-ghost-100 rounded-xl mb-4">
        <Lock className="w-3.5 h-3.5 text-ghost-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-ghost-700">
          Chiffrement bout-en-bout · Accessible uniquement après match mutuel accepté · Conversations supprimées après 90 jours inactifs
        </p>
      </div>

      {/* Thread list */}
      {matches && matches.length > 0 ? (
        <div className="card divide-y divide-gray-50 p-0 overflow-hidden">
          {matches.map((match) => {
            const otherParty = isVendeur ? match.buyer : match.seller
            const isRevealed = !!match.revealed_at
            const lastMsg = lastMsgByMatch[match.id]
            const unread = unreadByMatch[match.id] ?? 0
            const displayName = isRevealed
              ? otherParty?.full_name
              : `${isVendeur ? 'Acheteur' : 'Vendeur'} #${match.id.slice(-3).toUpperCase()}`

            return (
              <Link
                key={match.id}
                href={`/dashboard/messagerie/${match.id}`}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-ghost-50 flex items-center justify-center text-sm font-medium text-ghost-800 flex-shrink-0">
                  {displayName?.charAt(0).toUpperCase() ?? '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {lastMsg ? timeAgo(lastMsg.created_at) : timeAgo(match.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    #{match.deal_id?.slice(-4).toUpperCase()} · {getMatchStageLabel(match.status)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {lastMsg
                      ? `${lastMsg.sender_id === user!.id ? 'Vous : ' : ''}${lastMsg.content}`
                      : 'Conversation ouverte'}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                  {unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-ghost-600 flex items-center justify-center text-xs text-white font-medium">
                      {unread}
                    </div>
                  )}
                  <StatusBadge status={match.status} />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Aucune conversation active</p>
          <p className="text-xs text-gray-400 mt-1">
            {isVendeur
              ? 'Vos conversations apparaîtront ici dès qu\'un acheteur accepte le match.'
              : 'Exprimez votre intérêt sur un dossier pour démarrer une conversation.'}
          </p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    en_attente:    { label: 'Intérêt',      cls: 'badge-gray' },
    nda_signe:     { label: 'NDA signé',    cls: 'badge-ghost' },
    data_room:     { label: 'Data Room',    cls: 'badge-ghost' },
    due_diligence: { label: 'Due dil.',     cls: 'badge-teal' },
    offre:         { label: 'Offre',        cls: 'badge-amber' },
    closing:       { label: 'Closing',      cls: 'badge-green' },
  }
  const s = map[status] ?? { label: status, cls: 'badge-gray' }
  return <span className={cn('badge text-xs', s.cls)}>{s.label}</span>
}
