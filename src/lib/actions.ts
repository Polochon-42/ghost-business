'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  CreateDealInput, SendMessageInput, SubmitOfferInput,
  Deal, Match, Message, Profile
} from '@/types'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        role: formData.get('role') as string,
      },
    },
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function createDeal(input: CreateDealInput) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('deals')
    .insert({ ...input, seller_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/vendeur')
  return { data }
}

export async function updateDeal(dealId: string, updates: Partial<Deal>) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .eq('seller_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/vendeur')
  revalidatePath(`/dashboard/vendeur/deal/${dealId}`)
  return { data }
}

export async function getDealsForBuyer(filters?: {
  sector?: string
  region?: string
  minEbitda?: number
  maxPrice?: number
  offMarketOnly?: boolean
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  let query = supabase
    .from('deals')
    .select('*')
    .eq('status', 'actif')
    .order('ghost_score', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.sector) query = query.eq('sector', filters.sector)
  if (filters?.region) query = query.eq('region', filters.region)
  if (filters?.minEbitda) query = query.gte('ebitda', filters.minEbitda)
  if (filters?.maxPrice) query = query.lte('asking_price', filters.maxPrice)

  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function expressInterest(dealId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Get seller_id from deal
  const { data: deal } = await supabase
    .from('deals')
    .select('seller_id')
    .eq('id', dealId)
    .single()

  if (!deal) return { error: 'Dossier introuvable' }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      deal_id: dealId,
      buyer_id: user.id,
      seller_id: deal.seller_id,
      status: 'en_attente',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Notify seller
  await supabase.from('notifications').insert({
    user_id: deal.seller_id,
    title: 'Nouvel intérêt reçu',
    body: 'Un acheteur a exprimé son intérêt pour votre dossier.',
    type: 'match',
    action_url: `/dashboard/vendeur/matches/${data.id}`,
  })

  revalidatePath('/dashboard/acheteur')
  return { data }
}

export async function signNDA(matchId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match introuvable' }

  const isBuyer = match.buyer_id === user.id
  const isSeller = match.seller_id === user.id
  if (!isBuyer && !isSeller) return { error: 'Accès refusé' }

  const updates: Record<string, unknown> = {}
  if (isBuyer) updates.nda_signed_by_buyer = true
  if (isSeller) updates.nda_signed_by_seller = true

  const bothSigned =
    (isBuyer && match.nda_signed_by_seller) ||
    (isSeller && match.nda_signed_by_buyer)

  if (bothSigned) {
    updates.status = 'nda_signe'
    updates.nda_signed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)
    .select()
    .single()

  if (error) return { error: error.message }

  // Notify the other party
  const notifyId = isBuyer ? match.seller_id : match.buyer_id
  await supabase.from('notifications').insert({
    user_id: notifyId,
    title: 'NDA signé',
    body: 'La contrepartie a signé le NDA. La Data Room est maintenant accessible.',
    type: 'nda',
    action_url: `/dashboard/messagerie/${matchId}`,
  })

  revalidatePath('/dashboard/acheteur')
  revalidatePath('/dashboard/vendeur/matches')
  return { data }
}

export async function acceptReveal(matchId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match introuvable' }

  const isBuyer = match.buyer_id === user.id
  const isSeller = match.seller_id === user.id
  if (!isBuyer && !isSeller) return { error: 'Accès refusé' }

  const updates: Record<string, unknown> = {}
  if (isBuyer) updates.buyer_accepted_reveal = true
  if (isSeller) updates.seller_accepted_reveal = true

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/messagerie')
  return { data }
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendMessage(input: SendMessageInput) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: input.match_id,
      sender_id: user.id,
      content: input.content,
      type: input.type ?? 'text',
      metadata: input.metadata ?? null,
    })
    .select('*, sender:profiles(*)')
    .single()

  if (error) return { error: error.message }

  // Get the other party to notify
  const { data: match } = await supabase
    .from('matches')
    .select('buyer_id, seller_id')
    .eq('id', input.match_id)
    .single()

  if (match) {
    const notifyId = match.buyer_id === user.id ? match.seller_id : match.buyer_id
    await supabase.from('notifications').insert({
      user_id: notifyId,
      title: 'Nouveau message',
      body: input.content.substring(0, 80),
      type: 'message',
      action_url: `/dashboard/messagerie/${input.match_id}`,
    })
  }

  return { data }
}

export async function getMessages(matchId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(id, full_name, avatar_url, role)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message }
  return { data }
}

export async function markMessagesRead(matchId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .neq('sender_id', user.id)
    .is('read_at', null)
}

// ─── Offer ────────────────────────────────────────────────────────────────────

export async function submitOffer(input: SubmitOfferInput) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('matches')
    .update({
      status: 'offre',
      offer_price: input.price,
      offer_payment_terms: input.payment_terms,
      offer_transition_months: input.transition_months,
      offer_submitted_at: new Date().toISOString(),
    })
    .eq('id', input.match_id)
    .eq('buyer_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  // Send offer as special message
  await supabase.from('messages').insert({
    match_id: input.match_id,
    sender_id: user.id,
    content: `Offre soumise : ${new Intl.NumberFormat('fr-CA').format(input.price)} $`,
    type: 'offer',
    metadata: {
      offer: {
        price: input.price,
        payment_terms: input.payment_terms,
        transition_months: input.transition_months,
        submitted_at: new Date().toISOString(),
      },
    },
  })

  // Notify seller
  const { data: match } = await supabase
    .from('matches')
    .select('seller_id')
    .eq('id', input.match_id)
    .single()

  if (match) {
    await supabase.from('notifications').insert({
      user_id: match.seller_id,
      title: 'Nouvelle offre reçue',
      body: `Offre de ${new Intl.NumberFormat('fr-CA').format(input.price)} $`,
      type: 'offer',
      action_url: `/dashboard/vendeur/matches/${input.match_id}`,
    })
  }

  revalidatePath(`/dashboard/messagerie/${input.match_id}`)
  return { data }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getCurrentProfile(): Promise<{ data?: Profile; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message }
  return { data: data as Profile }
}
