import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function VendeurDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div style={{minHeight:'100vh',background:'#f7f7f7',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <nav style={{background:'white',borderBottom:'1px solid #ebebeb',padding:'0 24px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',background:'#222',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2C6.2 2 4 4.2 4 7C4 9.5 5.5 11.2 6 12.5H12C12.5 11.2 14 9.5 14 7C14 4.2 11.8 2 9 2Z" fill="white"/><rect x="6" y="12.5" width="6" height="1.8" rx="0.9" fill="white"/><rect x="6.5" y="14.3" width="5" height="1.2" rx="0.6" fill="white"/></svg>
          </div>
          <span style={{fontWeight:'600',fontSize:'15px',color:'#111'}}>Ghost Business</span>
        </div>
        <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
          <Link href="/dashboard/vendeur" style={{color:'#111',textDecoration:'none',fontSize:'14px',fontWeight:'500'}}>Tableau de bord</Link>
          <Link href="/dashboard/vendeur/dossier/nouveau" style={{color:'#717171',textDecoration:'none',fontSize:'14px'}}>Mon dossier</Link>
          <Link href="/dashboard/messagerie" style={{color:'#717171',textDecoration:'none',fontSize:'14px'}}>Messages</Link>
        </div>
      </nav>

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'40px 24px'}}>
        <div style={{marginBottom:'32px'}}>
          <h1 style={{color:'#111',fontSize:'28px',fontWeight:'600',margin:'0 0 8px',letterSpacing:'-0.5px'}}>Bonjour</h1>
          <p style={{color:'#717171',fontSize:'15px',margin:0}}>Voici un aperçu de votre dossier</p>
        </div>

        <div style={{background:'white',borderRadius:'16px',padding:'32px',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',marginBottom:'20px',border:'1px solid #ebebeb'}}>
          <h2 style={{color:'#111',fontSize:'18px',fontWeight:'600',margin:'0 0 24px',letterSpacing:'-0.3px'}}>Votre dossier</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'24px'}}>
            {[{label:'Vues totales',value:'47',sub:'+12 cette semaine'},{label:'Intérêts reçus',value:'6',sub:'3 NDA signés'},{label:'Ghost Score',value:'A+',sub:'Top 8% du marché'}].map((s,i) => (
              <div key={i} style={{background:'#f7f7f7',borderRadius:'12px',padding:'20px'}}>
                <p style={{color:'#717171',fontSize:'13px',margin:'0 0 8px'}}>{s.label}</p>
                <p style={{color:'#111',fontSize:'24px',fontWeight:'600',margin:'0 0 4px',letterSpacing:'-0.5px'}}>{s.value}</p>
                <p style={{color:'#aaa',fontSize:'12px',margin:0}}>{s.sub}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/vendeur/dossier/nouveau" style={{display:'inline-block',padding:'12px 24px',background:'#111',color:'white',borderRadius:'10px',textDecoration:'none',fontSize:'14px',fontWeight:'600'}}>
            Publier mon dossier →
          </Link>
        </div>

        <div style={{background:'white',borderRadius:'16px',padding:'32px',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',border:'1px solid #ebebeb'}}>
          <h2 style={{color:'#111',fontSize:'18px',fontWeight:'600',margin:'0 0 20px',letterSpacing:'-0.3px'}}>Activité récente</h2>
          {[
            {title:'Acheteur #ACH-221 a signé le NDA',sub:'Il y a 2 heures · Accès Data Room accordé',dot:'#222'},
            {title:'Acheteur #ACH-198 a demandé un match',sub:'Hier · Profil Portfolio · Investisseur',dot:'#717171'},
            {title:'47 vues cette semaine',sub:'+31% vs semaine précédente',dot:'#aaa'},
          ].map((n,i) => (
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'14px',padding:'14px 0',borderBottom:i<2?'1px solid #f0f0f0':'none'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:n.dot,marginTop:'6px',flexShrink:0}}></div>
              <div>
                <p style={{color:'#111',fontSize:'14px',margin:'0 0 3px',fontWeight:'500'}}>{n.title}</p>
                <p style={{color:'#aaa',fontSize:'13px',margin:0}}>{n.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
