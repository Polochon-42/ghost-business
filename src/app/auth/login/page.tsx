export default function LoginPage() {
  return (
    <div style={{minHeight:'100vh',background:'#f7f7f7',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{width:'100%',maxWidth:'420px',padding:'0 24px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'44px',height:'44px',background:'#222',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path d="M9 2C6.2 2 4 4.2 4 7C4 9.5 5.5 11.2 6 12.5H12C12.5 11.2 14 9.5 14 7C14 4.2 11.8 2 9 2Z" fill="white"/><rect x="6" y="12.5" width="6" height="1.8" rx="0.9" fill="white"/><rect x="6.5" y="14.3" width="5" height="1.2" rx="0.6" fill="white"/></svg>
          </div>
          <h1 style={{color:'#111',fontSize:'24px',fontWeight:'600',margin:'0 0 6px',letterSpacing:'-0.5px'}}>Ghost Business</h1>
          <p style={{color:'#717171',fontSize:'14px',margin:0}}>Terminal de repreneuriat au Québec</p>
        </div>

        <div style={{background:'white',borderRadius:'16px',padding:'32px',boxShadow:'0 1px 2px rgba(0,0,0,0

cat > src/app/auth/login/page.tsx << 'ENDOFFILE'
export default function LoginPage() {
  return (
    <div style={{minHeight:'100vh',background:'#f7f7f7',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{width:'100%',maxWidth:'420px',padding:'0 24px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'44px',height:'44px',background:'#222',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path d="M9 2C6.2 2 4 4.2 4 7C4 9.5 5.5 11.2 6 12.5H12C12.5 11.2 14 9.5 14 7C14 4.2 11.8 2 9 2Z" fill="white"/><rect x="6" y="12.5" width="6" height="1.8" rx="0.9" fill="white"/><rect x="6.5" y="14.3" width="5" height="1.2" rx="0.6" fill="white"/></svg>
          </div>
          <h1 style={{color:'#111',fontSize:'24px',fontWeight:'600',margin:'0 0 6px',letterSpacing:'-0.5px'}}>Ghost Business</h1>
          <p style={{color:'#717171',fontSize:'14px',margin:0}}>Terminal de repreneuriat au Québec</p>
        </div>

        <div style={{background:'white',borderRadius:'16px',padding:'32px',boxShadow:'0 1px 2px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05)'}}>
          <h2 style={{color:'#111',fontSize:'20px',fontWeight:'600',margin:'0 0 24px',letterSpacing:'-0.3px'}}>Connexion</h2>
          <form style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div>
              <label style={{color:'#111',fontSize:'13px',fontWeight:'500',display:'block',marginBottom:'6px'}}>Courriel</label>
              <input name="email" type="email" placeholder="vous@exemple.com" style={{width:'100%',padding:'13px 14px',background:'white',border:'1.5px solid #ddd',borderRadius:'10px',color:'#111',fontSize:'14px',outline:'none',boxSizing:'border-box' as const,transition:'border-color 0.15s'}} onFocus={(e)=>e.target.style.borderColor='#111'} onBlur={(e)=>e.target.style.borderColor='#ddd'} />
            </div>
            <div>
              <label style={{color:'#111',fontSize:'13px',fontWeight:'500',display:'block',marginBottom:'6px'}}>Mot de passe</label>
              <input name="password" type="password" placeholder="••••••••" style={{width:'100%',padding:'13px 14px',background:'white',border:'1.5px solid #ddd',borderRadius:'10px',color:'#111',fontSize:'14px',outline:'none',boxSizing:'border-box' as const}} onFocus={(e)=>e.target.style.borderColor='#111'} onBlur={(e)=>e.target.style.borderColor='#ddd'} />
            </div>
            <button type="submit" style={{width:'100%',padding:'14px',background:'#111',border:'none',borderRadius:'10px',color:'white',fontSize:'15px',fontWeight:'600',cursor:'pointer',marginTop:'4px',letterSpacing:'-0.2px'}}>
              Se connecter
            </button>
          </form>

          <div style={{margin:'20px 0',borderTop:'1px solid #f0f0f0'}}></div>

          <p style={{color:'#717171',fontSize:'14px',textAlign:'center',margin:0}}>
            Pas encore de compte ?{' '}
            <a href="/auth/signup" style={{color:'#111',fontWeight:'600',textDecoration:'underline'}}>Créer un compte</a>
          </p>
        </div>

        <p style={{color:'#aaa',fontSize:'12px',textAlign:'center',marginTop:'20px'}}>
          Anonymat garanti · Données hébergées au Canada
        </p>
      </div>
    </div>
  )
}
