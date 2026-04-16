'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Lock, ChevronLeft, Star, FileText } from 'lucide-react'
import { useMessages, useMatchStatus } from '@/lib/hooks/useMessages'
import { acceptReveal, submitOffer } from '@/lib/actions'
import { cn, timeAgo, formatCAD, getMatchStageLabel, MATCH_STAGES } from '@/lib/utils'
import type { Match, Message, Profile } from '@/types'

interface SecureThreadProps {
  match: Match
  currentUser: Profile
  initialMessages: Message[]
}

export function SecureThread({ match, currentUser, initialMessages }: SecureThreadProps) {
  const { messages, send, sending, bottomRef } = useMessages(match.id, initialMessages)
  const [draft, setDraft] = useState('')
  const [showMilestones, setShowMilestones] = useState(false)
  const [showOffer, setShowOffer] = useState(false)
  const status = useMatchStatus(match.id, match.status)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isBuyer = currentUser.id === match.buyer_id
  const otherParty = isBuyer ? match.seller : match.buyer
  const isRevealed = !!match.revealed_at

  const handleSend = async () => {
    if (!draft.trim()) return
    await send(draft)
    setDraft('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <a href="/dashboard/messagerie" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </a>

        <Avatar name={otherParty?.full_name ?? 'Anonyme'} size="sm" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {isRevealed ? otherParty?.full_name : `Acheteur #${match.id.slice(-3).toUpperCase()}`}
          </p>
          <p className="text-xs text-gray-400">
            {getMatchStageLabel(status)} · #{match.deal_id?.slice(-4).toUpperCase()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowMilestones(p => !p)}
            className={cn('text-xs px-3 py-1.5 rounded-lg border transition-colors',
              showMilestones
                ? 'bg-ghost-50 border-ghost-200 text-ghost-800'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            Jalons
          </button>
          {isBuyer && (
            <button
              onClick={() => setShowOffer(p => !p)}
              className={cn('text-xs px-3 py-1.5 rounded-lg border transition-colors',
                showOffer
                  ? 'bg-ghost-50 border-ghost-200 text-ghost-800'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              Offre
            </button>
          )}
        </div>
      </div>

      {/* Milestones */}
      {showMilestones && (
        <div className="p-3 bg-ghost-50 border-b border-ghost-100 animate-in">
          <div className="flex items-center gap-1.5 flex-wrap">
            {MATCH_STAGES.map((stage, i) => {
              const currentStep = MATCH_STAGES.findIndex(s => s.key === status)
              const isDone = i < currentStep
              const isCurrent = i === currentStep
              return (
                <div key={stage.key} className="flex items-center gap-1.5">
                  <span className={cn('badge text-xs',
                    isDone ? 'badge-green' :
                    isCurrent ? 'badge-ghost' :
                    'badge-gray'
                  )}>
                    {stage.label} {isCurrent && '←'}
                  </span>
                  {i < MATCH_STAGES.length - 1 && (
                    <span className="text-gray-300 text-xs">→</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Offer panel */}
      {showOffer && isBuyer && (
        <OfferPanel
          matchId={match.id}
          onClose={() => setShowOffer(false)}
        />
      )}

      {/* Security notice */}
      <div className="flex items-start gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <Lock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-400">
          Canal chiffré Ghost · Aucune donnée identifiable avant closing ·{' '}
          {isRevealed ? (
            <span className="text-teal-600 font-medium">Identités révélées</span>
          ) : (
            <span>Identités masquées</span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Match reveal marker */}
        <SystemMessage text={`Match accepté · Conversation ouverte · ${timeAgo(match.created_at)}`} />

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === currentUser.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-t border-gray-50">
        {['Disponible cette semaine', 'Je transmets à mon CPA', 'Pouvez-vous préciser ?'].map(r => (
          <button
            key={r}
            onClick={() => setDraft(r)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-ghost-200 hover:text-ghost-800 whitespace-nowrap transition-colors flex-shrink-0"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Compose */}
      <div className="flex items-end gap-2 p-3 border-t border-gray-100">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message chiffré..."
          rows={1}
          className="flex-1 field-input resize-none py-2 min-h-[38px] max-h-[100px]"
          style={{ height: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
            draft.trim() && !sending
              ? 'bg-ghost-600 hover:bg-ghost-800 active:scale-95'
              : 'bg-gray-100 cursor-not-allowed'
          )}
        >
          <Send className={cn('w-4 h-4', draft.trim() && !sending ? 'text-white' : 'text-gray-400')} />
        </button>
      </div>
    </div>
  )
}

// ─── Offer Panel ──────────────────────────────────────────────────────────────

function OfferPanel({ matchId, onClose }: { matchId: string; onClose: () => void }) {
  const [price, setPrice] = useState('2 050 000')
  const [terms, setTerms] = useState('comptant')
  const [transition, setTransition] = useState(3)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    const numericPrice = parseInt(price.replace(/\s/g, ''))
    await submitOffer({ match_id: matchId, price: numericPrice, payment_terms: terms as any, transition_months: transition })
    setSent(true)
    setSubmitting(false)
    setTimeout(onClose, 2000)
  }

  if (sent) {
    return (
      <div className="p-4 bg-teal-50 border-b border-teal-100 animate-in">
        <p className="text-sm font-medium text-teal-800">Offre envoyée — en attente de réponse du vendeur.</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-ghost-50 border-b border-ghost-100 animate-in">
      <p className="text-xs font-medium text-ghost-800 mb-3">Envoyer une offre structurée</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="field-label">Prix offert ($)</label>
          <input className="field-input" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Conditions de paiement</label>
          <select className="field-input" value={terms} onChange={e => setTerms(e.target.value)}>
            <option value="comptant">Comptant à la clôture</option>
            <option value="80_20_balanceur">80% + 20% balanceur vendeur</option>
            <option value="bdc">Financement BDC</option>
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label className="field-label">Transition proposée</label>
        <select className="field-input" value={transition} onChange={e => setTransition(+e.target.value)}>
          <option value={3}>3 mois avec le vendeur</option>
          <option value={6}>6 mois avec le vendeur</option>
          <option value={12}>12 mois (consultant)</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary flex-1 text-xs py-2">Annuler</button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-ghost flex-[2] text-xs py-2"
        >
          {submitting ? 'Envoi...' : 'Envoyer l\'offre Ghost →'}
        </button>
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  if (message.type === 'system') {
    return <SystemMessage text={message.content} />
  }

  if (message.type === 'offer' && message.metadata?.offer) {
    const offer = message.metadata.offer
    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="max-w-xs p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 mb-2 text-teal-800 font-medium">
            <FileText className="w-3.5 h-3.5" />
            Offre structurée
          </div>
          <p className="text-teal-700">{formatCAD(offer.price)}</p>
          <p className="text-teal-600 mt-0.5">{offer.payment_terms} · {offer.transition_months}m transition</p>
          <p className="text-teal-400 mt-1">{timeAgo(message.created_at)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-end gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwn && (
        <Avatar name={message.sender?.full_name ?? 'A'} size="xs" />
      )}
      <div className="max-w-[75%]">
        <div className={isOwn ? 'msg-bubble-out' : 'msg-bubble-in'}>
          {message.content}
        </div>
        <p className={cn('text-xs text-gray-400 mt-1', isOwn ? 'text-right' : 'text-left')}>
          {timeAgo(message.created_at)}
          {isOwn && message.read_at && <span className="ml-1 text-teal-400">✓</span>}
        </p>
      </div>
    </div>
  )
}

// ─── System message ───────────────────────────────────────────────────────────

function SystemMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center my-2">
      <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{text}</span>
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'sm' }: { name: string; size: 'xs' | 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' }
  return (
    <div className={cn('rounded-full bg-ghost-50 flex items-center justify-center font-medium text-ghost-800 flex-shrink-0', sizes[size])}>
      {initials}
    </div>
  )
}
