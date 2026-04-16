'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield, TrendingUp, Briefcase } from 'lucide-react'

type Role = 'acheteur' | 'vendeur'
type BuyerProfile = 'focus' | 'portfolio'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<Role | null>(null)
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>('focus')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: {
        data: {
          full_name: formData.get('full_name') as string,
          role,
          buyer_profile: role === 'acheteur' ? buyerProfile : null,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Insert profile
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: formData.get('email') as string,
        full_name: formData.get('full_name') as string,
        role: role!,
        buyer_profile: role === 'acheteur' ? buyerProfile : null,
        subscription_tier: 'standard',
        subscription_active: false,
        onboarding_complete: false,
      })
    }

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-ghost-600 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <path d="M9 2C6.2 2 4 4.2 4 7C4 9.5 5.5 11.2 6 12.5H12C12.5 11.2 14 9.5 14 7C14 4.2 11.8 2 9 2Z" fill="#CECBF6"/>
              <rect x="6" y="12.5" width="6" height="1.8" rx="0.9" fill="#CECBF6"/>
              <rect x="6.5" y="14.3" width="5" height="1.2" rx="0.6" fill="#CECBF6"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900">Créer un compte</h1>
          <p className="text-sm text-gray-500 mt-1">Ghost Business · Québec</p>
        </div>

        {/* Step 1 — Role selection */}
        {step === 'role' && (
          <div className="space-y-3 animate-in">
            <p className="text-sm text-gray-600 text-center mb-4">Quel est votre rôle ?</p>

            <button
              onClick={() => { setRole('acheteur'); setStep('form') }}
              className="w-full card hover:border-ghost-200 hover:bg-ghost-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ghost-50 group-hover:bg-ghost-100 flex items-center justify-center transition-colors">
                  <TrendingUp className="w-5 h-5 text-ghost-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Acheteur / Repreneur</p>
                  <p className="text-xs text-gray-500">Je cherche une entreprise à acquérir</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => { setRole('vendeur'); setStep('form') }}
              className="w-full card hover:border-teal-200 hover:bg-teal-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Vendeur / Propriétaire</p>
                  <p className="text-xs text-gray-500">Je souhaite vendre mon entreprise</p>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-400">Anonymat garanti · Aucune information identifiable partagée avant match</p>
            </div>
          </div>
        )}

        {/* Step 2 — Form */}
        {step === 'form' && role && (
          <div className="animate-in">
            {role === 'acheteur' && (
              <div className="flex gap-2 mb-4">
                {(['focus', 'portfolio'] as BuyerProfile[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setBuyerProfile(p)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all font-medium ${
                      buyerProfile === p
                        ? 'bg-ghost-600 text-white border-ghost-600'
                        : 'border-gray-200 text-gray-500 hover:border-ghost-200'
                    }`}
                  >
                    {p === 'focus' ? 'Profil Focus' : 'Profil Portfolio'}
                  </button>
                ))}
              </div>
            )}

            <div className="card">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="field-label">Prénom et nom</label>
                  <input name="full_name" required className="field-input" placeholder="Jean Tremblay" />
                </div>
                <div>
                  <label className="field-label">Courriel</label>
                  <input name="email" type="email" required className="field-input" placeholder="vous@exemple.com" />
                </div>
                <div>
                  <label className="field-label">Mot de passe</label>
                  <input name="password" type="password" required minLength={8} className="field-input" placeholder="Min. 8 caractères" />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{error}</p>
                )}

                <button type="submit" disabled={loading} className="btn-ghost w-full">
                  {loading ? 'Création...' : 'Créer mon compte →'}
                </button>
              </form>
            </div>

            <button onClick={() => setStep('role')} className="text-xs text-gray-400 hover:text-gray-600 mt-3 w-full text-center">
              ← Changer de rôle
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-ghost-600 hover:text-ghost-800 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
