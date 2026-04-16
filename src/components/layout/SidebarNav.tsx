'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Search, MessageSquare, Briefcase,
  Settings, LogOut, Shield, Bell, TrendingUp, Store
} from 'lucide-react'
import { signOut } from '@/lib/actions'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface SidebarNavProps {
  profile: Profile
}

export function SidebarNav({ profile }: SidebarNavProps) {
  const pathname = usePathname()
  const isVendeur = profile.role === 'vendeur'
  const isBuyer = profile.role === 'acheteur'

  const buyerLinks = [
    { href: '/dashboard/acheteur', icon: Search, label: 'Deals' },
    { href: '/dashboard/acheteur/pipeline', icon: TrendingUp, label: 'Pipeline' },
    { href: '/dashboard/messagerie', icon: MessageSquare, label: 'Messagerie' },
    { href: '/dashboard/marketplace', icon: Store, label: 'Services' },
  ]

  const sellerLinks = [
    { href: '/dashboard/vendeur', icon: LayoutDashboard, label: 'Tableau de bord' },
    { href: '/dashboard/vendeur/dossier', icon: Briefcase, label: 'Mon dossier' },
    { href: '/dashboard/vendeur/dataroom', icon: Shield, label: 'Data Room' },
    { href: '/dashboard/vendeur/matches', icon: Bell, label: 'Intérêts' },
    { href: '/dashboard/messagerie', icon: MessageSquare, label: 'Messagerie' },
  ]

  const links = isVendeur ? sellerLinks : buyerLinks

  return (
    <aside className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-gray-100 bg-white">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-ghost-600 flex items-center justify-center flex-shrink-0">
          <GhostIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Ghost Business</p>
          <p className="text-xs text-gray-400">{isVendeur ? 'Vendeur' : profile.buyer_profile === 'portfolio' ? 'Portfolio' : 'Focus'}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(isActive ? 'nav-item-active' : 'nav-item')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Profile + settings */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <Link href="/dashboard/settings" className="nav-item">
          <Settings className="w-4 h-4" />
          <span>Paramètres</span>
        </Link>
        <form action={signOut}>
          <button type="submit" className="nav-item w-full text-left text-red-500 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </form>
      </div>

      {/* User chip */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
          <div className="w-7 h-7 rounded-full bg-ghost-50 flex items-center justify-center text-xs font-medium text-ghost-800">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.subscription_tier}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function GhostIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2C6.2 2 4 4.2 4 7C4 9.5 5.5 11.2 6 12.5H12C12.5 11.2 14 9.5 14 7C14 4.2 11.8 2 9 2Z" fill="#CECBF6"/>
      <rect x="6" y="12.5" width="6" height="1.8" rx="0.9" fill="#CECBF6"/>
      <rect x="6.5" y="14.3" width="5" height="1.2" rx="0.6" fill="#CECBF6"/>
    </svg>
  )
}
