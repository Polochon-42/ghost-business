'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markMessagesRead } from '@/lib/actions'
import type { Message } from '@/types'

export function useMessages(matchId: string, initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Mark as read on mount
  useEffect(() => {
    markMessagesRead(matchId)
  }, [matchId])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          // Fetch full message with sender profile
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(id, full_name, avatar_url, role)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === data.id)) return prev
              return [...prev, data as Message]
            })
            markMessagesRead(matchId)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId, supabase])

  const send = useCallback(async (content: string) => {
    if (!content.trim() || sending) return
    setSending(true)
    try {
      await sendMessage({ match_id: matchId, content: content.trim() })
    } finally {
      setSending(false)
    }
  }, [matchId, sending])

  return { messages, send, sending, bottomRef }
}

// ─── Notifications real-time hook ─────────────────────────────────────────────

export function useNotifications(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Initial count
    supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0))

    // Real-time
    const channel = supabase
      .channel(`notif:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => setUnreadCount(prev => prev + 1)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  return { unreadCount }
}

// ─── Match status real-time hook ──────────────────────────────────────────────

export function useMatchStatus(matchId: string, initialStatus: string) {
  const [status, setStatus] = useState(initialStatus)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.new.status) setStatus(payload.new.status)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId, supabase])

  return status
}
