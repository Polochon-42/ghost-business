import { signIn } from '@/lib/actions'
import Link from 'next/link'

export default function LoginPage() {
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
          <h1 className="text-xl font-medium text-gray-900">Ghost Business</h1>
          <p className="text-sm text-gray-500 mt-1">Terminal de repreneuriat au Québec</p>
        </div>

        {/* Form */}
        <div className="card">
          <form action={signIn} className="space-y-4">
            <div>
              <label className="field-label">Courriel</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="field-input"
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label className="field-label">Mot de passe</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="field-input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-ghost w-full">
              Se connecter
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore de compte ?{' '}
          <Link href="/auth/signup" className="text-ghost-600 hover:text-ghost-800 font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
