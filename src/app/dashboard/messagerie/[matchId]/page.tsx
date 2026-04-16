import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SecureThread } from '@/components/messaging/SecureThread'
import { getMessages } from '@/lib/actions'

interface Props {
  params: { matchId: string }
}

export default async function ThreadPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch match with both parties
  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      deal:deals(*),
      buyer:profiles!matches_buyer_id_fkey(*),
      seller:profiles!matches_seller_id_fkey(*)
    `)
    .eq('id', params.matchId)
    .single()

  if (!match) notFound()

  // Auth guard — only participants
  const isParticipant = match.buyer_id === user.id || match.seller_id === user.id
  if (!isParticipant) redirect('/dashboard/messagerie')

  // Fetch current user profile
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch initial messages
  const { data: messages } = await getMessages(params.matchId)

  return (
    <div className="h-screen flex flex-col">
      <SecureThread
        match={match as any}
        currentUser={currentUser as any}
        initialMessages={(messages ?? []) as any}
      />
    </div>
  )
}
