'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role'|'form'>('role')
  const [role, setRole] = useState<'acheteur'|'vendeur'|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: { data: { full_name: formData.get('full_name'), role } }
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputStyle = {width:'100%',padding:'12px 14px',background:'#111',border:'1px solid #333',borderRadius:'10px',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box' as const}
  const btnStyle = {width:'100%',padding:'13px',background:'#534AB7',border:'none',borderRadius:'10px',color:'white',fontSize:'15px',fontWeight:'600' as const,cursor:'pointer'}

  return (
    <div style={{minHeight:'100vh',background:'#0f0f0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'100%',maxWidth:'400px',padding:'0 24px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'48px',height:'48px',background:'#534AB7',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <span style={{color:'white',fontSize:'24px'}}>👻</span>
          </div>
          <h1 style={{color:'white',fontSize:'26px',fontWeight:'700',margin:'0 0 6px'}}>Créer un compte</h1>
          <p style={{color:'#888',fontSize:'14px',margin:0}}>Ghost Business · Québec</p>
        </div>

        {step === 'role' && (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <button onClick={() => { setRole('acheteur'); setStep('form') }} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'20px',cursor:'pointer',textAlign:'left'}}>
              <div style={{fontSize:'20px',marginBottom:'6px'}}>🎯</div>
              <div style={{color:'white',fontWeight:'600',fontSize:'15px'}}>Acheteur / Repreneur</div>
              <div style={{color:'#666',fontSize:'13px',marginTop:'2px'}}>Je cherche une entreprise à acquérir</div>
            </button>
            <button onClick={() => { setRole('vendeur'); setStep('form') }} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'20px',cursor:'pointer',textAlign:'left'}}>
              <div style={{fontSize:'20px',marginBottom:'6px'}}>💼</div>
              <div style={{color:'white',fontWeight:'600',fontSize:'15px'}}>Vendeur / Propriétaire</div>
              <div style={{color:'#666',fontSize:'13px',marginTop:'2px'}}>Je souhaite vendre mon entreprise</div>
            </button>
            <p style={{color:'#444',fontSize:'12px',textAlign:'center',marginTop:'8px'}}>🔒 Anonymat garanti</p>
          </div>
        )}

        {step === 'form' && (
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'28px'}}>
            <form onSubmit={handleSignup} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div>
                <label style={{color:'#aaa',fontSize:'13px',display:'block',marginBottom:'6px'}}>Prénom et nom</label>
                <input name="full_name" required style={inputStyle} placeholder="Jean Tremblay" />
              </div>
              <div>
                <label style={{color:'#aaa',fontSize:'13px',display:'block',marginBottom:'6px'}}>Courriel</label>
                <input name="email" type="email" required style={inputStyle} placeholder="vous@exemple.com" />
              </div>
              <div>
                <label style={{color:'#aaa',fontSize:'13px',display:'block',marginBottom:'6px'}}>Mot de passe</label>
                <input name="password" type="password" required minLength={8} style={inputStyle} placeholder="Min. 8 caractères" />
              </div>
              {error && <p style={{color:'#f87171',fontSize:'13px',background:'#2a1a1a',padding:'10px',borderRadius:'8px'}}>{error}</p>}
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? 'Création...' : 'Créer mon compte →'}
              </button>
            </form>
            <button onClick={() => setStep('role')} style={{background:'none',border:'none',color:'#555',fontSize:'13px',cursor:'pointer',marginTop:'14px',width:'100%'}}>← Changer de rôle</button>
          </div>
        )}

        <p style={{color:'#555',fontSize:'13px',textAlign:'center',marginTop:'20px'}}>
          Déjà un compte ? <a href="/auth/login" style={{color:'#7F77DD',textDecoration:'none'}}>Se connecter</a>
        </p>
      </div>
    </div>
  )
}
