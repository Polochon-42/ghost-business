import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Ghost Business — Terminal de repreneuriat au Québec',
  description: 'Connectez propriétaires de PME et repreneurs qualifiés. Anonymat garanti. Transactions fluides.',
  keywords: ['repreneuriat', 'PME', 'Québec', 'acquisition', 'cession entreprise'],
  openGraph: {
    title: 'Ghost Business',
    description: 'Le terminal haut de gamme pour la vente et l\'achat de PME au Québec.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
