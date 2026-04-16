'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDeal } from '@/lib/actions'
import { computeGhostScore, formatCAD } from '@/lib/utils'
import { Shield, ChevronRight, Check } from 'lucide-react'
import type { CreateDealInput } from '@/types'

const STEPS = ['Informations', 'Finances', 'Description', 'Vérification']

export default function NouveauDossierPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<Partial<CreateDealInput>>({
    sector: 'agroalimentaire',
    region: 'estrie',
    founded_year: 2010,
    employee_count: '6-20',
    sale_reason: 'retraite',
    annual_revenue: 2400000,
    ebitda: 480000,
    growth_3y: 18,
    asking_price: 2160000,
    net_margin: 20,
    description: '',
    strengths: [],
    ideal_buyer: 'Entrepreneur opérationnel souhaitant s\'investir à temps plein.',
    company_name: '',
    address: '',
    off_market_only: false,
  })

  const set = (key: keyof CreateDealInput, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const scoreDetails = computeGhostScore(
    form.net_margin ?? 0,
    form.growth_3y ?? 0,
    form.ebitda ?? 0,
    form.annual_revenue ?? 0
  )

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const result = await createDeal(form as CreateDealInput)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    router.push('/dashboard/vendeur')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">Étape {step} sur {STEPS.length}</p>
          <p className="text-xs font-medium text-ghost-600">{STEPS[step - 1]}</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* Ghost notice */}
      <div className="flex items-start gap-2 p-3 bg-ghost-50 border border-ghost-100 rounded-xl mb-4">
        <Shield className="w-3.5 h-3.5 text-ghost-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-ghost-700">
          Le nom et l'adresse de votre entreprise ne seront jamais affichés publiquement.
          Seuls les chiffres financiers et le secteur sont visibles des acheteurs.
        </p>
      </div>

      {/* Step 1 — Basic info */}
      {step === 1 && (
        <div className="card space-y-4 animate-in">
          <p className="text-sm font-medium text-gray-900">À propos de votre entreprise</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Secteur d'activité">
              <select className="field-input" value={form.sector} onChange={e => set('sector', e.target.value)}>
                <option value="agroalimentaire">Agroalimentaire</option>
                <option value="manufacturier">Manufacturier</option>
                <option value="services_b2b">Services B2B</option>
                <option value="commerce_detail">Commerce de détail</option>
                <option value="technologies">Technologies</option>
                <option value="construction">Construction</option>
                <option value="sante">Santé</option>
                <option value="transport">Transport & logistique</option>
              </select>
            </Field>
            <Field label="Région">
              <select className="field-input" value={form.region} onChange={e => set('region', e.target.value)}>
                <option value="estrie">Estrie</option>
                <option value="monteregie">Montérégie</option>
                <option value="montreal">Montréal</option>
                <option value="quebec_ville">Québec (ville)</option>
                <option value="laurentides">Laurentides</option>
                <option value="laval">Laval</option>
                <option value="lanaudiere">Lanaudière</option>
                <option value="chaudiere_appalaches">Chaudière-Appalaches</option>
              </select>
            </Field>
            <Field label="Année de fondation">
              <input className="field-input" type="number" min={1950} max={2024}
                value={form.founded_year} onChange={e => set('founded_year', +e.target.value)} />
            </Field>
            <Field label="Nombre d'employés">
              <select className="field-input" value={form.employee_count} onChange={e => set('employee_count', e.target.value as any)}>
                <option value="1-5">1–5</option>
                <option value="6-20">6–20</option>
                <option value="21-50">21–50</option>
                <option value="51-100">51–100</option>
                <option value="100+">100+</option>
              </select>
            </Field>
          </div>
          <Field label="Motif de vente (confidentiel)">
            <select className="field-input" value={form.sale_reason} onChange={e => set('sale_reason', e.target.value as any)}>
              <option value="retraite">Retraite planifiée</option>
              <option value="reorientation">Réorientation de carrière</option>
              <option value="sante">Santé</option>
              <option value="transmission">Transmission familiale non réalisée</option>
              <option value="autre">Préfère ne pas préciser</option>
            </select>
          </Field>
          <button onClick={() => setStep(2)} className="btn-ghost w-full">
            Continuer <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2 — Financials */}
      {step === 2 && (
        <div className="card space-y-4 animate-in">
          <p className="text-sm font-medium text-gray-900">Chiffres financiers</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Chiffre d'affaires ($)">
              <input className="field-input" type="number"
                value={form.annual_revenue} onChange={e => set('annual_revenue', +e.target.value)} />
            </Field>
            <Field label="EBITDA ($)">
              <input className="field-input" type="number"
                value={form.ebitda} onChange={e => set('ebitda', +e.target.value)} />
            </Field>
            <Field label="Croissance sur 3 ans (%)">
              <input className="field-input" type="number"
                value={form.growth_3y} onChange={e => set('growth_3y', +e.target.value)} />
            </Field>
            <Field label="Marge nette (%)">
              <input className="field-input" type="number"
                value={form.net_margin} onChange={e => set('net_margin', +e.target.value)} />
            </Field>
            <Field label="Prix demandé ($)" className="col-span-2">
              <input className="field-input" type="number"
                value={form.asking_price} onChange={e => set('asking_price', +e.target.value)} />
            </Field>
          </div>

          {/* Live Ghost Score */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">Évaluation Ghost IA — en temps réel</p>
            <div className="flex items-center gap-4">
              <div className={`score-ring text-sm border-2 ${
                scoreDetails.rentabilite > 70 ? 'border-teal-400 bg-teal-50 text-teal-800' :
                scoreDetails.rentabilite > 40 ? 'border-amber-400 bg-amber-50 text-amber-800' :
                'border-red-300 bg-red-50 text-red-700'
              }`}>
                {(form.net_margin ?? 0) > 18 && (form.growth_3y ?? 0) > 10 ? 'A+' :
                 (form.net_margin ?? 0) > 14 ? 'A' :
                 (form.net_margin ?? 0) > 10 ? 'B+' : 'B'}
              </div>
              <div className="flex-1 space-y-1.5">
                <ScoreBar label="Rentabilité" value={scoreDetails.rentabilite} color="bg-teal-400" />
                <ScoreBar label="Attractivité" value={scoreDetails.attractivite_marche} color="bg-ghost-600" />
                <ScoreBar label="Multiple estimé" value={Math.min(100, scoreDetails.multiple_estime * 15)} display={`${scoreDetails.multiple_estime}×`} color="bg-amber-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Retour</button>
            <button onClick={() => setStep(3)} className="btn-ghost flex-[2]">Continuer <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Step 3 — Description */}
      {step === 3 && (
        <div className="card space-y-4 animate-in">
          <p className="text-sm font-medium text-gray-900">Description anonyme</p>
          <p className="text-xs text-gray-400">Ce texte sera visible des acheteurs. N'incluez aucun nom propre ni adresse.</p>

          <Field label="Description de l'activité">
            <textarea
              className="field-input resize-none"
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décrivez votre entreprise sans la nommer..."
            />
          </Field>
          <Field label="Points forts (séparés par une virgule)">
            <input
              className="field-input"
              value={form.strengths?.join(', ')}
              onChange={e => set('strengths', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Clientèle fidèle, équipe autonome, bail sécurisé..."
            />
          </Field>
          <Field label="Acheteur idéal">
            <select className="field-input" value={form.ideal_buyer} onChange={e => set('ideal_buyer', e.target.value)}>
              <option value="Entrepreneur opérationnel souhaitant s'investir à temps plein.">Entrepreneur opérationnel</option>
              <option value="Investisseur avec gestionnaire en place.">Investisseur + gestionnaire</option>
              <option value="Concurrent stratégique cherchant à consolider.">Concurrent stratégique</option>
              <option value="Fonds d'investissement privé.">Fonds d'investissement</option>
              <option value="Aucune préférence.">Aucune préférence</option>
            </select>
          </Field>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Retour</button>
            <button onClick={() => setStep(4)} className="btn-ghost flex-[2]">Continuer <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Step 4 — Verification */}
      {step === 4 && (
        <div className="card space-y-4 animate-in">
          <p className="text-sm font-medium text-gray-900">Vérification d'identité</p>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
            Votre identité sera vérifiée via le Registraire des entreprises du Québec. Elle restera privée pour les acheteurs.
          </div>
          <Field label="Nom légal complet">
            <input className="field-input" value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Nom de l'entreprise (usage interne uniquement)" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Numéro d'entreprise (NEQ)">
              <input className="field-input" placeholder="1234567890" />
            </Field>
            <Field label="Adresse">
              <input className="field-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Adresse (privée)" />
            </Field>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">← Retour</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-ghost flex-[2]">
              {loading ? 'Publication...' : 'Publier mon dossier Ghost →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

function ScoreBar({ label, value, color, display }: { label: string; value: number; color: string; display?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${Math.round(value)}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{display ?? `${Math.round(value)}%`}</span>
    </div>
  )
}
