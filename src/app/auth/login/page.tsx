export default function LoginPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0f0f0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'100%',maxWidth:'400px',padding:'0 24px'}}>
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{width:'48px',height:'48px',background:'#534AB7',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <span style={{color:'white',fontSize:'24px'}}>👻</span>
          </div>
          <h1 style={{color:'white',fontSize:'28px',fontWeight:'700',margin:'0 0 8px'}}>Ghost Business</h1>
          <p style={{color:'#888',fontSize:'15px',margin:0}}>Terminal de repreneuriat au Québec</p>
        </div>
        <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'32px'}}>
          <form style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div>
              <label style={{color:'#aaa',fontSize:'13px',display:'block',marginBottom:'6px'}}>Courriel</label>
              <input name="email" type="email" placeholder="vous@exemple.com" style={{width:'100%',padding:'12px 14px',background:'#111',border:'1px solid #333',borderRadius:'10px',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div>
              <label style={{color:'#aaa',fontSize:'13px',display:'block',marginBottom:'6px'}}>Mot de passe</label>
              <input name="password" type="password" placeholder="••••••••" style={{width:'100%',padding:'12px 14px',background:'#111',border:'1px solid #333',borderRadius:'10px',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
            </div>
            <button type="submit" style={{width:'100%',padding:'13px',background:'#534AB7',border:'none',borderRadius:'10px',color:'white',fontSize:'15px',fontWeight:'600',cursor:'pointer',marginTop:'4px'}}>
              Se connecter →
            </button>
          </form>
          <p style={{color:'#666',fontSize:'13px',textAlign:'center',marginTop:'20px',marginBottom:0}}>
            Pas encore de compte ? <a href="/auth/signup" style={{color:'#7F77DD',textDecoration:'none',fontWeight:'500'}}>Créer un compte</a>
          </p>
        </div>
        <p style={{color:'#444',fontSize:'12px',textAlign:'center',marginTop:'24px'}}>Anonymat garanti · Chiffrement bout-en-bout</p>
      </div>
    </div>
  )
}
